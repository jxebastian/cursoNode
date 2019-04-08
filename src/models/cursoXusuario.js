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
	}
});

cursoXusuarioSchema.plugin(uniqueValidator);

const CursoXUsuario = mongoose.model('CursoXUsuario', cursoXusuarioSchema);

module.exports = CursoXUsuario
