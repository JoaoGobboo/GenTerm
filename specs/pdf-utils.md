# pdf-utils

Propósito: funções de renderização e formatação para geração de PDFs com jsPDF.
Exposto em: `window.TermosPdfUtils`
Testado em: `tests/pdf-utils.test.js`

---

## safeValue(value, fallback?) → string

Normaliza um valor para uso em PDF, retornando fallback se vazio.

**Dado** qualquer valor
**Quando** chamado
**Então**:
- CRLF → `\n`
- Espaços consecutivos colapsados (preserva `\n`)
- Três ou mais `\n` consecutivos colapsados em dois
- `trim()` aplicado
- Se resultado vazio e `fallback` for string → retorna `fallback`
- Se resultado vazio e sem `fallback` → retorna `""`

Edge cases:
- `null` / `undefined` → `fallback` ou `""`
- `0` → `""` (falsy)
- `" "` (só espaços) → `""` → aplica fallback
- `fallback` não-string (ex: número) → ignorado, retorna `""`

---

## formatFileName(prefix, name) → string

Gera nome de arquivo seguro para download de PDF.

**Dado** um prefixo e um nome
**Quando** chamado
**Então** retorna `PREFIX_NOME_NORMALIZADO.pdf` onde:
- Acentos removidos (NFD decompose + strip combining marks)
- Caracteres não-alfanuméricos substituídos por `_`
- Underscores duplos/extremos removidos
- Tudo em maiúsculas
- Extensão `.pdf` sempre presente

Edge cases:
- `name` vazio / `null` → usa `"SEM_NOME"`
- `name` só com caracteres especiais → `"SEM_NOME"` (após normalização vira vazio)
- `name = "João Silva"` → `"JOAO_SILVA"`

---

## formatLongDate(isoDate) → string

Converte data ISO para formato longo em português.

**Dado** uma string `YYYY-MM-DD`
**Quando** chamado
**Então** retorna `"D de mês de AAAA"` em português

Exemplos:
- `"2024-01-05"` → `"5 de janeiro de 2024"`
- `"2024-12-31"` → `"31 de dezembro de 2024"`

Edge cases:
- `""` / `null` / `undefined` → usa data `1/1 do ano 0` (comportamento de fallback, não lança erro)
- Meses: janeiro, fevereiro, março, abril, maio, junho, julho, agosto, setembro, outubro, novembro, dezembro

---

## createPdfDocument(metadata) → jsPDF

Cria instância jsPDF com configurações padrão do sistema.

**Quando** chamado
**Então**:
- Orientação: portrait, formato A4, unidade mm
- Propriedades: author = nome da empresa, creator = "Gerador de Termos"
- `title` e `subject` vindos do `metadata`

**Se** `window.jspdf` não estiver disponível
**Então** lança `Error("jsPDF não está disponível.")`

---

## createLayoutContext(doc) → LayoutContext

Cria objeto de contexto de layout para desenho de elementos no PDF.

**Dado** um documento jsPDF
**Quando** chamado
**Então** retorna objeto com:
- `marginX: 20` (mm)
- `topMargin: 20` (mm)
- `contentWidth: pageWidth - 40`
- `lineHeight: 5.5`
- `paragraphGap: 2.6`
- `footerReserve: 24`
- `y: 20` (cursor vertical inicial)
- referência ao `doc`
