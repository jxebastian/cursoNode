const hbs = require('hbs');
const funciones = require('./funciones');

const listarEstudiantes = (estudiantes) =>{
  let texto = "";
  if (estudiantes.length == 0) {
    texto = "No hay estudiantes matriculados en este curso";
  } else {
    texto = `<table class="table table-striped">
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
    texto = texto + "</tbody> </table>";
  }
  return texto;
};

hbs.registerHelper('listarCursosInteresado', (cursos) => {
  texto ="<div class='accordion' id='accordion'>";
  i = 1;
  cursos.forEach(curso => {
    let cabecera = curso.nombre + "<br>" +
                    curso.descripcion + "<br>" +
                    curso.valor + " pesos.";
    let contenido = "<b> Descripción: </b> " + curso.descripcion + "<br>" +
                    "<b> Modalidad: </b> " + curso.modalidad + "<br>" +
                    "<b> Intensidad horaria: </b> " + curso.intensidad + " horas." + "<br>"  +
                    "<b> Valor: </b> " + curso.valor + " pesos.";
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
});

hbs.registerHelper('listarCursosCoordinador', (cursos) => {
  texto ="<div class='accordion' id='accordion'>";
  i = 1;
  cursos.forEach(curso => {
    let cabecera = curso.nombre + "<br>" +
                    curso.descripcion + "<br>" +
                    curso.valor + " pesos.";
    let estudiantes = funciones.obtenerUsuariosXcurso(curso.id);
    let contenido = "<b> Descripción: </b> " + curso.descripcion + "<br>" +
                    "<b> Modalidad: </b> " + curso.modalidad + "<br>" +
                    "<b> Intensidad horaria: </b> " + curso.intensidad + " horas." + "<br>"  +
                    "<b> Valor: </b> " + curso.valor + " pesos <br>" +
                    "<b> Estado: </b> " + curso.estado + ". <br>" +
                    "<button type='button' class='btn btn-primary' name='Cambiar estado'>Cambiar estado</button> <br><br>" +
                    listarEstudiantes(estudiantes);
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
});
