//librerias
const express = require('express');
const app = express();
const path = require('path');
const hbs = require('hbs');
const bcrypt = require('bcrypt');
const sgMail = require('@sendgrid/mail');
const server = require('http').createServer(app);
const io = require('socket.io')(server);
const multer = require('multer')
const ObjectId = require('mongodb').ObjectID;
//paths
const dirViews = path.join(__dirname, '../../template/views');
const dirPartials = path.join(__dirname, '../../template/partials');
//modelos
const Usuario = require('./../models/usuario');
const Curso = require('./../models/curso');
//helpers
require('./../helpers/helpers');
const { Usuarios } = require('./../usuarios');
const usuarios = new Usuarios();
//hbs
app.set('view engine', 'hbs')
app.set('views', dirViews)
hbs.registerPartials(dirPartials)

var upload = multer({})

app.route('/')
    .get((req, res) => {
        if (res.locals.sesion) {
            return res.redirect('/index');
        }
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
    if (!res.locals.sesion) {
        return res.redirect('/');
    }
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

app.route('/mis-cursos')
    .get((req, res) => {
        if (!res.locals.aspirante) {
            return res.redirect('/index');
        }
        Curso.find({ "estudiantes.identificacion": req.session.idUsuario }, (err, result) => {
            if (err) {
                return console.log(err)
            }
            if (result.length == 0) {
                return res.render('mis-cursos', {
                    datos: false
                })
            } else {
                result.forEach(curso => {
                    curso.idUser = req.session.idUsuario
                })
                return res.render('mis-cursos', {
                    datos: true,
                    lista: result
                })
            }
        })
    })

app.route('/dar-baja/:idUser' + '-' + ':idCurso')
    .get((req, res) => {
        Curso.findOne({ id: req.params.idCurso }, (err, result) => {
            if (err) {
                return console.log(err)
            }
            if (result) {
                let usuario = result.estudiantes.find(user => user.identificacion == req.params.idUser)
                return res.render('dar-baja', {
                    eliminado: false,
                    curso: result,
                    usuario: usuario,
                    lista: [result]
                })
            }
        })
    })
    .post((req, res) => {
        Curso.findOneAndUpdate({ id: req.params.idCurso }, { $pull: { 'estudiantes': { identificacion: req.params.idUser } } }, (err, result) => {
            if (err) {
                return console.log(err)
            }
            return res.render('dar-baja', {
                eliminado: true,
                mensaje: 'Usted ya no se encuentra matriculado en el curso.'
            })
        })
    })

app.get('/roles-usuarios', (req, res) => {
    if (!res.locals.coordinador) {
        return res.redirect('/index');
    }
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
        if (!res.locals.coordinador) {
            return res.redirect('/index');
        }
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
        Curso.updateMany({ "estudiantes.identificacion": req.params.id },
            {
                "estudiantes.$": {
                    identificacion: req.params.id,
                    nombre: req.body.nombre,
                    correo: req.body.correo,
                    telefono: req.body.telefono
                }
            }, (err, result) => {
                if (err) {
                    return console.log(err);
                }
            })
    })

app.route('/cambiar-rol/:id')
    .get((req, res) => {
        if (!res.locals.coordinador) {
            return res.redirect('/index');
        }
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
    if (!res.locals.sesion) {
        return res.redirect('/');
    }
    if (res.locals.coordinador) {
        Curso.find({}, (err, cursos) => {
            if (err) {
                return console.log(err);
            }
            res.render('cursos', {
                cursos: cursos
            });
        });
    } else if (res.locals.docente) {
        Curso.find({ identificacionDocente: req.session.idUsuario }, (err, cursos) => {
            if (err) {
                return console.log(err);
            }
            res.render('cursos', {
                cursos: cursos
            });
        });
    } else {
        Curso.find({ estado: 'disponible' }, (err, results) => {
            if (err) {
                return console.log(err);
            }
            res.render('cursos', {
                cursos: results,
                rol: res.locals.coordinador
            });
        });
    };
});

app.route('/inscribir-curso/:id')
    .get((req, res) => {
        if (!res.locals.aspirante) {
            return res.redirect('/');
        }
        Curso.findOne({ id: req.params.id }, (err, result) => {
            if (err) {
                return console.log(err);
            }
            if (!result) {
                res.render('inscribir-curso', {
                    alerta: true,
                    mensaje: 'Este curso no existe'
                })
            } else {
                res.render('inscribir-curso', {
                    curso: result
                })
            }
        })
    })
    .post((req, res) => {
        Curso.findOne({ id: req.params.id, "estudiantes.identificacion": req.session.idUsuario }, (err, estudiante) => {
            if (err) {
                return console.log(err);
            }
            if (estudiante) {
                return res.render('inscribir-curso', {
                    alerta: true,
                    mensaje: 'Usted ya se encuentra inscrito en este curso'
                })
            } else {
                Usuario.findOne({ identificacion: req.session.idUsuario }, (err, usuario) => {
                    if (err) {
                        return console.log(err);
                    }
                    if (usuario) {
                        let estudiante = {
                            identificacion: usuario.identificacion,
                            nombre: usuario.nombre,
                            correo: usuario.correo,
                            telefono: usuario.telefono
                        }
                        Curso.updateOne({ id: req.params.id }, { $push: { estudiantes: estudiante } }, (err, result) => {
                            if (err) {
                                return console.log(err)
                            }
                            return res.render('inscribir-curso', {
                                exito: true,
                                mensaje: 'Registro al curso exitosamente'
                            })
                        })
                    }
                });
            }
        })
    });

app.route('/desmatricular/:idCurso' + '-' + ':idUser')
    .get((req, res) => {
        if (!res.locals.sesion) {
            return res.redirect('/');
        }
        if (!res.locals.coordinador) {
            res.render('index', {});
        }
        Curso.findOne({ id: req.params.idCurso }, (err, resultCurso) => {
            if (err) {
                return console.log(err);
            }
            Usuario.findOne({ identificacion: req.params.idUser }, (err, resultUser) => {
                if (err) {
                    return console.log(err);
                }
                res.render('desmatricular', {
                    eliminado: false,
                    rol: res.locals.coordinador,
                    usuario: resultUser,
                    curso: resultCurso,
                    lista: [resultCurso]
                });
            });
        });
    })
    .post((req, res) => {
        Curso.findOneAndUpdate({ id: req.params.idCurso }, { $pull: { estudiantes: { identificacion: req.params.idUser } } }, (err, result) => {
            if (err) {
                console.log(err);
            }
            res.render('desmatricular', {
                eliminado: true
            });
        });
    })

app.route('/registroCurso')
    .get((req, res) => {

        res.render('registroCurso', {
            datos: false
        });
    })
    .post((req, res) => {
        let curse = new Curso({
            id: parseInt(req.body.id),
            nombre: req.body.nombre,
            descripcion: req.body.descripcion,
            valor: parseInt(req.body.valor),
            modalidad: req.body.modalidad,
            intensidad: parseInt(req.body.intensidad),
            estado: 'disponible'
        })
        Curso.findOne({ id: curse.id }, (err, result) => {
            if (err) {
                return console.log(err)
            }
            if (result) {
                let mensaje = 'El curso con número de identifición ' + curse.id +
                    ' ya ha sido creado, por favor, ingrese otro número de identificación(ID).'
                return res.render('registroCurso', {
                    datos: true,
                    creado: false,
                    mensaje: mensaje
                })
            } else {
                curse.save(curse, (err, result) => {
                    if (err) {
                        return console.log(err)
                    }
                    if (result) {
                        res.render('registroCurso', {
                            creado: true,
                            datos: true
                        })
                    }
                })

            }
        })
    })

app.route('/estado/:idCurso')
    .get((req, res) => {
        if (!res.locals.coordinador) {
            return res.redirect('/index');
        }
        Curso.findOne({ id: req.params.idCurso }, (err, resultCur) => {
            if (err) {
                return console.log(err);
            }
            else {
                Usuario.find({ rol: "Docente" }, (err, resultDoc) => {
                    if (err) {
                        return console.log(err);
                    }
                    else {
                        let docentes = resultDoc;
                        let lista = [resultCur]
                        res.render('estado', {
                            cerrado: false,
                            curso: resultCur,
                            lista: lista,
                            docentes: docentes
                        })
                    }
                })
            }
        })
    })
    .post((req, res) => {
        sgMail.setApiKey(process.env.SENDGRID_API_KEY);
        Curso.findOneAndUpdate({ id: req.params.idCurso }, { identificacionDocente: req.body.docente, estado: "no disponible" }, { upsert: true }, (err, result) => {
            if (err) {
                console.log(err);
            }
            let to = []
            result.estudiantes.forEach(estudiante => {
                to.push(estudiante.correo);
            });
            let msg = {
                to: to,
                from: 'johan2825@gmail.com',
                subject: 'Inicio de curso ' + result.nombre,
                text: 'Ya damos por empezado el curso al que te inscribiste en educación continua',
            };
            sgMail.send(msg);
            Usuario.findOne({ identificacion: req.body.docente }, (err, docente) => {
                if (err) {
                    return console.log(err);
                }
                let msg = {
                    to: docente.correo,
                    from: 'johan2825@gmail.com',
                    subject: 'Inicio de curso ' + result.nombre,
                    text: 'usted a sido designado a cargo del siguiente curso \n' +
                        'nombre: ' + result.nombre + ' descripción: ' + result.descripcion +
                        ' intensidad: ' + result.intensidad,
                };
                sgMail.send(msg);
            })
            res.render('estado', {
                cerrado: true
            })
        });
    })

app.get('/curso/:idCurso/', (req, res) => {
    if (res.locals.docente) {
        Curso.findOne({ id: req.params.idCurso, identificacionDocente: req.session.idUsuario }, (err, result) => {
            if (err) {
                return console.log(err)
            }
            if (result) {
                let vacio = true
                let listaContenido = []
                if (result.contenido.length > 0) {
                    vacio = false
                    result.contenido.forEach(item => {
                        let cont = {
                            id: item._id,
                            curso: result.id,
                            titulo: item.titulo,
                            descripcion: item.descripcion,
                            archivo: item.archivo.toString('base64')
                        }
                        listaContenido.push(cont);
                    })
                }
                return res.render('ver-curso', {
                    adscrito: true,
                    docente: true,
                    curso: result,
                    lista: listaContenido,
                    vacio: vacio
                })
            }
        })
    }
    if (res.locals.aspirante) {
        Curso.findOne({ id: req.params.idCurso, "estudiantes.identificacion": req.session.idUsuario }, (err, result) => {
            if (err) {
                return console.log(err)
            }
            if (result) {
                let vacio = true
                let listaContenido = []
                if (result.contenido.length > 0) {
                    vacio = false
                    result.contenido.forEach(item => {
                        let cont = {
                            titulo: item.titulo,
                            descripcion: item.descripcion,
                            archivo: item.archivo.toString('base64')
                        }
                        listaContenido.push(cont);
                    })
                }
                return res.render('ver-curso', {
                    adscrito: true,
                    docente: false,
                    curso: result,
                    lista: listaContenido,
                    vacio: vacio
                })
            }
        })
    } else {
        Curso.findOne({ id: req.params.idCurso }, (err, result) => {
            if (err) {
                return console.log(err)
            }
            if (result) {
                return res.render('ver-curso', {
                    curso: result,
                    adscrito: false
                })
            }

        })
    }
})

app.route('/curso/:idCurso/new')
    .get((req, res) => {
        res.render('nueva-entrada', {
            idCurso: req.params.idCurso
        });
    })
    .post(upload.single('archivo'), (req, res) => {
        console.log(req.file)
        let contenido = {
            titulo: req.body.titulo,
            descripcion: req.body.descripcion,
            archivo: req.file.buffer
        }
        console.log(contenido)
        Curso.findOneAndUpdate({ id: req.params.idCurso }, { $push: { 'contenido': contenido } }, (err, result) => {
            if (err) {
                return console.log(err)
            }
            if (result) {
                return res.render('nueva-entrada', {
                    uploaded: true,
                    idCurso: req.params.idCurso
                })
            }
        })
    })

app.route('/curso/:idCurso/delete/:idContenido')
    .get((req, res) => {
        Curso.findOne({ id: req.params.idCurso}, (err, result) => {
            if (err){
                return console.log(err)
            }
            if (result) {
                let encontrado;
                result.contenido.forEach(item => {
                    if (JSON.stringify(req.params.idContenido) === JSON.stringify(item._id)){
                        encontrado = {
                            titulo: item.titulo,
                            descripcion: item.descripcion,
                            archivo: item.archivo.toString('base64')
                        }
                    }

                })
                return res.render('borrar-entrada',{
                        eliminado: false,
                        contenido: encontrado,
                        idCurso: req.params.idCurso
                    })
            }
        })        
    })
    .post((req, res) => {
        Curso.findOneAndUpdate( { id: req.params.idCurso }, 
            {$pull: { "contenido": { _id: new ObjectId(req.params.idContenido) } } }, (err, result) => {
                if (err) {
                    return console.log(err)
                }
                if (result) {
                    return res.render('borrar-entrada', {
                        eliminado: true,
                        mensaje: "Entrada eliminada satisfactoriamente",
                        idCurso: req.params.idCurso
                    })
                }

            })
    })

app.route('/curso/:idCurso/chat')
    .get((req, res) => {
        if (!res.locals.sesion) {
            return res.redirect('/');
        };
        if (res.locals.coordinador) {
            return res.redirect('/');
        };
        Curso.findOne({ id: req.params.idCurso }, (err, resultCur) => {
            if (err) {
                return console.log(err);
            } else {
                let estudiante = resultCur.estudiantes.find(estudiante => estudiante.identificacion === res.locals.idUsuario);
                let docente = resultCur.identificacionDocente;
                if (estudiante) {
                    return res.render('chat', {
                      curso: resultCur.nombre,
                      usuario: estudiante.nombre
                    });
                } else if (docente === res.locals.idUsuario) {
                  Usuario.findOne({identificacion: res.locals.idUsuario}, (err, docente) => {
                    if (err) {
                      return console.log(err);
                    }
                    console.log("Check");
                    return res.render('chat', {
                      curso: resultCur.nombre,
                      usuario: docente.nombre
                    });
                    console.log("Check2");
                  });
                } else {
                  return res.redirect('/');
                }
            };
        });
    });

app.get('/salir', (req, res) => {
    req.session.destroy((err) => {
        if (err) return console.log(err)
    })
    res.redirect('/')
})

app.get('*', (req, res) => {
    res.render('error', {
        titulo: "Error 404",
    })
});

module.exports = app
