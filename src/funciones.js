const fs = require('fs');
const path = require('path');
const Usuario = require('./models/usuario');
const Curso = require('./models/curso');

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
  return Usuario.findOne({identificacion: identificacion}, (err, result) => {
    if (err) {
      return console.log("Error en obtenerUsuario(id)");
    }
    if (!result) {
      return console.log("No existe un usuario con esta identificacion: " + identificacion);
    } else {
      console.log('dentro');
      return result;
    }
  });
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

const guardarCursos = () => {
    let datos = JSON.stringify(listaCursos);
    fs.writeFile('./src/cursos.json', datos, (err) => {
        if(err) throw (err);
        console.log('Archivo creado con éxito')
    });
}

const obtenerCursos = () => {
  return Curso.find({}, (err,results) => {
		if (err){
			return console.log(err);
		}
		return results;
	});
}

const obtenerCurso = (id) => {
  return Curso.findOne({id: id},(err,results) => {
		if (err){
			return console.log(err);
		}
		return results;
	});
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
  return Curso.find({estado: 'disponible'},(err,results)=>{
    if (err){
      return console.log(err);
    }
    return results;
  });
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

  let usuariosEncontrados = [];
  return CursoXUsuario.find({idCurso: curso}, (err, results) =>{
    if (err){
      return console.log(err);
    }
    if (!results) {
      return false;
    } else {
      results.forEach(result => {
        Usuario.findById(result._id, (err, res) => {
          if (err) {
            return console.log("Error en findById");
          }
          if (res) {
            usuariosEncontrados.push(res);
          }
        });
      });
      return usuariosEncontrados;
    }
  });
};

const registrarUsuario = (usuario) => {
    obtenerUsuarios()
    let existe = listaUsuarios.find(user => user.identificacion == usuario.identificacion)
    if (!existe) {
        crear(usuario);
        text = "Usuario con identificacion: " + usuario.identificacion + " ha sido creado satisfactoriamente"
        /**/return true
    } else {
        text = 'El usuario con id ' + usuario.identificacion + ' ya está registrado, por favor ingrese otra identificacion'
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
  return CursoXUsuario.findOneAndDelete({idCurso: idCurso, identificacionUsuario: idUsuario}, (err, result) => {
    if (err) {
      return console.log("Error en eliminarCursoXUsuario");
    }
    if (!result) {
      return console.log("No eliminó en eliminarCursoXUsuario");
    }
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
    guardarCursos();
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
    curso = listaCursos.find(curse => curse.id == curso.id);
    curso['estado'] = 'no disponible';
    guardarCursos();
}

module.exports = {
    obtenerUsuarios,
    obtenerUsuario,
    actualizarUsuario,
    cambiarRol,
    obtenerCursos,
    obtenerCurso,
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
