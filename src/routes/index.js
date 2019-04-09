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

app.route('/')
    .get((req, res) => {
        res.render('login');
    })
    .post((req, res) => {
        Usuario.findOne({ identificacion: req.body.identificacion }, (err, result) => {
            if (err) {
                return console.log(err)
            }
            if (!result) {
                return res.render('login', {
                    alerta: true,
                    mensaje: 'Usuario no existe'
                });
            } else {
                if (!bcrypt.compareSync(req.body.password, result.password)) {
                    return res.render('login', {
                        alerta: true,
                        mensaje: 'Contraseña incorrecta'
                    });
                } else {
                    //variable de session
                    req.session.idUsuario = result.identificacion;
                    req.session.rolUsuario = result.rol;
                    req.session.nombreUsuario = result.nombre;
                    res.redirect('index');
                }
            }
        });
    })

app.get('/index', (req, res) => {
    res.render('index');
});

app.route('/registro')
    .get((req, res) => {
        res.render('registro', {
            datos: false
        });
    })
    .post((req, res) => {
        let user = new Usuario({
            identificacion: req.body.identificacion,
            nombre: req.body.nombre,
            password: bcrypt.hashSync(req.body.password, 10),
            correo: req.body.correo,
            telefono: parseInt(req.body.telefono)
        })
        Usuario.findOne({ identificacion: user.identificacion }, (err, result) => {
            if (err) {
                return console.log(err)
            }
            if (result) {
                let mensaje = 'El usuario con número de identifición ' + user.identificacion +
                    ' ya ha sido creado, por favor, ingrese otro número de identificación.'
                return res.render('registro', {
                    alerta: true,
                    usuario: user,
                    mensaje: mensaje
                })
            } else {
                user.save(user, (err, result) => {
                    if (err) {
                        return console.log(err)
                    }
                    if (result) {
                        //variable de session
                        req.session.idUsuario = result.identificacion;
                        req.session.nombreUsuario = result.nombre;
                        req.session.rolUsuario = result.rol;
                        return res.redirect('index')
                    }
                })

            }
        })
    })

app.route('/darme-baja')
    .get((req, res) => {
        res.render('darme-baja', {
            datos: false,
        })
    })
    .post((req, res) => {
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
        })
    })

app.route('/dar-baja/:idUser' + '-' + ':idCurso')
    .get((req, res) => {
        let usuario = funciones.obtenerUsuario(req.params.idUser);
        let cursos = funciones.obtenerCursos()
        let curso = cursos.find(curso => curso.id == req.params.idCurso)
        let lista = [curso]
        res.render('dar-baja', {
            eliminado: false,
            usuario: usuario,
            curso: curso,
            lista: lista,
        })
    })
    .post((req, res) => {
        let usuario = funciones.obtenerUsuario(req.params.idUser);
        let cursos = funciones.obtenerCursos()
        let curso = cursos.find(curso => curso.id == req.params.idCurso)
        funciones.eliminarCursoXUsuario(curso.id, usuario.identifion)
        res.render('dar-baja', {
            eliminado: true,
            usuario: usuario,
            curso: curso,
            lista: [],
        })
    })

app.get('/roles-usuarios', (req, res) => {
    Usuario.find({ rol: ['Aspirante', 'Docente'] }, (err, result) => {
        if (err) {
            return console.log(err);
        }
        if (result.length == 0) {
            res.render('roles-usuarios', {
                datos: false
            });
        } else {
            res.render('roles-usuarios', {
                datos: true,
                lista: result
            });
        }
    });
});

app.route('/editar-usuario/:id')
    .get((req, res) => {
        Usuario.findOne({ identificacion: req.params.id }, (err, result) => {
            if (err) {
                return console.log(err);
            }
            if (!result) {
                res.render('editar-usuario', {
                    existe: false,
                    mensaje: 'Usuario no existe'
                })
            } else {
                res.render('editar-usuario', {
                    existe: true,
                    usuario: result
                })
            }
        })
    })
    .post((req, res) => {
        Usuario.updateOne(
            { identificacion: req.params.id },
            {
                nombre: req.body.nombre,
                correo: req.body.correo,
                telefono: req.body.telefono
            }, (err, result) => {
                if (err) {
                    return res.render('editar-usuario', {
                        actualizado: false,
                        mensaje: 'Hubo error al actualizar'
                    })
                }
                Usuario.findOne({ identificacion: req.params.id }, (err, result) => {
                    if (err) {
                        return res.render('editar-usuario', {
                            actualizado: false,
                            mensaje: 'Hubo error trayendo al usuario'
                        })
                    }
                    res.render('editar-usuario', {
                        actualizado: true,
                        usuario: result,
                        existe: true,
                        mensaje: 'Actualizado correctamente'
                    })
                })
            }
        );
    })

app.route('/cambiar-rol/:id')
    .get((req, res) => {
        Usuario.findOne({ identificacion: req.params.id }, (err, result) => {
            if (err) {
                return console.log(err);
            }
            if (!result) {
                res.render('cambiar-rol', {
                    existe: false,
                    mensaje: 'Usuario no existe'
                })
            } else {
                res.render('cambiar-rol', {
                    existe: true,
                    usuario: result
                })
            }
        })
    })
    .post((req, res) => {
        Usuario.updateOne(
            { identificacion: req.params.id },
            {
                rol: req.body.rol
            }, (err, result) => {
                if (err) {
                    return res.render('cambiar-rol', {
                        actualizado: false,
                        mensaje: 'Hubo error al actualizar'
                    })
                }
                Usuario.findOne({ identificacion: req.params.id }, (err, result) => {
                    if (err) {
                        return res.render('cambiar-rol', {
                            actualizado: false,
                            mensaje: 'Hubo error trayendo al usuario'
                        })
                    }
                    res.render('cambiar-rol', {
                        actualizado: true,
                        usuario: result,
                        existe: true,
                        mensaje: 'Actualizado correctamente'
                    })
                })
            }
        );
    });

app.get('/cursos', (req, res) => {
    if (res.locals.coordinador) {
        Curso.find({}, (err, cursos) => {
            if (err) {
                return console.log(err);
            }
            CursoXUsuario.find({}, (err, cursoXUsuario) => {
                if (err) {
                    return console.log(err);
                }
                console.log(cursoXUsuario);
                res.render('cursos', {
                    cursos: cursos,
                    cursoXUsuario: cursoXUsuario
                });
            })
        });
    } else if (res.locals.docente) {
      Curso.find({}, (err, cursos) => {
          if (err) {
              return console.log(err);
          }
          CursoXUsuario.find({}, (err, cursoXUsuario) => {
              if (err) {
                  return console.log(err);
              }
              console.log(cursoXUsuario);
              res.render('cursos', {
                  cursos: cursos,
                  cursoXUsuario: cursoXUsuario
              });
          })
      });
    } else {
        Curso.find({ estado: 'disponible' }, (err, results) => {
            if (err) {
                return console.log(err);
            }
            res.render('cursos', {
                cursos: results,
            });
        });
    };
});

app.route('/inscribir-curso')
    .get((req, res) => {
        res.render('inscribir-curso', {
            cursos: funciones.obtenerCursosDisponibles(),
            datos: false,
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
        res.render('inscribir-curso', {
            cursos: funciones.obtenerCursosDisponibles(),
            datos: true,
            usuario: usuario,
            exito: exito,
            selecione: selecione,
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

        res.render('registroCurso', {
            datos: false
        });
    })
    .post((req, res) => {
        text = funciones.registrarCurso(req.body);
        if (text) {
            res.render('registroCurso', {
                creado: true,
                datos: true
            });
        } else {
            res.render('registroCurso', {
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

app.get('/salir', (req, res) => {
    req.session.destroy((err) => {
        if (err) return console.log(err)
    })
    res.redirect('/')
})
module.exports = app;
