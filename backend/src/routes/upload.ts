import { Router } from "express";
import multer from "multer";

import type { Grafo } from "../../../shared/types/grafo.js";

import { parseOsm } from "../parsers/osmParser.js";
import { parsePoly } from "../parsers/polyParser.js";
import { parseTxt } from "../parsers/txtParser.js";

const router = Router();

// Configuração do upload
const upload = multer({
  storage: multer.memoryStorage(),

  // Limite de 50MB
  limits: {
    fileSize: 50 * 1024 * 1024,
  },
});

/**
 * POST /api/upload
 *
 * Recebe um arquivo e converte para Grafo.
 */
router.post(
  "/upload",
  upload.single("arquivo"),
  (req, res) => {

    if (!req.file) {
      res.status(400).json({
        erro: "Nenhum arquivo enviado",
      });

      return;
    }

    // Nome do arquivo
    const nomeArquivo =
      req.file.originalname.toLowerCase();

    // Extensão
    const extensao =
      nomeArquivo.split(".").pop();

    // Conteúdo do arquivo
    const conteudo =
      req.file.buffer.toString("utf-8");

    try {

      let grafo: Grafo;

      switch (extensao) {

        case "poly":
          grafo = parsePoly(conteudo);
          break;

        case "txt":
          grafo = parseTxt(conteudo);
          break;

        case "osm":
        case "xml":
          grafo = parseOsm(conteudo);
          break;

        default:
          res.status(400).json({
            erro: `Formato .${extensao} não suportado`,
          });

          return;
      }

      // Retorna grafo em JSON
      res.json(grafo);

    } catch (erro) {

      const mensagem =
        erro instanceof Error
          ? erro.message
          : String(erro);

      res.status(400).json({
        erro: mensagem,
      });
    }
  }
);

export default router;