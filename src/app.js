const express = require('express');
const app = express();
const path = require('path');
const hbs = require('hbs');
const bodyParser = require('body-parser');
const funciones = require('./funciones');
require('./helpers');

let login;
let administrador;
let aspirante;

let session = funciones.obtenerSession();
//console.log(session);


const directorioPublico = path.join(__dirname, '../public');
const directorioPartials = path.join(__dirname, '../partials');
app.use(express.static(directorioPublico));
hbs.registerPartials(directorioPartials);
app.use(bodyParser.urlencoded({ extended: false }));

const dirNode_modules = path.join(__dirname, '../node_modules')
app.use('/css', express.static(dirNode_modules + '/bootstrap/dist/css'));
app.use('/js', express.static(dirNode_modules + '/jquery/dist'));
app.use('/js', express.static(dirNode_modules + '/popper.js/dist'));
app.use('/js', express.static(dirNode_modules + '/bootstrap/dist/js'));
app.use('/js', express.static('../src'));

app.set('view engine', 'hbs');

app.route('/')
  .get((req, res) =>{
    res.render('login');
  })
  .post((req, res) =>{
    aspirante = false;
    administrador = false;
    let usuario = funciones.obtenerUsuario(req.body.identificacion);
    let existe = false;
    if(!usuario){
      existe = true;
    }else{
      login = usuario.rol;
      if(login == 'Administrador'){
        administrador = true;
      } else if(login == 'Aspirante'){
        aspirante = true;
      }
    }
    datos = {
      login: login,
      aspirante: aspirante,
      administrador: administrador
    }
    funciones.guardarSession(datos);
    if (existe){
      res.render('login', {
        existe
      });
    }else{
      session = funciones.obtenerSession();
      res.render('index', {
        existe,
        aspirante: aspirante,
        administrador: administrador
      });
    }
  })

app.get('/index', (req, res) =>{
  res.render('index', {
    administrador: session.administrador,
    aspirante: session.aspirante
  });
});

app.route('/registro')
  .get((req, res) => {
    res.render('registro',{
      datos:false
    });
  })
  .post((req, res) => {
    let user = {
      identificacion: parseInt(req.body.identificacion),
      nombre: req.body.nombre,
      correo: req.body.correo,
      telefono: parseInt(req.body.telefono)
    }
    let creado =funciones.registrarUsuario(user);
    res.render('registro', {
        creado: creado,
        datos: true,
        usuario: user
    })
  })

app.route('/darme-baja')
  .get((req, res) => {
    res.render('darme-baja',{
      datos: false,
      administrador: session.administrador,
      aspirante: session.aspirante
    })
  })
  .post((req, res) => {
    let identificacion = parseInt(req.body.identificacion);
    let existe = funciones.obtenerUsuario(identificacion);
    if(existe){
      cursosUsuario = funciones.obtenerCursosUsuario(existe);
      cursosUsuario.forEach(curso =>{
        curso.idUser = identificacion
      })
    } else {
      cursosUsuario = []
    }
    res.render('darme-baja',{
      datos:true,
      idIngresado: identificacion,
      lista: cursosUsuario,
      existe: existe,
      administrador: session.administrador,
      aspirante: session.aspirante
    })
  })

app.route('/dar-baja/:idUser'+'-'+':idCurso')
  .get((req,res) => {
    let usuario = funciones.obtenerUsuario(req.params.idUser);
    let cursos = funciones.obtenerCursos()
    let curso = cursos.find(curso => curso.id == req.params.idCurso)
    let lista = [curso]
    res.render('dar-baja',{
      datos: false,
      eliminado: false,
      usuario: usuario,
      curso: curso,
      lista: lista,
      administrador: session.administrador,
      aspirante: session.aspirante
    })
  })
  .post((req,res) => {
    console.log('post')
    let usuario = funciones.obtenerUsuario(req.params.idUser);
    let cursos = funciones.obtenerCursos()
    let curso = cursos.find(curso => curso.id == req.params.idCurso)
    let eliminado = funciones.eliminarCursoXUsuario(curso.id,usuario.identifion)
    res.render('dar-baja',{
      datos: true,
      eliminado: eliminado,
      usuario: usuario,
      curso: curso,
      lista: [],
      administrador: session.administrador,
      aspirante: session.aspirante
    })
  })

app.get('/roles-usuarios', (req, res) => {
  let lista = funciones.obtenerUsuarios();
  lista = lista.filter(usuario => usuario.rol != 'Administrador');
  res.render('roles-usuarios', {
    lista: lista,
    administrador: session.administrador,
    aspirante: session.aspirante
  });

});

app.route('/editar-usuario/:id')
  .get((req, res) => {
    res.render('editar-usuario', {
      usuario: funciones.obtenerUsuario(req.params.id),
      datos: false,
      actualizado: false,
      administrador: session.administrador,
      aspirante: session.aspirante
    })
  })
  .post((req, res) => {
    let actualizado = false;
    actualizado = funciones.actualizarUsuario(req.body);
    res.render('editar-usuario', {
      usuario: funciones.obtenerUsuario(req.params.id),
      datos: true,
      actualizado: actualizado,
      administrador: session.administrador,
      aspirante: session.aspirante
    })
  })

app.route('/cambiar-rol/:id')
  .get((req, res) => {
    res.render('cambiar-rol', {
      usuario: funciones.obtenerUsuario(req.params.id),
      datos: false,
      actualizado: false,
      administrador: session.administrador,
      aspirante: session.aspirante
    })
  })
  .post((req, res) => {
    let actualizado = false;
    actualizado = funciones.cambiarRol(req.body);
    res.render('cambiar-rol', {
      usuario: funciones.obtenerUsuario(req.params.id),
      datos: true,
      actualizado: actualizado,
      administrador: session.administrador,
      aspirante: session.aspirante
    })
  })
app.get('/cursos', (req, res) => {
  let cursos = funciones.obtenerCursos();
  let cursosDisponibles = cursos.filter(curso => curso.estado == "disponible");
  res.render('cursos', {
    lista: cursosDisponibles,
    administrador: session.administrador,
    aspirante: session.aspirante
  });
});

app.route('/inscribir-curso')
  .get((req, res) => {
    res.render('inscribir-curso', {
      cursos: funciones.obtenerCursosDisponibles(),
      datos: false,
      aspirante: aspirante,
      administrador: administrador,
      administrador: session.administrador,
      aspirante: session.aspirante
    });
  })
  .post((req, res) => {
    let existe = funciones.obtenerUsuario(req.body.identificacion);
    let usuario;
    let exito;
    let selecione;
    if (req.body.idCurso == 'selecione'){
      selecione = true;
    }else {
      if (!existe){
        usuario = true;
      }else{
        usuario = false;
        exito = funciones.inscribirCurso(req.body);
      }
    }
    res.render('inscribir-curso', {
      cursos: funciones.obtenerCursosDisponibles(),
      datos: true,
      usuario: usuario,
      exito: exito,
      selecione: selecione,
      administrador: session.administrador,
      aspirante: session.aspirante
    })
  })

app.listen(3000, () => {
  console.log('Escuchando por el puerto 3000');

});

module.exports = {app}
