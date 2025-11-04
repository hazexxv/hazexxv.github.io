window.UB_CONFIG = {
  GAMES_REPO_API: 'https://api.github.com/repos/hazexxv/games/git/trees/main?recursive=1',
  APPS_REPO_API:  'https://api.github.com/repos/hazexxv/apps/git/trees/main?recursive=1',
  RAW_GAMES_BASE: 'https://raw.githubusercontent.com/hazexxv/games/main/',
  RAW_APPS_BASE:  'https://raw.githubusercontent.com/hazexxv/apps/main/',
  GOOGLE_FAVICON_RAW: 'https://raw.githubusercontent.com/hazexxv/covers/main/682665_favicon_google_logo_new_icon.png',
  setFaviconForDoc: function(doc, url){
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
  },
  escapeHtml: function(s){
    return String(s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }
};
