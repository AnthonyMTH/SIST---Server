const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Configurar carpeta estática para archivos HTML, CSS y JS
app.use(express.static(path.join(__dirname, "public")));

// Ruta principal para el index.html
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Aquí irán tus funciones de manejo de sockets
const deviceLocations = {};
const activeAlerts = {};

// Manejo de conexiones con Socket.IO
io.on("connection", (socket) => {
  console.log("Usuario conectado");

  // Enviar ubicaciones actuales al cliente
  socket.emit("device_locations", deviceLocations);

  // Escuchar alertas desde los dispositivos
  socket.on("alert", (data) => {
    console.log('Alert received:', data);
    // Usar un identificador único, como 'deviceId', como clave
    activeAlerts[data.deviceId] = data; // Añadir o actualizar la alerta usando el deviceId como clave

    io.emit('active_alerts', activeAlerts); // Emitir las alertas activas a todos los clientes conectados
  });

  // Resolver alertas
  socket.on("resolve_alert", (deviceId) => {
    delete activeAlerts[deviceId];
    io.emit("active_alerts", activeAlerts);
  });

  socket.on("disconnect", () => {
    console.log("Usuario desconectado");
  });
});

// Iniciar servidor
server.listen(3000, () => {
  console.log("Servidor corriendo en http://localhost:3000");
});