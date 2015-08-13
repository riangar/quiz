var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var partials = require('express-partials');
var methodOverride = require('method-override');
var session = require('express-session');

var routes = require('./routes/index');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(partials());

// uncomment after placing your favicon in /public
app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cookieParser('Quiz 2015'));
app.use(session());
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));

// Helpers dinámicos
app.use(function(req, res, next) {

    // guardar path en session.redir para despues de login
    if (!req.path.match(/\/login|\/logout/)) {
        req.session.redir = req.path;
    }

    // Hacer visible req.session en las vistas
    res.locals.session = req.session;
    next();
});

// Auto-logout
app.use(function(req, res, next) {
    if (req.session.user && req.session.lastAction) {
        if (Date.now() - req.session.lastAction > 120000) {
            delete req.session.user;
            req.session.errors = [{"message": 'Su sesión ha caducado, por favor vuelva a introducir usuario y contraseña.'}];
            // Si la acción que se iba a ejecutar es la publicación de un comentario se modifica la redirección:
            // Se cambia la redirección a la página principal por la siguiente razón:
            // si se pulsa en el botón "Publicar" justo después de que caduque la sesión, en cuanto
            // el usuario vuelva a hacer el login va a cargar la acción "publish" y se va a publicar
            // el comentario. Para que no quede publicado vamos a la página principal.
            if (req.session.redir.match(/\/publish/)) req.session.redir = '/';
            req.session.lastAction = new Date().getTime();
            // Se redirige a la página de Login
            res.redirect("/login"); 
        } else { 
            req.session.lastAction = new Date().getTime();
            next(); 
        }
    } else { 
        req.session.lastAction = new Date().getTime(); 
        next();
    }
});

app.use('/', routes);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err, 
            errors: []
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}, 
        errors: []
    });
});


module.exports = app;
