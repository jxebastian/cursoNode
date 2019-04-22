socket = io();

var usuario = res.locals.nombreUsuario;

socket.on("connect", () =>{
  console.log("Check en socket");
	console.log(usuario);
	socket.emit('usuarioNuevo', usuario);
});

socket.on('nuevoUsuario', (texto) =>{
	console.log(texto);
	chat.innerHTML  = chat.innerHTML + texto + '<br>';
});  

socket.on('usuarioDesconectado', (texto) =>{
	console.log(texto);
	chat.innerHTML  = chat.innerHTML + texto + '<br>';
});

const formulario = document.querySelector('#formulario');
const mensaje = formulario.querySelector('#mensaje');
const chat = document.querySelector('#chat');

formulario.addEventListener('submit', (datos) => {
	datos.preventDefault();
	socket.emit('texto', mensaje.value, () => {
			mensaje.value = '';
			mensaje.focus();
	});
});

socket.on("texto", (text) =>{
	console.log(text);
	chat.innerHTML  = chat.innerHTML + text + '<br>';
});
