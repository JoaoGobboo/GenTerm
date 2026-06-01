# batch-model

Propósito: validar linhas de planilha para geração em lote de termos, resolver IDs e construir dados prontos para o TermModel.
Exposto em: `window.TermosBatchModel`
Testado em: `tests/batch-model.test.js`

---

## validateParsedFile(type, parsedFile, dataContext) → ValidationResult

Valida a estrutura e os dados de um arquivo parseado.

**Formato de retorno `ValidationResult`:**
```js
{
  validRows: [{ rowNumber, data }],
  invalidRows: [{ rowNumber, errors: string[] }]
}
```

### Validações estruturais (retornam invalidRows com rowNumber `"-"`)

**Dado** planilha sem headers (`parsedFile.headers.length === 0`)
**Então** retorna `invalidRows: [{ rowNumber: "-", errors: ["A planilha não possui cabeçalhos."] }]`

**Dado** planilha com headers mas faltando obrigatórios
**Então** retorna erro listando os headers ausentes

**Dado** planilha com headers corretos mas sem linhas de dados
**Então** retorna `invalidRows: [{ rowNumber: "-", errors: ["A planilha não possui linhas de dados."] }]`

### Validações por linha

Cada linha é validada independentemente. Linhas válidas e inválidas são segregadas.

**Headers aceitos com case-insensitivo e sem acentos** — `"EmpresaId"`, `"empresaid"`, `"EMPRESAID"` são equivalentes a `"empresaId"`.

---

## Tipo: responsabilidade

Headers obrigatórios: `empresaId`, `nome`, `cpf`, `matricula`, `tipoEquipamento`, `marca`, `modelo`, `serial`, `patrimonio`
Headers opcionais: `cidade`, `caracteristicas`, `acessorios`

Validações de linha:
- Todos os campos obrigatórios não-vazios → senão: `"Campo obrigatório vazio: <campo>."`
- `cpf` presente e inválido → `"CPF inválido."`
- `empresaId` presente e não encontrado no dataContext → `"empresaId não encontrado: <valor>."`

Resolução de `empresaId`:
- Se numérico → usa como índice 1-based na lista de empresas
- Se string → compara `normalizeKey(company.id)` com `normalizeKey(empresaId)` (sem acentos, lowercase)

---

## Tipo: devolucao

Headers obrigatórios: `tecnicoId`, `colaboradorNome`, `colaboradorCpf`, `colaboradorMatricula`, `tipoEquipamento`, `marca`, `modelo`, `serial`, `patrimonio`
Headers opcionais: `cidade`, `data`, `caracteristicas`, `acessorios`

Validações de linha:
- Todos os campos obrigatórios não-vazios → senão: `"Campo obrigatório vazio: <campo>."`
- `colaboradorCpf` presente e inválido → `"CPF do colaborador inválido."`
- `tecnicoId` presente e não encontrado → `"tecnicoId não encontrado: <valor>."`
- `tecnicoId` só resolve por índice numérico 1-based (não por string)
- `data` presente → normalizada para ISO; se inválida → `"Data inválida."`

---

## normalizeDate(value) → string | ""

Converte datas de planilha para formato ISO `YYYY-MM-DD`.

**Dado** `"DD/MM/YYYY"`
**Quando** data real
**Então** retorna `"YYYY-MM-DD"`

**Dado** `"YYYY-MM-DD"` já em formato ISO e válido
**Então** retorna sem alteração

**Dado** string inválida ou formato desconhecido
**Então** retorna `""`

---

## downloadTemplate(type)

Cria e aciona download de CSV modelo para o tipo informado.

**Então**:
- Arquivo nomeado `modelo_lote_<type>.csv`
- Primeira linha: headers obrigatórios + opcionais separados por `;`
- BOM UTF-8 incluído no início do arquivo
- Linha vazia de dados incluída para orientar o preenchimento
