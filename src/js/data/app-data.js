(function () {
  const PdfUtils = window.TermosPdfUtils;
  const TECHNICIANS_FILE = "assets/tecnicos.json";
  const COMPANIES_FILE = "assets/empresas.json";
  const EQUIPMENT_OPTIONS_FILE = "assets/equipamentos.json";
  const DEFAULT_RESPONSIBILITY_COMPANY_ID = "posigraf";
  const EMPTY_COMPANY = {
    id: "",
    label: "",
    termName: "",
    cnpj: ""
  };
  const EMPTY_EQUIPMENT_OPTIONS = {
    tipos: [],
    marcas_por_tipo: {}
  };

  async function loadAppData() {
    const techniciansData = await loadTechnicians();
    const responsibilityCompanies = await loadResponsibilityCompanies();
    const equipmentOptionsData = await loadEquipmentOptions();

    return createDataContext({
      techniciansData: techniciansData,
      responsibilityCompanies: responsibilityCompanies,
      equipmentOptionsData: equipmentOptionsData
    });
  }

  function createDataContext(data) {
    const techniciansData = data.techniciansData;
    const responsibilityCompanies = data.responsibilityCompanies;
    const equipmentOptionsData = data.equipmentOptionsData;

    return {
      getTechnicians: function getTechnicians() {
        return techniciansData.tecnicos_n2;
      },
      getSelectedTechnician: function getSelectedTechnician(technicianId) {
        if (technicianId === "") {
          return null;
        }

        return techniciansData.tecnicos_n2[Number(technicianId)] || null;
      },
      getResponsibilityCompanies: function getResponsibilityCompanies() {
        return responsibilityCompanies;
      },
      getResponsibilityCompany: function getResponsibilityCompany(companyId) {
        const normalizedCompanyId = normalizeKey(companyId);

        return responsibilityCompanies.find(function findCompany(company) {
          return normalizeKey(company.id) === normalizedCompanyId;
        }) || responsibilityCompanies.find(function findDefaultCompany(company) {
          return company.id === DEFAULT_RESPONSIBILITY_COMPANY_ID;
        }) || responsibilityCompanies[0] || EMPTY_COMPANY;
      },
      getEquipmentTypes: function getEquipmentTypes() {
        return equipmentOptionsData.tipos;
      },
      getDefaultEquipmentType: function getDefaultEquipmentType() {
        return equipmentOptionsData.tipos[0] || "";
      },
      getBrandsForType: function getBrandsForType(typeValue) {
        const normalizedType = normalizeKey(typeValue);
        const matchingType = equipmentOptionsData.tipos.find(function findType(type) {
          return normalizeKey(type) === normalizedType;
        });

        if (matchingType) {
          const suggestions = equipmentOptionsData.marcas_por_tipo[matchingType] || [];
          // Lista vazia para o tipo: retorna todas as marcas como fallback de sugestão.
          return suggestions.length > 0 ? suggestions : getAllBrands(equipmentOptionsData);
        }

        return getAllBrands(equipmentOptionsData);
      }
    };
  }

  async function loadTechnicians() {
    try {
      const response = await window.fetch(TECHNICIANS_FILE, {
        cache: "no-store"
      });

      if (!response.ok) {
        throw new Error("Falha ao carregar técnicos.");
      }

      const data = await response.json();

      if (!data || !Array.isArray(data.tecnicos_n2)) {
        throw new Error("Arquivo de técnicos inválido.");
      }

      return normalizeTechnicians(data);
    } catch (error) {
      console.warn("Não foi possível carregar os técnicos em assets/tecnicos.json.", error);
      return normalizeTechnicians({ tecnicos_n2: [] });
    }
  }

  async function loadResponsibilityCompanies() {
    try {
      const response = await window.fetch(COMPANIES_FILE, {
        cache: "no-store"
      });

      if (!response.ok) {
        throw new Error("Falha ao carregar empresas.");
      }

      const data = await response.json();
      const companies = Array.isArray(data && data.empresas) ? data.empresas : Array.isArray(data) ? data : null;

      if (!companies) {
        throw new Error("Arquivo de empresas inválido.");
      }

      return normalizeResponsibilityCompanies(companies);
    } catch (error) {
      console.warn("Não foi possível carregar as empresas em assets/empresas.json.", error);
      return normalizeResponsibilityCompanies([]);
    }
  }

  async function loadEquipmentOptions() {
    try {
      const response = await window.fetch(EQUIPMENT_OPTIONS_FILE, {
        cache: "no-store"
      });

      if (!response.ok) {
        throw new Error("Falha ao carregar opções de equipamento.");
      }

      const data = await response.json();

      if (!data || !Array.isArray(data.tipos) || !data.marcas_por_tipo) {
        throw new Error("Arquivo de opções de equipamento inválido.");
      }

      return normalizeEquipmentOptions(data);
    } catch (error) {
      console.warn("Não foi possível carregar as opções de equipamento em assets/equipamentos.json.", error);
      return normalizeEquipmentOptions(EMPTY_EQUIPMENT_OPTIONS);
    }
  }

  function normalizeTechnicians(data) {
    return {
      tecnicos_n2: data.tecnicos_n2.map(function mapTechnician(technician) {
        return {
          nome: PdfUtils.safeValue(technician.nome),
          matricula: String(technician.matricula || ""),
          cpf: String(technician.cpf || "").replace(/\D/g, ""),
          cidade: PdfUtils.safeValue(technician.cidade, "Curitiba")
        };
      })
    };
  }

  function normalizeResponsibilityCompanies(data) {
    return data
      .map(function mapCompany(company) {
        const label = PdfUtils.safeValue(company.label);

        return {
          id: String(company.id || "").trim(),
          label: label,
          termName: PdfUtils.safeValue(company.termName, label),
          cnpj: PdfUtils.safeValue(company.cnpj)
        };
      })
      .filter(function hasId(company) {
        return Boolean(company.id);
      });
  }

  function normalizeEquipmentOptions(data) {
    const types = data.tipos
      .map(function mapType(type) {
        return PdfUtils.safeValue(type);
      })
      .filter(Boolean);
    const brandsByType = {};

    types.forEach(function eachType(type) {
      // Tenta a chave original e depois a normalizada — tolera acentos inconsistentes no JSON.
      const source = data.marcas_por_tipo[type] || data.marcas_por_tipo[normalizeKey(type)] || [];
      brandsByType[type] = source
        .map(function mapBrand(brand) {
          return PdfUtils.safeValue(brand);
        })
        .filter(Boolean);
    });

    return {
      tipos: types,
      marcas_por_tipo: brandsByType
    };
  }

  function getAllBrands(equipmentOptionsData) {
    return Array.from(
      new Set(
        Object.values(equipmentOptionsData.marcas_por_tipo).flat()
      )
    );
  }

  function normalizeKey(value) {
    return String(value || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim()
      .toLowerCase();
  }

  window.TermosData = {
    DEFAULT_RESPONSIBILITY_COMPANY_ID: DEFAULT_RESPONSIBILITY_COMPANY_ID,
    loadAppData: loadAppData,
    normalizeKey: normalizeKey,
    createDataContext: createDataContext
  };
})();
