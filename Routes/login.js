var express = require('express');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');
var seed = require('../Config/config').SEED;

var app = express();
var User = require('../Models/user');

var CLIENT_ID = require('../Config/config').CLIENT_ID;
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(CLIENT_ID);

// Autenticacion por Google
app.post('/Google', (req, res) => {

    var token = req.body.token || '';

    async function verify() {
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: CLIENT_ID
        });
        const payload = ticket.getPayload();
        const userid = payload['sub'];

        User.findOne({ email: payload.email }, (err, user) => {
            if (err) {
                res.status(500).json({
                    ok: true,
                    message: 'Error al buscar usuario',
                    error: err
                });
            }

            if (user) {
                if (!user.google) {
                    res.status(400).json({
                        ok: true,
                        message: 'Usuario registrado con e-mail/username'
                    });
                } else {
                    user.password = ':)';
                    var token = jwt.sign({ user: user }, seed, { expiresIn: 14400 })

                    res.status(200).json({
                        ok: true,
                        user: user,
                        username: user.username,
                        token: token,
                        id: user._id
                    });
                }
                // si el correo del usuario no se encuentra en la base de datos, crear un nuevo usuario
            } else {
                var user = new User();

                user.email = payload.email;
                user.firstname = payload.given_name;
                user.lastname = payload.family_name;
                user.username = payload.username;
                user.password = ':)';
                user.img = payload.picture;
                user.google = true;

                user.save((err, userSaved) => {
                    if (err) {
                        res.status(500).json({
                            ok: true,
                            message: 'Error al crear usuario con google',
                            error: err
                        });
                    }

                    var token = jwt.sign({ user: user }, seed, { expiresIn: 14400 })

                    res.status(200).json({
                        ok: true,
                        user: user,
                        username: user.username,
                        token: token,
                        id: user._id
                    });
                });
            }

        });

    }
    verify().catch(err => {
        return res.status(500).json({
            ok: false,
            message: 'Token invalido',
            errors: err
        });
    });

})

// Autenticacion propia
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
            token: token,
            id: user._id
        });

    });




});


module.exports = app;