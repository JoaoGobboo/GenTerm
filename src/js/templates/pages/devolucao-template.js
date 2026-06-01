(function () {
  const loader = window.TermosHtmlLoader;

  if (!loader || typeof loader.registerTemplate !== "function") {
    return;
  }

  loader.registerTemplate("src/html/pages/devolucao.html", `<article class="tool-panel" data-panel="devolucao" hidden>
  <div class="panel-layout">
    <section class="form-card panel-card">
      <div class="panel-header">
        <div class="panel-copy">
          <span class="eyebrow">Formulário</span>
          <h2>Termo de Devolução</h2>
          <p>Registro de devolução de equipamento ao Departamento de TI com geração em PDF.</p>
        </div>
      </div>

      <form class="panel-form" id="devolucao-form" novalidate>
        <section class="section-block" aria-labelledby="dev-ti-title">
          <div class="section-heading">
            <h3 id="dev-ti-title">Responsável pela devolução (TI)</h3>
          </div>
          <div class="form-grid">
            <div class="form-field field-full">
              <label for="dev-tecnico">Técnico N2</label>
              <select
                id="dev-tecnico"
                name="tecnicoId"
                required
                aria-describedby="dev-tecnico-help dev-tecnico-error"
              >
                <option value="">Selecione um técnico</option>
              </select>
              <p class="field-help" id="dev-tecnico-help">Os dados do técnico serão preenchidos automaticamente.</p>
              <p class="field-error" id="dev-tecnico-error" data-error-for="dev-tecnico" aria-live="polite"></p>
              <input id="dev-responsavel-nome" name="responsavelNome" type="hidden">
              <input id="dev-responsavel-cpf" name="responsavelCpf" type="hidden">
              <input id="dev-responsavel-matricula" name="responsavelMatricula" type="hidden">
            </div>
          </div>
        </section>

        <section class="section-block" aria-labelledby="dev-colaborador-title">
          <div class="section-heading">
            <h3 id="dev-colaborador-title">Colaborador que devolve</h3>
          </div>
          <div class="form-grid">
            <div class="form-field field-full">
              <label for="dev-colaborador-nome">Nome completo</label>
              <input
                id="dev-colaborador-nome"
                name="colaboradorNome"
                type="text"
                required
                autocomplete="name"
                aria-describedby="dev-colaborador-nome-error"
              >
              <p class="field-error" id="dev-colaborador-nome-error" data-error-for="dev-colaborador-nome" aria-live="polite"></p>
            </div>

            <div class="form-field">
              <label for="dev-colaborador-cpf">CPF</label>
              <input
                id="dev-colaborador-cpf"
                name="colaboradorCpf"
                type="text"
                inputmode="numeric"
                maxlength="14"
                required
                data-mask="cpf"
                autocomplete="off"
                aria-describedby="dev-colaborador-cpf-error"
              >
              <p class="field-error" id="dev-colaborador-cpf-error" data-error-for="dev-colaborador-cpf" aria-live="polite"></p>
            </div>

            <div class="form-field">
              <label for="dev-colaborador-matricula">Matrícula</label>
              <input
                id="dev-colaborador-matricula"
                name="colaboradorMatricula"
                type="text"
                required
                aria-describedby="dev-colaborador-matricula-error"
              >
              <p class="field-error" id="dev-colaborador-matricula-error" data-error-for="dev-colaborador-matricula" aria-live="polite"></p>
            </div>
          </div>
        </section>

        <section class="section-block" aria-labelledby="dev-equipamento-title">
          <div class="section-heading">
            <h3 id="dev-equipamento-title">Dados do equipamento</h3>
          </div>
          <div class="form-grid">
            <div class="form-field">
              <label for="dev-tipo-equipamento">Tipo</label>
              <div class="picker-group">
                <select
                  id="dev-tipo-equipamento-select"
                  aria-label="Sugestões de tipo do equipamento"
                >
                  <option value="">Selecionar sugestão</option>
                </select>
                <input
                  id="dev-tipo-equipamento"
                  name="tipoEquipamento"
                  type="text"
                  placeholder="Digite ou ajuste o tipo"
                  aria-describedby="dev-tipo-equipamento-help dev-tipo-equipamento-error"
                >
              </div>
              <p class="field-help" id="dev-tipo-equipamento-help">Escolha uma sugestão ou edite manualmente.</p>
              <p class="field-error" id="dev-tipo-equipamento-error" data-error-for="dev-tipo-equipamento" aria-live="polite"></p>
            </div>

            <div class="form-field">
              <label for="dev-marca">Marca</label>
              <div class="picker-group">
                <select
                  id="dev-marca-select"
                  aria-label="Sugestões de marca"
                >
                  <option value="">Selecionar sugestão</option>
                </select>
                <input
                  id="dev-marca"
                  name="marca"
                  type="text"
                  placeholder="Digite ou ajuste a marca"
                  aria-describedby="dev-marca-help dev-marca-error"
                >
              </div>
              <p class="field-help" id="dev-marca-help">As sugestões mudam conforme o tipo, mas você pode sobrescrever.</p>
              <p class="field-error" id="dev-marca-error" data-error-for="dev-marca" aria-live="polite"></p>
            </div>

            <div class="form-field">
              <label for="dev-modelo">Modelo</label>
              <input
                id="dev-modelo"
                name="modelo"
                type="text"
                aria-describedby="dev-modelo-error"
              >
              <p class="field-error" id="dev-modelo-error" data-error-for="dev-modelo" aria-live="polite"></p>
            </div>

            <div class="form-field">
              <label for="dev-serial">Serial</label>
              <input
                id="dev-serial"
                name="serial"
                type="text"
                required
                aria-describedby="dev-serial-error"
              >
              <p class="field-error" id="dev-serial-error" data-error-for="dev-serial" aria-live="polite"></p>
            </div>

            <div class="form-field field-full">
              <label for="dev-caracteristicas">Características</label>
              <textarea
                id="dev-caracteristicas"
                name="caracteristicas"
                rows="4"
                aria-describedby="dev-caracteristicas-error"
              ></textarea>
              <p class="field-error" id="dev-caracteristicas-error" data-error-for="dev-caracteristicas" aria-live="polite"></p>
            </div>

            <div class="form-field">
              <label for="dev-acessorios">Acessórios</label>
              <input
                id="dev-acessorios"
                name="acessorios"
                type="text"
                aria-describedby="dev-acessorios-error"
              >
              <p class="field-error" id="dev-acessorios-error" data-error-for="dev-acessorios" aria-live="polite"></p>
            </div>

            <div class="form-field">
              <label for="dev-patrimonio">Código de patrimônio</label>
              <input
                id="dev-patrimonio"
                name="patrimonio"
                type="text"
                required
                aria-describedby="dev-patrimonio-error"
              >
              <p class="field-error" id="dev-patrimonio-error" data-error-for="dev-patrimonio" aria-live="polite"></p>
            </div>
          </div>
        </section>

        <section class="section-block" aria-labelledby="dev-data-local-title">
          <div class="section-heading">
            <h3 id="dev-data-local-title">Data e local</h3>
          </div>
          <div class="form-grid">
            <div class="form-field">
              <label for="dev-cidade">Cidade</label>
              <input
                id="dev-cidade"
                name="cidade"
                type="text"
                value="Curitiba"
                autocomplete="address-level2"
                aria-describedby="dev-cidade-error"
              >
              <p class="field-error" id="dev-cidade-error" data-error-for="dev-cidade" aria-live="polite"></p>
            </div>

            <div class="form-field">
              <label for="dev-data">Data</label>
              <input
                id="dev-data"
                name="data"
                type="date"
                required
                aria-describedby="dev-data-error"
              >
              <p class="field-error" id="dev-data-error" data-error-for="dev-data" aria-live="polite"></p>
            </div>
          </div>
        </section>

        <div class="form-actions">
          <button class="btn btn-primary" type="submit">Gerar PDF</button>
        </div>
      </form>
    </section>

    <aside class="form-card preview-card preview-shell" aria-labelledby="dev-preview-title">
      <div class="preview-meta">
        <span class="eyebrow">Preview</span>
        <h3 id="dev-preview-title">Prévia do documento</h3>
        <p>Atualizada automaticamente conforme o preenchimento.</p>
      </div>
      <div class="preview-stage">
        <div class="preview-scroll">
          <div class="document-preview" id="devolucao-preview"></div>
        </div>
      </div>
    </aside>
  </div>
</article>
`);
})();

