var express = require('express');

var auth = require('../Middlewares/authentication');

var app = express();
var Company = require('../Models/company');

// Obtener todas las empresas
app.get('/', (req, res) => {

    var pagination = req.query.pagination || 0;
    pagination = Number(pagination);

    Company.find({})
        .populate('creationUserId', 'username email')
        .populate('lastModificationUserId', 'username email')
        .skip(pagination)
        .limit(5)
        .exec(
            (err, companies) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        message: 'Error al cargar empresas',
                        errors: err
                    });
                }

                Company.count({}, (err, count) => {

                    if (err) {
                        return res.status(500).json({
                            ok: false,
                            message: 'Error al contar empresas',
                            errors: err
                        });
                    }

                    res.status(200).json({
                        ok: true,
                        companies: companies,
                        count: count
                    });
                });
            });
});

// Crear una nueva empresa
app.post('/', auth.verifyToken, (req, res) => {
    var body = req.body;

    var comapny = new Company({
        name: body.name,
        creationUserId: req.user._id,
        lastModificationUserId: req.user._id
    });

    comapny.save((err, companySaved) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                message: 'Error crear empresa',
                errors: err
            });
        }
        res.status(201).json({
            ok: true,
            company: companySaved
        });
    });
});

// Actualizar emrpesa
app.put('/:name', auth.verifyToken, (req, res) => {

    var name = req.params.name;
    var body = req.body;

    Company.findOne({ name: name }, (err, company) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                message: 'Error al buscar empresa',
                errors: err
            });
        }

        if (!company) {
            return res.status(400).json({
                ok: false,
                message: 'Empresa ' + name + ' no existe',
                errors: { message: 'No existe la empresa con ese nombre' }
            });
        }

        company.name = body.name;
        company.lastModificationUserId = req.user._id;

        company.save((err, companySaved) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    message: 'Error al actualizar empresa',
                    errors: err
                });
            }
            res.status(200).json({
                ok: true,
                company: company
            });
        });

    });
});

// Eliminar empresa
app.delete('/:name', auth.verifyToken, (req, res) => {

    var name = req.params.name;

    Company.findOne({ name: name }, (err, company) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                message: 'Error al borrar empresa',
                errors: err
            });
        }

        if (!company) {
            return res.status(400).json({
                ok: false,
                message: 'Empresa ' + name + ' no existe',
                errors: { message: 'No existe la empresa con ese nombre' }
            });
        }
        // solo se inactiva la empresa, no se elimina de la base de datos
        company.active = false;
        company.lastModificationUserId = req.user._id;

        company.save((err, companySaved) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    message: 'Error al eliminar empresa',
                    errors: err
                });
            }

            res.status(200).json({
                ok: true,
                company: companySaved
            });
        });

    });
});

// retorna una empresa por su id
app.get('/:id', (req, res) => {

    var id = req.params.id;
    Company.findById(id)
        .populate('user', 'name img email')
        .exec((err, company) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error al buscar empresa',
                    errors: err
                });
            }
            if (!company) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'No se encuentra la empresa',
                    errors: {
                        message: 'No existe la empresa'
                    }
                });
            }
            res.status(200).json({
                ok: true,
                company: company
            });
        });
});



module.exports = app;