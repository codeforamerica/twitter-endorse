// redirect /someuser to /#/someuser
(function() {
  var user = $.url(window.location.href).segment(1)
  if (user.length > 0) window.location.href = $.url(window.location.href).attr('base') + '/#/' + user;  
})()

var app = {
  container: 'main_content',
  emitter: util.registerEmitter(),
  cache: {}
};

/*
  app.routes
    - pages (URL routed with SugarSkull, hrefs like "#/" or "#/bob")
    - modals (no URL change triggered, hrefs like "#/cancel!" or "#/logout!")
*/

app.routes = {
  pages: {
    welcome: function() {
  
    }
  },
  modals: {
    login: function() {
      $.oauthpopup({
        path: "/auth/twitter",
        callback: function() {
          window.location.href = "#/";
        }
      });
    }
  }
}

app.after = {
 
}

$(function() {
  
  // route all link clicks through the catchModals function
  $('a').live('click', function(event) {
    var route =  $(this).attr('href');
    util.catchModals(route);
  });
  
  app.router = Router({
    '/': {on: 'welcome'},
    '/(\\w+)!': {on: function(modal) { util.catchModals("#/" + modal + "!") }},
  }).use({ resource: app.routes.pages, notfound: function() { console.log('notfound') } })

})