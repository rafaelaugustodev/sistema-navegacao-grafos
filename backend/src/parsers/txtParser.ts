import type { Aresta, Grafo, Vertice } from "../../../shared/types/grafo.js";

/**
 * Converte um arquivo .txt para Grafo.
 *
 * Estrutura:
 *
 * nVertices direcionado ponderado
 *
 * id x y [rotulo]
 *
 * origem destino [peso]
 */
export function parseTxt(texto: string): Grafo {

  // Remove linhas vazias e comentários
  const linhas = texto
    .split(/\r?\n/)
    .map((linha) => linha.trim())
    .filter(
      (linha) =>
        linha.length > 0 &&
        !linha.startsWith("#")
    );

  if (linhas.length === 0) {
    throw new Error("Arquivo .txt vazio");
  }

  // Cabeçalho
  const cabecalho = linhas[0].split(/\s+/);

  const nVertices = Number.parseInt(cabecalho[0], 10);

  const ehDirecionado = cabecalho[1] === "1";

  const ehPonderado = cabecalho[2] === "1";

  const vertices: Vertice[] = [];

  const mapaVertices = new Map<string, Vertice>();

  // Lê vértices
  for (let i = 0; i < nVertices; i++) {

    const linha = linhas[i + 1];

    const partes = linha.split(/\s+/);

    const vertice: Vertice = {
      id: partes[0],
      x: Number.parseFloat(partes[1]),
      y: Number.parseFloat(partes[2]),
      rotulo: partes[3],
    };

    vertices.push(vertice);

    mapaVertices.set(vertice.id, vertice);
  }

  const arestas: Aresta[] = [];

  // Lê arestas
  for (let i = 1 + nVertices; i < linhas.length; i++) {

    const linha = linhas[i];

    const partes = linha.split(/\s+/);

    const origem = partes[0];
    const destino = partes[1];

    const verticeOrigem = mapaVertices.get(origem);
    const verticeDestino = mapaVertices.get(destino);

    if (!verticeOrigem || !verticeDestino) {
      throw new Error("Aresta referencia vértice inexistente");
    }

    let distancia: number;

    // Usa peso informado
    if (ehPonderado && partes[2]) {

      distancia = Number.parseFloat(partes[2]);

    } else {

      // Calcula distância automática
      const dx = verticeDestino.x - verticeOrigem.x;
      const dy = verticeDestino.y - verticeOrigem.y;

      distancia = Math.sqrt(dx * dx + dy * dy);
    }

    arestas.push({
      id: `e${i}`,
      origem,
      destino,
      distancia,
      direcionada: ehDirecionado,
    });
  }

  return {
    vertices,
    arestas,
    ehPonderado,
    ehDirecionado,
  };
}