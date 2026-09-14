/* ============================================================
   daveyduarte.com — loads content/site.json and fills in any
   element marked with data-bind / data-bind-src / data-bind-href
   / data-bind-mailto. Falls back silently to the hardcoded HTML
   already in the page if the fetch fails.
   ============================================================ */
(function () {
  'use strict';

  function getPath(obj, path) {
    return path.split('.').reduce(function (o, key) {
      return o == null ? undefined : o[key];
    }, obj);
  }

  fetch('content/site.json', { cache: 'no-store' })
    .then(function (res) { return res.ok ? res.json() : null; })
    .then(function (data) {
      if (!data) return;

      document.querySelectorAll('[data-bind]').forEach(function (el) {
        var val = getPath(data, el.getAttribute('data-bind'));
        if (val != null) el.innerHTML = val;
      });

      document.querySelectorAll('[data-bind-src]').forEach(function (el) {
        var val = getPath(data, el.getAttribute('data-bind-src'));
        if (val != null) el.setAttribute('src', val);
      });

      document.querySelectorAll('[data-bind-href]').forEach(function (el) {
        var val = getPath(data, el.getAttribute('data-bind-href'));
        if (val != null) el.setAttribute('href', val);
      });

      document.querySelectorAll('[data-bind-mailto]').forEach(function (el) {
        var val = getPath(data, el.getAttribute('data-bind-mailto'));
        if (val != null) el.setAttribute('href', 'mailto:' + val);
      });
    })
    .catch(function () { /* keep the hardcoded fallback content */ });
})();
