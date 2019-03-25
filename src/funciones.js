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

const obtenerUsuario = (identificacion) => {
    obtenerUsuarios();
    return listaUsuarios.find(usuario => usuario.identificacion == identificacion);
}

const actualizarUsuario = (datos) => {
    obtenerUsuarios();
    let usuario = obtenerUsuario(datos.identificacion);
    usuario['nombre'] = datos.nombre;
    usuario['correo'] = datos.correo;
    usuario['telefono'] = parseInt(datos.telefono);
    guardarUsuarios();
    return true;
}

const guardarUsuarios = () => {
    let datos = JSON.stringify(listaUsuarios);
    fs.writeFile('./src/usuarios.json', datos, (err) =>{
        if(err) throw (err);
        console.log('archivo creado con exito');
    });
}

const obtenerCursos = () => {
    try {
        listaCursos = require('./cursosPruebaFelipe.json');
    } catch (error) {
        listaCursos = [];
    }
    return listaCursos;
}

const registrarUsuario = (usuario) =>{
    obtenerUsuarios()
    let existe = listaUsuarios.find(user => user.identificacion == usuario.identificacion)
    if (!existe){
        crear(usuario);
        text = "Usuario con identificacion: " + usuario.identificacion + " ha sido creado satisfactoriamente"
        return text
    } else {
        text = 'El usuario con id ' + usuario.identificacion + ' ya está registrado, por favor ingrese otra identificacion'
        return text
    }
}

const crear = (usuario) => {
    let user = {
        identificacion: usuario.identificacion,
        nombre: usuario.nombre,
        correo: usuario.correo,
        telefono: usuario.telefono,
        rol: 'Aspirante'
    };
    listaUsuarios.push(user);
    let datos = JSON.stringify(listaUsuarios);
    fs.writeFile('./src/usuarios.json', datos, (err) => {
        if(err) throw (err);
        console.log('Archivo creado con éxito')
    });
}

module.exports = {
    obtenerUsuarios,
    obtenerUsuario,
    actualizarUsuario,
    obtenerCursos,
    registrarUsuario
}
