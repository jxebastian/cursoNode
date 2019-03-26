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

app.route('/editar-usuario/:id')
  .get((req, res) => {
    res.render('editar-usuario', {
      usuario: funciones.obtenerUsuario(req.params.id),
      datos: false,
      actualizado: false
    })
  })
  .post((req, res) => {
    let actualizado = false;
    actualizado = funciones.actualizarUsuario(req.body);
    res.render('editar-usuario', {
      usuario: funciones.obtenerUsuario(req.params.id),
      datos: true,
      actualizado: actualizado
    })
  })

app.route('/cambiar-rol/:id')
  .get((req, res) => {
    res.render('cambiar-rol', {
      usuario: funciones.obtenerUsuario(req.params.id),
      datos: false,
      actualizado: false
    })
  })
  .post((req, res) => {
    let actualizado = false;
    actualizado = funciones.cambiarRol(req.body);
    res.render('cambiar-rol', {
      usuario: funciones.obtenerUsuario(req.params.id),
      datos: true,
      actualizado: actualizado
    })
  })
app.get('/cursos', (req, res) => {
  let cursos = funciones.obtenerCursos();
  let cursosDisponibles = cursos.filter(curso => curso.estado == "disponible");
  res.render('cursos', {
    lista: cursosDisponibles
  });
});

app.route('/inscribir-curso')
  .get((req, res) => {
    let cursos = funciones.obtenerCursosDisponibles();
    res.render('inscribir-curso', {
      cursos: cursos
    });
  })
  .post((req, res) => {
    funciones.inscribirCurso(req.body);
    res.render('inscribir-curso', {
      cursos: funciones.obtenerCursosDisponibles()
    })
  })

app.listen(3000, () => {
  console.log('Escuchando por el puerto 3000');

});

module.exports = {app}
