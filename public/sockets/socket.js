socket = io();

const usuario = document.querySelector('#usuario').value;

socket.on("connect", () =>{
	socket.emit('usuarioNuevo', usuario);
});

socket.on('nuevoUsuario', (texto) =>{
	console.log(texto);
	chat.innerHTML  = chat.innerHTML + inflarChatConexion(texto);
	chat.scrollTop = chat.scrollHeight;
});

socket.on('usuarioDesconectado', (texto) =>{
	console.log(texto);
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
	// console.log(text);
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
