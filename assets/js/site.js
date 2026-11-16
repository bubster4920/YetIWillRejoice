// Yet I Will Rejoice — small progressive enhancements. Everything works without this file.
(function () {
  // Mobile menu
  var btn = document.querySelector(".menu-btn");
  var nav = document.getElementById("site-nav");
  if (btn && nav) {
    btn.addEventListener("click", function () {
      var open = nav.classList.toggle("open");
      btn.setAttribute("aria-expanded", open);
      btn.textContent = open ? "Close" : "Menu";
    });
    nav.addEventListener("click", function (e) {
      if (e.target.closest("a")) { nav.classList.remove("open"); btn.setAttribute("aria-expanded", false); btn.textContent = "Menu"; }
    });
  }

  // Click-to-play YouTube: no YouTube scripts load until someone presses play.
  document.querySelectorAll(".video[data-youtube] button").forEach(function (b) {
    b.addEventListener("click", function () {
      var box = b.parentElement;
      var f = document.createElement("iframe");
      f.src = "https://www.youtube-nocookie.com/embed/" + box.dataset.youtube + "?autoplay=1&rel=0";
      f.title = b.getAttribute("aria-label") || "Episode video";
      f.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
      f.allowFullscreen = true;
      box.replaceChildren(f);
    });
  });

  // Episode library: search + series filter, with the series kept in the URL hash.
  var lib = document.querySelector("[data-library]");
  if (lib) {
    var input = lib.querySelector("[data-search-input]");
    var chips = lib.querySelectorAll("[data-filter]");
    var cards = lib.querySelectorAll(".ep");
    var empty = lib.querySelector("[data-empty]");
    var series = "all";
    var apply = function () {
      var q = input.value.trim().toLowerCase();
      var shown = 0;
      cards.forEach(function (c) {
        var ok = (series === "all" || c.dataset.series === series) && (!q || c.dataset.search.indexOf(q) > -1);
        c.hidden = !ok;
        if (ok) shown++;
      });
      empty.hidden = shown > 0;
    };
    var pick = function (key) {
      series = key;
      chips.forEach(function (c) { c.setAttribute("aria-pressed", c.dataset.filter === key); });
      apply();
    };
    chips.forEach(function (c) {
      c.addEventListener("click", function () {
        pick(c.dataset.filter);
        history.replaceState(null, "", c.dataset.filter === "all" ? location.pathname : "#" + c.dataset.filter);
      });
    });
    input.addEventListener("input", apply);
    var start = location.hash.slice(1);
    if (start && lib.querySelector('[data-filter="' + start + '"]')) pick(start);
  }

  // Share buttons
  var share = document.querySelector("[data-share]");
  if (share) {
    var url = share.dataset.url, title = share.dataset.title;
    var nativeBtn = share.querySelector("[data-share-native]");
    if (navigator.share && nativeBtn) {
      nativeBtn.hidden = false;
      nativeBtn.addEventListener("click", function () { navigator.share({ title: title, url: url }).catch(function () {}); });
    }
    var copy = share.querySelector("[data-copy]");
    copy.addEventListener("click", function () {
      var done = function () { copy.textContent = "Link copied"; setTimeout(function () { copy.textContent = "Copy link"; }, 2000); };
      if (navigator.clipboard) navigator.clipboard.writeText(url).then(done, function () { prompt("Copy this link:", url); });
      else prompt("Copy this link:", url);
    });
  }

  /* Analytics consent: Google Analytics stays off until the visitor accepts. */
  (function () {
    var KEY = "yiwr-consent";
    function saved() { try { return localStorage.getItem(KEY); } catch (e) { return null; } }
    function save(v) {
      try { localStorage.setItem(KEY, v); } catch (e) {}
      if (typeof window.gtag === "function") {
        window.gtag("consent", "update", { analytics_storage: v === "granted" ? "granted" : "denied" });
      }
    }
    function close() { var el = document.getElementById("consent-banner"); if (el) el.remove(); }
    function open() {
      if (document.getElementById("consent-banner")) return;
      var home = document.querySelector(".brand, .links-logo");
      var base = home ? home.getAttribute("href") : "/";
      var el = document.createElement("div");
      el.id = "consent-banner";
      el.className = "consent-banner";
      el.setAttribute("role", "dialog");
      el.setAttribute("aria-label", "Cookie preferences");
      el.innerHTML = '<p>We use Google Analytics cookies to see, in aggregate, how people use this site. They are off unless you say yes. <a href="' + base + 'privacy/">Privacy</a></p>' +
        '<div class="consent-actions"><button type="button" class="btn btn-small btn-ghost-dark" data-consent="denied">Decline</button><button type="button" class="btn btn-small btn-accent" data-consent="granted">Accept</button></div>';
      el.addEventListener("click", function (e) {
        var v = e.target.getAttribute && e.target.getAttribute("data-consent");
        if (v) { save(v); close(); }
      });
      document.body.appendChild(el);
    }
    var links = document.querySelectorAll("[data-cookie-settings]");
    for (var i = 0; i < links.length; i++) {
      links[i].addEventListener("click", function (e) { e.preventDefault(); open(); });
    }
    if (!saved()) open();
  })();
})();
