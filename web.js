
/**  Simple express server that handles twitter logins + stuff
  *  Setup environment variables for local dev
  *    export COUCH="http://admin:pass@localhost:5984"
  *    export TWITTER_KEY="key from https://dev.twitter.com/ here"
  *    export TWITTER_SECRET="secret from https://dev.twitter.com/ here"
  *  or for Heroku do heroku config:add TWITTER_KEY=12345
  *  then "node web.js"
  *  Author: Max Ogden (@maxogden)
 **/

var express = require('express')
  , fs = require('fs')
  , useTwitterAuth = require('./twitterauth')
  ;

var app = express.createServer();

app.configure(function() {
  app.use(express.cookieParser());
  app.use(express.session({secret: "90ndsj9dfdsf"}));
  app.use(express.static(__dirname + '/public'));
})

useTwitterAuth(app, function(error) {
  console.log(error)
});

app.get('/', function(request, response) {
  response.writeHeader(200, {"Content-Type": "text/html"});  
  response.write(fs.readFileSync('public/pages/index.html'));  
  response.end();
})

var port = process.env.PORT || 3000;
app.listen(port);
