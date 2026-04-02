(function () {
  const ROOT = document.documentElement;
  let header = null;
  let resizeObserver = null;
  let lastAppHeight = "";
  let lastHeaderHeight = "";

  document.addEventListener("DOMContentLoaded", function onReady() {
    header = document.querySelector(".site-header");
    syncLayoutMetrics();
    bindEvents();
  });

  function bindEvents() {
    window.addEventListener("resize", syncLayoutMetrics, { passive: true });
    window.addEventListener("orientationchange", syncLayoutMetrics, { passive: true });

    if (!header || typeof ResizeObserver === "undefined") {
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
