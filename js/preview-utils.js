(function () {
  const PdfUtils = window.TermosPdfUtils;

  function renderResponsibility(container, data, config) {
    if (!container) {
      return;
    }

    const options = config || {};
    const clauses = Array.isArray(options.clauses) ? options.clauses : [];
    const manualUrl = options.manualUrl || "";

    container.innerHTML =
      '<div class="doc-preview-page">' +
        renderHeader("TERMO DE RESPONSABILIDADE", "Disponibilização de Equipamentos") +
        '<div class="doc-preview-body">' +
          renderParagraph(
            "Pelo presente Termo de Responsabilidade, eu " +
              renderInlineValue(data.nome, "Nome do colaborador") +
              ", CPF nº " +
              renderInlineValue(data.cpf, "000.000.000-00") +
              ", matrícula nº " +
              renderInlineValue(data.matricula, "000000") +
              ", na qualidade de empregado " +
              renderInlineValue(data.empresaNome, "GRAFICA E EDITORA POSIGRAF LTDA") +
              ", sociedade empresária limitada, CNPJ nº " +
              renderInlineValue(data.empresaCnpj, "00.000.000/0000-00") +
              ' ("EMPREGADORA"), DECLARO o seguinte:'
          ) +
          renderParagraph(
            "1. Para o desempenho de minhas funções, recebi, em comodato, os equipamentos e acessórios abaixo relacionados, os quais se encontram em meu poder até esta data:"
          ) +
          renderEquipmentTable(options.rows || []) +
          renderParagraph(
            "2. Estou ciente e de acordo com a política de uso dos Equipamentos, disponível no Manual do Colaborador, no seguinte endereço:"
          ) +
          '<p class="doc-preview-link"><a href="' +
            escapeHtml(manualUrl) +
            '" target="_blank" rel="noreferrer">' +
            escapeHtml(manualUrl) +
          "</a></p>" +
          clauses.map(function mapClause(clause) {
            return renderParagraph(clause);
          }).join("") +
          renderParagraph(
            "Ciente e de acordo com as declarações e compromissos ora assumidos, data e assino este termo."
          ) +
          renderParagraph("Local, data da assinatura digital/eletrônica.") +
          renderSignature(["(assinado eletronicamente)", "Empregado"]) +
        "</div>" +
        renderFooter("Disponibilização de Equipamentos", "TERMO DE RESPONSABILIDADE") +
      "</div>";
  }

  function renderReturn(container, data, config) {
    if (!container) {
      return;
    }

    const options = config || {};
    const longDate = PdfUtils && typeof PdfUtils.formatLongDate === "function"
      ? PdfUtils.formatLongDate(data.data)
      : safeValue(data.data, "Data");

    container.innerHTML =
      '<div class="doc-preview-page">' +
        renderHeader("TERMO DE DEVOLUÇÃO", "Devolução de Equipamentos.") +
        '<div class="doc-preview-body">' +
          renderParagraph(
            "Eu, " +
              renderInlineValue(data.responsavelNome, "Responsável TI") +
              ", inscrito(a) no CPF sob nº " +
              renderInlineValue(data.responsavelCpf, "000.000.000-00") +
              ", matrícula nº " +
              renderInlineValue(data.responsavelMatricula, "000000") +
              ", confirmo a devolução, ao Departamento de TI, dos equipamentos do colaborador " +
              renderInlineValue(data.colaboradorNome, "Nome do colaborador") +
              ", no CPF sob nº " +
              renderInlineValue(data.colaboradorCpf, "000.000.000-00") +
              ", matrícula sob o nº " +
              renderInlineValue(data.colaboradorMatricula, "000000") +
              " especificados a seguir:"
          ) +
          renderEquipmentTable(options.rows || []) +
          renderParagraph(
            renderInlineValue(data.cidade, "Curitiba") +
            ", " +
            renderInlineValue(longDate, "Data por extenso") +
            ".",
            "doc-preview-location"
          ) +
          renderSignature([
            safeValue(data.responsavelNome, "Responsável TI"),
            safeValue(data.responsavelCargo, "Responsável Departamento TI")
          ]) +
        "</div>" +
        renderFooter("Devolução de Equipamentos", "TERMO DE DEVOLUÇÃO") +
      "</div>";
  }

  function renderHeader(title, subtitle) {
    return (
      '<div class="doc-preview-header">' +
        '<div class="doc-preview-title">' + escapeHtml(title) + "</div>" +
        '<div class="doc-preview-subtitle">' + escapeHtml(subtitle) + "</div>" +
      "</div>"
    );
  }

  function renderParagraph(text, extraClassName) {
    const className = extraClassName ? "doc-preview-paragraph " + extraClassName : "doc-preview-paragraph";
    return '<p class="' + className + '">' + text + "</p>";
  }

  function renderEquipmentTable(rows) {
    return (
      '<table class="doc-preview-table">' +
        "<tbody>" +
          rows.map(function mapRow(row) {
            return (
              "<tr>" +
                "<td>" + escapeHtml(safeValue(row[0], "-")) + "</td>" +
                "<td>" + renderInlineValue(row[1], "-") + "</td>" +
              "</tr>"
            );
          }).join("") +
        "</tbody>" +
      "</table>"
    );
  }

  function renderSignature(lines) {
    return (
      '<div class="doc-preview-signature">' +
        '<div class="doc-preview-signature-line"></div>' +
        lines.map(function mapLine(line) {
          return '<p class="doc-preview-signature-text">' + escapeHtml(safeValue(line)) + "</p>";
        }).join("") +
      "</div>"
    );
  }

  function renderFooter(leftText, rightText) {
    return (
      '<div class="doc-preview-footer">' +
        '<span>' + escapeHtml(leftText) + "</span>" +
        '<span>' + escapeHtml(rightText) + "</span>" +
      "</div>"
    );
  }

  function renderInlineValue(value, fallback) {
    const normalized = safeValue(value);

    if (!normalized || normalized === "-") {
      return '<span class="doc-preview-placeholder">' + escapeHtml(fallback || "-") + "</span>";
    }

    return escapeHtml(normalized).replace(/\n/g, "<br>");
  }

  function safeValue(value, fallback) {
    if (PdfUtils && typeof PdfUtils.safeValue === "function") {
      return PdfUtils.safeValue(value, fallback);
    }

    const normalized = String(value || "").trim();
    return normalized || String(fallback || "");
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  window.TermosPreviewUtils = {
    renderResponsibility: renderResponsibility,
    renderReturn: renderReturn
  };
})();
