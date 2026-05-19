/**
 * Implementação do algoritmo de Dijkstra.
 *
 * Este arquivo calcula o menor caminho entre dois vértices de um grafo.
 * Ele recebe:
 * - o grafo completo;
 * - o id do vértice de origem;
 * - o id do vértice de destino.
 *
 * O algoritmo usa:
 * - lista de adjacência para representar os vizinhos de cada vértice;
 * - vetor de distâncias para guardar o menor custo conhecido até cada vértice;
 * - vetor de predecessores para reconstruir o caminho final;
 * - vetor de visitados para evitar processar o mesmo vértice mais de uma vez;
 * - MinHeap para buscar rapidamente o próximo vértice com menor distância acumulada.
 *
 * A MinHeap não calcula o caminho.
 * Ela apenas organiza os vértices pela menor distância acumulada até o momento.
 * Assim, o Dijkstra consegue sempre explorar primeiro o vértice mais promissor.
 */

import type { Grafo } from "../types/grafo";
import { MinHeap } from "./minHeap";

const INF = Infinity;

export type ResultadoDijkstra = {
    caminho: string[];
    distanciaTotal: number;
    tempoExecucaoMs: number;
    nosExplorados: number;
};

// Lista de adjacência: para cada vértice, guarda seus vizinhos e pesos
type ListaAdjacencia = Array<Array<{ vizinho: number; peso: number }>>;

// Monta a lista de adjacência a partir das arestas do grafo
function construirListaAdjacencia(
    grafo: Grafo,
    mapaIdParaIndice: Map<string, number>
): ListaAdjacencia {
    const totalVertices = grafo.vertices.length;

    const lista: ListaAdjacencia =
        Array.from({ length: totalVertices }, () => []);

    for (const aresta of grafo.arestas) {
        const indiceOrigem = mapaIdParaIndice.get(aresta.origem);
        const indiceDestino = mapaIdParaIndice.get(aresta.destino);

        if (indiceOrigem === undefined || indiceDestino === undefined) {
            continue;
        }

        const peso =
            aresta.distancia > 0
                ? aresta.distancia
                : calcularDistanciaEuclidiana(
                    grafo,
                    indiceOrigem,
                    indiceDestino
                );

        lista[indiceOrigem].push({
            vizinho: indiceDestino,
            peso
        });

        // Se a aresta não for direcionada, adiciona também o caminho inverso
        if (!aresta.direcionada) {
            lista[indiceDestino].push({
                vizinho: indiceOrigem,
                peso
            });
        }
    }

    return lista;
}

// Calcula a distância entre dois vértices usando suas coordenadas
function calcularDistanciaEuclidiana(
    grafo: Grafo,
    indiceA: number,
    indiceB: number
): number {
    const a = grafo.vertices[indiceA];
    const b = grafo.vertices[indiceB];

    return Math.sqrt(
        (a.x - b.x) ** 2 +
        (a.y - b.y) ** 2
    );
}

// Executa o algoritmo de Dijkstra entre origem e destino
export function dijkstra(
    grafo: Grafo,
    origemId: string,
    destinoId: string
): ResultadoDijkstra | null {
    const totalVertices = grafo.vertices.length;

    // Mapa para localizar rapidamente o índice de cada vértice pelo id
    const mapaIdParaIndice = new Map<string, number>();

    for (let i = 0; i < totalVertices; i++) {
        mapaIdParaIndice.set(grafo.vertices[i].id, i);
    }

    const origem = mapaIdParaIndice.get(origemId);
    const destino = mapaIdParaIndice.get(destinoId);

    if (origem === undefined || destino === undefined) {
        return null;
    }

    const listaAdj = construirListaAdjacencia(
        grafo,
        mapaIdParaIndice
    );

    // Vetor com a menor distância conhecida até cada vértice
    const distancias = new Array<number>(totalVertices).fill(INF);

    // Vetor usado para reconstruir o caminho final
    const predecessores = new Array<number>(totalVertices).fill(-1);

    // Controla quais vértices já foram processados
    const visitados = new Array<boolean>(totalVertices).fill(false);

    distancias[origem] = 0;

    // Heap guarda: [distância acumulada, índice do vértice]
    const heap = new MinHeap<[number, number]>((a, b) => a[0] - b[0]);

    heap.inserir([0, origem]);

    const inicio = performance.now();

    let nosVisitados = 0;

    while (!heap.estaVazio()) {
        const item = heap.extrairMinimo();

        if (!item) break;

        const distanciaAtual = item[0];
        const atual = item[1];

        // Ignora vértices que já foram processados
        if (visitados[atual]) continue;

        visitados[atual] = true;
        nosVisitados++;

        // Se chegou ao destino, encerra
        if (atual === destino) break;

        // Percorre os vizinhos do vértice atual
        for (const { vizinho, peso } of listaAdj[atual]) {
            if (visitados[vizinho]) continue;

            const novaDistancia = distanciaAtual + peso;

            if (novaDistancia < distancias[vizinho]) {
                distancias[vizinho] = novaDistancia;
                predecessores[vizinho] = atual;

                heap.inserir([novaDistancia, vizinho]);
            }
        }
    }

    const tempoExecucaoMs = performance.now() - inicio;

    if (distancias[destino] === INF) {
        return null;
    }

    // Reconstrói o caminho usando o vetor de predecessores
    const caminho: string[] = [];

    for (let atual = destino; atual !== -1; atual = predecessores[atual]) {
        caminho.push(grafo.vertices[atual].id);
    }

    caminho.reverse();

    return {
        caminho,
        distanciaTotal: distancias[destino],
        tempoExecucaoMs,
        nosExplorados: nosVisitados
    };
}