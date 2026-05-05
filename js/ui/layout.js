(function () {
  const ROOT = document.documentElement;
  let header = null;
  let resizeObserver = null;
  let eventsBound = false;
  let lastAppHeight = "";
  let lastHeaderHeight = "";

  document.addEventListener("DOMContentLoaded", init);
  document.addEventListener("termos:html-ready", init);

  function init() {
    const currentHeader = document.querySelector(".site-header");

    if (currentHeader !== header) {
      if (resizeObserver) {
        resizeObserver.disconnect();
        resizeObserver = null;
      }

      header = currentHeader;
      lastHeaderHeight = "";
    }

    syncLayoutMetrics();
    bindEvents();
  }

  function bindEvents() {
    if (!eventsBound) {
      window.addEventListener("resize", syncLayoutMetrics, { passive: true });
      window.addEventListener("orientationchange", syncLayoutMetrics, { passive: true });
      eventsBound = true;
    }

    if (!header || resizeObserver || typeof ResizeObserver === "undefined") {
      return;
    }

    resizeObserver = new ResizeObserver(syncLayoutMetrics);
    resizeObserver.observe(header);
  }

  function syncLayoutMetrics() {
    const appHeight = window.innerHeight + "px";

    if (appHeight !== lastAppHeight) {
      ROOT.style.setProperty("--app-height", appHeight);
      lastAppHeight = appHeight;
    }

    if (!header) {
      return;
    }

    const headerHeight = Math.ceil(header.getBoundingClientRect().height);
    const headerHeightValue = headerHeight + "px";

    if (headerHeightValue !== lastHeaderHeight) {
      ROOT.style.setProperty("--header-height", headerHeightValue);
      lastHeaderHeight = headerHeightValue;
    }
  }
})();
