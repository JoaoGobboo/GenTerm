(function () {
  const DataUtils = window.TermosData;
  const FormUtils = window.TermosFormUtils;
  const PdfUtils = window.TermosPdfUtils;
  const SpreadsheetParser = window.TermosSpreadsheetParser;
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

  function setupBatchPanel(config) {
    const dataContext = config && config.dataContext;
    const form = document.getElementById("lote-form");

    if (!form || !dataContext) {
      return;
    }

    const elements = {
      typeSelect: document.getElementById("batch-term-type"),
      fileInput: document.getElementById("batch-file"),
      templateButton: document.getElementById("batch-template-button"),
      idMemo: document.getElementById("batch-id-memo"),
      summary: document.getElementById("batch-summary"),
      errors: document.getElementById("batch-errors"),
      generateButton: document.getElementById("batch-generate-button")
    };
    const state = {
      validRows: [],
      invalidRows: []
    };

    renderIdMemo(dataContext, elements);

    elements.typeSelect.addEventListener("change", function onTypeChange() {
      clearState(state, elements);
      renderIdMemo(dataContext, elements);

      if (elements.fileInput.files && elements.fileInput.files[0]) {
        processSelectedFile(dataContext, elements, state);
      } else {
        renderSummary(elements.summary, "Nenhuma planilha importada.", "");
      }
    });
    elements.fileInput.addEventListener("change", function onFileChange() {
      processSelectedFile(dataContext, elements, state);
    });
    elements.templateButton.addEventListener("click", function onTemplateClick() {
      downloadTemplate(elements.typeSelect.value);
    });
    form.addEventListener("submit", function onSubmit(event) {
      event.preventDefault();
      generateBatchPdf(elements, state);
    });
  }

  function processSelectedFile(dataContext, elements, state) {
    const file = elements.fileInput.files && elements.fileInput.files[0];

    clearState(state, elements);

    if (!file) {
      renderSummary(elements.summary, "Nenhuma planilha importada.", "");
      return;
    }

    renderSummary(elements.summary, "Lendo planilha...", "");
    SpreadsheetParser.parseFile(file)
      .then(function onParsed(parsedFile) {
        const result = validateParsedFile(elements.typeSelect.value, parsedFile, dataContext);

        state.validRows = result.validRows;
        state.invalidRows = result.invalidRows;
        renderValidation(elements, result);
      })
      .catch(function onError(error) {
        state.validRows = [];
        state.invalidRows = [];
        elements.generateButton.disabled = true;
        renderSummary(elements.summary, error.message || "Não foi possível ler a planilha.", "is-error");
        renderErrors(elements.errors, []);
      });
  }

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

  function generateBatchPdf(elements, state) {
    const type = elements.typeSelect.value;
    const schema = BATCH_TYPES[type] || BATCH_TYPES.responsabilidade;
    const rows = state.validRows.map(function getData(row) {
      return row.data;
    });

    if (rows.length === 0) {
      renderSummary(elements.summary, "Não há linhas válidas para gerar.", "is-error");
      return;
    }

    setBusyState(elements.generateButton, true, "Gerando...");
    window.requestAnimationFrame(function onFrame() {
      try {
        const doc = type === "devolucao"
          ? TermModel.createBatchReturnPdf(rows)
          : TermModel.createBatchResponsibilityPdf(rows);

        doc.save(PdfUtils.formatFileName(schema.filePrefix, FormUtils.getTodayIso()));
      } catch (error) {
        console.error(error);
        window.alert("Não foi possível gerar o PDF em lote. Verifique os dados e tente novamente.");
      } finally {
        setBusyState(elements.generateButton, false, "Gerar PDF em lote");
      }
    });
  }

  function renderValidation(elements, result) {
    const validCount = result.validRows.length;
    const invalidCount = result.invalidRows.length;
    const summaryClass = validCount > 0 ? "is-ready" : "is-error";

    renderSummary(
      elements.summary,
      validCount + " linha(s) válida(s), " + invalidCount + " linha(s) com erro.",
      summaryClass
    );
    renderErrors(elements.errors, result.invalidRows);
    elements.generateButton.disabled = validCount === 0;
  }

  function renderSummary(element, text, className) {
    element.classList.remove("is-ready", "is-error");

    if (className) {
      element.classList.add(className);
    }

    element.textContent = text;
  }

  function renderErrors(container, invalidRows) {
    if (!invalidRows.length) {
      container.hidden = true;
      container.innerHTML = "";
      return;
    }

    container.hidden = false;
    container.innerHTML =
      '<table class="batch-error-table">' +
        "<thead>" +
          "<tr>" +
            "<th>Linha</th>" +
            "<th>Erro</th>" +
          "</tr>" +
        "</thead>" +
        "<tbody>" +
          invalidRows.map(function mapError(row) {
            return (
              "<tr>" +
                "<td>" + escapeHtml(row.rowNumber) + "</td>" +
                "<td>" + escapeHtml(row.errors.join(" ")) + "</td>" +
              "</tr>"
            );
          }).join("") +
        "</tbody>" +
      "</table>";
  }

  function renderIdMemo(dataContext, elements) {
    if (!elements.idMemo) {
      return;
    }

    elements.idMemo.innerHTML =
      getCompanyMemoHtml(dataContext) +
      getTechnicianMemoHtml(dataContext);
  }

  function getCompanyMemoHtml(dataContext) {
    const companies = dataContext.getResponsibilityCompanies();

    if (!companies.length) {
      return (
        '<p><strong>Empresas</strong></p>' +
        '<p>Para o lote de responsabilidade, a coluna <code>empresaId</code> deve usar um ID carregado em <code>assets/empresas.json</code>. No Docker, esse arquivo é gerado pela variável <code>EMPRESAS_JSON</code>. Nenhuma empresa foi carregada neste ambiente.</p>'
      );
    }

    return (
      '<p><strong>Empresas</strong></p>' +
      '<p>Na planilha de responsabilidade, preencha a coluna <code>empresaId</code> com o número abaixo correspondente à empresa.</p>' +
      '<ul class="batch-id-list">' +
        companies.map(function mapCompany(company, index) {
          return (
            '<li>' +
              '<code>' + escapeHtml(getDisplayId(index)) + '</code>' +
              '<span>=</span>' +
              '<strong>' + escapeHtml(company.label || company.termName) + '</strong>' +
            '</li>'
          );
        }).join("") +
      '</ul>'
    );
  }

  function getTechnicianMemoHtml(dataContext) {
    const technicians = dataContext.getTechnicians();

    if (!technicians.length) {
      return (
        '<p><strong>Técnicos</strong></p>' +
        '<p>Para o lote de devolução, a coluna <code>tecnicoId</code> deve usar um ID carregado em <code>assets/tecnicos.json</code>. No Docker, esse arquivo é gerado pela variável <code>TECNICOS_JSON</code>. Nenhum técnico foi carregado neste ambiente.</p>'
      );
    }

    return (
      '<p><strong>Técnicos</strong></p>' +
      '<p>Na planilha de devolução, preencha a coluna <code>tecnicoId</code> com o número abaixo correspondente ao responsável de TI.</p>' +
      '<ul class="batch-id-list">' +
        technicians.map(function mapTechnician(technician, index) {
          return (
            '<li>' +
              '<code>' + escapeHtml(getDisplayId(index)) + '</code>' +
              '<span>=</span>' +
              '<strong>' + escapeHtml(technician.nome) + '</strong>' +
            '</li>'
          );
        }).join("") +
      '</ul>'
    );
  }

  function clearState(state, elements) {
    state.validRows = [];
    state.invalidRows = [];
    elements.generateButton.disabled = true;
    renderErrors(elements.errors, []);
  }

  function downloadTemplate(type) {
    const schema = BATCH_TYPES[type] || BATCH_TYPES.responsabilidade;
    const headers = schema.requiredHeaders.concat(schema.optionalHeaders);
    const blob = new Blob(["\uFEFF" + headers.join(";") + "\r\n"], {
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

  function getDisplayId(index) {
    return index + 1;
  }

  function setBusyState(button, isBusy, busyText) {
    if (!button.dataset.defaultLabel) {
      button.dataset.defaultLabel = button.textContent;
    }

    button.disabled = isBusy;
    button.textContent = isBusy ? busyText : button.dataset.defaultLabel;

    if (!isBusy) {
      button.disabled = false;
    }
  }

  function escapeHtml(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  window.TermosBatchController = {
    setupBatchPanel: setupBatchPanel
  };
})();
