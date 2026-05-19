import type { Aresta, Grafo, Vertice } from "../../../shared/types/grafo.js";

/**
 * Converte um arquivo .poly para um objeto Grafo.
 *
 * Estrutura do .poly:
 *
 * Linha 1:
 * nVertices 2 0 1
 *
 * Próximas linhas:
 * id x y
 *
 * Depois:
 * nArestas 1
 *
 * Próximas linhas:
 * id origem destino 0
 *
 * Última linha:
 * 0
 */
export function parsePoly(texto: string): Grafo {

  // Quebra o arquivo em linhas
  const linhas = texto
    .split(/\r?\n/)
    .map((linha) => linha.trim())
    .filter((linha) => linha.length > 0);

  if (linhas.length === 0) {
    throw new Error("Arquivo .poly vazio");
  }

  // Cabeçalho de vértices
  const cabecalhoVertices = linhas[0].split(/\s+/);

  const nVertices = Number.parseInt(cabecalhoVertices[0], 10);

  if (!Number.isFinite(nVertices) || nVertices <= 0) {
    throw new Error("Número de vértices inválido");
  }

  const vertices: Vertice[] = [];

  // Mapa para buscar vértices rapidamente pelo id
  const mapaVertices = new Map<string, Vertice>();

  // Lê todos os vértices
  for (let i = 0; i < nVertices; i++) {

    const linha = linhas[i + 1];

    const partes = linha.split(/\s+/);

    const vertice: Vertice = {
      id: partes[0],
      x: Number.parseFloat(partes[1]),
      y: Number.parseFloat(partes[2]),
    };

    vertices.push(vertice);

    mapaVertices.set(vertice.id, vertice);
  }

  // Linha do cabeçalho de arestas
  const indiceCabecalhoArestas = nVertices + 1;

  const cabecalhoArestas =
    linhas[indiceCabecalhoArestas].split(/\s+/);

  const nArestas = Number.parseInt(cabecalhoArestas[0], 10);

  const arestas: Aresta[] = [];

  // Lê todas as arestas
  for (let i = 0; i < nArestas; i++) {

    const linha = linhas[indiceCabecalhoArestas + 1 + i];

    const partes = linha.split(/\s+/);

    const id = partes[0];
    const origem = partes[1];
    const destino = partes[2];

    const verticeOrigem = mapaVertices.get(origem);
    const verticeDestino = mapaVertices.get(destino);

    if (!verticeOrigem || !verticeDestino) {
      throw new Error("Aresta referencia vértice inexistente");
    }

    // Calcula distância euclidiana
    const dx = verticeDestino.x - verticeOrigem.x;
    const dy = verticeDestino.y - verticeOrigem.y;

    const distancia = Math.sqrt(dx * dx + dy * dy);

    arestas.push({
      id,
      origem,
      destino,
      distancia,
      direcionada: false,
    });
  }

  return {
    vertices,
    arestas,
    ehPonderado: true,
    ehDirecionado: false,
  };
}