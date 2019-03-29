const hbs = require('hbs');

hbs.registerHelper('listarCursos', (cursos) => {
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