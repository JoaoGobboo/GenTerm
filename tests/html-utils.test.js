'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { loadIife } = require('./helpers/harness.js');

const w = {};
loadIife('src/js/utils/html-utils.js', w);
const HtmlUtils = w.TermosHtmlUtils;

test('escapeHtml converte & para &amp;', () => {
  assert.equal(HtmlUtils.escapeHtml('a & b'), 'a &amp; b');
});

test('escapeHtml converte < e > para entidades', () => {
  assert.equal(HtmlUtils.escapeHtml('<div>'), '&lt;div&gt;');
});

test('escapeHtml converte aspas duplas para &quot;', () => {
  assert.equal(HtmlUtils.escapeHtml('"texto"'), '&quot;texto&quot;');
});

test('escapeHtml converte aspas simples para &#39;', () => {
  assert.equal(HtmlUtils.escapeHtml("it's"), 'it&#39;s');
});

test('escapeHtml converte múltiplos caracteres especiais juntos', () => {
  assert.equal(HtmlUtils.escapeHtml('<a href="x&y">it\'s</a>'), '&lt;a href=&quot;x&amp;y&quot;&gt;it&#39;s&lt;/a&gt;');
});

test('escapeHtml retorna string vazia para null', () => {
  assert.equal(HtmlUtils.escapeHtml(null), '');
});

test('escapeHtml retorna string vazia para undefined', () => {
  assert.equal(HtmlUtils.escapeHtml(undefined), '');
});

test('escapeHtml converte número para string sem alterar', () => {
  assert.equal(HtmlUtils.escapeHtml(42), '42');
});

test('escapeHtml preserva texto sem caracteres especiais', () => {
  assert.equal(HtmlUtils.escapeHtml('texto normal'), 'texto normal');
});
