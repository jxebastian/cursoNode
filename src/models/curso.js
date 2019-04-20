const mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');

const Schema = mongoose.Schema;
const cursoSchema = new Schema({
	id: {
		type: Number,
		required: true
	},
	nombre: {
		type: String,
		required: true
	},
	descripcion: {
		type: String,
		required: true
	},
	valor: {
		type: Number,
		required: true,
		min: 0
	},
	modalidad: {
		type: String,
		enum: { values: ['virtual', 'presencial'] },
		required: true
	},
	intensidad: {
		type: Number,
		default: 0,
		min: 0
	},
	estado: {
		type: String,
		enum: { values: ['disponible', 'no disponible'] }
	},
	identificacionDocente: {
		type: Number
	},
	estudiantes: [{
		identificacion: {
			type: Number
		},
		nombre: {
			type: String
		},
		correo: {
			type: String
		},
		telefono: {
			type: Number
		}
	}]
});

cursoSchema.plugin(uniqueValidator);

const Curso = mongoose.model('Curso', cursoSchema);

module.exports = Curso
