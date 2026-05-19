import express from "express";
import cors from "cors";

import uploadRouter from "./routes/upload.js";

const app = express();

const PORT = 3000;

// Permite requisições do frontend
app.use(cors());

// Permite JSON
app.use(express.json());

// Rota teste
app.get("/api", (_req, res) => {

  res.json({
    status: "ok",
    message: "Backend rodando!",
  });
});

// Rotas da API
app.use("/api", uploadRouter);

// Inicializa servidor
app.listen(PORT, () => {

  console.log(
    `Servidor rodando em http://localhost:${PORT}`
  );
});