(function () {
  const INCLUDE_SELECTOR = "[data-html-include]";
  const MAX_INCLUDE_PASSES = 10;
  const templates = {};

  function registerTemplate(path, html) {
    templates[normalizePath(path)] = String(html || "");
  }

  async function loadIncludes(root) {
    const container = root || document;
    let passCount = 0;

    while (container.querySelector(INCLUDE_SELECTOR)) {
      passCount += 1;

      if (passCount > MAX_INCLUDE_PASSES) {
        throw new Error("Limite de inclusões HTML excedido.");
      }

      await loadCurrentIncludes(container);
    }
  }

  async function loadCurrentIncludes(container) {
    const placeholders = Array.from(container.querySelectorAll(INCLUDE_SELECTOR));

    await Promise.all(placeholders.map(function loadPlaceholder(placeholder) {
      return loadFragment(placeholder);
    }));
  }

  async function loadFragment(placeholder) {
    const path = placeholder.getAttribute("data-html-include");

    if (!path) {
      placeholder.remove();
      return;
    }

    const registeredTemplate = templates[normalizePath(path)];

    if (isFileProtocol() && registeredTemplate) {
      injectHtml(placeholder, registeredTemplate);
      return;
    }

    try {
      const response = await fetch(path, {
        cache: "no-cache"
      });

      if (!response.ok) {
        throw new Error("Não foi possível carregar o fragmento HTML: " + path);
      }

      const html = await response.text();

      injectHtml(placeholder, html);
    } catch (error) {
      if (registeredTemplate) {
        console.warn("Usando template HTML registrado para " + path + ".", error);
        injectHtml(placeholder, registeredTemplate);
        return;
      }

      throw error;
    }
  }

  function injectHtml(placeholder, html) {
    const template = document.createElement("template");

    template.innerHTML = html.trim();
    placeholder.replaceWith(template.content.cloneNode(true));
  }

  function normalizePath(path) {
    return String(path || "").replace(/\\/g, "/").replace(/^\.\//, "");
  }

  function isFileProtocol() {
    return window.location.protocol === "file:";
  }

  window.TermosHtmlLoader = {
    registerTemplate: registerTemplate,
    loadIncludes: loadIncludes
  };
})();
