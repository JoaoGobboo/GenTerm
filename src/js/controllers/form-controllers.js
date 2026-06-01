(function () {
  const DataUtils = window.TermosData;
  const FormUtils = window.TermosFormUtils;
  const PdfUtils = window.TermosPdfUtils;
  const PreviewUtils = window.TermosPreviewUtils;
  const TermModel = window.TermosTermModel;

  function setupResponsibilityForm(config) {
    const dataContext = config && config.dataContext;
    const form = document.getElementById("responsabilidade-form");

    if (!form || !dataContext) {
      return;
    }

    setupResponsibilityCompanySelect(form, dataContext);
    setupEquipmentSelectors(form, dataContext, {
      typeSelectId: "resp-tipo-equipamento-select",
      typeInputName: "tipoEquipamento",
      brandSelectId: "resp-marca-select",
      brandInputName: "marca"
    });
    setupDocumentPreview({
      form: form,
      previewId: "responsabilidade-preview",
      getData: function getData() {
        return TermModel.withResponsibilityDefaults(getFormSnapshot(form), dataContext);
      },
      render: function renderPreview(container, data) {
        PreviewUtils.renderResponsibility(container, data, {
          clauses: TermModel.RESPONSIBILITY_CLAUSES,
          manualUrl: PdfUtils.MANUAL_URL,
          rows: TermModel.buildEquipmentRows(data)
        });
      }
    });
    FormUtils.setupForm({
      form: form,
      busyText: "Gerando...",
      onSubmit: function onSubmit(data) {
        TermModel.generateResponsibilityPdf(TermModel.withResponsibilityDefaults(data, dataContext));
      }
    });
  }

  function setupReturnForm(config) {
    const dataContext = config && config.dataContext;
    const form = document.getElementById("devolucao-form");

    if (!form || !dataContext) {
      return;
    }

    setupTechnicianSelect(form, dataContext);
    setupEquipmentSelectors(form, dataContext, {
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
        return TermModel.withReturnDefaults(getFormSnapshot(form), dataContext);
      },
      render: function renderPreview(container, data) {
        PreviewUtils.renderReturn(container, data, {
          rows: TermModel.buildEquipmentRows(data)
        });
      }
    });
    FormUtils.setupForm({
      form: form,
      busyText: "Gerando...",
      onSubmit: function onSubmit(data) {
        TermModel.generateReturnPdf(TermModel.withReturnDefaults(data, dataContext));
      }
    });
  }

  function setupResponsibilityCompanySelect(form, dataContext) {
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

    dataContext.getResponsibilityCompanies().forEach(function appendCompany(company) {
      const option = document.createElement("option");
      option.value = company.id;
      option.textContent = company.label;
      select.appendChild(option);
    });

    if (currentValue && dataContext.getResponsibilityCompanies().some(function hasCompany(company) { return company.id === currentValue; })) {
      select.value = currentValue;
    }

    if (!select.value) {
      select.value = dataContext.getResponsibilityCompany(DataUtils.DEFAULT_RESPONSIBILITY_COMPANY_ID).id;
    }
  }

  function setupTechnicianSelect(form, dataContext) {
    const select = form.elements.tecnicoId;
    const technicians = dataContext.getTechnicians();

    if (!select) {
      return;
    }

    technicians.forEach(function appendTechnician(technician, index) {
      const option = document.createElement("option");
      option.value = String(index);
      option.textContent = technician.nome;
      select.appendChild(option);
    });

    select.addEventListener("change", function onChange() {
      applyTechnicianSelection(form, dataContext);
    });

    if (!select.value && technicians.length > 0) {
      select.value = "0";
    }

    applyTechnicianSelection(form, dataContext);
  }

  function setupEquipmentSelectors(form, dataContext, config) {
    const typeField = form.elements[config.typeInputName];
    const brandField = form.elements[config.brandInputName];
    const typeSelect = document.getElementById(config.typeSelectId);
    const brandSelect = document.getElementById(config.brandSelectId);

    if (!typeField || !brandField || !typeSelect || !brandSelect) {
      return;
    }

    if (!typeField.value) {
      typeField.value = dataContext.getDefaultEquipmentType();
    }

    populateSelect(typeSelect, dataContext.getEquipmentTypes(), "Selecionar sugestão");
    syncSelectWithValue(typeSelect, typeField.value);
    updateBrandSelect(typeField.value, brandSelect, dataContext);
    syncSelectWithValue(brandSelect, brandField.value);

    typeSelect.addEventListener("change", function onTypeChange() {
      if (typeSelect.value) {
        typeField.value = typeSelect.value;
      }

      updateBrandSelect(typeField.value, brandSelect, dataContext);
      syncSelectWithValue(brandSelect, brandField.value);
    });

    typeField.addEventListener("input", function onTypeInput() {
      syncSelectWithValue(typeSelect, typeField.value);
      updateBrandSelect(typeField.value, brandSelect, dataContext);
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

  function applyTechnicianSelection(form, dataContext) {
    const technician = dataContext.getSelectedTechnician(form.elements.tecnicoId && form.elements.tecnicoId.value);
    const cpfValue = technician ? technician.cpf : "";

    form.elements.responsavelNome.value = technician ? technician.nome : "";
    form.elements.responsavelMatricula.value = technician ? technician.matricula : "";
    form.elements.responsavelCpf.value = cpfValue ? FormUtils.formatCpf(cpfValue) : "";

    if (technician && form.elements.cidade) {
      form.elements.cidade.value = technician.cidade;
    }
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

  function updateBrandSelect(typeValue, select, dataContext) {
    populateSelect(select, dataContext.getBrandsForType(typeValue), "Selecionar sugestão");
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
    const normalizedValue = DataUtils.normalizeKey(value);
    const matchingOption = Array.from(select.options).find(function findOption(option) {
      return DataUtils.normalizeKey(option.value) === normalizedValue;
    });

    select.value = matchingOption ? matchingOption.value : "";
  }

  function getFormSnapshot(form) {
    const formData = new FormData(form);
    const snapshot = {};

    formData.forEach(function assignValue(value, key) {
      snapshot[key] = FormUtils.sanitizeInputValue(value);
    });

    return snapshot;
  }

  window.TermosFormControllers = {
    setupResponsibilityForm: setupResponsibilityForm,
    setupReturnForm: setupReturnForm
  };
})();
