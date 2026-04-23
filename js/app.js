(function () {
  const FormUtils = window.TermosFormUtils;
  const PdfUtils = window.TermosPdfUtils;
  const PreviewUtils = window.TermosPreviewUtils;
  const DEFAULT_ROUTE_HASH = "#responsabilidade";
  const ROUTES = {
    "#responsabilidade": "responsabilidade",
    "#devolucao": "devolucao"
  };
  const FIXED_TI_ROLE = "Responsável Departamento TI";
  const TECHNICIANS_FILE = "assets/tecnicos.json";
  const COMPANIES_FILE = "assets/empresas.json";
  const EQUIPMENT_OPTIONS_FILE = "assets/equipamentos.json";
  const DEFAULT_RESPONSIBILITY_COMPANY_ID = "posigraf";
  const EMPTY_COMPANY = {
    id: "",
    label: "",
    termName: "",
    cnpj: ""
  };
  const EMPTY_EQUIPMENT_OPTIONS = {
    tipos: [],
    marcas_por_tipo: {}
  };
  let techniciansData = { tecnicos_n2: [] };
  let responsibilityCompanies = [];
  let equipmentOptionsData = EMPTY_EQUIPMENT_OPTIONS;
  const RESPONSIBILITY_CLAUSES = [
    "3. Os equipamentos e acessórios acima discriminados foram recebidos em perfeito estado de conservação, uso e funcionamento, razão pela qual me comprometo a conservá-los como se de minha propriedade fossem, responsabilizando-me pela guarda, segurança e integridade dos bens, bem como a obedecer às normas técnicas aplicáveis, contidas no manual do fabricante.",
    "4. Declaro que possuo instalações físicas adequadas à instalação e utilização dos equipamentos acima especificados, sem que isto acarrete qualquer tipo de custo ou despesa adicional além daquelas que já possuo.",
    "5. Declaro estar ciente, ainda, que a utilização de softwares está condicionada à regular existência de licença de uso de propriedade, responsabilizando-me pelos softwares instalados nos equipamentos, bem como a promover a instalação e a desinstalação destes, mesmo que gratuitos ou de demonstração, somente por meio de representantes da área de TI da EMPREGADORA. Estou ciente de que eventual caracterização de atividade de pirataria acarretará na minha responsabilização criminal pelas ações praticadas.",
    "6. Declaro estar ciente e concordar que toda e qualquer necessidade de suporte, atualização, formatação ou questão diversa que envolva a utilização do aparelho, devo acionar a área de TI da EMPREGADORA, abstendo-me de realizar qualquer intervenção nos equipamentos descritos no item 1 acima.",
    "7. Findo o período de utilização do equipamento ou do contrato de trabalho, ou outro prazo de vigência estabelecido pela EMPREGADORA, obrigo-me a devolver os equipamentos e acessórios a esta, nas mesmas condições em que os recebi, ressalvados eventuais desgastes decorrentes do uso normal, sob pena de configuração de apropriação indébita com a consequente responsabilização civil e criminal.",
    "8. Responsabilizo-me por eventual dano, perda, roubo, furto ou qualquer outra forma de extravio ou prejuízo causado por mim e/ou por terceiros aos equipamentos e acessórios descritos no item 1 acima, autorizando, desde já, o desconto em folha de pagamento, verbas salariais e/ou rescisórias, pela EMPREGADORA, do valor correspondente ao respectivo ressarcimento ou indenização.",
    "9. Declaro, ainda, que os equipamentos e acessórios mencionados serão utilizados única e exclusivamente por minha pessoa, no exercício de minhas funções, bem como que manterei sigilo profissional sobre todo e qualquer conteúdo e informações nele contidos ou por eles acessados.",
    "10. Declaro, por fim, que tenho ciência de que qualquer atitude em desacordo com o disposto neste termo poderá ser considerada, pela EMPREGADORA, como infração ao meu contrato de trabalho, ficando sujeito às medidas disciplinares cabíveis."
  ];

  document.addEventListener("DOMContentLoaded", function onReady() {
    init().catch(function onError(error) {
      console.error(error);
    });
  });

  async function init() {
    if (!FormUtils || !PdfUtils || !PreviewUtils) {
      return;
    }

    techniciansData = await loadTechnicians();
    responsibilityCompanies = await loadResponsibilityCompanies();
    equipmentOptionsData = await loadEquipmentOptions();
    setupRouteSync();
    setupResponsibilityForm();
    setupReturnForm();
    ensureDefaultRoute();
    syncRoute();
  }

  function setupRouteSync() {
    window.addEventListener("hashchange", function onHashChange() {
      syncRoute();
    });
  }

  function setupResponsibilityForm() {
    const form = document.getElementById("responsabilidade-form");

    if (!form) {
      return;
    }

    setupResponsibilityCompanySelect(form);
    setupEquipmentSelectors(form, {
      typeSelectId: "resp-tipo-equipamento-select",
      typeInputName: "tipoEquipamento",
      brandSelectId: "resp-marca-select",
      brandInputName: "marca"
    });
    setupDocumentPreview({
      form: form,
      previewId: "responsabilidade-preview",
      getData: function getData() {
        return withResponsibilityDefaults(getFormSnapshot(form));
      },
      render: function renderPreview(container, data) {
        PreviewUtils.renderResponsibility(container, data, {
          clauses: RESPONSIBILITY_CLAUSES,
          manualUrl: PdfUtils.MANUAL_URL,
          rows: buildEquipmentRows(data)
        });
      }
    });
    FormUtils.setupForm({
      form: form,
      busyText: "Gerando...",
      onSubmit: function onSubmit(data) {
        generateResponsibilityPdf(withResponsibilityDefaults(data));
      }
    });
  }

  function setupReturnForm() {
    const form = document.getElementById("devolucao-form");

    if (!form) {
      return;
    }

    setupTechnicianSelect(form);
    setupEquipmentSelectors(form, {
      typeSelectId: "dev-tipo-equipamento-select",
      typeInputName: "tipoEquipamento",
      brandSelectId: "dev-marca-select",
      brandInputName: "marca"
    });
    FormUtils.setDateInputToToday(form.elements.data);
    setupDocumentPreview({
      form: form,
      previewId: "devolucao-preview",
      getData: function getData() {
        return withReturnDefaults(getFormSnapshot(form));
      },
      render: function renderPreview(container, data) {
        PreviewUtils.renderReturn(container, data, {
          rows: buildEquipmentRows(data)
        });
      }
    });
    FormUtils.setupForm({
      form: form,
      busyText: "Gerando...",
      onSubmit: function onSubmit(data) {
        generateReturnPdf(withReturnDefaults(data));
      }
    });
  }

  function setupResponsibilityCompanySelect(form) {
    const select = form.elements.empresaId;
    const currentValue = select && select.value;

    if (!select) {
      return;
    }

    select.innerHTML = "";

    const firstOption = document.createElement("option");
    firstOption.value = "";
    firstOption.textContent = "Selecione a empresa";
    select.appendChild(firstOption);

    responsibilityCompanies.forEach(function appendCompany(company) {
      const option = document.createElement("option");
      option.value = company.id;
      option.textContent = company.label;
      select.appendChild(option);
    });

    if (currentValue && responsibilityCompanies.some(function hasCompany(company) { return company.id === currentValue; })) {
      select.value = currentValue;
    }

    if (!select.value) {
      select.value = getResponsibilityCompany(DEFAULT_RESPONSIBILITY_COMPANY_ID).id;
    }
  }

  function setupTechnicianSelect(form) {
    const select = form.elements.tecnicoId;

    if (!select) {
      return;
    }

    techniciansData.tecnicos_n2.forEach(function appendTechnician(technician, index) {
      const option = document.createElement("option");
      option.value = String(index);
      option.textContent = technician.nome;
      select.appendChild(option);
    });

    select.addEventListener("change", function onChange() {
      applyTechnicianSelection(form);
    });

    if (!select.value && techniciansData.tecnicos_n2.length > 0) {
      select.value = "0";
    }

    applyTechnicianSelection(form);
  }

  function setupEquipmentSelectors(form, config) {
    const typeField = form.elements[config.typeInputName];
    const brandField = form.elements[config.brandInputName];
    const typeSelect = document.getElementById(config.typeSelectId);
    const brandSelect = document.getElementById(config.brandSelectId);

    if (!typeField || !brandField || !typeSelect || !brandSelect) {
      return;
    }

    if (!typeField.value) {
      typeField.value = getDefaultEquipmentType();
    }

    populateSelect(typeSelect, equipmentOptionsData.tipos, "Selecionar sugestão");
    syncSelectWithValue(typeSelect, typeField.value);
    updateBrandSelect(typeField.value, brandSelect);
    syncSelectWithValue(brandSelect, brandField.value);

    typeSelect.addEventListener("change", function onTypeChange() {
      if (typeSelect.value) {
        typeField.value = typeSelect.value;
      }

      updateBrandSelect(typeField.value, brandSelect);
      syncSelectWithValue(brandSelect, brandField.value);
    });

    typeField.addEventListener("input", function onTypeInput() {
      syncSelectWithValue(typeSelect, typeField.value);
      updateBrandSelect(typeField.value, brandSelect);
      syncSelectWithValue(brandSelect, brandField.value);
    });

    brandSelect.addEventListener("change", function onBrandChange() {
      if (brandSelect.value) {
        brandField.value = brandSelect.value;
      }
    });

    brandField.addEventListener("input", function onBrandInput() {
      syncSelectWithValue(brandSelect, brandField.value);
    });
  }

  function applyTechnicianSelection(form) {
    const technician = getSelectedTechnician(form.elements.tecnicoId && form.elements.tecnicoId.value);
    const cpfValue = technician ? technician.cpf : "";

    form.elements.responsavelNome.value = technician ? technician.nome : "";
    form.elements.responsavelMatricula.value = technician ? technician.matricula : "";
    form.elements.responsavelCpf.value = cpfValue ? FormUtils.formatCpf(cpfValue) : "";

    if (technician && form.elements.cidade) {
      form.elements.cidade.value = technician.cidade;
    }
  }

  function getSelectedTechnician(technicianId) {
    if (technicianId === "") {
      return null;
    }

    return techniciansData.tecnicos_n2[Number(technicianId)] || null;
  }

  function setupDocumentPreview(config) {
    const form = config.form;
    const container = document.getElementById(config.previewId);

    if (!form || !container) {
      return;
    }

    const updatePreview = function updatePreview() {
      config.render(container, config.getData());
    };

    form.addEventListener("input", updatePreview);
    form.addEventListener("change", updatePreview);
    updatePreview();
  }

  async function loadTechnicians() {
    try {
      const response = await window.fetch(TECHNICIANS_FILE, {
        cache: "no-store"
      });

      if (!response.ok) {
        throw new Error("Falha ao carregar técnicos.");
      }

      const data = await response.json();

      if (!data || !Array.isArray(data.tecnicos_n2)) {
        throw new Error("Arquivo de técnicos inválido.");
      }

      return normalizeTechnicians(data);
    } catch (error) {
      console.warn("Não foi possível carregar os técnicos em assets/tecnicos.json.", error);
      return normalizeTechnicians({ tecnicos_n2: [] });
    }
  }

  async function loadResponsibilityCompanies() {
    try {
      const response = await window.fetch(COMPANIES_FILE, {
        cache: "no-store"
      });

      if (!response.ok) {
        throw new Error("Falha ao carregar empresas.");
      }

      const data = await response.json();
      const companies = Array.isArray(data && data.empresas) ? data.empresas : Array.isArray(data) ? data : null;

      if (!companies) {
        throw new Error("Arquivo de empresas inválido.");
      }

      return normalizeResponsibilityCompanies(companies);
    } catch (error) {
      console.warn("Não foi possível carregar as empresas em assets/empresas.json.", error);
      return normalizeResponsibilityCompanies([]);
    }
  }

  async function loadEquipmentOptions() {
    try {
      const response = await window.fetch(EQUIPMENT_OPTIONS_FILE, {
        cache: "no-store"
      });

      if (!response.ok) {
        throw new Error("Falha ao carregar opções de equipamento.");
      }

      const data = await response.json();

      if (!data || !Array.isArray(data.tipos) || !data.marcas_por_tipo) {
        throw new Error("Arquivo de opções de equipamento inválido.");
      }

      return normalizeEquipmentOptions(data);
    } catch (error) {
      console.warn("Não foi possível carregar as opções de equipamento em assets/equipamentos.json.", error);
      return normalizeEquipmentOptions(EMPTY_EQUIPMENT_OPTIONS);
    }
  }

  function normalizeTechnicians(data) {
    return {
      tecnicos_n2: data.tecnicos_n2.map(function mapTechnician(technician) {
        return {
          nome: PdfUtils.safeValue(technician.nome),
          matricula: String(technician.matricula || ""),
          cpf: String(technician.cpf || "").replace(/\D/g, ""),
          cidade: PdfUtils.safeValue(technician.cidade, "Curitiba")
        };
      })
    };
  }

  function normalizeResponsibilityCompanies(data) {
    return data
      .map(function mapCompany(company) {
        const label = PdfUtils.safeValue(company.label);

        return {
          id: String(company.id || "").trim(),
          label: label,
          termName: PdfUtils.safeValue(company.termName, label),
          cnpj: PdfUtils.safeValue(company.cnpj)
        };
      })
      .filter(function hasId(company) {
        return Boolean(company.id);
      });
  }

  function normalizeEquipmentOptions(data) {
    const types = data.tipos
      .map(function mapType(type) {
        return PdfUtils.safeValue(type);
      })
      .filter(Boolean);
    const brandsByType = {};

    types.forEach(function eachType(type) {
      const source = data.marcas_por_tipo[type] || data.marcas_por_tipo[normalizeKey(type)] || [];
      brandsByType[type] = source
        .map(function mapBrand(brand) {
          return PdfUtils.safeValue(brand);
        })
        .filter(Boolean);
    });

    return {
      tipos: types,
      marcas_por_tipo: brandsByType
    };
  }

  function updateBrandSelect(typeValue, select) {
    populateSelect(select, getBrandsForType(typeValue), "Selecionar sugestão");
  }

  function getDefaultEquipmentType() {
    return equipmentOptionsData.tipos[0] || "";
  }

  function getBrandsForType(typeValue) {
    const normalizedType = normalizeKey(typeValue);
    const matchingType = equipmentOptionsData.tipos.find(function findType(type) {
      return normalizeKey(type) === normalizedType;
    });

    if (matchingType) {
      const suggestions = equipmentOptionsData.marcas_por_tipo[matchingType] || [];
      return suggestions.length > 0 ? suggestions : getAllBrands();
    }

    return getAllBrands();
  }

  function getAllBrands() {
    return Array.from(
      new Set(
        Object.values(equipmentOptionsData.marcas_por_tipo).flat()
      )
    );
  }

  function populateSelect(select, values, placeholder) {
    const currentValue = select.value;

    select.innerHTML = "";

    const firstOption = document.createElement("option");
    firstOption.value = "";
    firstOption.textContent = placeholder;
    select.appendChild(firstOption);

    values.forEach(function appendValue(value) {
      const option = document.createElement("option");
      option.value = value;
      option.textContent = value;
      select.appendChild(option);
    });

    if (Array.from(select.options).some(function hasOption(option) { return option.value === currentValue; })) {
      select.value = currentValue;
    }
  }

  function syncSelectWithValue(select, value) {
    const normalizedValue = normalizeKey(value);
    const matchingOption = Array.from(select.options).find(function findOption(option) {
      return normalizeKey(option.value) === normalizedValue;
    });

    select.value = matchingOption ? matchingOption.value : "";
  }

  function normalizeKey(value) {
    return String(value || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim()
      .toLowerCase();
  }

  function getFormSnapshot(form) {
    const formData = new FormData(form);
    const snapshot = {};

    formData.forEach(function assignValue(value, key) {
      snapshot[key] = FormUtils.sanitizeInputValue(value);
    });

    return snapshot;
  }

  function ensureDefaultRoute() {
    if (window.location.hash === DEFAULT_ROUTE_HASH) {
      return;
    }

    if (window.history && typeof window.history.replaceState === "function") {
      window.history.replaceState(null, "", DEFAULT_ROUTE_HASH);
      return;
    }

    window.location.hash = DEFAULT_ROUTE_HASH;
  }

  function syncRoute() {
    const activePanel = ROUTES[window.location.hash] || ROUTES[DEFAULT_ROUTE_HASH];

    document.querySelectorAll("[data-panel]").forEach(function togglePanel(panel) {
      const isActive = panel.dataset.panel === activePanel;
      panel.hidden = !isActive;
    });

    document.querySelectorAll("[data-target]").forEach(function toggleCard(card) {
      card.classList.toggle("is-active", card.dataset.target === activePanel);
    });
  }

  function generateResponsibilityPdf(data) {
    const doc = PdfUtils.createPdfDocument({
      title: "Termo de Responsabilidade",
      subject: "Disponibilização de Equipamentos"
    });
    const ctx = PdfUtils.createLayoutContext(doc);

    PdfUtils.drawHeader(ctx, "TERMO  DE  RESPONSABILIDADE", "Disponibilização  de  Equipamentos");
    PdfUtils.drawParagraph(
      ctx,
      "Pelo presente Termo de Responsabilidade, eu " +
        data.nome +
        ", CPF nº " +
        data.cpf +
        ", matrícula nº " +
        data.matricula +
        ", na qualidade de empregado " +
        data.empresaNome +
        ", sociedade empresária limitada, CNPJ nº " +
        data.empresaCnpj +
        ' ("EMPREGADORA"), DECLARO o seguinte:'
    );
    PdfUtils.drawParagraph(
      ctx,
      "1. Para o desempenho de minhas funções, recebi, em comodato, os equipamentos e acessórios abaixo relacionados, os quais se encontram em meu poder até esta data:"
    );
    PdfUtils.drawEquipmentTable(ctx, buildEquipmentRows(data));
    PdfUtils.drawParagraph(
      ctx,
      "2. Estou ciente e de acordo com a política de uso dos Equipamentos, disponível no Manual do Colaborador, no seguinte endereço:"
    );
    PdfUtils.drawLinkLines(ctx, PdfUtils.MANUAL_URL);

    RESPONSIBILITY_CLAUSES.forEach(function eachClause(clause) {
      PdfUtils.drawParagraph(ctx, clause);
    });

    PdfUtils.drawParagraph(
      ctx,
      "Ciente e de acordo com as declarações e compromissos ora assumidos, data e assino este termo."
    );
    PdfUtils.drawParagraph(ctx, "Local, data da assinatura digital/eletrônica.");
    PdfUtils.drawSignature(ctx, ["(assinado eletronicamente)", "Empregado"]);
    PdfUtils.drawFooters(doc, "Disponibilização de Equipamentos", "TERMO DE RESPONSABILIDADE");

    doc.save(PdfUtils.formatFileName("TERMO_RESPONSABILIDADE", data.nome));
  }

  function generateReturnPdf(data) {
    const doc = PdfUtils.createPdfDocument({
      title: "Termo de Devolução",
      subject: "Devolução de Equipamentos"
    });
    const ctx = PdfUtils.createLayoutContext(doc);

    PdfUtils.drawHeader(ctx, "TERMO DE DEVOLUÇÃO", "Devolução de Equipamentos.");
    PdfUtils.drawParagraph(
      ctx,
      "Eu, " +
        data.responsavelNome +
        ", inscrito(a) no CPF sob nº " +
        data.responsavelCpf +
        ", matrícula nº " +
        data.responsavelMatricula +
        ", confirmo a devolução, ao Departamento de TI, dos equipamentos do colaborador " +
        data.colaboradorNome +
        ", no CPF sob nº " +
        data.colaboradorCpf +
        ", matrícula sob o nº " +
        data.colaboradorMatricula +
        " especificados a seguir:"
    );
    PdfUtils.drawEquipmentTable(ctx, buildEquipmentRows(data));
    PdfUtils.drawParagraph(ctx, data.cidade + ", " + PdfUtils.formatLongDate(data.data) + ".", {
      after: 8
    });
    PdfUtils.drawSignature(ctx, [
      { text: data.responsavelNome, bold: true },
      data.responsavelCargo
    ]);
    PdfUtils.drawFooters(doc, "Devolução de Equipamentos", "TERMO DE DEVOLUÇÃO");

    doc.save(PdfUtils.formatFileName("TERMO_DEVOLUCAO", data.colaboradorNome));
  }

  function buildEquipmentRows(data) {
    return [
      ["TIPO DO EQUIPAMENTO", data.tipoEquipamento],
      ["MARCA", data.marca || "-"],
      ["MODELO", data.modelo || "-"],
      ["SERIAL", data.serial],
      ["CARACTERISTICAS DO EQUIPAMENTO", data.caracteristicas || "-"],
      ["ACESSÓRIOS", data.acessorios || "-"],
      ["CÓDIGO DE PATRIMÔNIO", data.patrimonio]
    ];
  }

  function withResponsibilityDefaults(data) {
    const company = getResponsibilityCompany(data.empresaId);

    return {
      nome: PdfUtils.safeValue(data.nome),
      cpf: PdfUtils.safeValue(data.cpf),
      matricula: PdfUtils.safeValue(data.matricula),
      empresaNome: company.termName,
      empresaCnpj: company.cnpj,
      cidade: PdfUtils.safeValue(data.cidade, "Curitiba"),
      tipoEquipamento: PdfUtils.safeValue(data.tipoEquipamento, getDefaultEquipmentType()),
      marca: PdfUtils.safeValue(data.marca),
      modelo: PdfUtils.safeValue(data.modelo),
      serial: PdfUtils.safeValue(data.serial),
      caracteristicas: PdfUtils.safeValue(data.caracteristicas, "-"),
      acessorios: PdfUtils.safeValue(data.acessorios, "-"),
      patrimonio: PdfUtils.safeValue(data.patrimonio)
    };
  }

  function getResponsibilityCompany(companyId) {
    const normalizedCompanyId = normalizeKey(companyId);

    return responsibilityCompanies.find(function findCompany(company) {
      return normalizeKey(company.id) === normalizedCompanyId;
    }) || responsibilityCompanies.find(function findDefaultCompany(company) {
      return company.id === DEFAULT_RESPONSIBILITY_COMPANY_ID;
    }) || responsibilityCompanies[0] || EMPTY_COMPANY;
  }

  function withReturnDefaults(data) {
    return {
      responsavelNome: PdfUtils.safeValue(data.responsavelNome),
      responsavelCpf: PdfUtils.safeValue(data.responsavelCpf),
      responsavelMatricula: PdfUtils.safeValue(data.responsavelMatricula),
      responsavelCargo: FIXED_TI_ROLE,
      colaboradorNome: PdfUtils.safeValue(data.colaboradorNome),
      colaboradorCpf: PdfUtils.safeValue(data.colaboradorCpf),
      colaboradorMatricula: PdfUtils.safeValue(data.colaboradorMatricula),
      tipoEquipamento: PdfUtils.safeValue(data.tipoEquipamento, getDefaultEquipmentType()),
      marca: PdfUtils.safeValue(data.marca, "-"),
      modelo: PdfUtils.safeValue(data.modelo, "-"),
      serial: PdfUtils.safeValue(data.serial),
      caracteristicas: PdfUtils.safeValue(data.caracteristicas, "-"),
      acessorios: PdfUtils.safeValue(data.acessorios, "-"),
      patrimonio: PdfUtils.safeValue(data.patrimonio),
      cidade: PdfUtils.safeValue(data.cidade, "Curitiba"),
      data: PdfUtils.safeValue(data.data, FormUtils.getTodayIso())
    };
  }
})();
