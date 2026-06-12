export type Vertice = {
    id: string;
    x: number;
    y: number;
    rotulo?: string;
}

export type Aresta = {
    id: string;
    origem: string;
    destino: string;
    distancia: number;
    direcionada: boolean;
}

export type Grafo = {
    vertices: Vertice[];
    arestas: Aresta[];
    ehPonderado: boolean;
    ehDirecionado: boolean;
    metrosPorUnidade?: number;
}
