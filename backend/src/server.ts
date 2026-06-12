import "dotenv/config";
import express from "express";
import cors from "cors";

import uploadRouter from "./routes/upload.js";

const app = express();

const PORT = Number(process.env.PORT) || 3000;
const CORS_ORIGIN = process.env.CORS_ORIGIN ?? "*";

app.use(cors({ origin: CORS_ORIGIN }));
app.use(express.json());

app.get("/api", (_req, res) => {
  res.json({
    status: "ok",
    message: "Backend rodando!",
  });
});

app.use("/api", uploadRouter);

app.listen(PORT, () => {
  console.log(
    `Servidor rodando em http://localhost:${PORT}`
  );
});
