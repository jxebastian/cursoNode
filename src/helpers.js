const hbs = require('hbs');

hbs.registerHelper('listarCursos', (cursos) => {
  texto ="<div class='accordion' id='accordion'>";
  i = 1;
  cursos.forEach(curso => {
    let cabecera = curso.nombre + "<br>" +
                    curso.descripcion + "<br>" +
                    curso.valor + " pesos.";
    let contenido = curso.descripcion + "<br>" +
                    "Modalidad " + curso.modalidad + "<br>" +
                    "Intensidad horaria " + curso.intensidad + " horas.";
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
  texto = texto + "</div>";
  texto = texto + `<div class="row">
                    <div class="col-4">
                      <div class="list-group" id="list-tab" role="tablist">`;
  i = 1;
  cursos.forEach(curso => {
    if (i == 1) {
      active = "active";
    } else {
      active = "";
    }
    texto = texto + `<a class='list-group-item list-group-item-action ${active}' id='list-home-${i}' data-toggle='list' href='#list-${i}' role='tab' aria-controls='home'>${curso.nombre}</a>`;
    i = i + 1;
  });
  texto = texto + ` </div>
                  </div>
                  <div class="col-8">
                    <div class="tab-content" id="nav-tabContent">`;
  i = 1;
  cursos.forEach(curso => {
    if (i == 1) {
      active = "show active";
    } else {
      active = "";
    }
    let contenido = curso.descripcion + "<br>" +
                    "Valor: " + curso.valor + "<br>" +
                    "Modalidad " + curso.modalidad + "<br>" +
                    "Intensidad horaria " + curso.intensidad + " horas.";
    texto = texto + `<div class='tab-pane ${active}' id='list-${i}' role='tabpanel' aria-labelledby='list-home-${i}'>${contenido}</div>`;
    i = i + 1;
  });
  texto = texto + `</div>
                </div>
              </div>`;
  return texto;
});
