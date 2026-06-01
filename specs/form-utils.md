# form-utils

Propósito: validação de campos de formulário, formatação de CPF, sanitização de input e utilitários de data.
Exposto em: `window.TermosFormUtils`
Testado em: `tests/form-utils.test.js`

---

## isValidCpf(value) → boolean

Valida CPF usando o algoritmo de dígitos verificadores.

**Dado** qualquer string de entrada
**Quando** chamado com um CPF
**Então** retorna `true` apenas se:
- tiver exatamente 11 dígitos (ignorando pontuação)
- não for sequência de dígitos repetidos (ex: `111.111.111-11`)
- os dois dígitos verificadores estiverem corretos

Edge cases:
- `""` → `false`
- `null` / `undefined` → `false`
- `"000.000.000-00"` → `false` (sequência repetida)
- `"529.982.247-25"` → `true` (CPF válido conhecido)
- CPF com letras misturadas → `false`
- CPF com 10 ou 12 dígitos → `false`

---

## formatCpf(value) → string

Aplica máscara progressiva de CPF enquanto o usuário digita.

**Dado** uma string com dígitos (com ou sem máscara parcial)
**Quando** chamado
**Então** retorna apenas os dígitos, limitados a 11, formatados como:
- ≤3 dígitos: `"529"`
- 4–6 dígitos: `"529.9"`
- 7–9 dígitos: `"529.982.2"`
- 10–11 dígitos: `"529.982.247-25"`

Edge cases:
- Caracteres não-numéricos são descartados
- Mais de 11 dígitos são truncados após o 11º
- `""` → `""`

---

## sanitizeInputValue(value) → string

Normaliza o valor de um input antes de validar ou salvar.

**Dado** qualquer string (incluindo inputs do usuário)
**Quando** chamado
**Então**:
- CRLF (`\r\n`) convertido para `\n`
- Espaços consecutivos colapsados em um único espaço (exceto quebras de linha)
- Três ou mais quebras de linha consecutivas colapsadas em duas
- Espaços nas extremidades removidos (`trim`)

Edge cases:
- `null` / `undefined` → `""`
- Só espaços → `""`
- Tabs internos → substituídos por espaço

---

## isValidDateInput(value) → boolean

Valida se uma string representa uma data real no formato ISO.

**Dado** uma string
**Quando** chamado
**Então** retorna `true` somente se:
- formato exato `YYYY-MM-DD`
- a data existe no calendário (ex: `2024-02-29` válido em ano bissexto, inválido em ano comum)

Edge cases:
- `"2024-13-01"` → `false` (mês inválido)
- `"2023-02-29"` → `false` (não-bissexto)
- `"2024-02-29"` → `true` (bissexto)
- `"01/01/2024"` → `false` (formato errado)
- `""` → `false`

---

## getTodayIso() → string

Retorna a data de hoje no formato `YYYY-MM-DD` ajustada ao fuso horário local.

**Então**:
- Nunca usa UTC direto (evita bug de virada de dia)
- Formato sempre `YYYY-MM-DD`

---

## setDateInputToToday(input)

Preenche um `<input type="date">` com a data de hoje, mas apenas se estiver vazio.

**Dado** um input sem valor
**Quando** chamado
**Então** `input.value` recebe `getTodayIso()`

**Dado** um input já preenchido
**Quando** chamado
**Então** `input.value` não é alterado

Edge cases:
- `input` é `null` → não lança erro
