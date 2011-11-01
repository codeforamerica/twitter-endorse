var util = function() {

  $.fn.serializeObject = function() {
    var o = {};
    var a = this.serializeArray();
    $.each(a, function() {
      if (o[this.name]) {
        if (!o[this.name].push) {
          o[this.name] = [o[this.name]];
        }
        o[this.name].push(this.value || '');
      } else {
        o[this.name] = this.value || '';
      }
    });
    return o;
  };
  
  function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.substring(1).toLowerCase();
  }

  function inURL(url, str) {
    var exists = false;
    if ( url.indexOf( str ) > -1 ) {
      exists = true;
    }
    return exists;
  }

  function catchModals( route ) {
    if(!route) return;
    // Trim off the #/ from the beginning of the route if it exists
    route = route.replace('#/', '');
    
    /*
      Basic rules:
        * If the href ends with a bang (!) we're going to launch a modal
        * Otherwise, we're going to pass it through to SugarSkull
    */

    if( route && route.indexOf( '!' ) === ( route.length -1 ) ) {

      route = route.substr(0, route.lastIndexOf('!'));

      // The ID (if one exists) will be what comes after the slash
      var id = route.split('/')[1];

      // If there is an ID, then we have to trim it off the route
      if (id) {
        route = route.split('/')[0];
      }

      if(route in app.routes.modals) app.routes.modals[ route ](id);

      event.preventDefault();

    }

  }
  
  function registerEmitter() {
    var Emitter = function(obj) {
      this.emit = function(obj, channel) { 
        if (!channel) var channel = 'data';
        this.trigger(channel, obj); 
      };
    };
    MicroEvent.mixin(Emitter);
    return new Emitter();
  }
  
  function lookupIcon(word) {
    var params = {
      resource: "http://thenounproject.com/search",
      q: word
    }
    var ajaxOpts = {
      url: "http://jsonpify.heroku.com?" + $.param(params),
      dataType: "jsonp"
    }
    return cachedRequest(ajaxOpts);
  }

  function geocode(query, type, callback) {
    var types = {
      google: function(query) {
        var geocoder = new google.maps.Geocoder()
        geocoder.geocode({
          address: query
        }, function(locResult) {
          var lat = locResult[0].geometry.location.lat()
            , lng = locResult[0].geometry.location.lng()
          callback({type: "Point", coordinates: [lng, lat]})
        });
      },
      yahoo: function(query) {
        var url = 'http://query.yahooapis.com/v1/public/yql?format=json&q=select * from geo.placefinder where text="'
          + encodeURIComponent(query) + '"';
        $.ajax({
          url: url,
          dataType: "jsonp"
        }).then(function(response) {
          var lat = response.query.results['Result'].latitude
            , lng = response.query.results['Result'].longitude
          callback({type: "Point", coordinates: [lng, lat]})
        })
      }
    }
    types[type](query);
  }
  
  function cachedRequest(opts) {
    if (!app.cache.promises) app.cache.promises = {};
    var dfd = $.Deferred();
    var key = JSON.stringify(opts);
    if (app.cache[key]) {
      dfd.resolve(jQuery.extend(true, {}, app.cache[key]));
      return dfd.promise();
    } else if (app.cache.promises[key]) {
      return app.cache.promises[key]();
    } else {
      var ajaxOpts = $.extend({}, opts);
      $.ajax(ajaxOpts).then(function(data) {
        app.cache[key] = data;
        dfd.resolve(data);
      })
      app.cache.promises[key] = dfd.promise;
      return dfd.promise();
    }
  }
  
  function listenFor(keys) {
    var shortcuts = { // from jquery.hotkeys.js
      8: "backspace", 9: "tab", 13: "return", 16: "shift", 17: "ctrl", 18: "alt", 19: "pause",
      20: "capslock", 27: "esc", 32: "space", 33: "pageup", 34: "pagedown", 35: "end", 36: "home",
      37: "left", 38: "up", 39: "right", 40: "down", 45: "insert", 46: "del", 
      96: "0", 97: "1", 98: "2", 99: "3", 100: "4", 101: "5", 102: "6", 103: "7",
      104: "8", 105: "9", 106: "*", 107: "+", 109: "-", 110: ".", 111 : "/", 
      112: "f1", 113: "f2", 114: "f3", 115: "f4", 116: "f5", 117: "f6", 118: "f7", 119: "f8", 
      120: "f9", 121: "f10", 122: "f11", 123: "f12", 144: "numlock", 145: "scroll", 191: "/", 224: "meta"
    }
    window.addEventListener("keyup", function(e) { 
      var pressed = shortcuts[e.keyCode];
      if(_.include(keys, pressed)) app.emitter.emit("keyup", pressed); 
    }, false);
  }
  
  function render( template, target, data ) {
    if (! (target instanceof jQuery)) target = $( "." + target + ":first" );
    target.html( $.mustache( $( "." + template + "Template:first" ).html(), data || {} ) );
    if (template in app.after) app.after[template]();
  }

  function notify( message, options ) {
    if (!options) var options = {};
    if (!options.showFor) options.showFor = 3000;
    $('#notification-container').show();
    $('#notification-message').text(message);
    if (!options.loader) $('.notification-loader').hide();
    if (options.loader) $('.notification-loader').show();
    if (!options.persist) setTimeout(function() { $('#notification-container').hide() }, options.showFor);
  }

  function searchTwitter(term) {
    var linkSearch = "http://search.twitter.com/search.json?rpp=4&page=1&q=filter:links%20";
    return $.ajax({dataType: "jsonp", url: linkSearch + encodeURIComponent(term)}).promise();
  }
  
  return {
    inURL: inURL,
    capitalize: capitalize,
    catchModals: catchModals,
    registerEmitter: registerEmitter,
    cachedRequest: cachedRequest,
    lookupIcon: lookupIcon,
    geocode: geocode,
    listenFor: listenFor,
    render: render,
    notify: notify,
    searchTwitter: searchTwitter,
  };
}();