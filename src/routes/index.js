//librerias
const express = require('express');
const app = express();
const path = require('path');
const hbs = require('hbs');
const bcrypt = require('bcrypt');
//paths
const dirViews = path.join(__dirname, '../../template/views');
const dirPartials = path.join(__dirname, '../../template/partials');
//modelos
const Usuario = require('./../models/usuario');
const Curso = require('./../models/curso');
const CursoXUsuario = require('./../models/cursoXusuario');
//helpers
require('./../helpers/helpers');
//funciones
const funciones = require('./../funciones');

//hbs
app.set('view engine', 'hbs')
app.set('views', dirViews)
hbs.registerPartials(dirPartials)

let login;
let coordinador;
let aspirante;

app.route('/')
    .get((req, res) => {
        res.render('login');
    })
    .post((req, res) => {
        aspirante = false;
        coordinador = false;
        let usuario = funciones.obtenerUsuario(req.body.identificacion);
        let existe = false;
        if (!usuario) {
            return res.render('login', {
                alerta: true,
                mensaje: 'Usuario no existe'
            })
        } else {
            login = usuario.rol;
            if (login == 'Coordinador') {
                coordinador = true;
            } else if (login == 'Aspirante') {
                aspirante = true;
            }
        }
        datos = {
            login: login,
            aspirante: aspirante,
            coordinador: coordinador
        }
        localStorage.setItem('session', JSON.stringify(datos));
        if (existe) {
            res.render('login', {
                existe
            });
        } else {
            res.render('index', {
                existe,
                aspirante: aspirante,
                coordinador: coordinador
            });
        }
    })

app.get('/index', (req, res) => {
    let session = JSON.parse(localStorage.getItem('session'));
    res.render('index', {
        coordinador: session.coordinador,
        aspirante: session.aspirante
    });
});

app.route('/registro')
    .get((req, res) => {
        res.render('registro', {
            datos: false
        });
    })
    .post((req, res) => {
        let user = {
            identificacion: parseInt(req.body.identificacion),
            nombre: req.body.nombre,
            correo: req.body.correo,
            telefono: parseInt(req.body.telefono)
        }
        let creado = funciones.registrarUsuario(user);
        res.render('registro', {
            creado: creado,
            datos: true,
            usuario: user
        })
    })

app.route('/darme-baja')
    .get((req, res) => {
        let session = JSON.parse(localStorage.getItem('session'));
        res.render('darme-baja', {
            datos: false,
            coordinador: session.coordinador,
            aspirante: session.aspirante
        })
    })
    .post((req, res) => {
        let session = JSON.parse(localStorage.getItem('session'));
        let identificacion = parseInt(req.body.identificacion);
        let existe = funciones.obtenerUsuario(identificacion);
        if (existe) {
            cursosUsuario = funciones.obtenerCursosUsuario(existe);
            cursosUsuario.forEach(curso => {
                curso.idUser = identificacion
            })
        } else {
            cursosUsuario = []
        }
        res.render('darme-baja', {
            datos: true,
            idIngresado: identificacion,
            lista: cursosUsuario,
            existe: existe,
            coordinador: session.coordinador,
            aspirante: session.aspirante
        })
    })

app.route('/dar-baja/:idUser' + '-' + ':idCurso')
    .get((req, res) => {
        let session = JSON.parse(localStorage.getItem('session'));
        let usuario = funciones.obtenerUsuario(req.params.idUser);
        let cursos = funciones.obtenerCursos()
        let curso = cursos.find(curso => curso.id == req.params.idCurso)
        let lista = [curso]
        res.render('dar-baja', {
            eliminado: false,
            usuario: usuario,
            curso: curso,
            lista: lista,
            coordinador: session.coordinador,
            aspirante: session.aspirante
        })
    })
    .post((req, res) => {
        let session = JSON.parse(localStorage.getItem('session'));
        let usuario = funciones.obtenerUsuario(req.params.idUser);
        let cursos = funciones.obtenerCursos()
        let curso = cursos.find(curso => curso.id == req.params.idCurso)
        funciones.eliminarCursoXUsuario(curso.id, usuario.identifion)
        res.render('dar-baja', {
            eliminado: true,
            usuario: usuario,
            curso: curso,
            lista: [],
            coordinador: session.coordinador,
            aspirante: session.aspirante
        })
    })

app.get('/roles-usuarios', (req, res) => {
    let session = JSON.parse(localStorage.getItem('session'));
    let lista = funciones.obtenerUsuarios();
    lista = lista.filter(usuario => usuario.rol != 'Coordinador');
    res.render('roles-usuarios', {
        lista: lista,
        coordinador: session.coordinador,
        aspirante: session.aspirante
    });
});

app.route('/editar-usuario/:id')
    .get((req, res) => {
        let session = JSON.parse(localStorage.getItem('session'));
        res.render('editar-usuario', {
            usuario: funciones.obtenerUsuario(req.params.id),
            datos: false,
            actualizado: false,
            coordinador: session.coordinador,
            aspirante: session.aspirante
        })
    })
    .post((req, res) => {
        let session = JSON.parse(localStorage.getItem('session'));
        let actualizado = false;
        actualizado = funciones.actualizarUsuario(req.body);
        res.render('editar-usuario', {
            usuario: funciones.obtenerUsuario(req.params.id),
            datos: true,
            actualizado: actualizado,
            coordinador: session.coordinador,
            aspirante: session.aspirante
        })
    })

app.route('/cambiar-rol/:id')
    .get((req, res) => {
        let session = JSON.parse(localStorage.getItem('session'));
        res.render('cambiar-rol', {
            usuario: funciones.obtenerUsuario(req.params.id),
            datos: false,
            actualizado: false,
            coordinador: session.coordinador,
            aspirante: session.aspirante
        })
    })
    .post((req, res) => {
        let session = JSON.parse(localStorage.getItem('session'));
        let actualizado = false;
        actualizado = funciones.cambiarRol(req.body);
        res.render('cambiar-rol', {
            usuario: funciones.obtenerUsuario(req.params.id),
            datos: true,
            actualizado: actualizado,
            coordinador: session.coordinador,
            aspirante: session.aspirante
        })
    });

app.get('/cursos', (req, res) => {
    let session = JSON.parse(localStorage.getItem('session'));
    //let cursos = funciones.obtenerCursos();
    let cursosMostrar = [];
    if (session.coordinador) {
        cursosMostrar = funciones.obtenerCursos();
    } else {
        cursosMostrar = funciones.obtenerCursosDisponibles();
    };
    res.render('cursos', {
        coordinador: session.coordinador,
        aspirante: session.aspirante,
        cursos: cursosMostrar
    });
});

app.route('/inscribir-curso')
    .get((req, res) => {
        let session = JSON.parse(localStorage.getItem('session'));
        res.render('inscribir-curso', {
            cursos: funciones.obtenerCursosDisponibles(),
            datos: false,
            coordinador: session.coordinador,
            aspirante: session.aspirante
        });
    })
    .post((req, res) => {
        let existe = funciones.obtenerUsuario(req.body.identificacion);
        let usuario;
        let exito;
        let selecione;
        if (req.body.idCurso == 'selecione') {
            selecione = true;
        } else {
            if (!existe) {
                usuario = true;
            } else {
                usuario = false;
                exito = funciones.inscribirCurso(req.body);
            }
        }
        let session = JSON.parse(localStorage.getItem('session'));
        res.render('inscribir-curso', {
            cursos: funciones.obtenerCursosDisponibles(),
            datos: true,
            usuario: usuario,
            exito: exito,
            selecione: selecione,
            coordinador: session.coordinador,
            aspirante: session.aspirante
        })
    });

app.route('/desmatricular/:idCurso' + '-' + ':idUser')
    .get((req, res) => {
        let session = JSON.parse(localStorage.getItem('session'));
        let usuario = funciones.obtenerUsuario(req.params.idUser);
        let cursos = funciones.obtenerCurso(req.params.idCurso);
        //let curso = cursos.find(curso => curso.id == req.params.idCurso)
        let lista = [curso];
        res.render('desmatricular', {
            eliminado: false,
            usuario: usuario,
            curso: curso,
            lista: lista,
            coordinador: session.coordinador,
            aspirante: session.aspirante
        });
    })
    .post((req, res) => {
        let session = JSON.parse(localStorage.getItem('session'));
        let usuario = funciones.obtenerUsuario(req.params.idUser);
        let cursos = funciones.obtenerCurso(req.params.idCurso)
        //let curso = cursos.find(curso => curso.id == req.params.idCurso)
        funciones.eliminarCursoXUsuario(curso.id, usuario.identifion)
        res.render('desmatricular', {
            eliminado: true,
            usuario: usuario,
            curso: curso,
            lista: [],
            coordinador: session.coordinador,
            aspirante: session.aspirante
        });
    })

app.route('/registroCurso')
    .get((req, res) => {
        let session = JSON.parse(localStorage.getItem('session'));
        res.render('registroCurso', {
            coordinador: session.coordinador,
            aspirante: session.aspirante,
            datos: false,
            datos: false
        });
    })
    .post((req, res) => {
        let session = JSON.parse(localStorage.getItem('session'));
        text = funciones.registrarCurso(req.body);
        if (text) {
            res.render('registroCurso', {
                coordinador: session.coordinador,
                aspirante: session.aspirante,
                creado: true,
                datos: true
            });
        } else {
            res.render('registroCurso', {
                coordinador: session.coordinador,
                aspirante: session.aspirante,
                datos: true,
                creado: false
            });
        }
    });
app.route('/estado/:idCurso')
    .get((req, res) => {
        let session = JSON.parse(localStorage.getItem('session'));
        let cursos = funciones.obtenerCursos()
        let curso = cursos.find(curso => curso.id == req.params.idCurso)
        let lista = [curso];
        res.render('estado', {
            cerrado: false,
            curso: curso,
            lista: lista,
            coordinador: session.coordinador,
            aspirante: session.aspirante
        })
    })
    .post((req, res) => {
        let session = JSON.parse(localStorage.getItem('session'));
        let cursos = funciones.obtenerCursos()
        let curso = cursos.find(curso => curso.id == req.params.idCurso)
        funciones.cambiarEstadoCurso(curso)
        res.render('estado', {
            cerrado: true,
            curso: curso,
            coordinador: session.coordinador,
            aspirante: session.aspirante
        })
    })
module.exports = app;
