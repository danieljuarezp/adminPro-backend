var express = require('express');

var auth = require('../Middlewares/authentication');

var app = express();
var Employee = require('../Models/employee');

// Obtener todos los empleados
app.get('/', (req, res) => {
    Employee.find({})
        .populate('userId', 'username email')
        .populate('companyId', 'name')
        .exec(
            (err, employee) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        message: 'Error al cargar empleados',
                        errors: err
                    });
                }
                res.status(200).json({
                    ok: true,
                    employee: employee
                });

            });
});

// Crear un nuevo empleado
app.post('/', auth.verifyToken, (req, res) => {
    var body = req.body;

    var employee = new Employee({
        name: body.name,
        userId: req.user._id,
        companyId: body.companyId
    });

    employee.save((err, employeeSaved) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                message: 'Error crear empleado',
                errors: err
            });
        }
        res.status(201).json({
            ok: true,
            employee: employeeSaved
        });
    });
});

// Actualizar empleado
app.put('/:name', auth.verifyToken, (req, res) => {

    var name = req.params.name;
    var body = req.body;

    Employee.findOne({ name: name }, (err, employee) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                message: 'Error al buscar empleado',
                errors: err
            });
        }

        if (!employee) {
            return res.status(400).json({
                ok: false,
                message: 'Empresa ' + name + ' no existe',
                errors: { message: 'No existe el empleado con ese nombre' }
            });
        }

        employee.name = body.name;
        employee.userId = req.user._id;
        employee.companyId = body.companyId;

        employee.save((err, employeeSaved) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    message: 'Error al actualizar empleado',
                    errors: err
                });
            }
            res.status(200).json({
                ok: true,
                employee: employeeSaved
            });
        });

    });
});

// Eliminar empresa
app.delete('/:name', auth.verifyToken, (req, res) => {

    var name = req.params.name;

    Employee.findOne({ name: name }, (err, employee) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                message: 'Error al borrar empleado',
                errors: err
            });
        }

        if (!employee) {
            return res.status(400).json({
                ok: false,
                message: 'Empleado ' + name + ' no existe',
                errors: { message: 'No existe el empleado con ese nombre' }
            });
        }
        // solo se inactiva la empresa, no se elimina de la base de datos
        employee.active = false;

        employee.save((err, employeeSaved) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    message: 'Error al eliminar empleado',
                    errors: err
                });
            }

            res.status(200).json({
                ok: true,
                employee: employeeSaved
            });
        });

    });
});


module.exports = app;