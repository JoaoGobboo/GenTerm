# preview-utils

Propósito: renderizar a pré-visualização HTML dos termos em um elemento container do DOM.
Exposto em: `window.TermosPreviewUtils`
Testado em: — (DOM-dependent; coberto por testes de integração/visual)

> **Nota:** este módulo escreve diretamente em `container.innerHTML` e depende de `document`. Não possui testes unitários com `node --test`. O comportamento é verificado visualmente no navegador e indiretamente pelos testes de `html-utils` e `pdf-utils`.

---

## renderResponsibility(container, data, config)

Escreve a pré-visualização do Termo de Responsabilidade no `container`.

**Dado** `container` nulo ou undefined
**Então** retorna sem lançar erro

**Dado** `container` válido e `data` preenchido
**Então** `container.innerHTML` recebe o HTML completo do termo com:
- Cabeçalho (título + subtítulo de `DocumentSpecs.RESPONSIBILITY`)
- Parágrafo de abertura com dados do colaborador e empresa
- Tabela de equipamentos (`config.rows`)
- Cláusulas adicionais (`config.clauses`)
- Rodapé com link do manual (`config.manualUrl`)
- Assinatura e localização

**Dado** campo de dado vazio (ex: `data.nome === ""`)
**Então** o campo é substituído por um placeholder visual

---

## renderReturn(container, data, config)

Escreve a pré-visualização do Termo de Devolução no `container`.

**Dado** `container` nulo ou undefined
**Então** retorna sem lançar erro

**Dado** `container` válido e `data` preenchido
**Então** `container.innerHTML` recebe o HTML completo do termo com:
- Cabeçalho (título + subtítulo de `DocumentSpecs.RETURN`)
- Parágrafo de abertura com dados do responsável TI e colaborador
- Tabela de equipamentos (`config.rows`)
- Data por extenso (via `PdfUtils.formatLongDate`)
- Assinatura do responsável TI
- Rodapé

**Dado** campo de dado vazio
**Então** o campo é substituído por um placeholder visual
