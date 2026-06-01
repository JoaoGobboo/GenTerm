'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { loadIife } = require('./helpers/harness.js');

const w = {};

// FormUtils has no deps
loadIife('src/js/utils/form-utils.js', w);

// TermosData stub — only normalizeKey is needed by BatchModel
w.TermosData = {
  normalizeKey: function (value) {
    return String(value || '')
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .trim()
      .toLowerCase();
  }
};

// TermosTermModel stub — withResponsibilityDefaults and withReturnDefaults just return the data as-is
w.TermosTermModel = {
  withResponsibilityDefaults: function (data) { return data; },
  withReturnDefaults: function (data) { return data; }
};

loadIife('src/js/models/batch-model.js', w);
const BatchModel = w.TermosBatchModel;

// --- dataContext helpers ---
function makeDataContext({ companies = [], technicians = [] } = {}) {
  return {
    getResponsibilityCompanies: () => companies,
    getTechnicians: () => technicians
  };
}

const POSIGRAF = { id: 'posigraf', label: 'Posigraf', termName: 'GRAFICA E EDITORA POSIGRAF LTDA', cnpj: '00.000.000/0000-00' };
const TECH_JOAO = { nome: 'João TI', matricula: 'T001', cpf: '52998224725', cidade: 'Curitiba' };

// --- normalizeDate ---
test('normalizeDate: data ISO válida aceita', () => {
  assert.equal(BatchModel.normalizeDate('2024-05-15'), '2024-05-15');
});

test('normalizeDate: data dd/mm/yyyy é convertida para ISO', () => {
  assert.equal(BatchModel.normalizeDate('15/05/2024'), '2024-05-15');
});

test('normalizeDate: data dd/mm/yyyy inválida recusada', () => {
  assert.equal(BatchModel.normalizeDate('30/02/2024'), '');
});

test('normalizeDate: string inválida retorna vazio', () => {
  assert.equal(BatchModel.normalizeDate('not-a-date'), '');
  assert.equal(BatchModel.normalizeDate(''), '');
});

// --- validateParsedFile: cabeçalhos ausentes ---
test('cabeçalhos obrigatórios ausentes geram erro de cabeçalho', () => {
  const parsedFile = { headers: ['nome', 'cpf'], rows: [] };
  const result = BatchModel.validateParsedFile('responsabilidade', parsedFile, makeDataContext());
  assert.equal(result.validRows.length, 0);
  assert.ok(result.invalidRows[0].errors[0].includes('Cabeçalhos obrigatórios ausentes'));
});

test('planilha sem cabeçalhos retorna erro específico', () => {
  const parsedFile = { headers: [], rows: [] };
  const result = BatchModel.validateParsedFile('responsabilidade', parsedFile, makeDataContext());
  assert.ok(result.invalidRows[0].errors[0].includes('não possui cabeçalhos'));
});

test('planilha com cabeçalhos mas sem dados retorna erro de linhas', () => {
  const headers = ['empresaId', 'nome', 'cpf', 'matricula', 'tipoEquipamento', 'marca', 'modelo', 'serial', 'patrimonio'];
  const parsedFile = { headers, rows: [] };
  const result = BatchModel.validateParsedFile('responsabilidade', parsedFile, makeDataContext({ companies: [POSIGRAF] }));
  assert.ok(result.invalidRows[0].errors[0].includes('não possui linhas'));
});

// --- validateParsedFile: linha de responsabilidade válida ---
test('linha válida de responsabilidade gera uma validRow', () => {
  const headers = ['empresaId', 'nome', 'cpf', 'matricula', 'tipoEquipamento', 'marca', 'modelo', 'serial', 'patrimonio'];
  const row = {
    rowNumber: 2,
    values: {
      empresaId: '1', nome: 'Alice', cpf: '529.982.247-25',
      matricula: 'M001', tipoEquipamento: 'Notebook',
      marca: 'Dell', modelo: 'XPS', serial: 'SN001', patrimonio: 'P001'
    }
  };
  const parsedFile = { headers, rows: [row] };
  const result = BatchModel.validateParsedFile('responsabilidade', parsedFile, makeDataContext({ companies: [POSIGRAF] }));
  assert.equal(result.validRows.length, 1);
  assert.equal(result.invalidRows.length, 0);
});

// --- validateParsedFile: linha de devolução válida ---
test('linha válida de devolução gera uma validRow', () => {
  const headers = ['tecnicoId', 'colaboradorNome', 'colaboradorCpf', 'colaboradorMatricula', 'tipoEquipamento', 'marca', 'modelo', 'serial', 'patrimonio'];
  const row = {
    rowNumber: 2,
    values: {
      tecnicoId: '1', colaboradorNome: 'Bob', colaboradorCpf: '529.982.247-25',
      colaboradorMatricula: 'C001', tipoEquipamento: 'Notebook',
      marca: 'Dell', modelo: 'XPS', serial: 'SN001', patrimonio: 'P001'
    }
  };
  const parsedFile = { headers, rows: [row] };
  const result = BatchModel.validateParsedFile('devolucao', parsedFile, makeDataContext({ technicians: [TECH_JOAO] }));
  assert.equal(result.validRows.length, 1);
  assert.equal(result.invalidRows.length, 0);
});

// --- CPF inválido ---
test('CPF inválido na responsabilidade gera erro', () => {
  const headers = ['empresaId', 'nome', 'cpf', 'matricula', 'tipoEquipamento', 'marca', 'modelo', 'serial', 'patrimonio'];
  const row = {
    rowNumber: 2,
    values: {
      empresaId: '1', nome: 'Alice', cpf: '111.111.111-11',
      matricula: 'M001', tipoEquipamento: 'Notebook',
      marca: 'Dell', modelo: 'XPS', serial: 'SN001', patrimonio: 'P001'
    }
  };
  const parsedFile = { headers, rows: [row] };
  const result = BatchModel.validateParsedFile('responsabilidade', parsedFile, makeDataContext({ companies: [POSIGRAF] }));
  assert.ok(result.invalidRows[0].errors.some(e => e.includes('CPF inválido')));
});

// --- empresaId inexistente ---
test('empresaId inexistente na responsabilidade gera erro', () => {
  const headers = ['empresaId', 'nome', 'cpf', 'matricula', 'tipoEquipamento', 'marca', 'modelo', 'serial', 'patrimonio'];
  const row = {
    rowNumber: 2,
    values: {
      empresaId: '99', nome: 'Alice', cpf: '529.982.247-25',
      matricula: 'M001', tipoEquipamento: 'Notebook',
      marca: 'Dell', modelo: 'XPS', serial: 'SN001', patrimonio: 'P001'
    }
  };
  const parsedFile = { headers, rows: [row] };
  const result = BatchModel.validateParsedFile('responsabilidade', parsedFile, makeDataContext({ companies: [POSIGRAF] }));
  assert.ok(result.invalidRows[0].errors.some(e => e.includes('empresaId não encontrado')));
});

// --- tecnicoId inexistente ---
test('tecnicoId inexistente na devolução gera erro', () => {
  const headers = ['tecnicoId', 'colaboradorNome', 'colaboradorCpf', 'colaboradorMatricula', 'tipoEquipamento', 'marca', 'modelo', 'serial', 'patrimonio'];
  const row = {
    rowNumber: 2,
    values: {
      tecnicoId: '99', colaboradorNome: 'Bob', colaboradorCpf: '529.982.247-25',
      colaboradorMatricula: 'C001', tipoEquipamento: 'Notebook',
      marca: 'Dell', modelo: 'XPS', serial: 'SN001', patrimonio: 'P001'
    }
  };
  const parsedFile = { headers, rows: [row] };
  const result = BatchModel.validateParsedFile('devolucao', parsedFile, makeDataContext({ technicians: [TECH_JOAO] }));
  assert.ok(result.invalidRows[0].errors.some(e => e.includes('tecnicoId não encontrado')));
});

// --- normalização de data no lote ---
test('data dd/mm/yyyy é normalizada para ISO na devolução', () => {
  const headers = ['tecnicoId', 'colaboradorNome', 'colaboradorCpf', 'colaboradorMatricula', 'tipoEquipamento', 'marca', 'modelo', 'serial', 'patrimonio', 'data'];
  const row = {
    rowNumber: 2,
    values: {
      tecnicoId: '1', colaboradorNome: 'Bob', colaboradorCpf: '529.982.247-25',
      colaboradorMatricula: 'C001', tipoEquipamento: 'Notebook',
      marca: 'Dell', modelo: 'XPS', serial: 'SN001', patrimonio: 'P001',
      data: '15/05/2024'
    }
  };
  const parsedFile = { headers, rows: [row] };
  const result = BatchModel.validateParsedFile('devolucao', parsedFile, makeDataContext({ technicians: [TECH_JOAO] }));
  assert.equal(result.validRows.length, 1);
  assert.equal(result.validRows[0].data.data, '2024-05-15');
});

test('data inválida na devolução gera erro', () => {
  const headers = ['tecnicoId', 'colaboradorNome', 'colaboradorCpf', 'colaboradorMatricula', 'tipoEquipamento', 'marca', 'modelo', 'serial', 'patrimonio', 'data'];
  const row = {
    rowNumber: 2,
    values: {
      tecnicoId: '1', colaboradorNome: 'Bob', colaboradorCpf: '529.982.247-25',
      colaboradorMatricula: 'C001', tipoEquipamento: 'Notebook',
      marca: 'Dell', modelo: 'XPS', serial: 'SN001', patrimonio: 'P001',
      data: 'not-a-date'
    }
  };
  const parsedFile = { headers, rows: [row] };
  const result = BatchModel.validateParsedFile('devolucao', parsedFile, makeDataContext({ technicians: [TECH_JOAO] }));
  assert.ok(result.invalidRows[0].errors.some(e => e.includes('Data inválida')));
});
