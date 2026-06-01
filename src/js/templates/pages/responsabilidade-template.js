(function () {
  const loader = window.TermosHtmlLoader;

  if (!loader || typeof loader.registerTemplate !== "function") {
    return;
  }

  loader.registerTemplate("src/html/pages/responsabilidade.html", `<article class="tool-panel" data-panel="responsabilidade" hidden>
  <div class="panel-layout">
    <section class="form-card panel-card">
      <div class="panel-header">
        <div class="panel-copy">
          <span class="eyebrow">Formulário</span>
          <h2>Termo de Responsabilidade</h2>
          <p>Disponibilização de equipamento ao colaborador com geração direta em PDF.</p>
        </div>
      </div>

      <form class="panel-form" id="responsabilidade-form" novalidate>
        <section class="section-block" aria-labelledby="resp-colaborador-title">
          <div class="section-heading">
            <h3 id="resp-colaborador-title">Dados do colaborador</h3>
          </div>
          <div class="form-grid">
            <div class="form-field field-full">
              <label for="resp-nome">Nome completo</label>
              <input
                id="resp-nome"
                name="nome"
                type="text"
                required
                autocomplete="name"
                aria-describedby="resp-nome-error"
              >
              <p class="field-error" id="resp-nome-error" data-error-for="resp-nome" aria-live="polite"></p>
            </div>

            <div class="form-field">
              <label for="resp-cpf">CPF</label>
              <input
                id="resp-cpf"
                name="cpf"
                type="text"
                inputmode="numeric"
                maxlength="14"
                required
                data-mask="cpf"
                autocomplete="off"
                aria-describedby="resp-cpf-error"
              >
              <p class="field-error" id="resp-cpf-error" data-error-for="resp-cpf" aria-live="polite"></p>
            </div>

            <div class="form-field">
              <label for="resp-matricula">Matrícula</label>
              <input
                id="resp-matricula"
                name="matricula"
                type="text"
                required
                autocomplete="off"
                aria-describedby="resp-matricula-error"
              >
              <p class="field-error" id="resp-matricula-error" data-error-for="resp-matricula" aria-live="polite"></p>
            </div>

            <div class="form-field">
              <label for="resp-cidade">Cidade</label>
              <input
                id="resp-cidade"
                name="cidade"
                type="text"
                value="Curitiba"
                autocomplete="address-level2"
                aria-describedby="resp-cidade-error"
              >
              <p class="field-error" id="resp-cidade-error" data-error-for="resp-cidade" aria-live="polite"></p>
            </div>

            <div class="form-field field-full">
              <label for="resp-empresa">Empresa</label>
              <select
                id="resp-empresa"
                name="empresaId"
                required
                aria-describedby="resp-empresa-help resp-empresa-error"
              >
                <option value="">Selecione a empresa</option>
              </select>
              <p class="field-help" id="resp-empresa-help">A empresa escolhida será usada no texto do Termo de Responsabilidade.</p>
              <p class="field-error" id="resp-empresa-error" data-error-for="resp-empresa" aria-live="polite"></p>
            </div>
          </div>
        </section>

        <section class="section-block" aria-labelledby="resp-equipamento-title">
          <div class="section-heading">
            <h3 id="resp-equipamento-title">Dados do equipamento</h3>
          </div>
          <div class="form-grid">
            <div class="form-field">
              <label for="resp-tipo-equipamento">Tipo do equipamento</label>
              <div class="picker-group">
                <select
                  id="resp-tipo-equipamento-select"
                  aria-label="Sugestões de tipo do equipamento"
                >
                  <option value="">Selecionar sugestão</option>
                </select>
                <input
                  id="resp-tipo-equipamento"
                  name="tipoEquipamento"
                  type="text"
                  required
                  placeholder="Digite ou ajuste o tipo"
                  aria-describedby="resp-tipo-equipamento-help resp-tipo-equipamento-error"
                >
              </div>
              <p class="field-help" id="resp-tipo-equipamento-help">Escolha uma sugestão ou edite manualmente.</p>
              <p class="field-error" id="resp-tipo-equipamento-error" data-error-for="resp-tipo-equipamento" aria-live="polite"></p>
            </div>

            <div class="form-field">
              <label for="resp-marca">Marca</label>
              <div class="picker-group">
                <select
                  id="resp-marca-select"
                  aria-label="Sugestões de marca"
                >
                  <option value="">Selecionar sugestão</option>
                </select>
                <input
                  id="resp-marca"
                  name="marca"
                  type="text"
                  required
                  placeholder="Digite ou ajuste a marca"
                  aria-describedby="resp-marca-help resp-marca-error"
                >
              </div>
              <p class="field-help" id="resp-marca-help">As sugestões mudam conforme o tipo, mas você pode sobrescrever.</p>
              <p class="field-error" id="resp-marca-error" data-error-for="resp-marca" aria-live="polite"></p>
            </div>

            <div class="form-field">
              <label for="resp-modelo">Modelo</label>
              <input
                id="resp-modelo"
                name="modelo"
                type="text"
                required
                aria-describedby="resp-modelo-error"
              >
              <p class="field-error" id="resp-modelo-error" data-error-for="resp-modelo" aria-live="polite"></p>
            </div>

            <div class="form-field">
              <label for="resp-serial">Serial</label>
              <input
                id="resp-serial"
                name="serial"
                type="text"
                required
                aria-describedby="resp-serial-error"
              >
              <p class="field-error" id="resp-serial-error" data-error-for="resp-serial" aria-live="polite"></p>
            </div>

            <div class="form-field field-full">
              <label for="resp-caracteristicas">Características</label>
              <textarea
                id="resp-caracteristicas"
                name="caracteristicas"
                rows="4"
                placeholder="Ex.: Processador: Intel Core i5 13ª geração, Memória RAM: 16 GB"
                aria-describedby="resp-caracteristicas-error"
              ></textarea>
              <p class="field-error" id="resp-caracteristicas-error" data-error-for="resp-caracteristicas" aria-live="polite"></p>
            </div>

            <div class="form-field">
              <label for="resp-acessorios">Acessórios</label>
              <input
                id="resp-acessorios"
                name="acessorios"
                type="text"
                placeholder="Ex.: Carregador"
                aria-describedby="resp-acessorios-error"
              >
              <p class="field-error" id="resp-acessorios-error" data-error-for="resp-acessorios" aria-live="polite"></p>
            </div>

            <div class="form-field">
              <label for="resp-patrimonio">Código de patrimônio</label>
              <input
                id="resp-patrimonio"
                name="patrimonio"
                type="text"
                required
                aria-describedby="resp-patrimonio-error"
              >
              <p class="field-error" id="resp-patrimonio-error" data-error-for="resp-patrimonio" aria-live="polite"></p>
            </div>
          </div>
        </section>

        <div class="form-actions">
          <button class="btn btn-primary" type="submit">Gerar PDF</button>
        </div>
      </form>
    </section>

    <aside class="form-card preview-card preview-shell" aria-labelledby="resp-preview-title">
      <div class="preview-meta">
        <span class="eyebrow">Preview</span>
        <h3 id="resp-preview-title">Prévia do documento</h3>
        <p>Atualizada automaticamente conforme o preenchimento.</p>
      </div>
      <div class="preview-stage">
        <div class="preview-scroll">
          <div class="document-preview" id="responsabilidade-preview"></div>
        </div>
      </div>
    </aside>
  </div>
</article>
`);
})();

