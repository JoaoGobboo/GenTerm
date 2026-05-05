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
- Docker + Nginx para deploy

## Estrutura

```text
.
├── assets/
│   ├── equipamentos.json
│   ├── tecnicos.json
│   └── nova logo.png
├── css/
│   └── style.css
├── js/
│   ├── app.js
│   ├── controllers/
│   │   ├── batch-controller.js
│   │   └── form-controllers.js
│   ├── data/
│   │   ├── app-data.js
│   │   └── spreadsheet-parser.js
│   ├── models/
│   │   └── term-model.js
│   ├── ui/
│   │   ├── layout.js
│   │   └── theme.js
│   ├── utils/
│   │   ├── form-utils.js
│   │   ├── pdf-utils.js
│   │   └── preview-utils.js
│   └── vendor/
│       └── xlsx.full.min.js
├── nginx/
│   └── default.conf.template
├── .dockerignore
├── Dockerfile
└── index.html
```

## Como usar localmente

Como o projeto é estático, você pode abrir o arquivo [index.html](./index.html) diretamente no navegador.

Se preferir servir localmente por HTTP:

```bash
python -m http.server 8000
```

Depois acesse:

```text
http://localhost:8000
```

## Dados externos

Os dados de apoio ficam em JSON dentro de `assets/`:

- `assets/tecnicos.json`: técnicos N2 usados no formulário de devolução
- `assets/equipamentos.json`: tipos e marcas sugeridos no formulário

Os campos de equipamento continuam editáveis mesmo com sugestões pré-definidas.

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
4. A porta é configurada via variável `PORT`, já tratada no `nginx`.

Não é necessário backend, build step ou framework adicional.

## Observações

- O PDF é gerado inteiramente no navegador.
- Não há persistência de dados.
- O projeto foi mantido propositalmente simples, com um único HTML.
