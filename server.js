const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const cors = require("cors");

const app = express();
const server = http.createServer(app);
// Almacén de ubicaciones de dispositivos en memoria
const deviceLocations = {};
// Configuración de CORS
const io = socketIo(server, {
  cors: {
    origin: "*", // En producción, usar dominio específico
    methods: ["GET", "POST"],
    allowedHeaders: ["*"],
  },
  transports: ["websocket", "polling"],
});

// Middleware de CORS
app.use(
  cors({
    origin: "*", // Ajustar en producción
    methods: ["GET", "POST"],
  })
);

io.on("connection", (socket) => {
  console.log("Nuevo cliente conectado");

  socket.on("location_update", (data) => {
    console.log("Ubicación recibida:", data);

    const { deviceId, latitude, longitude, timestamp } = data;

    // Almacenar ubicación del dispositivo
    deviceLocations[deviceId] = {
      latitude,
      longitude,
      timestamp,
    };

    // Emitir actualización a todos los clientes
    io.emit("device_locations", deviceLocations);
  });

  socket.on("disconnect", () => {
    console.log("Cliente desconectado");
  });
});

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, "0.0.0.0", () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});
