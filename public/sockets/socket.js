socket = io();

const usuario = document.querySelector('#usuario').value;
const curso = document.querySelector('#curso').value;
// curso = "#" + curso;

socket.on("connect", () =>{
	socket.emit('usuarioNuevo', {nombre: usuario, curso: curso});
	socket.emit('notificar');
});

socket.on('nuevoUsuario', (texto) =>{
	chat.innerHTML  = chat.innerHTML + inflarChatConexion(texto);
	socket.emit('notificar');
    chat.scrollTop = chat.scrollHeight;
});

socket.on('usuarioDesconectado', (texto) =>{
	chat.innerHTML  = chat.innerHTML + inflarChatConexion(texto);
	chat.scrollTop = chat.scrollHeight;
});

const chat = document.querySelector('#chat');
const formulario = document.querySelector('#formulario');
const mensaje = formulario.querySelector('#mensaje');

formulario.addEventListener('submit', (datos) => {
	datos.preventDefault();
	socket.emit('texto', mensaje.value, () => {
			mensaje.value = '';
			mensaje.focus();
	});
});

socket.on("texto", (datos) =>{
	chat.innerHTML  = chat.innerHTML + inflarChat(datos);
	chat.scrollTop = chat.scrollHeight;
});

const inflarChatConexion = (texto) => {
  let mensaje = `<div class="mensaje-conexion">
										<div class="conexion">
											<span>${texto}.</span>
								 		</div>
								 </div>`;
  return mensaje;
}

const inflarChat = (datos) => {
	console.log(datos.usuario);
	console.log(usuario);
	console.log(datos.usuario === usuario);
	if (datos.usuario === usuario) {
		let mensaje = `<div class="mensaje">
											<span></span>
										  <div class="mensaje-enviado">
										    <div class="mensaje-estilo">
										      <div class="mensaje-contenido">
										        <span dir="ltr">${datos.texto}</span>
										      </div>
										    </div>
												<span></span>
										  </div>
										</div>`;
	  return mensaje;
	} else {
		let mensaje = `<div class="mensaje">
											<span></span>
										  <div class="mensaje-recibido">
										    <div class="mensaje-estilo">
										      <div class="mensaje-recibido-nombre">
										        <span class="nombre-usuario">${datos.usuario}</span>
										      </div>
										      <div class="mensaje-contenido">
										        <span dir="ltr">${datos.texto}</span>
										      </div>
										    </div>
												<span></span>
										  </div>
										</div>`;
		return mensaje;
	}
}
