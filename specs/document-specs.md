# document-specs

Propósito: repositório de texto estático e constantes dos documentos. Nenhuma lógica — só dados.
Exposto em: `window.TermosDocumentSpecs`
Testado em: — (dados estáticos, verificados indiretamente pelos testes de term-model e batch-model)

---

## Invariantes

Estas propriedades **nunca devem ser alteradas sem revisão jurídica/editorial**, pois afetam o conteúdo legal dos documentos gerados.

### FIXED_TI_ROLE

Cargo fixo do responsável TI que assina os Termos de Devolução.

```
"Responsável Departamento TI"
```

### EQUIPMENT_ROW_LABELS

Array de 7 strings com os rótulos das linhas da tabela de equipamentos, nesta ordem:

```js
[
  "TIPO DO EQUIPAMENTO",
  "MARCA",
  "MODELO",
  "SERIAL",
  "CARACTERISTICAS DO EQUIPAMENTO",
  "ACESSÓRIOS",
  "CÓDIGO DE PATRIMÔNIO"
]
```

A ordem importa — `buildEquipmentRows` em `term-model` acessa por índice.

---

## RESPONSIBILITY

Textos do Termo de Responsabilidade.

| Chave | Uso |
|-------|-----|
| `pdfTitle` | Título no header do PDF (maiúsculas com espaços extras) |
| `title` | Título canônico do documento |
| `subtitle` | Subtítulo exibido abaixo do título |
| `footerLeft` | Rodapé esquerdo em todas as páginas |
| `footerRight` | Rodapé direito em todas as páginas |
| `staticParagraph1` | Parágrafo introdutório sobre recebimento de equipamentos |
| `staticParagraph2` | Parágrafo sobre ciência da política de uso |
| `clauses` | Array com 8 cláusulas numeradas de 3 a 10 |
| `closing` | Frase de encerramento antes da assinatura |
| `locationLine` | Linha de local e data |
| `signatureLines` | Array de linhas abaixo da assinatura |

**Invariante de `clauses`:** deve conter exatamente 8 itens (cláusulas 3–10).

---

## RETURN

Textos do Termo de Devolução.

| Chave | Uso |
|-------|-----|
| `title` | Título no header do PDF |
| `subtitle` | Subtítulo no header |
| `footerLeft` | Rodapé esquerdo |
| `footerRight` | Rodapé direito |

O Termo de Devolução não possui cláusulas estáticas — o corpo é gerado dinamicamente pelo `term-model`.
