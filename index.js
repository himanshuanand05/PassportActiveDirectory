var express = require('express')
var passport = require('passport')
var appConsts = require('./keys')
var ActiveDirectoryStrategy = require('passport-activedirectory')
var app = express.createServer();

app.configure(function() {
    app.use(express.bodyParser());
    app.use(passport.initialize());
    app.use(app.router);
    app.use(express.static(__dirname + '/public'));
    });
//Cofiguring Passport strategy
passport.use(new ActiveDirectoryStrategy({
    integrated: false,
    ldap: {
      url: 'ldap://192.168.2.18',
      baseDN: 'CN=Users,DC=contatan,DC=local',
      username: appConsts.adUser,
      password: appConsts.adPass
    }
  }, function (profile, ad, done) {
    ad.userExists(profile._json.dn, 'AccessGroup', function (err, isMember) {
      if (err) return done(err)
      return done(null, profile)
    })
  }))

var opts = { failWithError: true, session: false  }
//Registering route which will be called to make connection and authenticate user credentials provided in req.body
app.post('/', passport.authenticate('ActiveDirectory', opts), function(req, res) {
  res.json(req.user)
}, function (err) {
  res.status(401).send('Not Authenticated')
})

app.listen(3100);