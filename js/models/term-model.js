(function () {
  const FormUtils = window.TermosFormUtils;
  const PdfUtils = window.TermosPdfUtils;
  const FIXED_TI_ROLE = "Responsável Departamento TI";
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

  function createResponsibilityPdf(data) {
    const doc = PdfUtils.createPdfDocument({
      title: "Termo de Responsabilidade",
      subject: "Disponibilização de Equipamentos"
    });

    drawResponsibilityTerm(doc, data);
    PdfUtils.drawFooters(doc, "Disponibilização de Equipamentos", "TERMO DE RESPONSABILIDADE");

    return doc;
  }

  function createReturnPdf(data) {
    const doc = PdfUtils.createPdfDocument({
      title: "Termo de Devolução",
      subject: "Devolução de Equipamentos"
    });

    drawReturnTerm(doc, data);
    PdfUtils.drawFooters(doc, "Devolução de Equipamentos", "TERMO DE DEVOLUÇÃO");

    return doc;
  }

  function createBatchResponsibilityPdf(rows) {
    const doc = PdfUtils.createPdfDocument({
      title: "Termos de Responsabilidade em Lote",
      subject: "Disponibilização de Equipamentos"
    });

    rows.forEach(function drawRow(data, index) {
      if (index > 0) {
        doc.addPage();
      }

      drawResponsibilityTerm(doc, data);
    });

    PdfUtils.drawFooters(doc, "Disponibilização de Equipamentos", "TERMO DE RESPONSABILIDADE");

    return doc;
  }

  function createBatchReturnPdf(rows) {
    const doc = PdfUtils.createPdfDocument({
      title: "Termos de Devolução em Lote",
      subject: "Devolução de Equipamentos"
    });

    rows.forEach(function drawRow(data, index) {
      if (index > 0) {
        doc.addPage();
      }

      drawReturnTerm(doc, data);
    });

    PdfUtils.drawFooters(doc, "Devolução de Equipamentos", "TERMO DE DEVOLUÇÃO");

    return doc;
  }

  function drawResponsibilityTerm(doc, data) {
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
  }

  function drawReturnTerm(doc, data) {
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
