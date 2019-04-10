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

app.route('/darme-baja')
    .get( (req, res) => {
        if (!res.locals.aspirante) {
            return res.redirect('/index');
        }
        Curso.find({ "estudiantes.identificacion" : req.session.idUsuario }, (err, result) => {
            if (err) {
                return console.log(err)
            }
            if (result.length == 0) {
                return res.render('darme-baja', {
                    datos: false
                })
            } else {
                result.forEach(curso =>{
                    curso.idUser = req.session.idUsuario
                })
                return res.render('darme-baja', {
                    datos: true,
                    lista: result
                })
            }
        })
    })

app.route('/dar-baja/:idUser' + '-' + ':idCurso')
    .get((req, res) => {
        Curso.findOne({id: req.params.idCurso},(err,result)=>{
            if(err){
                return console.log(err)
            }
            if (result){
                let usuario = result.estudiantes.find(user => user.identificacion == req.params.idUser)
                console.log(usuario)
                return res.render('dar-baja',{
                    eliminado: false,
                    curso: result,
                    usuario: usuario,
                    lista: [result]
                })
            }
        })
    })
    .post((req, res) => {
        Curso.findOneAndUpdate({id: req.params.idCurso},{$pull: {'estudiantes': {identificacion: req.params.idUser}}}, (err,result)=>{
            if (err){
                return console.log(err)
            }
            return res.render('dar-baja',{
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
        Usuario.findOne({identificacion: req.session.idUsuario}, (err, usuario) => {
            if(err) {
                return console.log(err);
            }
            if (usuario) {
                let estudiante = {
                    identificacion: usuario.identificacion,
                    nombre: usuario.nombre,
                    correo: usuario.correo,
                    telefono: usuario.telefono
                }
                Curso.updateOne({id: req.params.id},{$push: {estudiantes: estudiante}}, (err, result) => {
                    if(err) {
                        return console.log(err)
                    }
                    return res.render('inscribir-curso', {
                        exito: true,
                        mensaje: 'Registro al curso exitosamente'
                    })
                })
            }
        });
        /*
        CursoXUsuario.findOne({ idCurso: req.params.id, identificacionUsuario: req.session.idUsuario },
            (err, resultado) => {
                if (err) {
                    return console.log(err);
                }
                if (resultado) {
                    res.render('inscribir-curso', {
                        alerta: true,
                        mensaje: 'Usted ya se encuentra inscrito en este curso'
                    })
                } else {
                    Usuario.findOne({ identificacion: req.session.idUsuario }, (err, result) => {
                        if (err) {
                            return console.log(err);
                        }
                        if (result) {
                            let cursoXUsuario = new CursoXUsuario({
                                idCurso: req.params.id,
                                identificacionUsuario: result.identificacion,
                                nombreUsuario: result.nombre,
                                correoUsuario: result.correo,
                                telefonoUsuario: result.telefono
                            });
                            cursoXUsuario.save((err, result) => {
                                if (err) {
                                    return console.log(err);
                                }
                                res.render('inscribir-curso', {
                                    exito: true,
                                    mensaje: 'Registro al curso exitosamente'
                                })
                            })
                        }
                    })
                }
            })
            */
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
        Curso.findOneAndUpdate({id: req.params.idCurso},{$pull: {estudiantes: {identificacion: req.params.idUser}}}, (err, result) =>{
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
        let cursos = funciones.obtenerCursos()
        let curso = cursos.find(curso => curso.id == req.params.idCurso)
        let lista = [curso];
        res.render('estado', {
            cerrado: false,
            curso: curso,
            lista: lista
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

app.get('*', (req, res) => {
    res.render('error', {
        titulo: "Error 404",
    })
});
module.exports = app