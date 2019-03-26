const express = require('express');
const app = express();
const path = require('path');
const hbs = require('hbs');
const bodyParser = require('body-parser');
const funciones = require('./funciones');
require('./helpers');

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

app.get('/', (req, res) => {
  res.render('index');
});

app.get('/registro', (req, res) => {
  res.render('registro');
  text = funciones.registrarUsuario(req.query);
  console.log(text)
});

app.get('/roles-usuarios', (req, res) => {
  res.render('roles-usuarios', {
    lista: funciones.obtenerUsuarios()
  });
});

app.get('/editar-usuario/:id' , (req, res) => {
  let datos;
  let actualizado = false;
  if (req.query.identificacion == undefined){
    datos = false;
  }else {
    datos = true;
    actualizado = funciones.actualizarUsuario(req.query);
  }
  res.render('editar-usuario', {
    usuario: funciones.obtenerUsuario(req.params.id),
    datos: datos,
    actualizado: actualizado
  })
});

app.get('/cursos', (req, res) => {
  let cursos = funciones.obtenerCursos();
  let cursosDisponibles = cursos.filter(curso => curso.estado == "disponible");
  res.render('cursos', {
    lista: cursosDisponibles
  });
});

app.get('/registroCurso', (req, res) => {
  res.render('registroCurso');
  text = funciones.registrarCurso(req.query);
  console.log(text)
});

app.listen(3000, () => {
  console.log('Escuchando por el puerto 3000');

});

module.exports = {app}
