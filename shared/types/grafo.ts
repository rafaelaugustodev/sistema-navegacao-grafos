export type Vertice = {
    id: string;
    x: number;
    y: number;
    rotulo?: string; // nome opcional
}

export type Aresta = {
    id: string;
    origem: string; // id do vértice inicial
    destino: string; // id do vértice final
    distancia: number;
    direcionada: boolean; // false = mão dupla, true = mão única
}

export type Grafo = {
    vertices: Vertice[]; // vetor de vértices
    arestas: Aresta[]; // vetor de arestas
    ehPonderado: boolean; // se o grafo usa distancia 
    ehDirecionado: boolean; // false = mão dupla, true = mão única
}