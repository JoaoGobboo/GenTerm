# GenTerm

Gerador estático de termos em HTML, CSS e JavaScript puro para a **GRAFICA E EDITORA POSIGRAF LTDA**.

O projeto gera, no navegador e sem backend, os seguintes documentos em PDF:

- Termo de Responsabilidade
- Termo de Devolução de Equipamentos
- Termos em lote a partir de CSV/XLSX

## Stack

- HTML5
- CSS3
- JavaScript puro
- [jsPDF](https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js) via CDN
- SheetJS `xlsx.full.min.js` local para leitura de XLSX no navegador
- Docker com servidor estático Python para deploy

## Estrutura

```text
.
├── assets/
│   ├── empresas.json          # não versionado — gerado via env no deploy
│   ├── equipamentos.json      # não versionado — gerado via env no deploy
│   ├── tecnicos.json          # não versionado — gerado via env no deploy
│   └── nova logo.png
├── specs/                     # contratos de comportamento (SDD)
│   ├── README.md
│   ├── batch-model.md
│   ├── document-specs.md
│   ├── form-utils.md
│   ├── html-utils.md
│   ├── pdf-utils.md
│   ├── spreadsheet-parser.md
│   └── term-model.md
├── src/
│   ├── css/
│   │   ├── base/
│   │   │   ├── reset.css
│   │   │   └── tokens.css
│   │   ├── components/
│   │   │   ├── buttons.css
│   │   │   ├── cards.css
│   │   │   ├── forms.css
│   │   │   ├── header.css
│   │   │   └── preview.css
│   │   ├── layout/
│   │   │   ├── panel.css
│   │   │   ├── shell.css
│   │   │   └── workspace.css
│   │   ├── pages/
│   │   │   └── batch.css
│   │   ├── responsive.css
│   │   └── style.css
│   ├── html/
│   │   ├── components/
│   │   │   └── site-header.html
│   │   └── pages/
│   │       ├── devolucao.html
│   │       ├── lote.html
│   │       └── responsabilidade.html
│   ├── js/
│   │   ├── app.js
│   │   ├── controllers/
│   │   │   ├── batch-controller.js
│   │   │   └── form-controllers.js
│   │   ├── data/
│   │   │   ├── app-data.js
│   │   │   └── spreadsheet-parser.js
│   │   ├── models/
│   │   │   ├── batch-model.js
│   │   │   ├── document-specs.js
│   │   │   └── term-model.js
│   │   ├── templates/
│   │   │   ├── components/
│   │   │   │   └── site-header-template.js
│   │   │   └── pages/
│   │   │       ├── devolucao-template.js
│   │   │       ├── lote-template.js
│   │   │       └── responsabilidade-template.js
│   │   ├── ui/
│   │   │   ├── html-loader.js
│   │   │   ├── layout.js
│   │   │   └── theme.js
│   │   ├── utils/
│   │   │   ├── form-utils.js
│   │   │   ├── html-utils.js
│   │   │   ├── pdf-utils.js
│   │   │   └── preview-utils.js
│   │   └── vendor/
│   │       └── xlsx.full.min.js
│   └── scripts/
│       └── verify-templates.js
├── tests/
│   ├── helpers/
│   │   └── harness.js
│   ├── batch-model.test.js
│   ├── form-utils.test.js
│   ├── html-utils.test.js
│   ├── pdf-utils.test.js
│   ├── spreadsheet-parser.test.js
│   └── term-model.test.js
├── .dockerignore
├── Dockerfile
├── package.json
└── index.html
```

## Como usar localmente

Você pode abrir o arquivo [index.html](./index.html) diretamente no navegador.

Para validar o mesmo fluxo do deploy e carregar JSONs locais por `fetch`, sirva os arquivos por HTTP:

```bash
python -m http.server 8000
```

Depois acesse:

```text
http://localhost:8000
```

## Dados externos

Os dados de apoio ficam em JSON dentro de `assets/`. **Esses arquivos não estão versionados** e podem não existir localmente. O app funciona sem eles — as funcionalidades de seleção de empresa, técnico e tipo de equipamento ficam desabilitadas ou vazias.

- `assets/tecnicos.json`: técnicos N2 usados no formulário de devolução
- `assets/empresas.json`: empresas usadas no formulário e no lote de responsabilidade
- `assets/equipamentos.json`: tipos e marcas sugeridos no formulário

Os campos de equipamento continuam editáveis mesmo com sugestões pré-definidas.

### Geração no Docker

No deploy via Docker (Railway), os JSONs são gerados a partir de variáveis de ambiente:

- `TECNICOS_JSON`: conteúdo do `assets/tecnicos.json`
- `EMPRESAS_JSON`: conteúdo do `assets/empresas.json`
- `EQUIPAMENTOS_JSON`: conteúdo do `assets/equipamentos.json`

Sem essas variáveis, os arquivos JSON correspondentes não serão criados e o app opera sem os dados pré-carregados.

## Geração em lote

O painel `Lote` aceita arquivos CSV, XLSX e XLS. O usuário escolhe o tipo do lote, baixa o modelo CSV correspondente, importa a planilha preenchida e gera um único PDF consolidado.

Cada linha válida da planilha gera um termo. Linhas com erro são listadas na tela e não entram no PDF.

O próprio painel exibe as relações de IDs aceitos para preencher `empresaId` e `tecnicoId` na planilha.

## Docker

Build da imagem:

```bash
docker build -t genterm-static .
```

Executar localmente:

```bash
docker run --rm -p 8080:8080 genterm-static
```

A aplicação ficará disponível em:

```text
http://localhost:8080
```

## Deploy no Railway

O projeto já possui um `Dockerfile` compatível com Railway.

Fluxo básico:

1. Suba este projeto para um repositório Git.
2. Crie um novo projeto no Railway apontando para o repositório.
3. O Railway detectará o `Dockerfile` e fará o build automaticamente.
4. A porta é configurada via variável `PORT`, já tratada no comando do `Dockerfile`.

Não é necessário backend, build step ou framework adicional.

## Testes

O projeto usa `node --test` sem dependências de runtime.

```bash
npm test
```

Para verificar se os templates JS (`src/js/templates/`) estão em sincronia com os arquivos HTML (`src/html/`):

```bash
npm run verify-templates
```

### Spec-Driven Development (SDD)

Os contratos de comportamento ficam em `specs/` e precedem a implementação. O fluxo é:

1. **Spec primeiro** — descreva o comportamento em `specs/<módulo>.md`
2. **Teste segundo** — escreva o teste em `tests/` que falha
3. **Implementação** — faça o teste passar sem alterar o spec
4. **Revisão** — se a implementação revelar algo novo, atualize o spec e repita

Módulos cobertos por spec: `form-utils`, `html-utils`, `pdf-utils`, `spreadsheet-parser`, `batch-model`, `term-model`, `document-specs`.

## Observações

- O PDF é gerado inteiramente no navegador.
- Não há persistência de dados.
- O projeto continua estático e sem build step; o `index.html` é apenas o shell e as telas ficam em `html/pages/`.
- Os arquivos em `js/templates/` registram os mesmos fragmentos para permitir uso direto por `file://`.
- O `package.json` existe apenas para os scripts de teste e verificação — não há dependências de runtime.
