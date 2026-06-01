"use strict";
const { test } = require("node:test");
const assert = require("node:assert/strict");
const { loadIife } = require("./helpers/harness.js");

const w = {};
loadIife("src/js/utils/form-utils.js", w);
const FormUtils = w.TermosFormUtils;

// isValidCpf
test("CPF válido aceito", () => {
    assert.ok(FormUtils.isValidCpf("529.982.247-25"));
    assert.ok(FormUtils.isValidCpf("52998224725"));
});

test("CPF com todos os dígitos iguais rejeitado", () => {
    assert.ok(!FormUtils.isValidCpf("111.111.111-11"));
    assert.ok(!FormUtils.isValidCpf("000.000.000-00"));
});

test("CPF com dígito verificador errado rejeitado", () => {
    assert.ok(!FormUtils.isValidCpf("529.982.247-26"));
});

test("CPF com tamanho errado rejeitado", () => {
    assert.ok(!FormUtils.isValidCpf("123.456.789"));
    assert.ok(!FormUtils.isValidCpf(""));
});

// formatCpf
test("formatCpf formata 11 dígitos corretamente", () => {
    assert.equal(FormUtils.formatCpf("52998224725"), "529.982.247-25");
});

test("formatCpf formata parcialmente enquanto digita", () => {
    assert.equal(FormUtils.formatCpf("529"), "529");
    assert.equal(FormUtils.formatCpf("529982"), "529.982");
    assert.equal(FormUtils.formatCpf("5299822"), "529.982.2");
});

test("formatCpf remove caracteres não numéricos", () => {
    assert.equal(FormUtils.formatCpf("529.982.247-25"), "529.982.247-25");
});

// sanitizeInputValue
test("sanitizeInputValue apara espaços nas bordas", () => {
    assert.equal(FormUtils.sanitizeInputValue("  texto  "), "texto");
});

test("sanitizeInputValue colapsa espaços múltiplos", () => {
    assert.equal(FormUtils.sanitizeInputValue("a  b   c"), "a b c");
});

test("sanitizeInputValue preserva quebra de linha única", () => {
    assert.equal(FormUtils.sanitizeInputValue("a\nb"), "a\nb");
});

test("sanitizeInputValue colapsa quebras de linha excessivas", () => {
    assert.equal(FormUtils.sanitizeInputValue("a\n\n\n\nb"), "a\n\nb");
});

test("sanitizeInputValue normaliza CRLF para LF", () => {
    assert.equal(FormUtils.sanitizeInputValue("a\r\nb"), "a\nb");
});

// getTodayIso
test("getTodayIso retorna string no formato YYYY-MM-DD", () => {
    assert.match(FormUtils.getTodayIso(), /^\d{4}-\d{2}-\d{2}$/);
});

test("getTodayIso retorna data compatível com a data atual do sistema", () => {
    const result = FormUtils.getTodayIso();
    const now = new Date();
    assert.equal(result.slice(0, 4), String(now.getFullYear()));
});

// isValidDateInput
test("data ISO válida aceita", () => {
    assert.ok(FormUtils.isValidDateInput("2024-05-15"));
    assert.ok(FormUtils.isValidDateInput("2000-01-01"));
});

test("data ISO inválida rejeitada", () => {
    assert.ok(!FormUtils.isValidDateInput("2024-02-30"));
    assert.ok(!FormUtils.isValidDateInput("2024-13-01"));
    assert.ok(!FormUtils.isValidDateInput("not-a-date"));
    assert.ok(!FormUtils.isValidDateInput(""));
    assert.ok(!FormUtils.isValidDateInput("15/05/2024"));
});
