# Specs — Spec-Driven Development

Cada arquivo neste diretório descreve o **contrato de comportamento** de um módulo antes de qualquer implementação. Os testes em `tests/` derivam diretamente desses contratos.

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

## Módulos cobertos

| Spec | Módulo | Testes |
|------|--------|--------|
| [form-utils.md](form-utils.md) | `js/utils/form-utils.js` | `tests/form-utils.test.js` |
| [html-utils.md](html-utils.md) | `js/utils/html-utils.js` | `tests/html-utils.test.js` |
| [pdf-utils.md](pdf-utils.md) | `js/utils/pdf-utils.js` | `tests/pdf-utils.test.js` |
| [spreadsheet-parser.md](spreadsheet-parser.md) | `js/data/spreadsheet-parser.js` | `tests/spreadsheet-parser.test.js` |
| [batch-model.md](batch-model.md) | `js/models/batch-model.js` | `tests/batch-model.test.js` |
| [term-model.md](term-model.md) | `js/models/term-model.js` | `tests/term-model.test.js` |
| [document-specs.md](document-specs.md) | `js/models/document-specs.js` | — (dados estáticos) |

## Fluxo SDD

1. **Spec primeiro** — descreva o comportamento aqui antes de escrever ou alterar código
2. **Teste segundo** — escreva o teste que falha (`node --test`)
3. **Implementação** — faça o teste passar sem alterar o spec
4. **Revisão** — se a implementação revelar algo novo, atualize o spec e repita
