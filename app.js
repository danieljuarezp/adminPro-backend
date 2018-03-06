// Requires
var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');

// Inicializar variables
var app = express();

// Body Parser
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

// Importar Rutas
var appRoutes = require('./Routes/app');
var userRoutes = require('./Routes/user');
var loginRoutes = require('./Routes/login');
var companyRoutes = require('./Routes/company');
var employeeRoutes = require('./Routes/employee');
var searchRoutes = require('./Routes/search');
var uploadRoutes = require('./Routes/upload');
var imgRoutes = require('./Routes/img');

//Conexion DB
mongoose.connection.openUri('mongodb://localhost:27017/adminPro', (error, resp) => {

    if (error) throw err;

    console.log('Database port 27017: \x1b[32m%s\x1b[0m', 'online')

});

// Server index config
var serveIndex = require('serve-index');
app.use(express.static(__dirname + '/'))
app.use('/uploads', serveIndex(__dirname + '/uploads'));

// Rutas
app.use('/Img', imgRoutes);
app.use('/Upload', uploadRoutes);
app.use('/Search', searchRoutes);
app.use('/Employee', employeeRoutes);
app.use('/Company', companyRoutes);
app.use('/Login', loginRoutes);
app.use('/User', userRoutes);
app.use('/', appRoutes);

// Escuchar peticiones
app.listen(3000, () => {
    console.log('Express server port 3000: \x1b[32m%s\x1b[0m', 'online')
});