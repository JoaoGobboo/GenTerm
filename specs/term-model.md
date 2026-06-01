# term-model

Propósito: aplicar defaults, resolver entidades e montar estrutura de dados pronta para geração de PDF.
Exposto em: `window.TermosTermModel`
Testado em: `tests/term-model.test.js`

---

## withResponsibilityDefaults(data, dataContext) → TermData

Normaliza dados de formulário/planilha para um Termo de Responsabilidade.

**Dado** `data` com campos parcialmente preenchidos e `dataContext` com empresas
**Quando** chamado
**Então** retorna objeto com:

| Campo | Fonte | Fallback |
|-------|-------|---------|
| `nome` | `data.nome` | `""` |
| `cpf` | `data.cpf` | `""` |
| `matricula` | `data.matricula` | `""` |
| `empresaNome` | `dataContext.getResponsibilityCompany(data.empresaId).termName` | empresa padrão |
| `empresaCnpj` | `dataContext.getResponsibilityCompany(data.empresaId).cnpj` | — |
| `cidade` | `data.cidade` | `"Curitiba"` |
| `tipoEquipamento` | `data.tipoEquipamento` | `dataContext.getDefaultEquipmentType()` |
| `marca` | `data.marca` | `""` |
| `modelo` | `data.modelo` | `""` |
| `serial` | `data.serial` | `""` |
| `caracteristicas` | `data.caracteristicas` | `"-"` |
| `acessorios` | `data.acessorios` | `"-"` |
| `patrimonio` | `data.patrimonio` | `""` |

Todos os valores passam por `safeValue()` antes de aplicar o fallback.

---

## withReturnDefaults(data, dataContext) → TermData

Normaliza dados de formulário/planilha para um Termo de Devolução.

**Dado** `data` com campos do responsável TI e do colaborador
**Quando** chamado
**Então** retorna objeto com:

| Campo | Fonte | Fallback |
|-------|-------|---------|
| `responsavelNome` | `data.responsavelNome` | `""` |
| `responsavelCpf` | `data.responsavelCpf` | `""` |
| `responsavelMatricula` | `data.responsavelMatricula` | `""` |
| `responsavelCargo` | constante `"Responsável Departamento TI"` | — |
| `colaboradorNome` | `data.colaboradorNome` | `""` |
| `colaboradorCpf` | `data.colaboradorCpf` | `""` |
| `colaboradorMatricula` | `data.colaboradorMatricula` | `""` |
| `tipoEquipamento` | `data.tipoEquipamento` | `dataContext.getDefaultEquipmentType()` |
| `marca` | `data.marca` | `"-"` |
| `modelo` | `data.modelo` | `"-"` |
| `serial` | `data.serial` | `""` |
| `caracteristicas` | `data.caracteristicas` | `"-"` |
| `acessorios` | `data.acessorios` | `"-"` |
| `patrimonio` | `data.patrimonio` | `""` |
| `cidade` | `data.cidade` | `"Curitiba"` |
| `data` | `data.data` | `getTodayIso()` |

---

## buildEquipmentRows(data) → [string, string][]

Constrói linhas para a tabela de equipamento no PDF.

**Dado** dados normalizados (após `withXxxDefaults`)
**Quando** chamado
**Então** retorna array de 7 pares `[label, value]` na ordem:
1. `["TIPO DO EQUIPAMENTO", data.tipoEquipamento]`
2. `["MARCA", data.marca || "-"]`
3. `["MODELO", data.modelo || "-"]`
4. `["SERIAL", data.serial]`
5. `["CARACTERISTICAS DO EQUIPAMENTO", data.caracteristicas || "-"]`
6. `["ACESSÓRIOS", data.acessorios || "-"]`
7. `["CÓDIGO DE PATRIMÔNIO", data.patrimonio]`

Labels vêm de `TermosDocumentSpecs.EQUIPMENT_ROW_LABELS` — nunca hardcoded aqui.

---

## generateResponsibilityPdf(data)

Cria PDF de Termo de Responsabilidade e aciona download via `doc.save()`.

**Nome do arquivo:** `TERMO_RESPONSABILIDADE_<NOME_DO_COLABORADOR>.pdf`

---

## generateReturnPdf(data)

Cria PDF de Termo de Devolução e aciona download via `doc.save()`.

**Nome do arquivo:** `TERMO_DEVOLUCAO_<NOME_DO_COLABORADOR>.pdf`

---

## createBatchResponsibilityPdf(rows) → jsPDF

Cria documento com múltiplos Termos de Responsabilidade, um por página.

**Dado** array de TermData já normalizados
**Quando** chamado
**Então**:
- Primeiro termo na página 1, cada termo subsequente em nova página
- Footers aplicados em todas as páginas após todas as páginas serem adicionadas

---

## createBatchReturnPdf(rows) → jsPDF

Mesma lógica de `createBatchResponsibilityPdf`, para Termos de Devolução.
