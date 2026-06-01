(function () {
  const FormUtils = window.TermosFormUtils;
  const PdfUtils = window.TermosPdfUtils;
  const Specs = window.TermosDocumentSpecs;
  const FIXED_TI_ROLE = Specs.FIXED_TI_ROLE;
  const RESPONSIBILITY_CLAUSES = Specs.RESPONSIBILITY.clauses;

  function withResponsibilityDefaults(data, dataContext) {
    const company = dataContext.getResponsibilityCompany(data.empresaId);

    return {
      nome: PdfUtils.safeValue(data.nome),
      cpf: PdfUtils.safeValue(data.cpf),
      matricula: PdfUtils.safeValue(data.matricula),
      empresaNome: company.termName,
      empresaCnpj: company.cnpj,
      cidade: PdfUtils.safeValue(data.cidade, "Curitiba"),
      tipoEquipamento: PdfUtils.safeValue(data.tipoEquipamento, dataContext.getDefaultEquipmentType()),
      marca: PdfUtils.safeValue(data.marca),
      modelo: PdfUtils.safeValue(data.modelo),
      serial: PdfUtils.safeValue(data.serial),
      caracteristicas: PdfUtils.safeValue(data.caracteristicas, "-"),
      acessorios: PdfUtils.safeValue(data.acessorios, "-"),
      patrimonio: PdfUtils.safeValue(data.patrimonio)
    };
  }

  function withReturnDefaults(data, dataContext) {
    return {
      responsavelNome: PdfUtils.safeValue(data.responsavelNome),
      responsavelCpf: PdfUtils.safeValue(data.responsavelCpf),
      responsavelMatricula: PdfUtils.safeValue(data.responsavelMatricula),
      responsavelCargo: FIXED_TI_ROLE,
      colaboradorNome: PdfUtils.safeValue(data.colaboradorNome),
      colaboradorCpf: PdfUtils.safeValue(data.colaboradorCpf),
      colaboradorMatricula: PdfUtils.safeValue(data.colaboradorMatricula),
      tipoEquipamento: PdfUtils.safeValue(data.tipoEquipamento, dataContext.getDefaultEquipmentType()),
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

  function buildEquipmentRows(data) {
    const labels = Specs.EQUIPMENT_ROW_LABELS;
    return [
      [labels[0], data.tipoEquipamento],
      [labels[1], data.marca || "-"],
      [labels[2], data.modelo || "-"],
      [labels[3], data.serial],
      [labels[4], data.caracteristicas || "-"],
      [labels[5], data.acessorios || "-"],
      [labels[6], data.patrimonio]
    ];
  }

  function createResponsibilityPdf(data) {
    const doc = PdfUtils.createPdfDocument({
      title: "Termo de Responsabilidade",
      subject: Specs.RESPONSIBILITY.subtitle
    });

    drawResponsibilityTerm(doc, data);
    PdfUtils.drawFooters(doc, Specs.RESPONSIBILITY.footerLeft, Specs.RESPONSIBILITY.footerRight);

    return doc;
  }

  function createReturnPdf(data) {
    const doc = PdfUtils.createPdfDocument({
      title: "Termo de Devolução",
      subject: Specs.RETURN.footerLeft
    });

    drawReturnTerm(doc, data);
    PdfUtils.drawFooters(doc, Specs.RETURN.footerLeft, Specs.RETURN.footerRight);

    return doc;
  }

  function createBatchResponsibilityPdf(rows) {
    const doc = PdfUtils.createPdfDocument({
      title: "Termos de Responsabilidade em Lote",
      subject: Specs.RESPONSIBILITY.subtitle
    });

    rows.forEach(function drawRow(data, index) {
      if (index > 0) {
        doc.addPage();
      }

      drawResponsibilityTerm(doc, data);
    });

    PdfUtils.drawFooters(doc, Specs.RESPONSIBILITY.footerLeft, Specs.RESPONSIBILITY.footerRight);

    return doc;
  }

  function createBatchReturnPdf(rows) {
    const doc = PdfUtils.createPdfDocument({
      title: "Termos de Devolução em Lote",
      subject: Specs.RETURN.footerLeft
    });

    rows.forEach(function drawRow(data, index) {
      if (index > 0) {
        doc.addPage();
      }

      drawReturnTerm(doc, data);
    });

    PdfUtils.drawFooters(doc, Specs.RETURN.footerLeft, Specs.RETURN.footerRight);

    return doc;
  }

  function drawResponsibilityTerm(doc, data) {
    const ctx = PdfUtils.createLayoutContext(doc);

    PdfUtils.drawHeader(ctx, Specs.RESPONSIBILITY.pdfTitle, "Disponibilização  de  Equipamentos");
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
    PdfUtils.drawParagraph(ctx, Specs.RESPONSIBILITY.staticParagraph1);
    PdfUtils.drawEquipmentTable(ctx, buildEquipmentRows(data));
    PdfUtils.drawParagraph(ctx, Specs.RESPONSIBILITY.staticParagraph2);
    PdfUtils.drawLinkLines(ctx, PdfUtils.MANUAL_URL);

    RESPONSIBILITY_CLAUSES.forEach(function eachClause(clause) {
      PdfUtils.drawParagraph(ctx, clause);
    });

    PdfUtils.drawParagraph(ctx, Specs.RESPONSIBILITY.closing);
    PdfUtils.drawParagraph(ctx, Specs.RESPONSIBILITY.locationLine);
    PdfUtils.drawSignature(ctx, Specs.RESPONSIBILITY.signatureLines);
  }

  function drawReturnTerm(doc, data) {
    const ctx = PdfUtils.createLayoutContext(doc);

    PdfUtils.drawHeader(ctx, Specs.RETURN.title, Specs.RETURN.subtitle);
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
  }

  function generateResponsibilityPdf(data) {
    const doc = createResponsibilityPdf(data);

    doc.save(PdfUtils.formatFileName("TERMO_RESPONSABILIDADE", data.nome));
  }

  function generateReturnPdf(data) {
    const doc = createReturnPdf(data);

    doc.save(PdfUtils.formatFileName("TERMO_DEVOLUCAO", data.colaboradorNome));
  }

  window.TermosTermModel = {
    RESPONSIBILITY_CLAUSES: RESPONSIBILITY_CLAUSES,
    buildEquipmentRows: buildEquipmentRows,
    createBatchResponsibilityPdf: createBatchResponsibilityPdf,
    createBatchReturnPdf: createBatchReturnPdf,
    generateResponsibilityPdf: generateResponsibilityPdf,
    generateReturnPdf: generateReturnPdf,
    withResponsibilityDefaults: withResponsibilityDefaults,
    withReturnDefaults: withReturnDefaults
  };
})();
