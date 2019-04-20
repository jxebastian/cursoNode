const mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');

const Schema = mongoose.Schema;
const usuarioSchema = new Schema({
  identificacion : {
		type : Number,
		required : true,
	},
  nombre : {
		type : String,
		required : true,
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
  correo : {
		type : String,
		required : true,
		trim : true
	},
  telefono : {
		type: Number,
		required: true
	}
});

usuarioSchema.plugin(uniqueValidator);

const Usuario = mongoose.model('Usuario', usuarioSchema);

module.exports = Usuario
