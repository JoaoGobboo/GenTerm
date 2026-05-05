(function () {
  const CSV_EXTENSIONS = [".csv"];
  const XLSX_EXTENSIONS = [".xlsx", ".xls"];

  function parseFile(file) {
    if (!file) {
      return Promise.reject(new Error("Selecione uma planilha."));
    }

    if (hasExtension(file.name, CSV_EXTENSIONS)) {
      return readFileAsText(file).then(parseCsvText);
    }

    if (hasExtension(file.name, XLSX_EXTENSIONS)) {
      return readFileAsArrayBuffer(file).then(parseWorkbook);
    }

    return Promise.reject(new Error("Formato de arquivo não suportado."));
  }

  function parseCsvText(text) {
    const normalizedText = String(text || "").replace(/^\uFEFF/, "");
    const firstLine = getFirstNonEmptyLine(normalizedText);
    const delimiter = detectDelimiter(firstLine);
    const rows = parseCsvRows(normalizedText, delimiter).filter(function hasContent(row) {
      return row.some(function hasCell(cell) {
        return String(cell || "").trim();
      });
    });

    return rowsToObjects(rows);
  }

  function parseWorkbook(buffer) {
    if (!window.XLSX || !window.XLSX.read || !window.XLSX.utils) {
      throw new Error("Leitor XLSX não está disponível.");
    }

    const workbook = window.XLSX.read(buffer, {
      type: "array"
    });
    const firstSheetName = workbook.SheetNames && workbook.SheetNames[0];

    if (!firstSheetName) {
      throw new Error("A planilha não possui abas.");
    }

    const sheet = workbook.Sheets[firstSheetName];
    const rows = window.XLSX.utils.sheet_to_json(sheet, {
      header: 1,
      defval: "",
      blankrows: false,
      raw: false
    });

    return rowsToObjects(rows);
  }

  function rowsToObjects(rows) {
    const headers = (rows[0] || []).map(function normalizeHeader(header) {
      return String(header || "").replace(/^\uFEFF/, "").trim();
    });
    const dataRows = rows.slice(1).map(function mapRow(row, index) {
      const item = {};

      headers.forEach(function assignCell(header, cellIndex) {
        if (!header) {
          return;
        }

        item[header] = normalizeCell(row[cellIndex]);
      });

      return {
        rowNumber: index + 2,
        values: item
      };
    }).filter(function hasValues(row) {
      return Object.keys(row.values).some(function hasValue(key) {
        return row.values[key];
      });
    });

    return {
      headers: headers.filter(Boolean),
      rows: dataRows
    };
  }

  function parseCsvRows(text, delimiter) {
    const rows = [];
    let row = [];
    let cell = "";
    let isQuoted = false;

    for (let index = 0; index < text.length; index += 1) {
      const char = text[index];
      const nextChar = text[index + 1];

      if (char === '"') {
        if (isQuoted && nextChar === '"') {
          cell += '"';
          index += 1;
        } else {
          isQuoted = !isQuoted;
        }
      } else if (char === delimiter && !isQuoted) {
        row.push(cell);
        cell = "";
      } else if ((char === "\n" || char === "\r") && !isQuoted) {
        if (char === "\r" && nextChar === "\n") {
          index += 1;
        }

        row.push(cell);
        rows.push(row);
        row = [];
        cell = "";
      } else {
        cell += char;
      }
    }

    row.push(cell);
    rows.push(row);

    return rows;
  }

  function detectDelimiter(line) {
    const semicolonCount = parseCsvRows(line, ";")[0].length;
    const commaCount = parseCsvRows(line, ",")[0].length;

    return semicolonCount >= commaCount ? ";" : ",";
  }

  function getFirstNonEmptyLine(text) {
    const lines = String(text || "").split(/\r?\n/);

    return lines.find(function isNotEmpty(line) {
      return String(line || "").trim();
    }) || "";
  }

  function normalizeCell(value) {
    return String(value || "")
      .replace(/\r\n/g, "\n")
      .replace(/[^\S\n]+/g, " ")
      .trim();
  }

  function hasExtension(fileName, extensions) {
    const normalizedFileName = String(fileName || "").toLowerCase();

    return extensions.some(function matchesExtension(extension) {
      return normalizedFileName.endsWith(extension);
    });
  }

  function readFileAsText(file) {
    return readFile(file, "text");
  }

  function readFileAsArrayBuffer(file) {
    return readFile(file, "arrayBuffer");
  }

  function readFile(file, mode) {
    return new Promise(function executor(resolve, reject) {
      const reader = new FileReader();

      reader.addEventListener("load", function onLoad() {
        resolve(reader.result);
      });
      reader.addEventListener("error", function onError() {
        reject(new Error("Não foi possível ler o arquivo."));
      });

      if (mode === "arrayBuffer") {
        reader.readAsArrayBuffer(file);
      } else {
        reader.readAsText(file, "utf-8");
      }
    });
  }

  window.TermosSpreadsheetParser = {
    parseFile: parseFile
  };
})();
