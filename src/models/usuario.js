const mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');

const Schema = mongoose.Schema;
const usuarioSchema = new Schema({
  nombre : {
		type : String,
		required : true,
		trim : true
	},
	password :{
		type : String,
		required : true
	},
  rol : {
		type : String,
		required : true	,
		trim : true,
    default: 'Aspirante'
	},
  telefono : {
		type: Number,
		required: true
	}
});

usuarioSchema.plugin(uniqueValidator);

const Usuario = mongoose.model('Usuario', usuarioSchema);

module.exports = Usuario
