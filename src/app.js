//requires
require('./config/config');
const express = require('express');
const app = express();
const path = require('path');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const session = require('express-session')
var MemoryStore = require('memorystore')(session)

const LocalStorage = require('node-localstorage').LocalStorage;
localStorage = new LocalStorage('./scratch');

//paths
const dirPublico = path.join(__dirname, '../public');
const dirNode_modules = path.join(__dirname, '../node_modules')

//static
app.use(express.static(dirPublico));
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

app.use((req, res, next) =>{
	//variables de session
	if(req.session.usuario){		
		res.locals.sesion = true
		//res.locals.nombre = req.session.nombre
	}	
	next()
})

//bodyParser
app.use(bodyParser.urlencoded({ extended: false }));

//routes
app.use(require('./routes/index'));

mongoose.connect(process.env.URLDB, { useNewUrlParser: true }, (err, resultado) => {
  if (err) {
    return console.log(error)
  }
  console.log("conectado")
});

app.listen(process.env.PORT, () => {
  console.log('servidor en el puerto ' + process.env.PORT)
});
