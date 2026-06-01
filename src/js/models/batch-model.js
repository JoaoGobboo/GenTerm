(function () {
  const DataUtils = window.TermosData;
  const FormUtils = window.TermosFormUtils;
  const TermModel = window.TermosTermModel;

  const BATCH_TYPES = {
    responsabilidade: {
      label: "Responsabilidade",
      filePrefix: "TERMO_LOTE_RESPONSABILIDADE",
      requiredHeaders: ["empresaId", "nome", "cpf", "matricula", "tipoEquipamento", "marca", "modelo", "serial", "patrimonio"],
      optionalHeaders: ["cidade", "caracteristicas", "acessorios"]
    },
    devolucao: {
      label: "Devolução",
      filePrefix: "TERMO_LOTE_DEVOLUCAO",
      requiredHeaders: ["tecnicoId", "colaboradorNome", "colaboradorCpf", "colaboradorMatricula", "tipoEquipamento", "marca", "modelo", "serial", "patrimonio"],
      optionalHeaders: ["cidade", "data", "caracteristicas", "acessorios"]
    }
  };

  function validateParsedFile(type, parsedFile, dataContext) {
    const schema = BATCH_TYPES[type] || BATCH_TYPES.responsabilidade;
    const headerMap = buildHeaderMap(schema);
    const canonicalHeaders = parsedFile.headers.map(function mapHeader(header) {
      return headerMap[normalizeHeader(header)] || "";
    }).filter(Boolean);
    const missingHeaders = schema.requiredHeaders.filter(function isMissing(header) {
      return canonicalHeaders.indexOf(header) === -1;
    });

    if (parsedFile.headers.length === 0) {
      return {
        validRows: [],
        invalidRows: [{ rowNumber: "-", errors: ["A planilha não possui cabeçalhos."] }]
      };
    }

    if (missingHeaders.length > 0) {
      return {
        validRows: [],
        invalidRows: [{
          rowNumber: "-",
          errors: ["Cabeçalhos obrigatórios ausentes: " + missingHeaders.join(", ") + "."]
        }]
      };
    }

    if (parsedFile.rows.length === 0) {
      return {
        validRows: [],
        invalidRows: [{ rowNumber: "-", errors: ["A planilha não possui linhas de dados."] }]
      };
    }

    return parsedFile.rows.reduce(function validateRows(result, row) {
      const normalizedRow = normalizeRow(row.values, headerMap);
      const validation = validateRow(type, normalizedRow, dataContext);

      if (validation.errors.length > 0) {
        result.invalidRows.push({
          rowNumber: row.rowNumber,
          errors: validation.errors
        });
      } else {
        result.validRows.push({
          rowNumber: row.rowNumber,
          data: buildTermData(type, validation.data, dataContext)
        });
      }

      return result;
    }, {
      validRows: [],
      invalidRows: []
    });
  }

  function validateRow(type, row, dataContext) {
    const schema = BATCH_TYPES[type] || BATCH_TYPES.responsabilidade;
    const errors = [];
    const data = Object.assign({}, row);

    schema.requiredHeaders.forEach(function validateRequired(header) {
      if (!data[header]) {
        errors.push("Campo obrigatório vazio: " + header + ".");
      }
    });

    if (type === "responsabilidade") {
      if (data.cpf && !FormUtils.isValidCpf(data.cpf)) {
        errors.push("CPF inválido.");
      }

      if (data.empresaId && !resolveBatchCompany(dataContext, data.empresaId)) {
        errors.push("empresaId não encontrado: " + data.empresaId + ".");
      }
    }

    if (type === "devolucao") {
      if (data.colaboradorCpf && !FormUtils.isValidCpf(data.colaboradorCpf)) {
        errors.push("CPF do colaborador inválido.");
      }

      if (data.tecnicoId && !resolveBatchTechnician(dataContext, data.tecnicoId)) {
        errors.push("tecnicoId não encontrado: " + data.tecnicoId + ".");
      }

      if (data.data) {
        const normalizedDate = normalizeDate(data.data);

        if (!normalizedDate) {
          errors.push("Data inválida.");
        } else {
          data.data = normalizedDate;
        }
      }
    }

    return {
      data: data,
      errors: errors
    };
  }

  function buildTermData(type, row, dataContext) {
    if (type === "responsabilidade") {
      const company = resolveBatchCompany(dataContext, row.empresaId);

      return TermModel.withResponsibilityDefaults(Object.assign({}, row, {
        empresaId: company.id,
        cpf: FormUtils.formatCpf(row.cpf)
      }), dataContext);
    }

    const technician = resolveBatchTechnician(dataContext, row.tecnicoId);

    return TermModel.withReturnDefaults(Object.assign({}, row, {
      responsavelNome: technician.nome,
      responsavelCpf: FormUtils.formatCpf(technician.cpf),
      responsavelMatricula: technician.matricula,
      colaboradorCpf: FormUtils.formatCpf(row.colaboradorCpf),
      cidade: row.cidade || technician.cidade
    }), dataContext);
  }

  function downloadTemplate(type) {
    const schema = BATCH_TYPES[type] || BATCH_TYPES.responsabilidade;
    const headers = schema.requiredHeaders.concat(schema.optionalHeaders);
    const blob = new Blob(["﻿" + headers.join(";") + "\r\n"], {
      type: "text/csv;charset=utf-8"
    });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "modelo_lote_" + type + ".csv";
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  }

  function normalizeRow(values, headerMap) {
    return Object.keys(values).reduce(function normalize(result, header) {
      const key = headerMap[normalizeHeader(header)];

      if (key) {
        result[key] = FormUtils.sanitizeInputValue(values[header]);
      }

      return result;
    }, {});
  }

  function buildHeaderMap(schema) {
    return schema.requiredHeaders.concat(schema.optionalHeaders).reduce(function build(result, header) {
      result[normalizeHeader(header)] = header;
      return result;
    }, {});
  }

  function normalizeHeader(value) {
    return DataUtils.normalizeKey(value).replace(/[^a-z0-9]/g, "");
  }

  function normalizeDate(value) {
    const trimmedValue = FormUtils.sanitizeInputValue(value);

    if (/^\d{4}-\d{2}-\d{2}$/.test(trimmedValue) && FormUtils.isValidDateInput(trimmedValue)) {
      return trimmedValue;
    }

    if (/^\d{2}\/\d{2}\/\d{4}$/.test(trimmedValue)) {
      const parts = trimmedValue.split("/");
      const isoDate = parts[2] + "-" + parts[1] + "-" + parts[0];

      return FormUtils.isValidDateInput(isoDate) ? isoDate : "";
    }

    return "";
  }

  function resolveBatchCompany(dataContext, companyId) {
    const numericCompanyIndex = getNumericIndex(companyId);

    if (numericCompanyIndex >= 0) {
      return dataContext.getResponsibilityCompanies()[numericCompanyIndex] || null;
    }

    const normalizedCompanyId = DataUtils.normalizeKey(companyId);

    return dataContext.getResponsibilityCompanies().find(function findCompany(company) {
      return DataUtils.normalizeKey(company.id) === normalizedCompanyId;
    }) || null;
  }

  function resolveBatchTechnician(dataContext, technicianId) {
    const numericTechnicianIndex = getNumericIndex(technicianId);

    if (numericTechnicianIndex < 0) {
      return null;
    }

    return dataContext.getTechnicians()[numericTechnicianIndex] || null;
  }

  function getNumericIndex(value) {
    const normalizedValue = String(value || "").trim();

    if (!/^\d+$/.test(normalizedValue)) {
      return -1;
    }

    return Number(normalizedValue) - 1;
  }

  window.TermosBatchModel = {
    BATCH_TYPES: BATCH_TYPES,
    buildTermData: buildTermData,
    downloadTemplate: downloadTemplate,
    normalizeDate: normalizeDate,
    validateParsedFile: validateParsedFile
  };
})();
