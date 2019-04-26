//requires
require('./config/config');
const express = require('express');
const app = express();
const path = require('path');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const session = require('express-session')
const server = require('http').createServer(app);
const io = require('socket.io')(server);
var MemoryStore = require('memorystore')(session);

//paths
const dirPublico = path.join(__dirname, '../public');
const dirNode_modules = path.join(__dirname, '../node_modules');

//static
app.use(express.static(dirPublico));

const { Usuarios } = require('./usuarios');
const usuarios = new Usuarios();

io.on('connection', client => {

  console.log("un usuario se ha conectado");

  client.on('usuarioNuevo', (usuario) =>{
    let listado = usuarios.agregarUsuario(client.id, usuario.nombre, usuario.curso);
    let texto = `${usuario.nombre} se ha conectado`;
    let contactos = usuarios.getUsuarios(usuario.curso).filter(user => user.id !== client.id);
    contactos.forEach(contacto => client.broadcast.to(contacto.id).emit('nuevoUsuario', texto))
    // client.broadcast.emit('nuevoUsuario', texto );
  });

  client.on('disconnect',()=>{
    let usuarioBorrado = usuarios.borrarUsuario(client.id);
    if (usuarioBorrado != undefined){
      let texto = `${usuarioBorrado.nombre} se ha desconectado`;
      let contactos = usuarios.getUsuarios(usuarioBorrado.curso);
      client.broadcast.emit('notificacion',(texto));
      contactos.forEach(contacto => client.broadcast.to(contacto.id).emit('usuarioDesconectado', texto));
      // client.broadcast.emit('usuarioDesconectado', texto);
    } else {
        console.log("Alguien cambio de pagina");
    }
  });

  client.on("texto", (text, callback) =>{
    let usuario = usuarios.getUsuario(client.id);
    let datos = {
      texto: text,
      usuario: usuario.nombre
    }
    let contactos = usuarios.getUsuarios(usuario.curso);
    contactos.forEach(contacto => client.to(contacto.id).emit("texto", (datos)));
    client.emit("texto", (datos));
    callback();
  });

  client.on("notificar", () =>{
    let usuario = usuarios.getUsuario(client.id);
    let texto = "Se ha conectado " + usuario.nombre ;
    client.broadcast.emit('notificacion',(texto));
  });

});

app.use('/css', express.static(dirNode_modules + '/bootstrap/dist/css'));
app.use('/js', express.static(dirNode_modules + '/jquery/dist'));
app.use('/js', express.static(dirNode_modules + '/popper.js/dist'));
app.use('/js', express.static(dirNode_modules + '/bootstrap/dist/js'));

//para las variables de session
app.use(session({
  cookie: { maxAge: 86400000 },
  store: new MemoryStore({
    checkPeriod: 86400000 // prune expired entries every 24h
  }),
  secret: 'keyboard cat',
  resave: true,
  saveUninitialized: true
}))

app.use((req, res, next) => {
  //variables de session
  if (req.session.idUsuario) {
    res.locals.idUsuario = req.session.idUsuario;
    res.locals.sesion = true;
    res.locals.nombreUsuario = req.session.nombreUsuario;
    res.locals.rolUsuario = req.session.rolUsuario;
    let coordinador = false;
    let aspirante = false;
    let docente = false;
    switch (req.session.rolUsuario) {
      case 'Coordinador':
        coordinador = true;
        break;
      case 'Aspirante':
        aspirante = true;
        break;
      case 'Docente':
        docente = true;
        break;
      default:
        break;
    }
    res.locals.coordinador = coordinador;
    res.locals.aspirante = aspirante;
    res.locals.docente = docente;
  }
  next()
})

//bodyParser
app.use(bodyParser.urlencoded({ extended: false }));

//routes
app.use(require('./routes/index'));

mongoose.connect(process.env.URLDB, { useNewUrlParser: true }, (err, resultado) => {
  if (err) {
    return console.log(err)
  }
  console.log("conectado")
});

server.listen(process.env.PORT, (err) => {
	console.log ('servidor en el puerto ' + process.env.PORT)
});
