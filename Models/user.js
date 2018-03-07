var mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');

var Schema = mongoose.Schema;

var roles = {
    values: ['ADMIN_ROLE', 'EMPLOYEE_ROLE', 'USER_ROLE'],
    message: '{VALUE} no es un rol valido'
};

var userSchema = new Schema({
    firstname: { type: String, require: [true, 'Nombre necesario :('] },
    lastname: { type: String, require: [true, 'Apellido necesario :('] },
    username: { type: String, unique: true, require: [true, 'Usuario necesario :('] },
    email: { type: String, unique: true, require: [true, 'Correo necesario :('] },
    password: { type: String, require: [true, 'Contraseña necesaria :('] },
    img: { type: String, require: false },
    role: { type: String, require: true, default: 'USER_ROLE', enum: roles },
    settings: { type: String, require: false },
    active: { type: Boolean, require: true, default: true },
    google: { type: Boolean, require: true, default: false }
});

userSchema.plugin(uniqueValidator, { message: '{PATH} debe de ser unico' })

module.exports = mongoose.model('User', userSchema);