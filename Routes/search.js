var express = require('express');

var app = express();
var Company = require('../Models/company');
var Employee = require('../Models/employee');
var User = require('../Models/user');

// Busqueda por coleccion
app.get('/Collection/:table/:search', (req, res) => {


    var table = req.params.table;
    var search = req.params.search;

    var regex = new RegExp(search, 'i');

    var promise;

    switch (table) {
        case 'User':
            promise = SearchUser(search, regex);
            break;
        case 'Employee':
            promise = SearchEmployee(search, regex);
            break;
        case 'Company':
            promise = SearchCompany(search, regex);
            break;
        default:
            return res.status(400).json({
                ok: false,
                message: 'Parametros de busqueda incorrectos',
                error: table
            });
            break;
    }

    promise.then(data => {
        return res.status(200).json({
            ok: true,
            [table]: data
        });
    });

});




// Busqueda general
app.get('/All/:search', (req, res, next) => {

    var search = req.params.search;
    var regex = new RegExp(search, 'i');


    Promise.all([
        SearchCompany(search, regex),
        SearchEmployee(search, regex),
        SearchUser(search, regex)
    ]).then(resp => {
        res.status(200).json({
            ok: true,
            companies: resp[0],
            employees: resp[1],
            users: resp[2]
        });
    });

});


function SearchCompany(search, regex) {

    return new Promise((resolve, reject) => {

        Company.find({ name: regex })
            .populate('creationUserId', 'username email')
            .populate('lastModificationUserId', 'username email')
            .exec((err, companies) => {

                if (err) {
                    reject('Error al cargar empresas', err);
                } else {
                    resolve(companies);
                }
            });

    });
}

function SearchEmployee(search, regex) {

    return new Promise((resolve, reject) => {

        Employee.find({ name: regex })
            .populate('userId', 'username email')
            .populate('companyId', 'name')
            .exec((err, employee) => {

                if (err) {
                    reject('Error al cargar empleado', err);
                } else {
                    resolve(employee);
                }
            });

    });
}

function SearchUser(search, regex) {

    return new Promise((resolve, reject) => {

        User.find({}, 'firstname lastname username email role active google img')
            .or([{ username: regex }, { email: regex }])
            .exec((err, users) => {
                if (err) {
                    reject('Error al cargar usuarios', err);
                } else {
                    resolve(users);
                }
            });

    });
}

module.exports = app;