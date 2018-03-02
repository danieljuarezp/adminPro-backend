var express = require('express');
var fileUpload = require('express-fileupload');
var fs = require('fs');

var app = express();
var Company = require('../Models/company');
var Employee = require('../Models/employee');
var User = require('../Models/user');

app.use(fileUpload());

app.put('/:collection/:id', (req, res, next) => {

    var collection = req.params.collection;
    var id = req.params.id;

    var allowedCollections = ['Users', 'Employees', 'Companies'];

    if (allowedCollections.indexOf(collection) < 0) {
        return res.status(500).json({
            ok: false,
            message: 'Ruta incorrecta',
            errors: { message: 'Coleccion no valida' }
        });
    }

    if (!req.files) {
        return res.status(500).json({
            ok: false,
            message: 'Seleccionar un archivo',
            errors: { message: 'Seleccione un archivo' }
        });
    }

    // Obtener el nombre del archivo
    var file = req.files.img
    var nameFile = file.name.split('.');
    var extension = nameFile[nameFile.length - 1];

    // Extensiones validas
    var allowedExtensions = ['jpg', 'png', 'gif', 'jpeg'];

    if (allowedExtensions.indexOf(extension) < 0) {
        return res.status(500).json({
            ok: false,
            message: 'Seleccionar un archivo valido',
            errors: { message: 'Extensiones validas ' + allowedExtensions.join(', ') }
        });
    }

    // Agregar nuevo nombre al archivo
    var newNameFile = `${id}-${ new Date().getMilliseconds()}.${extension}`;

    // Mover el archido de temporal a un path
    var path = `./Uploads/${collection}/${newNameFile}`;

    file.mv(path, err => {
        if (err) {
            return res.status(500).json({
                ok: false,
                message: 'Error al guardar archivo',
                errors: err
            });
        }

        UploadByCollection(collection, id, newNameFile, res);

    });

});

function UploadByCollection(collection, id, newNameFile, res) {

    switch (collection) {
        case 'Users':
            User.findById(id, (err, user) => {

                var oldPath = './Uploads/Users' + user.img;

                // Eliminar la ultima imagen del usuario
                if (fs.existsSync(oldPath)) {
                    fs.unlink(oldPath);
                }

                user.img = newNameFile;

                user.save((err, updatedUser) => {
                    return res.status(200).json({
                        ok: true,
                        message: 'Imagen actualizada',
                        user: updatedUser
                    });
                });
            });
            break;
        case 'Employees':
            Employee.findById(id, (err, employee) => {

                var oldPath = './Uploads/Employee' + employee.img;

                // Eliminar la ultima imagen del usuario
                if (fs.existsSync(oldPath)) {
                    fs.unlink(oldPath);
                }

                employee.img = newNameFile;

                employee.save((err, updatedEmployee) => {
                    return res.status(200).json({
                        ok: true,
                        message: 'Imagen actualizada',
                        employee: updatedEmployee
                    });
                });
            });
            break;
        case 'Companies':
            Company.findById(id, (err, company) => {

                var oldPath = './Uploads/Companies' + company.img;

                // Eliminar la ultima imagen del usuario
                if (fs.existsSync(oldPath)) {
                    fs.unlink(oldPath);
                }

                company.img = newNameFile;

                company.save((err, updatedCompany) => {
                    return res.status(200).json({
                        ok: true,
                        message: 'Imagen actualizada',
                        company: updatedCompany
                    });
                });
            });
            break;

    }
}

module.exports = app;