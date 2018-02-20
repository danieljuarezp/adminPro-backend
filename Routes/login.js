var express = require('express');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');
var seed = require('../Config/config').SEED;

var app = express();
var User = require('../Models/user');

app.post('/', (req, res) => {

    var body = req.body;

    User.findOne({
        $or: [
            { email: body.email },
            { username: body.username }
        ]
    }, (err, user) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                message: 'Error buscar usuario',
                errors: err
            });
        }

        if (!user) {
            return res.status(400).json({
                ok: false,
                message: 'Credenciales incorrectas - email username',
                errors: err
            });
        }

        if (!bcrypt.compareSync(body.password, user.password)) {
            return res.status(400).json({
                ok: false,
                message: 'Credenciales incorrectas - password',
                errors: err
            });
        }

        // Crear token
        // expria en 4 horas
        user.password = ':)';
        var token = jwt.sign({ user: user }, seed, { expiresIn: 14400 })

        res.status(200).json({
            ok: true,
            user: user,
            username: user.username,
            token: token
        });

    });




});


module.exports = app;