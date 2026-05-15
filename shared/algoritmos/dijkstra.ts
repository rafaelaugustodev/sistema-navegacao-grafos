// Implementação do algoritmo de Dijkstra convertida do código em C fornecido pelo professor.
// A lógica original foi adaptada para TypeScript utilizando os tipos definidos em shared/types/grafo.ts.
//
// O algoritmo recebe:
// - o grafo completo;
// - o vértice de origem;
// - o vértice de destino.
//
// A partir disso, calcula:
// - o menor caminho entre os vértices;
// - a distância total da rota.
//
// O retorno contém:
// - um vetor com a sequência de vértices do menor caminho;
// - o custo/distância total do percurso.

import type { Grafo } from "../types/grafo";

const INF = Infinity;

export type ResultadoDijkstra = {
    caminho: string[];
    distanciaTotal: number;
};

function calcularDistancia(x0: number, y0: number, x1: number, y1: number): number {
    return Math.sqrt((x0 - x1) ** 2 + (y0 - y1) ** 2);
}

function construirMatrizAdjacencia(grafo: Grafo): number[][] {
    const totalVertices = grafo.vertices.length;

    const matrizAdj: number[][] = Array.from({ length: totalVertices }, () =>
        Array.from({ length: totalVertices }, () => INF)
    );

    grafo.arestas.forEach((aresta) => {
        const indiceOrigem = grafo.vertices.findIndex((v) => v.id === aresta.origem);
        const indiceDestino = grafo.vertices.findIndex((v) => v.id === aresta.destino);

        if (indiceOrigem === -1 || indiceDestino === -1) return;

        const verticeOrigem = grafo.vertices[indiceOrigem];
        const verticeDestino = grafo.vertices[indiceDestino];

        const distancia = aresta.distancia > 0
            ? aresta.distancia
            : calcularDistancia(
                verticeOrigem.x,
                verticeOrigem.y,
                verticeDestino.x,
                verticeDestino.y
            );

        matrizAdj[indiceOrigem][indiceDestino] = distancia;

        if (!aresta.direcionada) {
            matrizAdj[indiceDestino][indiceOrigem] = distancia;
        }
    });

    return matrizAdj;
}

export function dijkstra(
    grafo: Grafo,
    origemId: string,
    destinoId: string
): ResultadoDijkstra | null {
    const totalVertices = grafo.vertices.length;

    const matrizAdj = construirMatrizAdjacencia(grafo);

    const origem = grafo.vertices.findIndex((v) => v.id === origemId);
    const destino = grafo.vertices.findIndex((v) => v.id === destinoId);

    if (origem === -1 || destino === -1) {
        return null;
    }

    const distancias = Array.from({ length: totalVertices }, () => INF);
    const predecessores = Array.from({ length: totalVertices }, () => -1);
    const visitados = Array.from({ length: totalVertices }, () => false);

    distancias[origem] = 0;

    for (let i = 0; i < totalVertices; i++) {
        let atual = -1;
        let menorDistancia = INF;

        for (let j = 0; j < totalVertices; j++) {
            if (!visitados[j] && distancias[j] < menorDistancia) {
                atual = j;
                menorDistancia = distancias[j];
            }
        }

        if (atual === -1) break;

        visitados[atual] = true;

        for (let vizinho = 0; vizinho < totalVertices; vizinho++) {
            if (
                matrizAdj[atual][vizinho] < INF &&
                distancias[atual] + matrizAdj[atual][vizinho] < distancias[vizinho]
            ) {
                distancias[vizinho] = distancias[atual] + matrizAdj[atual][vizinho];
                predecessores[vizinho] = atual;
            }
        }
    }

    if (distancias[destino] === INF) {
        return null;
    }

    const caminho: string[] = [];

    for (let atual = destino; atual !== -1; atual = predecessores[atual]) {
        caminho.push(grafo.vertices[atual].id);
    }

    caminho.reverse();

    return {
        caminho,
        distanciaTotal: distancias[destino]
    };
}