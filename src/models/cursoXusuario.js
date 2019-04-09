const mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');

const Schema = mongoose.Schema;
const cursoXusuarioSchema = new Schema({
	idCurso : {
		type : Number,
		required : true
	},
  identificacionUsuario : {
		type : Number,
		required : true
	},
	nombreUsuario : {
		type : String,
		required : true
	},
	correoUsuario : {
		type : String,
		required : true,
		trim : true
	},
  telefonoUsuario : {
		type: Number,
		required: true
	}
});

cursoXusuarioSchema.plugin(uniqueValidator);

const CursoXUsuario = mongoose.model('CursoXUsuario', cursoXusuarioSchema);

module.exports = CursoXUsuario
