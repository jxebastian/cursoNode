const fs = require('fs');
const path = require('path');

listaUsuarios = [];
listaCursos = [];
const root = path.join(__dirname, '../');

const obtenerUsuarios = () => {
    try {
        listaUsuarios = require('./usuarios.json');
    } catch (error) {
        listaUsuarios = [];
    }
    return listaUsuarios;
}

const obtenerCursos = () => {
    try {
        listaCursos = require('./cursosPruebaFelipe.json');
    } catch (error) {
        listaCursos = [];
    }
    return listaCursos;
}

module.exports = {
    obtenerUsuarios,
    obtenerCursos
}
