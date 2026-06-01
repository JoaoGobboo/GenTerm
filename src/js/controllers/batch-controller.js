(function () {
  const BatchModel = window.TermosBatchModel;
  const FormUtils = window.TermosFormUtils;
  const HtmlUtils = window.TermosHtmlUtils;
  const PdfUtils = window.TermosPdfUtils;
  const SpreadsheetParser = window.TermosSpreadsheetParser;
  const TermModel = window.TermosTermModel;

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
      BatchModel.downloadTemplate(elements.typeSelect.value);
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
        const result = BatchModel.validateParsedFile(elements.typeSelect.value, parsedFile, dataContext);

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

  function generateBatchPdf(elements, state) {
    const type = elements.typeSelect.value;
    const schema = BatchModel.BATCH_TYPES[type] || BatchModel.BATCH_TYPES.responsabilidade;
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
                "<td>" + HtmlUtils.escapeHtml(row.rowNumber) + "</td>" +
                "<td>" + HtmlUtils.escapeHtml(row.errors.join(" ")) + "</td>" +
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
              '<code>' + HtmlUtils.escapeHtml(index + 1) + '</code>' +
              '<span>=</span>' +
              '<strong>' + HtmlUtils.escapeHtml(company.label || company.termName) + '</strong>' +
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
              '<code>' + HtmlUtils.escapeHtml(index + 1) + '</code>' +
              '<span>=</span>' +
              '<strong>' + HtmlUtils.escapeHtml(technician.nome) + '</strong>' +
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

  window.TermosBatchController = {
    setupBatchPanel: setupBatchPanel
  };
})();
