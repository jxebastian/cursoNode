const mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');

const Schema = mongoose.Schema;
const cursoXusrioSchema = new Schema({
	idCurso : {
		type : String,
		required : true
	},
  identificacionUsuario : {
		type : String,
		required : true
	}
});

cursoXusuarioSchema.plugin(uniqueValidator);

const CursoXUsario = mongoose.model('CursoXUsario', cursoXusuarioSchema);

module.exports = CursoXUsario
