/**
 * Operações puras de edição do grafo (RF05).
 *
 * Cada função recebe um Grafo e devolve um novo Grafo, sem mutar a entrada.
 * Mantém o grafo coerente: ao remover um vértice, remove também as arestas
 * que tocam nele; ids novos não colidem com os existentes.
 */

import type { Grafo, Vertice, Aresta } from "../types/grafo";

// Gera um id de vértice inédito no grafo. Sequência: A, B, ..., Z, AA, AB, ...
export function proximoIdVertice(grafo: Grafo): string {
    const existentes = new Set(grafo.vertices.map((v) => v.id));
    let n = grafo.vertices.length;

    while (true) {
        const id = indiceParaRotulo(n);
        if (!existentes.has(id)) return id;
        n++;
    }
}

// Converte 0 → A, 1 → B, ..., 25 → Z, 26 → AA, 27 → AB...
function indiceParaRotulo(indice: number): string {
    let rotulo = "";
    let n = indice;

    do {
        rotulo = String.fromCharCode(65 + (n % 26)) + rotulo;
        n = Math.floor(n / 26) - 1;
    } while (n >= 0);

    return rotulo;
}

// Gera um id de aresta inédito no grafo.
export function proximoIdAresta(grafo: Grafo): string {
    const existentes = new Set(grafo.arestas.map((a) => a.id));
    let n = grafo.arestas.length + 1;

    while (existentes.has(String(n))) n++;
    return String(n);
}

// Adiciona um novo vértice ao grafo.
export function adicionarVertice(
    grafo: Grafo,
    x: number,
    y: number,
    rotulo?: string
): Grafo {
    const id = proximoIdVertice(grafo);
    const novo: Vertice = {
        id,
        x,
        y,
        rotulo: rotulo ?? id
    };

    return {
        ...grafo,
        vertices: [...grafo.vertices, novo]
    };
}

// Move um vértice já existente para uma nova posição.
export function moverVertice(
    grafo: Grafo,
    idVertice: string,
    x: number,
    y: number
): Grafo {
    return {
        ...grafo,
        vertices: grafo.vertices.map((v) =>
            v.id === idVertice ? { ...v, x, y } : v
        )
    };
}

// Remove um vértice e todas as arestas que o tocam.
export function removerVertice(grafo: Grafo, idVertice: string): Grafo {
    return {
        ...grafo,
        vertices: grafo.vertices.filter((v) => v.id !== idVertice),
        arestas: grafo.arestas.filter(
            (a) => a.origem !== idVertice && a.destino !== idVertice
        )
    };
}

// Adiciona uma aresta entre dois vértices existentes. Não cria duplicata.
export function adicionarAresta(
    grafo: Grafo,
    idOrigem: string,
    idDestino: string,
    distancia: number,
    direcionada: boolean
): Grafo {
    // Bloqueia laços (origem == destino) e arestas com vértice inexistente.
    if (idOrigem === idDestino) return grafo;

    const idsValidos = new Set(grafo.vertices.map((v) => v.id));
    if (!idsValidos.has(idOrigem) || !idsValidos.has(idDestino)) return grafo;

    // Evita criar duas vezes a mesma aresta no mesmo sentido.
    const jaExiste = grafo.arestas.some(
        (a) => a.origem === idOrigem && a.destino === idDestino
    );
    if (jaExiste) return grafo;

    const nova: Aresta = {
        id: proximoIdAresta(grafo),
        origem: idOrigem,
        destino: idDestino,
        distancia,
        direcionada
    };

    return {
        ...grafo,
        arestas: [...grafo.arestas, nova]
    };
}

// Grafo inicial vazio usado pelo modo "Criar Grafo".
export function grafoVazio(
    ehPonderado: boolean,
    ehDirecionado: boolean
): Grafo {
    return {
        vertices: [],
        arestas: [],
        ehPonderado,
        ehDirecionado
    };
}
