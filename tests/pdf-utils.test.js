'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { loadIife } = require('./helpers/harness.js');

const w = {};
loadIife('src/js/utils/pdf-utils.js', w);
const PdfUtils = w.TermosPdfUtils;

// safeValue
test('safeValue retorna string original sem alteração', () => {
  assert.equal(PdfUtils.safeValue('texto normal'), 'texto normal');
});

test('safeValue apara espaços nas bordas', () => {
  assert.equal(PdfUtils.safeValue('  texto  '), 'texto');
});

test('safeValue colapsa espaços múltiplos em um', () => {
  assert.equal(PdfUtils.safeValue('a  b   c'), 'a b c');
});

test('safeValue colapsa três ou mais quebras de linha em duas', () => {
  assert.equal(PdfUtils.safeValue('a\n\n\nb'), 'a\n\nb');
});

test('safeValue normaliza CRLF para LF', () => {
  assert.equal(PdfUtils.safeValue('a\r\nb'), 'a\nb');
});

test('safeValue retorna string vazia para valor vazio sem fallback', () => {
  assert.equal(PdfUtils.safeValue(''), '');
});

test('safeValue retorna fallback quando valor é vazio', () => {
  assert.equal(PdfUtils.safeValue('', '-'), '-');
});

test('safeValue retorna fallback quando valor é null', () => {
  assert.equal(PdfUtils.safeValue(null, 'N/A'), 'N/A');
});

test('safeValue não aplica fallback quando valor é não vazio', () => {
  assert.equal(PdfUtils.safeValue('texto', '-'), 'texto');
});

// formatFileName
test('formatFileName concatena prefixo e nome normalizado', () => {
  assert.equal(PdfUtils.formatFileName('RESP', 'João Silva'), 'RESP_JOAO_SILVA.pdf');
});

test('formatFileName remove acentos do nome', () => {
  assert.equal(PdfUtils.formatFileName('DEV', 'Ação Ênfase'), 'DEV_ACAO_ENFASE.pdf');
});

test('formatFileName substitui espaços e caracteres especiais por underscore', () => {
  assert.equal(PdfUtils.formatFileName('RESP', 'Maria   da  Silva'), 'RESP_MARIA_DA_SILVA.pdf');
});

test('formatFileName remove underscores nas bordas do nome', () => {
  assert.equal(PdfUtils.formatFileName('RESP', '  Silva  '), 'RESP_SILVA.pdf');
});

test('formatFileName usa SEM_NOME quando nome é vazio', () => {
  assert.equal(PdfUtils.formatFileName('RESP', ''), 'RESP_SEM_NOME.pdf');
});

test('formatFileName usa SEM_NOME quando nome é null', () => {
  assert.equal(PdfUtils.formatFileName('RESP', null), 'RESP_SEM_NOME.pdf');
});

// formatLongDate
test('formatLongDate formata data ISO em extenso em português', () => {
  assert.equal(PdfUtils.formatLongDate('2024-05-15'), '15 de maio de 2024');
});

test('formatLongDate formata janeiro corretamente', () => {
  assert.equal(PdfUtils.formatLongDate('2024-01-01'), '1 de janeiro de 2024');
});

test('formatLongDate formata dezembro corretamente', () => {
  assert.equal(PdfUtils.formatLongDate('2023-12-31'), '31 de dezembro de 2023');
});

test('formatLongDate formata todos os meses do ano', () => {
  const meses = [
    'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
    'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'
  ];
  meses.forEach((mes, i) => {
    const month = String(i + 1).padStart(2, '0');
    assert.ok(PdfUtils.formatLongDate(`2024-${month}-10`).includes(mes), `mês ${mes} não encontrado`);
  });
});
