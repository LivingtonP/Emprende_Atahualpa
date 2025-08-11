const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware para archivos estáticos
app.use(express.static(path.join(__dirname, "public")));

// Ruta de inicio
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Arrancar servidor
app.listen(PORT, () => {
  console.log(`Servidor "Emprende_atahualpa" escuchando en puerto ${PORT}`);
});

