import express from "express";
import cors from "cors";

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

app.get("/api", (req, res) => {
  res.json({
    status: "ok",
    message: "Backend rodando!"
  });
});

app.listen(PORT, () => {
  console.log(`Server rodando em http://localhost:${PORT}`);
});