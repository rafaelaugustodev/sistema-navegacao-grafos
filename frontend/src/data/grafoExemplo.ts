import type { Grafo } from "../../../shared/types/grafo";

// Grafo de teste utilizado como smoke test enquanto a importação de
// arquivos reais (.osm/.poly/.txt) ainda não foi implementada.
export const grafoExemplo: Grafo = {
    vertices: [
        { id: "A", x: 100, y: 100, rotulo: "A" },
        { id: "B", x: 300, y: 100, rotulo: "B" },
        { id: "C", x: 500, y: 100, rotulo: "C" },

        { id: "D", x: 200, y: 250, rotulo: "D" },
        { id: "E", x: 400, y: 250, rotulo: "E" },

        { id: "F", x: 100, y: 400, rotulo: "F" },
        { id: "G", x: 300, y: 400, rotulo: "G" },
        { id: "H", x: 500, y: 400, rotulo: "H" }
    ],

    arestas: [
        { id: "1", origem: "A", destino: "B", distancia: 4, direcionada: false },
        { id: "2", origem: "B", destino: "C", distancia: 6, direcionada: false },

        { id: "3", origem: "A", destino: "D", distancia: 3, direcionada: false },
        { id: "4", origem: "B", destino: "D", distancia: 2, direcionada: false },
        { id: "5", origem: "B", destino: "E", distancia: 5, direcionada: false },
        { id: "6", origem: "C", destino: "E", distancia: 4, direcionada: false },

        { id: "7", origem: "D", destino: "G", distancia: 6, direcionada: false },
        { id: "8", origem: "E", destino: "G", distancia: 2, direcionada: false },

        { id: "9", origem: "D", destino: "F", distancia: 5, direcionada: false },
        { id: "10", origem: "E", destino: "H", distancia: 3, direcionada: false },

        { id: "11", origem: "F", destino: "G", distancia: 4, direcionada: false },
        { id: "12", origem: "G", destino: "H", distancia: 1, direcionada: false }
    ],

    ehPonderado: true,
    ehDirecionado: false
};
