(function(){
  var C = window.UB_CONFIG || {};
  function $(s){ return document.querySelector(s); }
  function $$(s){ return Array.from(document.querySelectorAll(s)); }

  var tabs = $$('.tab-btn');
  var panels = $$('.panel');
  var searchInput = $('#globalSearch');
  var gamesGrid = $('#gamesGrid');
  var appsGrid = $('#appsGrid');
  var gamesCountEl = $('#gamesCount');
  var appsCountEl = $('#appsCount');
  var usageFill = $('#usageFill');
  var usageText = $('#usageText');

  var goGames = $('#goGames');
  var goApps = $('#goApps');
  var goSettings = $('#goSettings');

  var openThemePickerBtn = $('#openThemePicker');
  var themeModal = $('#themeModal');
  var closeThemeModalBtn = $('#closeThemeModal');
  var themeItems = $$('.theme-item');

  var sidebarBtns = $$('.sidebar-btn');
  var aboutPanel = $('#aboutPanel');
  var customizePanel = $('#customizePanel');
  var cloakingPanel = $('#cloakingPanel');
  var uselessCloakBtn = $('#uselessCloakBtn');

  var GRID_COLUMNS = 6;
  var GRID_ROWS = 2;
  var ITEMS_PER_PAGE = GRID_COLUMNS * GRID_ROWS;
  var TOTAL_PAGES = 42;
  var REQUIRED_GAMES_TOTAL = ITEMS_PER_PAGE * TOTAL_PAGES;

  var ALL_GAMES = [];
  var APPS = [];
  var FILTER = '';
  var currentPage = 1;
  var paginationContainer = null;

  function escapeHtml(s){
    return (s||'').toString().replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }

  function applyThemeGlobal(url){
    if(!url) return;
    document.documentElement.style.backgroundImage = 'url("' + url + '")';
    document.documentElement.style.backgroundSize = 'cover';
    document.documentElement.style.backgroundPosition = 'center';
    document.documentElement.style.backgroundAttachment = 'fixed';
    document.body.style.backgroundImage = 'url("' + url + '")';
    document.body.style.backgroundSize = 'cover';
    document.body.style.backgroundPosition = 'center';
    document.body.style.backgroundAttachment = 'fixed';
    try{ localStorage.setItem('ub_theme', JSON.stringify({ url: url })); }catch(e){}
  }

  (function restoreThemeOnLoad(){
    try{
      var raw = localStorage.getItem('ub_theme');
      if(!raw) return;
      var obj = JSON.parse(raw);
      if(obj && obj.url) applyThemeGlobal(obj.url);
    }catch(e){}
  })();

  function setFaviconForDoc(doc, url){
    try{
      if(!doc) return;
      var existing = doc.querySelectorAll('link[data-ub-favicon]');
      existing.forEach(function(n){ n.remove(); });
      var link = doc.createElement('link');
      link.setAttribute('data-ub-favicon','1');
      link.rel = 'icon';
      link.type = 'image/png';
      link.href = url;
      doc.head.appendChild(link);
    }catch(e){}
  }

  function persistFavTitle(title, favicon){
    try{ if(title) localStorage.setItem('ub_last_title', title); if(favicon) localStorage.setItem('ub_last_favicon', favicon); }catch(e){}
  }

  (function restoreFavTitle(){
    try{
      var f = localStorage.getItem('ub_last_favicon');
      var t = localStorage.getItem('ub_last_title') || 'Useless UB';
      if(f) setFaviconForDoc(document, f);
      if(t) document.title = t;
    }catch(e){}
  })();

  function initUsage(){
    if(!usageFill || !usageText) return;
    if(navigator.getBattery){
      navigator.getBattery().then(function(bat){
        function update(){ var p = Math.round(bat.level * 100); usageText.textContent = 'Battery • ' + p + '%' + (bat.charging ? ' (charging)' : ''); usageFill.style.width = Math.max(3,p) + '%'; }
        bat.addEventListener('levelchange', update);
        bat.addEventListener('chargingchange', update);
        update();
      }).catch(simulate);
    } else simulate();
    var id = null;
    function simulate(){
      if(id) return;
      function tick(){ var p = 25 + Math.floor(Math.random() * 55); usageText.textContent = 'Computer usage • ' + p + '%'; usageFill.style.width = Math.max(3,p) + '%'; }
      tick();
      id = setInterval(tick, 2500);
    }
  }

  function showPanel(name){
    panels.forEach(function(p){ p.classList.toggle('hidden', p.dataset.panel !== name); });
    tabs.forEach(function(t){ t.classList.toggle('active', t.dataset.target === name); });
    if(name === 'games' || name === 'apps'){
      if(searchInput && searchInput.style) searchInput.style.display = 'inline-block';
    } else {
      if(searchInput && searchInput.style) searchInput.style.display = 'none';
      if(searchInput) searchInput.value = '';
      FILTER = '';
      renderAllLists();
    }
    var lastTitle = localStorage.getItem('ub_last_title') || 'Useless UB';
    if(lastTitle !== 'Google') document.title = 'Useless UB';
  }

  tabs.forEach(function(btn){ btn.addEventListener('click', function(){ showPanel(btn.dataset.target); }); });
  if(goGames) goGames.addEventListener('click', function(){ showPanel('games'); });
  if(goApps) goApps.addEventListener('click', function(){ showPanel('apps'); });
  if(goSettings) goSettings.addEventListener('click', function(){ showPanel('settings'); });

  sidebarBtns.forEach(function(b){ b.addEventListener('click', function(){ sidebarBtns.forEach(function(x){ x.classList.remove('active'); }); b.classList.add('active'); var tab = b.dataset.tab; aboutPanel.classList.toggle('hidden', tab !== 'about'); customizePanel.classList.toggle('hidden', tab !== 'customize'); cloakingPanel.classList.toggle('hidden', tab !== 'cloaking'); }); });

  if(openThemePickerBtn) openThemePickerBtn.addEventListener('click', function(){ themeModal.classList.remove('hidden'); themeModal.setAttribute('aria-hidden','false'); });
  if(closeThemeModalBtn) closeThemeModalBtn.addEventListener('click', function(){ themeModal.classList.add('hidden'); themeModal.setAttribute('aria-hidden','true'); });
  if(themeModal) themeModal.addEventListener('click', function(e){ if(e.target === themeModal){ themeModal.classList.add('hidden'); themeModal.setAttribute('aria-hidden','true'); } });
  themeItems.forEach(function(it){ it.addEventListener('click', function(){ var url = it.dataset.url; if(url) applyThemeGlobal(url); themeModal.classList.add('hidden'); themeModal.setAttribute('aria-hidden','true'); }); });

  function openAboutBlankAndWrite(content, setGoogleFavicon){
    try{
      var w = window.open('about:blank', '_blank');
      if(!w) return null;
      w.document.open();
      w.document.write(content);
      w.document.close();
      if(setGoogleFavicon){
        try{ setFaviconForDoc(w.document, C.GOOGLE_FAVICON_RAW); w.document.title = 'Google'; }catch(e){}
        try{ setFaviconForDoc(document, C.GOOGLE_FAVICON_RAW); document.title = 'Google'; persistFavTitle('Google', C.GOOGLE_FAVICON_RAW); }catch(e){}
      }
      return w;
    }catch(e){ return null; }
  }

  function cloakRawFile(rawUrl, setRedirect){
    return fetch(rawUrl, { cache: 'no-store' }).then(function(res){
      if(!res.ok) throw new Error('fetch failed');
      return res.text();
    }).then(function(txt){
      var content = '<!doctype html><html><head><meta charset="utf-8"><title>Document</title></head><body style="margin:0;background:#fff;color:#000"><pre style="white-space:pre-wrap;word-break:break-word;padding:12px;font-family:monospace;">' + C.escapeHtml(txt) + '</pre></body></html>';
      var newWin = openAboutBlankAndWrite(content, true);
      if(!newWin){ alert('Popup blocked. Allow popups to cloak.'); return; }
      try{ setFaviconForDoc(newWin.document, C.GOOGLE_FAVICON_RAW); newWin.document.title = 'Google'; }catch(e){}
      try{ persistFavTitle('Google', C.GOOGLE_FAVICON_RAW); setFaviconForDoc(document, C.GOOGLE_FAVICON_RAW); document.title = 'Google'; }catch(e){}
      if(setRedirect) setTimeout(function(){ window.location.href = 'https://www.google.com'; }, 160);
    }).catch(function(e){ alert('Cloak failed: ' + (e && e.message ? e.message : e)); });
  }

  if(uselessCloakBtn) uselessCloakBtn.addEventListener('click', function(){
    try{
      var html = document.documentElement.outerHTML;
      var w = openAboutBlankAndWrite(html, true);
      if(!w){ alert('Popup blocked. Allow popups.'); return; }
      setTimeout(function(){ window.location.href = 'https://www.google.com'; }, 160);
    }catch(e){ alert('Cloak failed'); }
  });

  function fetchRepoXmlList(apiUrl, rawBase){
    if(!apiUrl || !rawBase) return Promise.resolve([]);
    return fetch(apiUrl, { cache: 'no-store' }).then(function(r){
      if(!r.ok) throw new Error('api-fail');
      return r.json();
    }).then(function(json){
      if(!json.tree) return [];
      var files = json.tree.filter(function(i){ return i.path && i.path.toLowerCase().endsWith('.xml'); }).map(function(i){ return i.path; });
      return files.map(function(p){ return { name: p.split('/').pop(), raw: rawBase + encodeURIComponent(p) }; });
    }).catch(function(){ return []; });
  }

  function ensurePaginationContainer(){
    if(!paginationContainer){
      paginationContainer = document.querySelector('.games-pagination');
      if(!paginationContainer){
        paginationContainer = document.createElement('div');
        paginationContainer.className = 'games-pagination';
        if(gamesGrid) gamesGrid.insertAdjacentElement('afterend', paginationContainer);
      }
    }
  }

  function ensureFullGamePool(list){
    var out = list.slice();
    var need = REQUIRED_GAMES_TOTAL - out.length;
    for(var i=0;i<Math.max(0,need);i++){
      var idx = out.length + 1;
      var name = 'Placeholder Game ' + String(idx).padStart(3,'0') + '.xml';
      out.push({ name: name, raw: (C.RAW_GAMES_BASE || '') + encodeURIComponent(name) });
    }
    return out.slice(0, REQUIRED_GAMES_TOTAL);
  }

  function itemsForPage(page){
    var start = (page - 1) * ITEMS_PER_PAGE;
    return ALL_GAMES.slice(start, start + ITEMS_PER_PAGE);
  }

  function renderGamesPage(page){
    if(!gamesGrid) return;
    gamesGrid.style.gridTemplateColumns = 'repeat(' + GRID_COLUMNS + ', minmax(0,1fr))';
    gamesGrid.style.gridAutoRows = '1fr';
    gamesGrid.innerHTML = '';
    currentPage = Math.max(1, Math.min(TOTAL_PAGES, page || 1));
    var pageItems = itemsForPage(currentPage).filter(function(it){ return (it.name || '').toLowerCase().includes(FILTER); });
    var frag = document.createDocumentFragment();
    pageItems.forEach(function(it){
      var card = document.createElement('div'); card.className = 'card';
      var t = document.createElement('div'); t.className = 'card-title'; t.textContent = (it.name || '').replace('.xml','');
      var s = document.createElement('div'); s.className = 'card-sub'; s.textContent = it.name || '';
      var f = document.createElement('div'); f.className = 'card-footer';
      var b = document.createElement('button'); b.className = 'btn'; b.type = 'button'; b.textContent = 'Cloak';
      if(it.raw) b.setAttribute('data-raw', it.raw);
      b.addEventListener('click', function(){ cloakRawFile(it.raw, false); });
      f.appendChild(b);
      card.appendChild(t); card.appendChild(s); card.appendChild(f);
      frag.appendChild(card);
    });
    gamesGrid.appendChild(frag);
    if(gamesCountEl) gamesCountEl.textContent = pageItems.length;
    renderPagination();
  }

  function makePageButton(p){
    var btn = document.createElement('button');
    btn.className = 'page-btn' + (p === currentPage ? ' active' : '');
    btn.textContent = String(p);
    btn.addEventListener('click', function(){
      if(p === currentPage) return;
      currentPage = p;
      renderGamesPage(currentPage);
      var list = paginationContainer.querySelector('.page-list');
      var active = list && list.querySelector('.page-btn.active');
      if(active) active.scrollIntoView({ inline: 'center', behavior: 'smooth', block: 'nearest' });
    });
    return btn;
  }

  function renderPagination(){
    ensurePaginationContainer();
    paginationContainer.innerHTML = '';
    var prev = document.createElement('button'); prev.className = 'page-btn'; prev.textContent = 'Prev';
    prev.disabled = (currentPage <= 1);
    prev.addEventListener('click', function(){ if(currentPage>1){ currentPage--; renderGamesPage(currentPage); }});
    paginationContainer.appendChild(prev);

    var list = document.createElement('div'); list.className = 'page-list';
    var WINDOW = 5;
    var start = Math.max(1, currentPage - WINDOW);
    var end = Math.min(TOTAL_PAGES, currentPage + WINDOW);

    if(start > 1){
      list.appendChild(makePageButton(1));
      if(start > 2){ var ell = document.createElement('div'); ell.className = 'page-info'; ell.textContent = '…'; list.appendChild(ell); }
    }
    for(var p = start; p <= end; p++) list.appendChild(makePageButton(p));
    if(end < TOTAL_PAGES){
      if(end < TOTAL_PAGES - 1){ var ell2 = document.createElement('div'); ell2.className = 'page-info'; ell2.textContent = '…'; list.appendChild(ell2); }
      list.appendChild(makePageButton(TOTAL_PAGES));
    }

    paginationContainer.appendChild(list);

    var next = document.createElement('button'); next.className = 'page-btn'; next.textContent = 'Next';
    next.disabled = (currentPage >= TOTAL_PAGES);
    next.addEventListener('click', function(){ if(currentPage < TOTAL_PAGES){ currentPage++; renderGamesPage(currentPage); }});
    paginationContainer.appendChild(next);

    var info = document.createElement('div'); info.className = 'page-info';
    info.textContent = 'Page ' + currentPage + ' of ' + TOTAL_PAGES + ' • showing up to ' + ITEMS_PER_PAGE + ' per page';
    paginationContainer.appendChild(info);
  }

  function renderAppsList(){
    if(!appsGrid) return;
    appsGrid.style.gridTemplateColumns = 'repeat(' + GRID_COLUMNS + ', minmax(0,1fr))';
    appsGrid.style.gridAutoRows = '1fr';
    appsGrid.innerHTML = '';
    var filtered = APPS.filter(function(it){ return (it.name || '').toLowerCase().includes(FILTER); });
    var frag = document.createDocumentFragment();
    filtered.slice(0, ITEMS_PER_PAGE).forEach(function(it){
      var card = document.createElement('div'); card.className = 'card';
      var t = document.createElement('div'); t.className = 'card-title'; t.textContent = (it.name || '').replace('.xml','');
      var s = document.createElement('div'); s.className = 'card-sub'; s.textContent = it.name || '';
      var f = document.createElement('div'); f.className = 'card-footer';
      var b = document.createElement('button'); b.className = 'btn'; b.type = 'button'; b.textContent = 'Cloak';
      if(it.raw) b.setAttribute('data-raw', it.raw);
      b.addEventListener('click', function(){ cloakRawFile(it.raw, false); });
      f.appendChild(b);
      card.appendChild(t); card.appendChild(s); card.appendChild(f);
      frag.appendChild(card);
    });
    appsGrid.appendChild(frag);
    if(appsCountEl) appsCountEl.textContent = filtered.length;
  }

  function loadLists(){
    Promise.all([ fetchRepoXmlList(C.GAMES_REPO_API, C.RAW_GAMES_BASE).catch(function(){ return []; }), fetchRepoXmlList(C.APPS_REPO_API, C.RAW_APPS_BASE).catch(function(){ return []; }) ]).then(function(results){
      var gamesList = results[0] || [];
      var appsList = results[1] || [];
      var gpool = (gamesList && gamesList.length) ? gamesList : placeholderGames(REQUIRED_GAMES_TOTAL);
      gpool = ensureFullGamePool(gpool);
      ALL_GAMES = gpool.slice(0, REQUIRED_GAMES_TOTAL);
      APPS = (appsList && appsList.length) ? appsList : placeholderApps();
      renderGamesPage(1);
      renderAppsList();
    }).catch(function(){
      ALL_GAMES = placeholderGames(REQUIRED_GAMES_TOTAL);
      APPS = placeholderApps();
      renderGamesPage(1);
      renderAppsList();
    });
  }

  function fetchRepoXmlList(apiUrl, rawBase){
    if(!apiUrl || !rawBase) return Promise.resolve([]);
    return fetch(apiUrl, { cache: 'no-store' }).then(function(r){
      if(!r.ok) throw new Error('fetch failed');
      return r.json();
    }).then(function(json){
      if(!json.tree) return [];
      var files = json.tree.filter(function(i){ return i.path && i.path.toLowerCase().endsWith('.xml'); }).map(function(i){ return i.path; });
      return files.map(function(p){ return { name: p.split('/').pop(), raw: rawBase + encodeURIComponent(p) }; });
    }).catch(function(){ return []; });
  }

  function placeholderGames(n){
    var out = [];
    for(var i=1;i<=n;i++){
      var name = 'Game ' + String(i).padStart(3,'0') + '.xml';
      out.push({ name: name, raw: (C.RAW_GAMES_BASE || '') + encodeURIComponent(name) });
    }
    return out;
  }
  function placeholderApps(){
    var demo = ['Tools.xml','Music.xml','Movies.xml','Extras.xml'];
    return demo.map(function(n){ return { name: n, raw: (C.RAW_APPS_BASE || '') + encodeURIComponent(n) }; });
  }

  if(searchInput && searchInput.addEventListener) searchInput.addEventListener('input', function(e){
    FILTER = (e.target.value || '').trim().toLowerCase();
    renderAllLists();
  });

  function renderAllLists(){
    renderGamesPage(currentPage || 1);
    renderAppsList();
  }

  (function suppressScrollIntoView(){
    var orig = Element.prototype.scrollIntoView;
    Element.prototype.scrollIntoView = function(){};
    setTimeout(function(){ Element.prototype.scrollIntoView = orig; }, 800);
  })();

  (function init(){
    initUsage();
    loadLists();
    showPanel('home');
    if(searchInput && searchInput.style) searchInput.style.display = 'none';
    document.addEventListener('keydown', function(e){ if(e.key === 'Escape'){ themeModal && themeModal.classList.add('hidden'); } });
  })();

  window.UB_APP = {
    renderGamesPage: renderGamesPage,
    renderAppsList: renderAppsList,
    loadLists: loadLists,
    setFilter: function(s){ FILTER = (s||'').trim().toLowerCase(); renderAllLists(); },
    config: { columns: GRID_COLUMNS, rows: GRID_ROWS, itemsPerPage: ITEMS_PER_PAGE, totalPages: TOTAL_PAGES }
  };
})();
