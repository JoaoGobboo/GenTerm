# Specs — SDD + TDD

Cada arquivo neste diretório descreve o **contrato de comportamento** de um módulo. Os testes em `tests/` derivam diretamente desses contratos.

## Convenção de spec

```
# NomeDoMódulo

Propósito: uma linha descrevendo o que o módulo faz.
Exposto em: `window.TermosXxx` (ou equivalente)
Testado em: `tests/nome-do-modulo.test.js`

## função(params) → RetornoEsperado

**Dado** <pré-condição>
**Quando** <ação>
**Então** <resultado esperado>

Edge cases:
- <caso limite 1>
- <caso limite 2>
```

## Módulos com testes unitários

| Spec | Módulo | Testes |
|------|--------|--------|
| [form-utils.md](form-utils.md) | `src/js/utils/form-utils.js` | `tests/form-utils.test.js` |
| [html-utils.md](html-utils.md) | `src/js/utils/html-utils.js` | `tests/html-utils.test.js` |
| [pdf-utils.md](pdf-utils.md) | `src/js/utils/pdf-utils.js` | `tests/pdf-utils.test.js` |
| [spreadsheet-parser.md](spreadsheet-parser.md) | `src/js/data/spreadsheet-parser.js` | `tests/spreadsheet-parser.test.js` |
| [app-data.md](app-data.md) | `src/js/data/app-data.js` | `tests/app-data.test.js` |
| [batch-model.md](batch-model.md) | `src/js/models/batch-model.js` | `tests/batch-model.test.js` |
| [term-model.md](term-model.md) | `src/js/models/term-model.js` | `tests/term-model.test.js` |
| [document-specs.md](document-specs.md) | `src/js/models/document-specs.js` | — (dados estáticos) |

## Módulos DOM-only (sem teste unitário)

Estes módulos dependem de `document` / `window.fetch` e não são cobertos por `node --test`. O comportamento é verificado visualmente no navegador.

| Spec | Módulo | Motivo |
|------|--------|--------|
| [preview-utils.md](preview-utils.md) | `src/js/utils/preview-utils.js` | Escreve em `container.innerHTML` |
| — | `src/js/controllers/batch-controller.js` | Manipulação de DOM e eventos |
| — | `src/js/controllers/form-controllers.js` | Manipulação de DOM e eventos |
| — | `src/js/ui/html-loader.js` | `fetch` + injeção de HTML |
| — | `src/js/ui/layout.js` | Manipulação de DOM |
| — | `src/js/ui/theme.js` | `localStorage` + DOM |
| — | `src/js/app.js` | Bootstrap da aplicação |

## Fluxo SDD + TDD

| Fase | O que fazer |
|------|-------------|
| **Spec** | Descreva o contrato de comportamento em `specs/<módulo>.md` |
| **Red** | Escreva o teste em `tests/` — deve falhar |
| **Green** | Implemente o mínimo para o teste passar |
| **Refactor** | Limpe o código sem quebrar os testes |
| **Revisão** | Se a implementação revelar algo novo, atualize o spec e repita |
