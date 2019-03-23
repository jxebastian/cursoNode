const fs = require('fs');
const path = require('path');

listaUsuarios = [];
const root = path.join(__dirname, '../');

const obtenerUsuarios = () => {
    try {
        listaUsuarios = require('./usuarios.json');
    } catch (error) {
        listaUsuarios = [];
    }
    return listaUsuarios;
}

module.exports = {
    obtenerUsuarios
}