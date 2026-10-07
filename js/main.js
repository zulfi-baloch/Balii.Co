/* ==========================================================================
   Balli.Co — main.js
   Reads everything editable from js/config.js (brandConfig, socialLinks, products, gallery).
   ========================================================================== */
(function () {
  "use strict";

  var cfg = brandConfig;
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var root = document.documentElement;
  root.classList.add("js");

  /* ---------- Helpers ---------- */
  function esc(str) {
    return String(str).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function intlNumber(num) {
    var d = String(num).replace(/\D/g, "");
    if (d.indexOf("00") === 0) d = d.slice(2);
    if (d.charAt(0) === "0") d = "92" + d.slice(1);
    return d; // 03043062683 -> 923043062683
  }
  function waLink(message) {
    return "https://wa.me/" + intlNumber(cfg.whatsapp) + "?text=" + encodeURIComponent(message);
  }
  function priceLabel(p) {
    return typeof p.price === "number" ? cfg.currency + " " + p.price.toLocaleString("en-PK") : cfg.pricePlaceholder;
  }

  /* ---------- Store layer (swap these for a real backend later) ----------
     - getProducts(): replace with fetch("/api/products").then(r => r.json())
     - addToCart / checkout: wire to your cart + payment gateway
     - orderViaWhatsApp: today's ordering path                                      */
  var BalliStore = {
    getProducts: function () { return Promise.resolve(BALLI_PRODUCTS); },
    addToCart: function (/* productId, options */) { /* TODO: cart state + persistence */ },
    checkout: function () { /* TODO: payment gateway + order management */ },
    orderMessage: function (product, opts) {
      var msg = "Hello Balli.Co, I'd like to order: " + product.name + " (" + product.sku + ")";
      if (opts && opts.size) msg += " — Size: " + opts.size;
      return msg + ". Please share the price and availability.";
    },
    orderViaWhatsApp: function (product, opts) { return waLink(this.orderMessage(product, opts)); }
  };
  window.BalliStore = BalliStore;

  /* ---------- Config -> DOM ---------- */
  function applyConfig() {
    $$("[data-brand]").forEach(function (el) {
      var key = el.getAttribute("data-brand");
      if (cfg[key]) el.textContent = cfg[key];
    });
    $$("[data-tel]").forEach(function (el) { el.setAttribute("href", "tel:+" + intlNumber(cfg.phone)); });
    $$("[data-wa]").forEach(function (el) {
      el.setAttribute("href", waLink(el.getAttribute("data-wa-msg") || cfg.whatsappGreeting));
    });
    $$("[data-social]").forEach(function (el) {
      var url = cfg.social[el.getAttribute("data-social")];
      if (url && url !== "#") {
        el.setAttribute("href", url);
        el.setAttribute("target", "_blank");
        el.setAttribute("rel", "noopener noreferrer");
      } else {
        el.setAttribute("href", "#");
        el.classList.add("is-placeholder");
        el.addEventListener("click", function (e) { e.preventDefault(); });
      }
    });
    var dev = $("#dev-credit");
    if (dev && cfg.developerUrl) {
      dev.setAttribute("href", cfg.developerUrl);
      dev.setAttribute("target", "_blank");
    }
    var q = encodeURIComponent(cfg.location);
    var map = $("#map-frame");
    if (map) map.src = "https://maps.google.com/maps?q=" + q + "&t=m&z=16&output=embed";
    var dir = $("#directions-link");
    if (dir) dir.href = "https://www.google.com/maps/search/?api=1&query=" + q;

    // The HTML already carries the default hero/about photos for fast first paint;
    // only swap them if the owner changed the ids in config.js.
    function syncImage(el, img, w, widths) {
      if (!el || !img) return;
      var src = imageUrl(img, w);
      if (el.getAttribute("src") !== src) {
        el.src = src;
        el.srcset = imageSrcset(img, widths);
        el.alt = img.alt;
      }
    }
    if (typeof BALLI_IMAGES !== "undefined") {
      syncImage($("#hero-img"), BALLI_IMAGES.hero, 1200, [800, 1200, 1800]);
      syncImage($("#about-img"), BALLI_IMAGES.about, 1000, [600, 1000, 1400]);
    }
    var hint = $("#form-hint");
    if (hint && cfg.formEndpoint) hint.textContent = "Your message will be sent to the Balli.Co team.";
  }

  /* ---------- Products ---------- */
  function productCard(p, i) {
    var n = String(i + 1).padStart(2, "0");
    return '<article class="card reveal" style="--d:' + ((i % 4) * 0.07).toFixed(2) + 's">' +
      '<div class="card__media img-reveal has-fallback">' +
        '<span class="card__index" aria-hidden="true">' + n + '</span>' +
        '<img src="' + imageUrl(p.image, 640) + '" srcset="' + imageSrcset(p.image, [400, 640, 900]) + '" ' +
        'sizes="(min-width:1280px) 300px, (min-width:640px) 45vw, 92vw" width="800" height="1000" ' +
        'loading="lazy" decoding="async" alt="' + esc(p.image.alt) + '" style="object-position:' + esc(p.image.pos || "50% 30%") + '">' +
      '</div>' +
      '<div class="card__body">' +
        '<h3 class="card__title">' + esc(p.name) + '</h3>' +
        '<p class="card__desc">' + esc(p.short) + '</p>' +
        '<p class="card__price">' + esc(priceLabel(p)) + '</p>' +
        '<div class="card__actions">' +
          '<button class="btn btn--ghost btn--sm" type="button" data-details="' + esc(p.id) + '">View Details</button>' +
          '<a class="btn btn--primary btn--sm" target="_blank" rel="noopener noreferrer" href="' + esc(BalliStore.orderViaWhatsApp(p)) + '">' +
            '<svg class="icon" aria-hidden="true"><use href="#i-whatsapp"/></svg> Order on WhatsApp</a>' +
        '</div>' +
      '</div></article>';
  }

  var productsById = {};
  function renderProducts() {
    var grid = $("#product-grid");
    return BalliStore.getProducts().then(function (list) {
      list.forEach(function (p) { productsById[p.id] = p; });
      grid.innerHTML = list.map(productCard).join("");
      observeReveals(grid);
    });
  }

  /* ---------- Gallery ---------- */
  var RATIOS = ["4 / 5", "1 / 1", "3 / 4", "4 / 3", "4 / 5", "3 / 4", "1 / 1"];
  function renderGallery() {
    var grid = $("#gallery-grid");
    grid.innerHTML = BALLI_GALLERY.map(function (g, i) {
      return '<figure class="gallery__item reveal">' +
        '<div class="gallery__frame img-reveal has-fallback" style="aspect-ratio:' + RATIOS[i % RATIOS.length] + '">' +
          '<img src="' + imageUrl(g.image, 700) + '" srcset="' + imageSrcset(g.image, [480, 700, 1000]) + '" ' +
          'sizes="(min-width:1024px) 30vw, (min-width:640px) 45vw, 92vw" width="800" height="1000" loading="lazy" decoding="async" ' +
          'alt="' + esc(g.image.alt) + '" style="object-position:' + esc(g.image.pos || "50% 30%") + '">' +
        '</div>' +
        '<figcaption><span>' + String(i + 1).padStart(2, "0") + '</span>' + esc(g.label) + '</figcaption></figure>';
    }).join("");
    observeReveals(grid);
  }

  /* Graceful image failure: show the monogram placeholder instead of a broken icon */
  document.addEventListener("error", function (e) {
    var t = e.target;
    if (t && t.tagName === "IMG") { t.classList.add("img-failed"); if (t.parentElement) t.parentElement.classList.add("has-fallback"); }
  }, true);

  /* ---------- Reveal on scroll ---------- */
  var revealObserver = null;
  function observeReveals(scope) {
    var els = $$(".reveal, .img-reveal", scope || document);
    if (!("IntersectionObserver" in window) || reduceMotion) {
      els.forEach(function (el) { el.classList.add("is-visible"); });
      return;
    }
    if (!revealObserver) {
      revealObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) { en.target.classList.add("is-visible"); revealObserver.unobserve(en.target); }
        });
      }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    }
    els.forEach(function (el) { if (!el.classList.contains("is-visible")) revealObserver.observe(el); });
  }

  /* ---------- Header: compact on scroll + mobile menu + active link ---------- */
  function initNav() {
    var header = $("#site-header");
    var toggle = $("#nav-toggle");
    var panel = $("#nav-panel");
    var ticking = false;

    function onScroll() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () {
        header.classList.toggle("is-compact", window.scrollY > 24);
        ticking = false;
      });
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    var mq = window.matchMedia("(min-width: 900px)");
    function setMenu(open) {
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
      panel.classList.toggle("is-open", open);
      document.body.classList.toggle("is-locked", open);
      if (!mq.matches) {
        if (open) { panel.removeAttribute("inert"); } else { panel.setAttribute("inert", ""); }
      }
    }
    function syncForViewport() {
      if (mq.matches) { panel.removeAttribute("inert"); setMenu(false); panel.removeAttribute("inert"); }
      else if (!panel.classList.contains("is-open")) { panel.setAttribute("inert", ""); }
    }
    toggle.addEventListener("click", function () { setMenu(toggle.getAttribute("aria-expanded") !== "true"); });
    $$("a", panel).forEach(function (a) { a.addEventListener("click", function () { if (!mq.matches) setMenu(false); }); });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && panel.classList.contains("is-open")) { setMenu(false); toggle.focus(); }
    });
    (mq.addEventListener ? mq.addEventListener("change", syncForViewport) : mq.addListener(syncForViewport));
    syncForViewport();

    // Active link highlighting
    var links = $$(".nav__links a");
    var map = {};
    links.forEach(function (a) { map[a.getAttribute("href").slice(1)] = a; });
    if ("IntersectionObserver" in window) {
      var spy = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) {
            var id = en.target.id;
            if (id === "visit") id = "contact";
            links.forEach(function (a) { a.removeAttribute("aria-current"); });
            if (map[id]) map[id].setAttribute("aria-current", "true");
          }
        });
      }, { rootMargin: "-45% 0px -50% 0px" });
      ["home", "collection", "about", "gallery", "contact", "visit"].forEach(function (id) {
        var s = document.getElementById(id); if (s) spy.observe(s);
      });
    }
  }

  /* ---------- Product dialog ---------- */
  function openDialog(d) { if (typeof d.showModal === "function") d.showModal(); else d.setAttribute("open", ""); }
  function closeDialog(d) { if (typeof d.close === "function") d.close(); else d.removeAttribute("open"); }

  function initProductDialog() {
    var dlg = $("#product-dialog");
    var sizes = ["S", "M", "L", "XL", "XXL"];
    var current = null;
    var sizesEl = $("#pd-sizes");
    sizesEl.innerHTML = sizes.map(function (s) {
      return '<label><input type="radio" name="pd-size" value="' + s + '"><span>' + s + '</span></label>';
    }).join("");

    function refreshOrderLink() {
      if (!current) return;
      var checked = $('input[name="pd-size"]:checked', dlg);
      $("#pd-order").href = BalliStore.orderViaWhatsApp(current, { size: checked ? checked.value : "" });
    }
    sizesEl.addEventListener("change", refreshOrderLink);

    document.addEventListener("click", function (e) {
      var btn = e.target.closest("[data-details]");
      if (!btn) return;
      var p = productsById[btn.getAttribute("data-details")];
      if (!p) return;
      current = p;
      var img = $("#pd-img");
      img.classList.remove("img-failed");
      img.src = imageUrl(p.image, 900);
      img.srcset = imageSrcset(p.image, [600, 900, 1200]);
      img.sizes = "(min-width:640px) 480px, 92vw";
      img.alt = p.image.alt;
      img.style.objectPosition = p.image.pos || "50% 30%";
      $("#pd-sku").textContent = "SKU " + p.sku;
      $("#pd-title").textContent = p.name;
      $("#pd-price").textContent = priceLabel(p);
      $("#pd-desc").textContent = p.long;
      $$('input[name="pd-size"]', dlg).forEach(function (r) { r.checked = false; });
      refreshOrderLink();
      openDialog(dlg);
    });
    $$("[data-close]", dlg).forEach(function (b) { b.addEventListener("click", function () { closeDialog(dlg); }); });
    dlg.addEventListener("click", function (e) { if (e.target === dlg) closeDialog(dlg); });
  }

  /* ---------- Contact form ---------- */
  function initForm() {
    var form = $("#contact-form");
    var status = $("#form-status");
    function setStatus(msg, bad) { status.textContent = msg; status.style.color = bad ? "#B3260E" : "inherit"; }

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var fields = $$("input, textarea", form);
      var valid = true;
      fields.forEach(function (f) {
        var ok = f.value.trim().length > 0;
        f.setAttribute("aria-invalid", String(!ok));
        if (!ok) valid = false;
      });
      if (!valid) { setStatus("Please fill in your name, a phone or email, and a message.", true); fields.filter(function (f) { return !f.value.trim(); })[0].focus(); return; }

      var data = { name: form.name.value.trim(), contact: form.contact.value.trim(), message: form.message.value.trim() };

      if (cfg.formEndpoint) {
        setStatus("Sending…");
        fetch(cfg.formEndpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json", "Accept": "application/json" },
          body: JSON.stringify(data)
        }).then(function (r) {
          if (!r.ok) throw new Error("bad response");
          form.reset();
          setStatus("Thank you — your message has been sent.");
        }).catch(function () {
          setStatus("Sorry, that didn't go through. Please try WhatsApp or call us.", true);
        });
      } else {
        var msg = "Hello Balli.Co, my name is " + data.name + " (" + data.contact + ").\n\n" + data.message;
        setStatus("Opening WhatsApp so you can send your message…");
        window.open(waLink(msg), "_blank", "noopener");
      }
    });
  }

  /* ---------- Cookie consent ---------- */
  function initCookies() {
    var KEY = "balliCookieConsent";
    var banner = $("#cookie-banner");
    var dlg = $("#cookie-dialog");
    var cats = ["analytics", "preferences", "marketing"];

    function read() { try { return JSON.parse(localStorage.getItem(KEY)); } catch (e) { return null; } }
    function save(choice) {
      var record = { essential: true, analytics: !!choice.analytics, preferences: !!choice.preferences, marketing: !!choice.marketing, savedAt: new Date().toISOString(), version: 1 };
      try { localStorage.setItem(KEY, JSON.stringify(record)); } catch (e) { /* storage unavailable */ }
      window.dispatchEvent(new CustomEvent("balli:consent", { detail: record }));
      hideBanner();
    }
    function showBanner() {
      banner.hidden = false;
      document.body.classList.add("has-cookie");
      requestAnimationFrame(function () { requestAnimationFrame(function () { banner.classList.add("is-visible"); }); });
    }
    function hideBanner() {
      banner.classList.remove("is-visible");
      document.body.classList.remove("has-cookie");
      setTimeout(function () { banner.hidden = true; }, 600);
    }
    function syncToggles() {
      var saved = read() || {};
      cats.forEach(function (c) { $("#ck-" + c).checked = !!saved[c]; });
    }
    function openSettings() { syncToggles(); openDialog(dlg); }

    $("#cookie-accept").addEventListener("click", function () { save({ analytics: true, preferences: true, marketing: true }); });
    $("#cookie-reject").addEventListener("click", function () { save({}); });
    $("#cookie-settings").addEventListener("click", openSettings);
    $("#cookie-settings-open").addEventListener("click", openSettings);
    $("#ck-save").addEventListener("click", function () {
      var c = {}; cats.forEach(function (k) { c[k] = $("#ck-" + k).checked; });
      save(c); closeDialog(dlg);
    });
    $("#ck-all").addEventListener("click", function () { save({ analytics: true, preferences: true, marketing: true }); closeDialog(dlg); });
    $$("[data-close]", dlg).forEach(function (b) { b.addEventListener("click", function () { closeDialog(dlg); }); });
    dlg.addEventListener("click", function (e) { if (e.target === dlg) closeDialog(dlg); });

    // Use this from your own scripts: if (BalliConsent.allowed("analytics")) { loadAnalytics(); }
    window.BalliConsent = {
      get: read,
      allowed: function (cat) { var r = read(); return !!(r && r[cat]); }
    };

    if (!read()) setTimeout(showBanner, reduceMotion ? 300 : 1400);
  }

  /* ---------- Loader ---------- */
  function initLoader() {
    var loader = $("#loader");
    var started = performance.now();
    var MIN = reduceMotion ? 0 : 900;
    var MAX = 3500;
    var done = false;

    function finish() {
      if (done) return; done = true;
      var wait = Math.max(0, MIN - (performance.now() - started));
      setTimeout(function () {
        root.classList.add("is-loaded");
        loader.setAttribute("aria-hidden", "true");
        setTimeout(function () { if (loader.parentNode) loader.parentNode.removeChild(loader); }, 900);
      }, wait);
    }

    var hero = $("#hero-img");
    var heroReady = new Promise(function (res) {
      if (!hero || hero.complete) return res();
      hero.addEventListener("load", res, { once: true });
      hero.addEventListener("error", res, { once: true });
    });
    var winReady = new Promise(function (res) {
      if (document.readyState === "complete") res(); else window.addEventListener("load", res, { once: true });
    });
    Promise.all([heroReady, winReady]).then(finish);
    setTimeout(finish, MAX);
  }

  /* ---------- Boot ---------- */
  function boot() {
    applyConfig();
    initLoader();
    initNav();
    renderGallery();
    renderProducts().then(function () { initProductDialog(); });
    initForm();
    initCookies();
    observeReveals(document);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot); else boot();
})();
