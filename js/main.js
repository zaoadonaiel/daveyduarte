/* ============================================================
   daveyduarte.com — nav, scroll reveal, contact form
   ============================================================ */
(function () {
  'use strict';

  /* ---------- mobile drawer ---------- */
  var toggle = document.querySelector('.nav__toggle');
  var drawer = document.getElementById('drawer');

  if (toggle && drawer) {
    toggle.addEventListener('click', function () {
      var open = drawer.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    drawer.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') {
        drawer.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  /* ---------- scroll reveal ---------- */
  var items = document.querySelectorAll('.rv');

  if (!('IntersectionObserver' in window)) {
    Array.prototype.forEach.call(items, function (el) { el.classList.add('in'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          en.target.classList.add('in');
          io.unobserve(en.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.06 });

    Array.prototype.forEach.call(items, function (el) { io.observe(el); });
  }

  /* ---------- contact form ---------- */
  var form = document.getElementById('contact-form');
  if (!form) return;

  var status = document.getElementById('form-status');
  var submit = form.querySelector('button[type="submit"]');
  var EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  function field(input) { return input.closest('.field'); }

  function setError(input, message) {
    var f = field(input);
    if (!f) return;
    f.classList.add('is-invalid');
    var err = f.querySelector('.field__err');
    if (err) err.textContent = message;
    input.setAttribute('aria-invalid', 'true');
  }

  function clearError(input) {
    var f = field(input);
    if (!f) return;
    f.classList.remove('is-invalid');
    input.removeAttribute('aria-invalid');
  }

  function validate() {
    var ok = true;
    var first = null;

    form.querySelectorAll('[data-required]').forEach(function (input) {
      clearError(input);
      var val = (input.value || '').trim();

      if (!val) {
        setError(input, 'This field is required.');
        ok = false;
      } else if (input.type === 'email' && !EMAIL.test(val)) {
        setError(input, 'Please enter a valid email address.');
        ok = false;
      } else if (input.name === 'message' && val.length < 10) {
        setError(input, 'Please add a little more detail.');
        ok = false;
      }

      if (!ok && !first) first = input;
    });

    if (first) first.focus();
    return ok;
  }

  function say(message, kind) {
    if (!status) return;
    status.textContent = message;
    status.className = 'form__status is-on ' + (kind === 'ok' ? 'is-ok' : 'is-err');
  }

  // clear an error as soon as the person starts fixing it
  form.querySelectorAll('[data-required]').forEach(function (input) {
    input.addEventListener('input', function () { clearError(input); });
  });

  form.addEventListener('submit', function (e) {
    if (!validate()) { e.preventDefault(); return; }

    // No JS endpoint configured? let the browser post normally.
    if (!form.dataset.ajax) return;

    e.preventDefault();
    submit.disabled = true;
    var label = submit.textContent;
    submit.textContent = 'Sending…';

    fetch(form.action, {
      method: 'POST',
      body: new FormData(form),
      headers: { 'Accept': 'application/json' }
    })
      .then(function (res) {
        return res.json().catch(function () { return { ok: res.ok }; });
      })
      .then(function (data) {
        if (data && (data.ok === true || data.success === true)) {
          form.reset();
          say('Thank you — your message is on its way. I’ll reply personally, usually within one business day.', 'ok');
        } else {
          say((data && data.error) || 'Something went wrong sending that. Please email info@thexdigital.com directly.', 'err');
        }
      })
      .catch(function () {
        say('Something went wrong sending that. Please email info@thexdigital.com directly.', 'err');
      })
      .finally(function () {
        submit.disabled = false;
        submit.textContent = label;
      });
  });
})();
