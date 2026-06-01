# app-data

Propósito: carregar dados externos (técnicos, empresas, equipamentos) e expor um contexto de consulta pura.
Exposto em: `window.TermosData`
Testado em: `tests/app-data.test.js`

---

## normalizeKey(value) → string

Normaliza uma string para comparações insensíveis a acentos e maiúsculas.

**Dado** qualquer valor
**Quando** chamado
**Então**:
- Remove acentos via NFD
- Converte para minúsculas
- Remove espaços nas extremidades

Edge cases:
- `null` / `undefined` / `""` → `""`
- `"São Paulo"` → `"sao paulo"`
- `"  NOTEBOOK  "` → `"notebook"`

---

## createDataContext(data) → DataContext

Recebe dados já normalizados e retorna um objeto de consulta pura (sem I/O).

`data` tem a forma:
```js
{
  techniciansData:        { tecnicos_n2: [...] },
  responsibilityCompanies: [{ id, label, termName, cnpj }],
  equipmentOptionsData:   { tipos: [...], marcas_por_tipo: { tipo: [...] } }
}
```

### getTechnicians() → array

Retorna `tecnicos_n2` completo.

### getSelectedTechnician(id) → object | null

**Dado** `id === ""`
**Então** retorna `null`

**Dado** um id numérico válido como string
**Então** retorna `tecnicos_n2[Number(id)]` ou `null` se fora de bounds

### getResponsibilityCompanies() → array

Retorna a lista completa de empresas.

### getResponsibilityCompany(id) → object

Busca empresa por id normalizado. Fallbacks em ordem:
1. Empresa cujo `normalizeKey(id)` bate com `normalizeKey(company.id)`
2. Empresa com `id === "posigraf"`
3. Primeira empresa da lista
4. `{ id: "", label: "", termName: "", cnpj: "" }` (objeto vazio)

Edge cases:
- Busca é case-insensitive e ignora acentos
- Lista vazia → objeto vazio

### getEquipmentTypes() → array

Retorna `tipos` do contexto de equipamentos.

### getDefaultEquipmentType() → string

Retorna `tipos[0]` ou `""` se lista vazia.

### getBrandsForType(type) → array

**Dado** um tipo existente (busca normalizada)
**Então** retorna as marcas desse tipo; se a lista for vazia, retorna todas as marcas de todos os tipos

**Dado** um tipo inexistente
**Então** retorna todas as marcas de todos os tipos (sem duplicatas)
