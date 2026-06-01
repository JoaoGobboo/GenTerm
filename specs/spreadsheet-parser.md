# spreadsheet-parser

Propósito: ler arquivos CSV, XLSX e XLS do navegador e convertê-los em estrutura normalizada de linhas/colunas.
Exposto em: `window.TermosSpreadsheetParser`
Testado em: `tests/spreadsheet-parser.test.js`

---

## parseFile(file) → Promise<ParsedFile>

Detecta o formato pelo nome do arquivo e delega para o parser correto.

**Dado** um objeto `File` com extensão `.csv`
**Quando** chamado
**Então** lê como texto UTF-8 e retorna `ParsedFile`

**Dado** um objeto `File` com extensão `.xlsx` ou `.xls`
**Quando** chamado
**Então** lê como ArrayBuffer, usa SheetJS para converter, retorna `ParsedFile`

**Dado** um arquivo com extensão não suportada (ex: `.pdf`)
**Quando** chamado
**Então** rejeita com `Error("Formato de arquivo não suportado.")`

**Dado** `null` ou `undefined`
**Quando** chamado
**Então** rejeita com `Error("Selecione uma planilha.")`

---

## parseCsvText(text) → ParsedFile

Faz parse de texto CSV bruto.

**Quando** chamado
**Então**:
- Remove BOM (`﻿`) do início
- Detecta delimitador automaticamente (`;` vs `,`) — ganha o que tiver mais ocorrências na primeira linha
- Linhas completamente vazias são ignoradas
- Retorna `ParsedFile`

**Formato de retorno `ParsedFile`:**
```js
{
  headers: string[],   // primeira linha, BOM removido, trim aplicado
  rows: [
    {
      rowNumber: number,   // linha na planilha (começa em 2)
      values: { [header]: string }
    }
  ]
}
```

Edge cases:
- CSV com BOM UTF-8 → BOM removido do header e das células
- Células com aspas duplas → RFC 4180: aspas duplas internas escapadas com `""`
- Células com quebras de linha internas (dentro de aspas) → preservadas
- Linhas só com delimitadores (sem conteúdo) → filtradas
- Header com célula vazia no meio → coluna sem nome ignorada nos `values`
- Linhas de dados com mais colunas do que headers → colunas extras ignoradas

---

## detectDelimiter(line) → ";" | ","

Escolhe delimitador pela maior contagem de campos ao parsear a primeira linha.

**Dado** uma linha com mais `;` como separadores
**Então** retorna `";"`

**Dado** uma linha com mais `,` como separadores
**Então** retorna `","`

**Dado** empate
**Então** retorna `";"` (preferência por ponto-e-vírgula)

---

## normalizeCell(value) → string

Normaliza o valor de uma célula.

**Então**:
- CRLF → `\n`
- Espaços consecutivos colapsados
- `trim()` aplicado
- `null` / `undefined` → `""`
