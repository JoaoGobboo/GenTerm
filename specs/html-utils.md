# html-utils

Propósito: escapar valores arbitrários para inserção segura em HTML, prevenindo XSS.
Exposto em: `window.TermosHtmlUtils`
Testado em: `tests/html-utils.test.js`

---

## escapeHtml(value) → string

Converte caracteres especiais de HTML em suas entidades seguras.

**Dado** qualquer valor
**Quando** chamado
**Então** retorna string com as seguintes substituições:
- `&` → `&amp;`
- `<` → `&lt;`
- `>` → `&gt;`
- `"` → `&quot;`
- `'` → `&#39;`

Edge cases:
- `null` → `""` (não lança erro)
- `undefined` → `""` (não lança erro)
- `0` / `false` / número → converte para string antes de escapar
- String sem caracteres especiais → retornada sem alteração
- Múltiplos caracteres especiais na mesma string → todos escapados
- Entidades já escapadas (ex: `&amp;`) → re-escapadas (`&amp;amp;`) — sem double-escape inteligente
