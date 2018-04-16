var express = require('express');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');
var seed = require('../Config/config').SEED;

var auth = require('../Middlewares/authentication');

var app = express();
var User = require('../Models/user');

// Obtener todos los usuarios
app.get('/', (req, res, next) => {

    var pagination = req.query.pagination || 0;
    pagination = Number(pagination);

    User.find({ active: true }, 'firstname lastname username email role active')
        .skip(pagination)
        .limit(5)
        .exec(
            (err, users) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        message: 'Error al cargar usuarios',
                        errors: err
                    });
                }

                User.count({active: true}, (err, count) => {

                    if (err) {
                        return res.status(500).json({
                            ok: false,
                            message: 'Error al contar usuarios',
                            errors: err
                        });
                    }

                    res.status(200).json({
                        ok: true,
                        usuarios: users,
                        count: count
                    });
                });

            });
});


// Actualizar usuario
app.put('/:username', auth.verifyToken, (req, res) => {

    var username = req.params.username;
    var body = req.body;

    User.findOne({ username: username }, (err, user) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                message: 'Error al buscar usuario',
                errors: err
            });
        }

        if (!user) {
            return res.status(400).json({
                ok: false,
                message: 'Usuario ' + username + ' no existe',
                errors: { message: 'No existe el usuario con ese nombre de usuario' }
            });
        }

        user.firstname = body.firstname;
        user.lastname = body.lastname;
        user.username = body.username;
        user.email = body.email;
        user.role = body.role;

        user.save((err, userSaved) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    message: 'Error al actualizar usuario',
                    errors: err
                });
            }
            // para no mandar la constraseña la modificamos solo para la vista, en la base de datos
            userSaved.password = ':)'
            res.status(200).json({
                ok: true,
                user: userSaved
            });
        });

    });
});

// Crear un nuevo usuario
app.post('/', (req, res) => {
    var body = req.body;

    var user = new User({
        firstname: body.firstname,
        lastname: body.lastname,
        username: body.username,
        email: body.email,
        password: bcrypt.hashSync(body.password, 10),
        img: body.img,
        role: body.role,
        settings: body.settings
    });

    user.save((err, userSaved) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                message: 'Error crear usuario',
                errors: err
            });
        }
        res.status(201).json({
            ok: true,
            user: userSaved,
            userToken: req.user
        });
    });
});

// Eliminar usuario
app.delete('/:username', auth.verifyToken, (req, res) => {

    var username = req.params.username;

    User.findOne({ username: username }, (err, user) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                message: 'Error al borrar usuario',
                errors: err
            });
        }

        if (!user) {
            return res.status(400).json({
                ok: false,
                message: 'Usuario ' + username + ' no existe',
                errors: { message: 'No existe el usuario con ese nombre de usuario' }
            });
        }
        // solo se inactiva el usuario, no se elimina de la base de datos
        user.active = false;

        user.save((err, userSaved) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    message: 'Error al eliminar usuario',
                    errors: err
                });
            }
            // para no mandar la constraseña la modificamos solo para la vista, en la base de datos
            userSaved.password = ':)'
            res.status(200).json({
                ok: true,
                user: userSaved
            });
        });

    });
});


module.exports = app;