"use strict";
const { test } = require("node:test");
const assert = require("node:assert/strict");
const { loadIife } = require("./helpers/harness.js");

const w = {
  TermosPdfUtils: {
    safeValue: (v, fallback) => {
      const s = String(v == null ? "" : v).trim();
      return s || (fallback != null ? String(fallback) : "");
    }
  }
};
loadIife("src/js/data/app-data.js", w);
const AppData = w.TermosData;

function makeCtx(overrides) {
  return AppData.createDataContext(Object.assign({
    techniciansData: { tecnicos_n2: [] },
    responsibilityCompanies: [],
    equipmentOptionsData: { tipos: [], marcas_por_tipo: {} }
  }, overrides));
}

// normalizeKey
test("normalizeKey remove acentos e converte para minúsculas", () => {
  assert.strictEqual(AppData.normalizeKey("São Paulo"), "sao paulo");
  assert.strictEqual(AppData.normalizeKey("NOTEBOOK"), "notebook");
  assert.strictEqual(AppData.normalizeKey("Curitibá"), "curitiba");
});

test("normalizeKey remove espaços nas extremidades", () => {
  assert.strictEqual(AppData.normalizeKey("  foo  "), "foo");
});

test("normalizeKey retorna string vazia para null, undefined ou vazio", () => {
  assert.strictEqual(AppData.normalizeKey(null), "");
  assert.strictEqual(AppData.normalizeKey(undefined), "");
  assert.strictEqual(AppData.normalizeKey(""), "");
});

// getSelectedTechnician
test("getSelectedTechnician retorna null para id vazio", () => {
  const ctx = makeCtx({
    techniciansData: { tecnicos_n2: [{ nome: "Ana", matricula: "001", cpf: "12345678901", cidade: "Curitiba" }] }
  });
  assert.strictEqual(ctx.getSelectedTechnician(""), null);
});

test("getSelectedTechnician retorna técnico pelo índice", () => {
  const tecnico = { nome: "Ana", matricula: "001", cpf: "12345678901", cidade: "Curitiba" };
  const ctx = makeCtx({ techniciansData: { tecnicos_n2: [tecnico] } });
  assert.deepStrictEqual(ctx.getSelectedTechnician("0"), tecnico);
});

test("getSelectedTechnician retorna null para índice inexistente", () => {
  const ctx = makeCtx({ techniciansData: { tecnicos_n2: [] } });
  assert.strictEqual(ctx.getSelectedTechnician("5"), null);
});

// getResponsibilityCompany
test("getResponsibilityCompany encontra empresa por id exato", () => {
  const company = { id: "posigraf", label: "Posigraf", termName: "POSIGRAF", cnpj: "00.000.000/0001-00" };
  const ctx = makeCtx({ responsibilityCompanies: [company] });
  assert.deepStrictEqual(ctx.getResponsibilityCompany("posigraf"), company);
});

test("getResponsibilityCompany faz busca normalizada (ignora acentos e case)", () => {
  const company = { id: "São Paulo", label: "SP", termName: "SP", cnpj: "" };
  const ctx = makeCtx({ responsibilityCompanies: [company] });
  assert.deepStrictEqual(ctx.getResponsibilityCompany("sao paulo"), company);
});

test("getResponsibilityCompany faz fallback para posigraf quando id não encontrado", () => {
  const posigraf = { id: "posigraf", label: "Posigraf", termName: "POSIGRAF", cnpj: "" };
  const other = { id: "other", label: "Other", termName: "Other", cnpj: "" };
  const ctx = makeCtx({ responsibilityCompanies: [other, posigraf] });
  assert.deepStrictEqual(ctx.getResponsibilityCompany("inexistente"), posigraf);
});

test("getResponsibilityCompany retorna primeira empresa quando posigraf não existe", () => {
  const first = { id: "first", label: "First", termName: "First", cnpj: "" };
  const ctx = makeCtx({ responsibilityCompanies: [first] });
  assert.deepStrictEqual(ctx.getResponsibilityCompany("inexistente"), first);
});

test("getResponsibilityCompany retorna objeto vazio quando lista está vazia", () => {
  const ctx = makeCtx({ responsibilityCompanies: [] });
  const result = ctx.getResponsibilityCompany("inexistente");
  assert.strictEqual(result.id, "");
  assert.strictEqual(result.label, "");
  assert.strictEqual(result.cnpj, "");
});

// getDefaultEquipmentType
test("getDefaultEquipmentType retorna primeiro tipo quando há tipos", () => {
  const ctx = makeCtx({ equipmentOptionsData: { tipos: ["Notebook", "Desktop"], marcas_por_tipo: {} } });
  assert.strictEqual(ctx.getDefaultEquipmentType(), "Notebook");
});

test("getDefaultEquipmentType retorna string vazia quando não há tipos", () => {
  const ctx = makeCtx();
  assert.strictEqual(ctx.getDefaultEquipmentType(), "");
});

// getBrandsForType
test("getBrandsForType retorna marcas do tipo correspondente", () => {
  const ctx = makeCtx({
    equipmentOptionsData: {
      tipos: ["Notebook"],
      marcas_por_tipo: { Notebook: ["Dell", "Lenovo"] }
    }
  });
  assert.deepStrictEqual(ctx.getBrandsForType("Notebook"), ["Dell", "Lenovo"]);
});

test("getBrandsForType faz busca normalizada por tipo", () => {
  const ctx = makeCtx({
    equipmentOptionsData: {
      tipos: ["Notebook"],
      marcas_por_tipo: { Notebook: ["Dell"] }
    }
  });
  assert.deepStrictEqual(ctx.getBrandsForType("notebook"), ["Dell"]);
});

test("getBrandsForType retorna todas as marcas quando tipo não encontrado", () => {
  const ctx = makeCtx({
    equipmentOptionsData: {
      tipos: ["Notebook", "Desktop"],
      marcas_por_tipo: { Notebook: ["Dell"], Desktop: ["HP"] }
    }
  });
  const brands = ctx.getBrandsForType("inexistente");
  assert.ok(brands.includes("Dell"));
  assert.ok(brands.includes("HP"));
});

test("getBrandsForType retorna todas as marcas quando lista do tipo está vazia", () => {
  const ctx = makeCtx({
    equipmentOptionsData: {
      tipos: ["Notebook", "Desktop"],
      marcas_por_tipo: { Notebook: [], Desktop: ["HP"] }
    }
  });
  const brands = ctx.getBrandsForType("Notebook");
  assert.ok(brands.includes("HP"));
});
