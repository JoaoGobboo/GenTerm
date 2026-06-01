'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { loadIife } = require('./helpers/harness.js');

const w = {};

// FormUtils stub — only getTodayIso is used by term-model
loadIife('src/js/utils/form-utils.js', w);

// PdfUtils stub — only safeValue is used by term-model defaults
w.TermosPdfUtils = {
  safeValue: function (value, fallback) {
    const normalized = String(value || '').replace(/\r\n/g, '\n').replace(/[^\S\n]+/g, ' ').replace(/\n{3,}/g, '\n\n').trim();
    return normalized || (typeof fallback === 'string' ? fallback : '');
  }
};

// DocumentSpecs stub — minimal subset needed by term-model
w.TermosDocumentSpecs = {
  FIXED_TI_ROLE: 'Responsável Departamento TI',
  EQUIPMENT_ROW_LABELS: [
    'TIPO DO EQUIPAMENTO', 'MARCA', 'MODELO', 'SERIAL',
    'CARACTERISTICAS DO EQUIPAMENTO', 'ACESSÓRIOS', 'CÓDIGO DE PATRIMÔNIO'
  ],
  RESPONSIBILITY: {
    pdfTitle: 'TERMO  DE  RESPONSABILIDADE',
    title: 'TERMO DE RESPONSABILIDADE',
    subtitle: 'Disponibilização de Equipamentos',
    footerLeft: 'Disponibilização de Equipamentos',
    footerRight: 'TERMO DE RESPONSABILIDADE',
    staticParagraph1: '1. Para o desempenho de minhas funções...',
    staticParagraph2: '2. Estou ciente e de acordo...',
    clauses: ['3. Cláusula três.'],
    closing: 'Ciente e de acordo...',
    locationLine: 'Local, data da assinatura digital/eletrônica.',
    signatureLines: ['(assinado eletronicamente)', 'Empregado']
  },
  RETURN: {
    title: 'TERMO DE DEVOLUÇÃO',
    subtitle: 'Devolução de Equipamentos.',
    footerLeft: 'Devolução de Equipamentos',
    footerRight: 'TERMO DE DEVOLUÇÃO'
  }
};

loadIife('src/js/models/term-model.js', w);
const TermModel = w.TermosTermModel;

// dataContext helpers
const POSIGRAF = { id: 'posigraf', label: 'Posigraf', termName: 'GRAFICA E EDITORA POSIGRAF LTDA', cnpj: '75.104.422/0008-82' };
const TECH_JOAO = { nome: 'João TI', matricula: 'T001', cpf: '52998224725', cidade: 'Curitiba' };

function makeDataContext({ company = POSIGRAF, technician = TECH_JOAO } = {}) {
  return {
    getResponsibilityCompany: () => company,
    getDefaultEquipmentType: () => 'Notebook'
  };
}

// --- withResponsibilityDefaults ---
test('empresa padrão: empresaNome e cnpj vêm do dataContext', () => {
  const data = TermModel.withResponsibilityDefaults({ empresaId: 'posigraf', nome: 'Alice', cpf: '111.111.111-11', matricula: 'M1' }, makeDataContext());
  assert.equal(data.empresaNome, POSIGRAF.termName);
  assert.equal(data.empresaCnpj, POSIGRAF.cnpj);
});

test('cidade padrão de responsabilidade é Curitiba quando não informada', () => {
  const data = TermModel.withResponsibilityDefaults({ empresaId: 'posigraf', nome: 'Alice', cpf: '', matricula: '' }, makeDataContext());
  assert.equal(data.cidade, 'Curitiba');
});

test('cidade informada é preservada na responsabilidade', () => {
  const data = TermModel.withResponsibilityDefaults({ empresaId: 'posigraf', nome: 'Alice', cpf: '', matricula: '', cidade: 'São Paulo' }, makeDataContext());
  assert.equal(data.cidade, 'São Paulo');
});

test('tipoEquipamento padrão vem do dataContext quando não informado', () => {
  const data = TermModel.withResponsibilityDefaults({ empresaId: 'posigraf', nome: 'Alice', cpf: '', matricula: '' }, makeDataContext());
  assert.equal(data.tipoEquipamento, 'Notebook');
});

test('marca vazia resulta em string vazia (sem fallback automático em responsabilidade)', () => {
  const data = TermModel.withResponsibilityDefaults({ empresaId: 'posigraf', nome: 'Alice', cpf: '', matricula: '' }, makeDataContext());
  assert.equal(data.marca, '');
});

test('caracteristicas e acessorios vazios recebem fallback "-"', () => {
  const data = TermModel.withResponsibilityDefaults({ empresaId: 'posigraf', nome: 'Alice', cpf: '', matricula: '' }, makeDataContext());
  assert.equal(data.caracteristicas, '-');
  assert.equal(data.acessorios, '-');
});

// --- withReturnDefaults ---
test('técnico padrão de devolução: responsavelCargo é FIXED_TI_ROLE', () => {
  const data = TermModel.withReturnDefaults({ responsavelNome: 'João', responsavelCpf: '', responsavelMatricula: '', colaboradorNome: 'Bob', colaboradorCpf: '', colaboradorMatricula: '' }, makeDataContext());
  assert.equal(data.responsavelCargo, 'Responsável Departamento TI');
});

test('cidade de devolução padrão é Curitiba', () => {
  const data = TermModel.withReturnDefaults({ responsavelNome: 'João', responsavelCpf: '', responsavelMatricula: '', colaboradorNome: 'Bob', colaboradorCpf: '', colaboradorMatricula: '' }, makeDataContext());
  assert.equal(data.cidade, 'Curitiba');
});

test('marca e modelo de devolução vazios recebem fallback "-"', () => {
  const data = TermModel.withReturnDefaults({ responsavelNome: 'João', responsavelCpf: '', responsavelMatricula: '', colaboradorNome: 'Bob', colaboradorCpf: '', colaboradorMatricula: '' }, makeDataContext());
  assert.equal(data.marca, '-');
  assert.equal(data.modelo, '-');
});

test('data de devolução padrão é hoje quando não informada', () => {
  const today = w.TermosFormUtils.getTodayIso();
  const data = TermModel.withReturnDefaults({ responsavelNome: 'João', responsavelCpf: '', responsavelMatricula: '', colaboradorNome: 'Bob', colaboradorCpf: '', colaboradorMatricula: '' }, makeDataContext());
  assert.equal(data.data, today);
});
