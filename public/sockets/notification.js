socket = io();

socket.on('notificacion', (texto) =>{
	console.log(texto);
    alert(texto);
    
});  