var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var employeeSchema = new Schema({
    name: { type: String, required: [true, 'El nombre es necesario'] },
    img: { type: String, required: false },
    active: { type: Boolean, require: true, default: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    companyId: { type: Schema.Types.ObjectId, ref: 'Company', required: true }
});



module.exports = mongoose.model('Employee', employeeSchema);