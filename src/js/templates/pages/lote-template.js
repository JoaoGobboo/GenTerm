(function () {
  const loader = window.TermosHtmlLoader;

  if (!loader || typeof loader.registerTemplate !== "function") {
    return;
  }

  loader.registerTemplate("src/html/pages/lote.html", `<article class="tool-panel" data-panel="lote" hidden>
  <div class="panel-layout batch-layout">
    <section class="form-card panel-card batch-panel-card">
      <div class="panel-header">
        <div class="panel-copy">
          <span class="eyebrow">Lote</span>
          <h2>Geração em lote</h2>
          <p>Importe uma planilha para gerar um PDF consolidado com um termo por linha válida.</p>
        </div>
      </div>

      <form class="panel-form" id="lote-form" novalidate>
        <section class="section-block" aria-labelledby="batch-config-title">
          <div class="section-heading">
            <h3 id="batch-config-title">Arquivo e tipo de termo</h3>
          </div>
          <div class="form-grid">
            <div class="form-field">
              <label for="batch-term-type">Tipo de lote</label>
              <select id="batch-term-type" name="termType" required>
                <option value="responsabilidade">Responsabilidade</option>
                <option value="devolucao">Devolução</option>
              </select>
              <p class="field-help">Use uma planilha separada para cada tipo de termo.</p>
            </div>

            <div class="form-field">
              <label for="batch-file">Planilha</label>
              <input
                id="batch-file"
                name="spreadsheet"
                type="file"
                accept=".csv,.xlsx,.xls,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
              >
              <p class="field-help">Formatos aceitos: CSV, XLSX e XLS.</p>
            </div>
          </div>

          <div class="batch-template-actions">
            <button class="btn btn-secondary" id="batch-template-button" type="button">Baixar modelo CSV</button>
          </div>
        </section>

        <section class="section-block" aria-labelledby="batch-id-memo-title">
          <div class="section-heading">
            <h3 id="batch-id-memo-title">IDs para preencher a planilha</h3>
          </div>
          <div class="batch-id-memo" id="batch-id-memo" aria-live="polite"></div>
        </section>

        <section class="section-block" aria-labelledby="batch-result-title">
          <div class="section-heading">
            <h3 id="batch-result-title">Validação</h3>
          </div>
          <div class="batch-summary" id="batch-summary" aria-live="polite">
            Nenhuma planilha importada.
          </div>
          <div class="batch-errors" id="batch-errors" hidden></div>
        </section>

        <div class="form-actions">
          <button class="btn btn-primary" id="batch-generate-button" type="submit" disabled>Gerar PDF em lote</button>
        </div>
      </form>
    </section>
  </div>
</article>
`);
})();

