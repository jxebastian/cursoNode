const hbs = require('hbs');
const funciones = require('./../funciones');
const CursoXUsuario = require('./../models/cursoXusuario');

const mostrarBotonInscribirme = (coordinador, curso) => {
  if (!coordinador) {
    return `<a href= "/inscribir-curso/${curso}" class="btn btn-primary" >Inscribirse al curso</a> <br><br>`;;
  } else {
    return "";
  }
}

const listarEstudiantes = (estudiantes, curso) => {
  let texto = "";
  if (estudiantes.length == 0) {
    texto = "No hay estudiantes matriculados en este curso";
  } else {
    texto = `<div class="container">
                <table class="table table-striped">
                  <thead calss="thead-dark">
                    <tr>
                      <th scope="col">Identificación</th>
                      <th scope="col">Nombre</th>
                      <th scope="col">Telefono</th>
                      <th scope="col">Correo</th>
                      <th scope="col"></th>
                    </tr>
                  </thead>
                  <tbody>`;
    let i = 1;
    estudiantes.forEach(estudiante => {
      texto = texto + `<tr>
                        <th scope="row">${estudiante.identificacion}</th>
                        <td>${estudiante.nombre}</td>
                        <td>${estudiante.telefono}</td>
                        <td>${estudiante.correo}</td>
                        <td><a href="/desmatricular/${curso}-${estudiante.identificacion}" class="btn btn-danger">Desmatricular</a></td>
                      </tr>`;
      i = i + 1;
    });
    texto = texto + "</tbody> </table> </div>";
  }
  return texto;
};

const listarEstudiantesDocente = (estudiantes, curso) => {
  let texto = "";
  if (estudiantes.length == 0) {
    texto = "No hay estudiantes matriculados en este curso";
  } else {
    texto = `<div class="container">
                <table class="table table-striped">
                  <thead calss="thead-dark">
                    <tr>
                      <th scope="col">Identificación</th>
                      <th scope="col">Nombre</th>
                      <th scope="col">Telefono</th>
                      <th scope="col">Correo</th>
                    </tr>
                  </thead>
                  <tbody>`;
    let i = 1;
    estudiantes.forEach(estudiante => {
      texto = texto + `<tr>
                        <th scope="row">${estudiante.identificacion}</th>
                        <td>${estudiante.nombre}</td>
                        <td>${estudiante.telefono}</td>
                        <td>${estudiante.correo}</td>
                      </tr>`;
      i = i + 1;
    });
    texto = texto + "</tbody> </table> </div>";
  }
  return texto;
};

hbs.registerHelper('listarCursosInteresado', (cursos, rol) => {
  if (cursos.length > 0) {
    texto = "<div class='accordion' id='accordion'>";
    i = 1;
    cursos.forEach(curso => {
      let cabecera = curso.nombre + "<br>" +
        curso.descripcion + "<br>" +
        curso.valor + " pesos.";
      let contenido = "<b> Descripción: </b> " + curso.descripcion + ".<br>" +
        "<b> Modalidad: </b> " + curso.modalidad + ".<br>" +
        "<b> Intensidad horaria: </b> " + curso.intensidad + " horas." + "<br>" +
        "<b> Valor: </b> " + curso.valor + " pesos." + "<br><br>" +
        mostrarBotonInscribirme(rol, curso.id);
        `<a href= "/inscribir-curso/${curso.id}" class="btn btn-primary" >Inscribirse al curso</a> <br><br>`;
      texto = texto +
        `<div class="card">
                <div class="card-header" id="heading${i}">
                  <h5 class="mb-0">
                    <button class="btn btn-outline-info btn-lg btn-block" type="button" data-toggle="collapse" data-target="#collapse${i}" aria-expanded="true" aria-controls="collapse${i}">
                      ${cabecera}
                    </button>
                  </h5>
                </div>

                <div id="collapse${i}" class="collapse" aria-labelledby="heading${i}" data-parent="#accordion">
                  <div class="card-body">
                    ${contenido}
                  </div>
                </div>
              </div>`;
      i = i + 1;
    });
    return texto;
  } else {
    return "<h1>No hay cursos por mostrar</h1>";
  }
});

hbs.registerHelper('listarCursosCoordinador', (cursos) => {
  if (cursos.length > 0) {
    texto = "<div class='accordion' id='accordion'>";
    i = 1;
    cursos.forEach(curso => {
      let cabecera = curso.nombre + "<br>" +
        curso.descripcion + "<br>" +
        curso.valor + " pesos.";
      listaEstudiantes = listarEstudiantes(curso.estudiantes, curso.id);
      let contenido = "<b> Descripción: </b> " + curso.descripcion + ".<br>" +
        "<b> Modalidad: </b> " + curso.modalidad + ".<br>" +
        "<b> Intensidad horaria: </b> " + curso.intensidad + " horas." + "<br>" +
        "<b> Valor: </b> " + curso.valor + " pesos. <br>" +
        "<b> Estado: </b> " + curso.estado + ". <br>" +
        `<a href= "/estado/${curso.id}" class="btn btn-danger" >Cambiar estado</a> <br><br>` +
        listaEstudiantes;
      texto = texto +
        `<div class="card">
                    <div class="card-header" id="heading${i}">
                      <h5 class="mb-0">
                        <button class="btn btn-outline-info btn-lg btn-block" type="button" data-toggle="collapse" data-target="#collapse${i}" aria-expanded="true" aria-controls="collapse${i}">
                          ${cabecera}
                        </button>
                      </h5>
                    </div>

                    <div id="collapse${i}" class="collapse" aria-labelledby="heading${i}" data-parent="#accordion">
                      <div class="card-body">
                        ${contenido}
                      </div>
                    </div>
                  </div>`;

      i = i + 1;
    });
    return texto;

  } else {
    return "<h1>No hay cursos por mostrar</h1>";
  }
});

hbs.registerHelper('listarCursosDocente', (cursos) => {
  if (cursos.length > 0) {
    texto = "<div class='accordion' id='accordion'>";
    i = 1;
    cursos.forEach(curso => {
      let cabecera = curso.nombre + "<br>" +
        curso.descripcion + "<br>" +
        curso.valor + " pesos.";
      listaEstudiantes = listarEstudiantesDocente(curso.estudiantes, curso.id);
      let contenido = "<b> Descripción: </b> " + curso.descripcion + ".<br>" +
        "<b> Modalidad: </b> " + curso.modalidad + ".<br>" +
        "<b> Intensidad horaria: </b> " + curso.intensidad + " horas." + "<br>" +
        "<b> Valor: </b> " + curso.valor + " pesos. <br>" +
        "<b> Estado: </b> " + curso.estado + ". <br>" +
        listaEstudiantes;
      texto = texto +
        `<div class="card">
                    <div class="card-header" id="heading${i}">
                      <h5 class="mb-0">
                        <button class="btn btn-outline-info btn-lg btn-block" type="button" data-toggle="collapse" data-target="#collapse${i}" aria-expanded="true" aria-controls="collapse${i}">
                          ${cabecera}
                        </button>
                      </h5>
                    </div>

                    <div id="collapse${i}" class="collapse" aria-labelledby="heading${i}" data-parent="#accordion">
                      <div class="card-body">
                        ${contenido}
                      </div>
                    </div>
                  </div>`;

      i = i + 1;
    });
    return texto;

  } else {
    return "<h1>No hay cursos por mostrar</h1>";
  }
});
