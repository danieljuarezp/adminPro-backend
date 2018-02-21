var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var companySchema = new Schema({
    name: { type: String, required: [true, 'El nombre es necesario'] },
    img: { type: String, required: false },
    active: { type: Boolean, require: true, default: true },
    creationUserId: { type: Schema.Types.ObjectId, ref: 'User' },
    lastModificationUserId: { type: Schema.Types.ObjectId, ref: 'User' }
}, { collection: 'companies' });

module.exports = mongoose.model('Company', companySchema);