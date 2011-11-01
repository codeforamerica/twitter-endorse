var couchapp = require('couchapp')
  , path = require('path')
  ;

ddoc =
  { _id:'_design/recruiter'
  , rewrites :
    [ {from:"/", to:'pages/index.html'}
    , {from:"/login", to:"../../../_smalldata/twitter/auth/twitter"}
    , {from:"/login/callback", to:"../../../_smalldata/twitter/auth/twitter/callback"}
    , {from:"/logout", to:"../../../_smalldata/twitter/logout"}
    , {from:"/api", to:"../../"}
    , {from:"/api/*", to:"../../*"}
    , {from:"/*", to:'*'}
    ]
  }
  ;

ddoc.views = {
  /**
   * A simple map function mocking _all, but allows usage with lists etc.
   */
  all: {
    map: function(doc) {
      emit(doc._id, doc);
    }
  }
}

ddoc.validate_doc_update = function (newDoc, oldDoc, userCtx, securityObj) {
  if (userCtx.roles.indexOf('_admin') > -1) return;
  if ( !userCtx.name ) throw({forbidden : "You have to sign in to do that."});
};

module.exports = ddoc;