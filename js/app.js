(function () {
  const FormUtils = window.TermosFormUtils;
  const PdfUtils = window.TermosPdfUtils;
  const PreviewUtils = window.TermosPreviewUtils;
  const Data = window.TermosData;
  const TermModel = window.TermosTermModel;
  const FormControllers = window.TermosFormControllers;
  const SpreadsheetParser = window.TermosSpreadsheetParser;
  const BatchController = window.TermosBatchController;
  const DEFAULT_ROUTE_HASH = "#responsabilidade";
  const ROUTES = {
    "#responsabilidade": "responsabilidade",
    "#devolucao": "devolucao",
    "#lote": "lote"
  };

  document.addEventListener("DOMContentLoaded", function onReady() {
    init().catch(function onError(error) {
      console.error(error);
    });
  });

  async function init() {
    if (!FormUtils || !PdfUtils || !PreviewUtils || !Data || !TermModel || !FormControllers || !SpreadsheetParser || !BatchController) {
      return;
    }

    const dataContext = await Data.loadAppData();

    setupRouteSync();
    FormControllers.setupResponsibilityForm({
      dataContext: dataContext
    });
    FormControllers.setupReturnForm({
      dataContext: dataContext
    });
    BatchController.setupBatchPanel({
      dataContext: dataContext
    });
    ensureValidRoute();
    syncRoute();
  }

  function setupRouteSync() {
    window.addEventListener("hashchange", function onHashChange() {
      ensureValidRoute();
      syncRoute();
    });
  }

  function ensureValidRoute() {
    if (ROUTES[window.location.hash]) {
      return;
    }

    if (window.history && typeof window.history.replaceState === "function") {
      window.history.replaceState(null, "", DEFAULT_ROUTE_HASH);
      return;
    }

    window.location.hash = DEFAULT_ROUTE_HASH;
  }

  function syncRoute() {
    const activePanel = ROUTES[window.location.hash] || ROUTES[DEFAULT_ROUTE_HASH];

    document.querySelectorAll("[data-panel]").forEach(function togglePanel(panel) {
      const isActive = panel.dataset.panel === activePanel;
      panel.hidden = !isActive;
    });

    document.querySelectorAll("[data-target]").forEach(function toggleCard(card) {
      card.classList.toggle("is-active", card.dataset.target === activePanel);
    });
  }
})();
