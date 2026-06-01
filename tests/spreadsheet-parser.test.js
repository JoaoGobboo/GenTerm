'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { loadIife } = require('./helpers/harness.js');

const w = {};
loadIife('src/js/data/spreadsheet-parser.js', w);
const Parser = w.TermosSpreadsheetParser;

test('CSV com ponto-e-vírgula como delimitador', () => {
  const result = Parser.parseCsvText('nome;cpf\nJoão;123');
  assert.deepEqual(result.headers, ['nome', 'cpf']);
  assert.equal(result.rows.length, 1);
  assert.equal(result.rows[0].values.nome, 'João');
  assert.equal(result.rows[0].values.cpf, '123');
});

test('CSV com vírgula como delimitador', () => {
  const result = Parser.parseCsvText('nome,cpf\nMaria,456');
  assert.deepEqual(result.headers, ['nome', 'cpf']);
  assert.equal(result.rows[0].values.nome, 'Maria');
});

test('CSV com aspas preserva conteúdo com delimitador interno', () => {
  const result = Parser.parseCsvText('nome;obs\n"Silva, João";"sem obs"');
  assert.equal(result.rows[0].values.nome, 'Silva, João');
  assert.equal(result.rows[0].values.obs, 'sem obs');
});

test('CSV com quebra de linha dentro de aspas', () => {
  const result = Parser.parseCsvText('nome;obs\n"João";"linha1\nlinha2"');
  assert.equal(result.rows[0].values.obs, 'linha1\nlinha2');
});

test('linhas completamente vazias são ignoradas', () => {
  const result = Parser.parseCsvText('nome;cpf\n\nJoão;123\n\n');
  assert.equal(result.rows.length, 1);
});

test('cabeçalhos vazios são ignorados', () => {
  const result = Parser.parseCsvText('nome;;cpf\nJoão;;123');
  assert.deepEqual(result.headers, ['nome', 'cpf']);
  assert.ok(!('undefined' in result.rows[0].values));
});

test('BOM UTF-8 é removido do cabeçalho', () => {
  const result = Parser.parseCsvText('﻿nome;cpf\nJoão;123');
  assert.deepEqual(result.headers, ['nome', 'cpf']);
});

test('número de linha começa em 2 (linha 1 é o cabeçalho)', () => {
  const result = Parser.parseCsvText('nome\nAlice\nBob');
  assert.equal(result.rows[0].rowNumber, 2);
  assert.equal(result.rows[1].rowNumber, 3);
});

test('linhas cujos valores são todos vazios são ignoradas', () => {
  const result = Parser.parseCsvText('nome;cpf\n;\n;\nJoão;123');
  assert.equal(result.rows.length, 1);
  assert.equal(result.rows[0].values.nome, 'João');
});
