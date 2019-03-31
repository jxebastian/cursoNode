const fs = require('fs');
const path = require('path');

listaUsuarios = [];
listaCursos = [];
listaCursosXUsuarios = [];
listaCursosResultante = [];

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

const cambiarRol = (datos) => {
    if (datos.rol == 'Selecione') {
        return false;
    }
    obtenerUsuarios();
    let usuario = obtenerUsuario(datos.identificacion);
    usuario['rol'] = datos.rol;
    guardarUsuarios();
    return true;
}

const guardarUsuarios = () => {
    let datos = JSON.stringify(listaUsuarios);
    fs.writeFile('./src/usuarios.json', datos, (err) => {
        if (err) throw (err);
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

const obtenerCursosXUsuarios = () => {
    try {
        listaCursosXUsuarios = require('./cursosXusuarios.json');
    } catch (error) {
        listaCursosXUsuarios = [];
    }
    return listaCursosXUsuarios;
}

const obtenerCursosDisponibles = () => {
    obtenerCursos();
    return listaCursos.filter(curso => curso.estado == 'disponible');
}

const obtenerCursosUsuario = (usuario) => {
    obtenerCursosXUsuarios();
    obtenerCursos();
    listaCursosResultante = [];
    let cursosEncontrados = listaCursosXUsuarios.filter(cursoE => cursoE.identificacionUsuario == usuario.identificacion);
    cursosEncontrados.forEach(curso => {
        let match = listaCursos.find(curso2 => curso2.id== curso.idCurso );
        if (match) {
            listaCursosResultante.push(match)
        }
    })
    return listaCursosResultante
}

const obtenerUsuariosXcurso = (curso) => {
    obtenerCursosXUsuarios();
    obtenerUsuarios();
    listaUsuariosResultante = [];
    let usuariosEncontrados = listaCursosXUsuarios.filter(cursoXusuario => cursoXusuario.idCurso == curso);
    usuariosEncontrados.forEach(usuario => {
        let match = listaUsuarios.find(user => user.identificacion == usuario.identificacionUsuario);
        if (match) {
            listaUsuariosResultante.push(match);
        };
    });
    return listaUsuariosResultante;
};

const registrarUsuario = (usuario) => {
    obtenerUsuarios()
    let existe = listaUsuarios.find(user => user.identificacion == usuario.identificacion)
    if (!existe) {
        crear(usuario);
        text = "Usuario con identificacion: " + usuario.identificacion + " ha sido creado satisfactoriamente"
        console.log(text)
        /**/return true
    } else {
        text = 'El usuario con id ' + usuario.identificacion + ' ya está registrado, por favor ingrese otra identificacion'
        console.log(text)
        /**/return false
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
        if (err) throw (err);
        console.log('Archivo creado con éxito')
    });
}

const inscribirCurso = (datos) => {
    console.log(datos);

    obtenerCursosXUsuarios();
    let existe = listaCursosXUsuarios.find(item => item.idCurso == datos.idCurso &&
        item.identificacionUsuario == datos.identificacion);
    if (!existe) {
        let nuevo = {
            idCurso: parseInt(datos.idCurso),
            identificacionUsuario: parseInt(datos.identificacion)
        }
        listaCursosXUsuarios.push(nuevo);
        let lista = JSON.stringify(listaCursosXUsuarios);
        fs.writeFile('./src/cursosXusuarios.json', lista, (err) => {
            if (err) throw (err);
            console.log('Archivo creado con éxito')
        });
        return true;
    } else {
        return false;
    }

}

const eliminarCursoXUsuario = (idCurso, idUsuario) => {
    obtenerCursosXUsuarios();
    let element = listaCursosXUsuarios.find(curso => (curso.idCurso == idCurso) && (curso.identificacionUsuario == idUsuario))
    listaCursosXUsuarios.splice(listaCursosXUsuarios.indexOf(element), 1);
    let lista = JSON.stringify(listaCursosXUsuarios);
    fs.writeFile('./src/cursosXusuarios.json', lista, (err) => {
        if (err) throw (err);
        console.log('Archivo creado con éxito')
    });
}


const crearCurso = (curso) => {
    obtenerCursos()
    let curse = {
        id: curso.id,
        nombre: curso.nombre,
        descripcion: curso.descripcion,
        valor: curso.valor,
        modalidad: curso.modalidad,
        intensidad: curso.intensidad,
        estado: 'disponible'
    };
    listaCursos.push(curse);
    let datos = JSON.stringify(listaCursos);
    fs.writeFile('./src/cursosPruebaFelipe.json', datos, (err) => {
        if(err) throw (err);
        console.log('Archivo creado con éxito')
    });
}

const registrarCurso = (curso) =>{
    obtenerCursos()
    let existe = listaCursos.find(curse => curse.id == curso.id)
    if (!existe && curso.id != "undefined"){
        crearCurso(curso);
        text = "Curso con identificacion: " + curso.id + " ha sido creado satisfactoriamente"
        return true
    } else if (curso.id != undefined) {
        text = 'El curso con id ' + curso.id + ' ya está registrado, por favor ingrese otra identificacion'
        return false
    } else {
        return false
    }
}

const cambiarEstadoCurso = (curso) =>{
    obtenerCursos()
    listaCursos = listaCursos.filter(curse => curse.id != curso.id);
    let cur = {
        id: curso.id,
        nombre: curso.nombre,
        descripcion: curso.descripcion,
        valor: curso.valor,
        modalidad: curso.modalidad,
        intensidad: curso.intensidad,
        estado: 'cerrado'
    };
    listaCursos.push(cur);
    let datos = JSON.stringify(listaCursos);
    fs.writeFile('./src/cursosPruebaFelipe.json', datos, (err) => {
        if(err) throw (err);
        console.log('Archivo creado con éxito')
    }); 
}

module.exports = {
    obtenerUsuarios,
    obtenerUsuario,
    actualizarUsuario,
    cambiarRol,
    obtenerCursos,
    obtenerCursosDisponibles,
    inscribirCurso,
    registrarUsuario,
    obtenerCursosUsuario,
    eliminarCursoXUsuario,
    obtenerUsuariosXcurso,
    crearCurso,
    registrarCurso,
    cambiarEstadoCurso
}
