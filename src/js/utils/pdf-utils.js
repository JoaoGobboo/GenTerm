(function () {
  const COMPANY_NAME = "GRAFICA E EDITORA POSIGRAF LTDA";
  const COMPANY_CNPJ = "75.104.422/0008-82";
  const MANUAL_URL =
    "https://positivo.com.br/uploads/intranet/manual_colaborador/manual_do_colaborador_positivo.pdf";
  const MM_PER_PT = 0.352778;
  const COLORS = {
    yellow: [240, 192, 64],
    lightYellow: [245, 208, 112],
    border: [204, 204, 204],
    black: [0, 0, 0],
    footer: [119, 119, 119],
    link: [30, 78, 137],
  };

  function createPdfDocument(metadata) {
    if (!window.jspdf || !window.jspdf.jsPDF) {
      throw new Error("jsPDF não está disponível.");
    }

    const doc = new window.jspdf.jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    doc.setProperties({
      author: COMPANY_NAME,
      creator: "Gerador de Termos",
      title: metadata && metadata.title,
      subject: metadata && metadata.subject,
    });

    return doc;
  }

  function createLayoutContext(doc) {
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    return {
      doc: doc,
      pageWidth: pageWidth,
      pageHeight: pageHeight,
      marginX: 20,
      topMargin: 20,
      contentWidth: pageWidth - 40,
      lineHeight: 5.5,
      paragraphGap: 2.6,
      footerReserve: 24,
      fontSizeMm: 10 * MM_PER_PT,
      y: 20,
    };
  }

  function drawHeader(ctx, title, subtitle) {
    const x = ctx.marginX;
    const y = ctx.y;
    const width = ctx.contentWidth;
    const titleHeight = 12;
    const subtitleHeight = 10;
    const totalHeight = titleHeight + subtitleHeight;

    applyColor(ctx.doc, "setDrawColor", COLORS.border);
    ctx.doc.setLineWidth(0.35);
    ctx.doc.rect(x, y, width, totalHeight);

    applyColor(ctx.doc, "setFillColor", COLORS.yellow);
    ctx.doc.rect(x, y, width, titleHeight, "F");

    applyColor(ctx.doc, "setFillColor", COLORS.lightYellow);
    ctx.doc.rect(x, y + titleHeight, width, subtitleHeight, "F");

    ctx.doc.setFont("helvetica", "bold");
    ctx.doc.setFontSize(12);
    applyColor(ctx.doc, "setTextColor", COLORS.black);
    ctx.doc.text(title, x + width / 2, y + 7.4, { align: "center" });

    ctx.doc.setFont("helvetica", "normal");
    ctx.doc.setFontSize(10);
    ctx.doc.text(subtitle, x + width / 2, y + titleHeight + 6.3, {
      align: "center",
    });

    ctx.y += totalHeight + 10;
  }

  function drawParagraph(ctx, text, options) {
    const config = options || {};
    const x = config.x || ctx.marginX;
    const width = config.width || ctx.contentWidth;
    const after =
      typeof config.after === "number" ? config.after : ctx.paragraphGap;
    const justify = config.justify !== false;
    const lines = splitIntoParagraphLines(ctx.doc, text, width);

    ctx.doc.setFont("helvetica", config.fontStyle || "normal");
    ctx.doc.setFontSize(config.fontSize || 10);
    applyColor(ctx.doc, "setTextColor", COLORS.black);

    lines.forEach(function eachParagraph(paragraphLines, paragraphIndex) {
      paragraphLines.forEach(function eachLine(line, lineIndex) {
        ensureSpace(ctx, ctx.lineHeight);

        const baselineY = ctx.y + ctx.fontSizeMm;
        const isLastLine = lineIndex === paragraphLines.length - 1;

        if (justify && !isLastLine && /\s/.test(line)) {
          drawJustifiedLine(ctx.doc, line, x, baselineY, width);
        } else {
          ctx.doc.text(line, x, baselineY);
        }

        ctx.y += ctx.lineHeight;
      });

      if (paragraphIndex < lines.length - 1) {
        ctx.y += after;
      }
    });

    ctx.y += after;
  }

  function drawEquipmentTable(ctx, rows) {
    const tableX = ctx.marginX;
    const labelWidth = 60;
    const valueWidth = ctx.contentWidth - labelWidth;
    const paddingX = 2;
    const paddingY = 1.7;

    rows.forEach(function drawRow(row) {
      const labelLines = ctx.doc.splitTextToSize(
        safeValue(row[0]),
        labelWidth - paddingX * 2,
      );
      const valueLines = ctx.doc.splitTextToSize(
        safeValue(row[1], "-"),
        valueWidth - paddingX * 2,
      );
      const totalLines = Math.max(labelLines.length, valueLines.length);
      const rowHeight = totalLines * ctx.lineHeight + paddingY * 2;

      ensureSpace(ctx, rowHeight);

      applyColor(ctx.doc, "setDrawColor", COLORS.black);
      ctx.doc.setLineWidth(0.25);
      ctx.doc.rect(tableX, ctx.y, labelWidth, rowHeight);
      ctx.doc.rect(tableX + labelWidth, ctx.y, valueWidth, rowHeight);

      drawCellText(
        ctx,
        labelLines,
        tableX + paddingX,
        ctx.y + paddingY,
        "bold",
      );
      drawCellText(
        ctx,
        valueLines,
        tableX + labelWidth + paddingX,
        ctx.y + paddingY,
        "normal",
      );

      ctx.y += rowHeight;
    });

    ctx.y += 4.5;
  }

  function drawLinkLines(ctx, url) {
    ctx.doc.setFont("helvetica", "normal");
    ctx.doc.setFontSize(10);
    applyColor(ctx.doc, "setTextColor", COLORS.link);

    ctx.doc
      .splitTextToSize(url, ctx.contentWidth)
      .forEach(function eachLine(line) {
        ensureSpace(ctx, ctx.lineHeight);

        const top = ctx.y;
        const width = ctx.doc.getTextWidth(line);

        ctx.doc.text(line, ctx.marginX, top + ctx.fontSizeMm);
        ctx.doc.link(ctx.marginX, top, width, ctx.lineHeight, { url: url });

        ctx.y += ctx.lineHeight;
      });

    applyColor(ctx.doc, "setTextColor", COLORS.black);
    ctx.y += ctx.paragraphGap;
  }

  function drawSignature(ctx, lines) {
    const signatureWidth = 86;
    const centerX = ctx.pageWidth / 2;
    const lineStart = centerX - signatureWidth / 2;
    const lineEnd = centerX + signatureWidth / 2;
    const blockHeight = 26;

    ensureSpace(ctx, blockHeight);

    const lineY = ctx.y + 10;

    applyColor(ctx.doc, "setDrawColor", COLORS.black);
    ctx.doc.setLineWidth(0.25);
    ctx.doc.line(lineStart, lineY, lineEnd, lineY);

    ctx.doc.setFontSize(10);
    applyColor(ctx.doc, "setTextColor", COLORS.black);

    lines.forEach(function eachLine(line, index) {
      const signatureLine = normalizeSignatureLine(line);

      ctx.doc.setFont("helvetica", signatureLine.bold ? "bold" : "normal");
      ctx.doc.text(
        signatureLine.text,
        centerX,
        lineY + 6 + index * ctx.lineHeight,
        { align: "center" },
      );
    });

    ctx.y = lineY + 6 + lines.length * ctx.lineHeight + 2;
  }

  function drawFooters(doc, leftText, rightText) {
    const pageCount = doc.getNumberOfPages();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const marginX = 20;
    const lineY = pageHeight - 14;

    for (let page = 1; page <= pageCount; page += 1) {
      doc.setPage(page);
      applyColor(doc, "setDrawColor", COLORS.border);
      doc.setLineWidth(0.25);
      doc.line(marginX, lineY, pageWidth - marginX, lineY);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      applyColor(doc, "setTextColor", COLORS.footer);
      doc.text(leftText, marginX, lineY + 5);
      doc.text(rightText, pageWidth - marginX, lineY + 5, { align: "right" });
    }
  }

  function ensureSpace(ctx, heightNeeded) {
    const bottomLimit = ctx.pageHeight - ctx.footerReserve;

    if (ctx.y + heightNeeded <= bottomLimit) {
      return;
    }

    ctx.doc.addPage();
    ctx.y = ctx.topMargin;
  }

  function formatFileName(prefix, name) {
    const safeName = safeValue(name, "SEM_NOME")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^A-Za-z0-9]+/g, "_")
      .replace(/^_+|_+$/g, "")
      .toUpperCase();

    return prefix + "_" + safeName + ".pdf";
  }

  function formatLongDate(isoDate) {
    const [year, month, day] = String(isoDate || "")
      .split("-")
      .map(Number);
    const date = new Date(year, (month || 1) - 1, day || 1);
    const months = [
      "janeiro",
      "fevereiro",
      "março",
      "abril",
      "maio",
      "junho",
      "julho",
      "agosto",
      "setembro",
      "outubro",
      "novembro",
      "dezembro",
    ];

    return (
      date.getDate() +
      " de " +
      months[date.getMonth()] +
      " de " +
      date.getFullYear()
    );
  }

  function safeValue(value, fallback) {
    const normalized = String(value || "")
      .replace(/\r\n/g, "\n")
      .replace(/[^\S\n]+/g, " ")
      .replace(/\n{3,}/g, "\n\n")
      .trim();

    if (normalized) {
      return normalized;
    }

    return typeof fallback === "string" ? fallback : "";
  }

  function normalizeSignatureLine(line) {
    if (line && typeof line === "object") {
      return {
        text: safeValue(line.text),
        bold: Boolean(line.bold),
      };
    }

    return {
      text: safeValue(line),
      bold: false,
    };
  }

  function splitIntoParagraphLines(doc, text, width) {
    return safeValue(text)
      .split(/\n+/)
      .filter(Boolean)
      .map(function splitParagraph(paragraph) {
        return doc.splitTextToSize(paragraph, width);
      });
  }

  function drawCellText(ctx, lines, x, top, fontStyle) {
    ctx.doc.setFont("helvetica", fontStyle);
    ctx.doc.setFontSize(10);
    applyColor(ctx.doc, "setTextColor", COLORS.black);

    lines.forEach(function eachLine(line, index) {
      ctx.doc.text(line, x, top + ctx.fontSizeMm + index * ctx.lineHeight);
    });
  }

  function drawJustifiedLine(doc, line, x, y, width) {
    const words = line.trim().split(/\s+/);

    if (words.length <= 1) {
      doc.text(line, x, y);
      return;
    }

    const wordsWidth = words.reduce(function sum(total, word) {
      return total + doc.getTextWidth(word);
    }, 0);
    const gapWidth = (width - wordsWidth) / (words.length - 1);
    let cursorX = x;

    words.forEach(function eachWord(word, index) {
      doc.text(word, cursorX, y);
      cursorX += doc.getTextWidth(word);

      if (index < words.length - 1) {
        cursorX += gapWidth;
      }
    });
  }

  function applyColor(doc, methodName, rgb) {
    doc[methodName].apply(doc, rgb);
  }

  window.TermosPdfUtils = {
    COMPANY_CNPJ: COMPANY_CNPJ,
    COMPANY_NAME: COMPANY_NAME,
    MANUAL_URL: MANUAL_URL,
    createLayoutContext: createLayoutContext,
    createPdfDocument: createPdfDocument,
    drawEquipmentTable: drawEquipmentTable,
    drawFooters: drawFooters,
    drawHeader: drawHeader,
    drawLinkLines: drawLinkLines,
    drawParagraph: drawParagraph,
    drawSignature: drawSignature,
    formatFileName: formatFileName,
    formatLongDate: formatLongDate,
    safeValue: safeValue,
  };
})();
