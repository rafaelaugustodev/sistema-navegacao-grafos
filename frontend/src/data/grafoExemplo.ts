import type { Grafo } from "../../../shared/types/grafo";

// Grafo conexo padrão — todos os vértices são alcançáveis entre si.
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

// Grafo desconexo — dois clusters sem ligação entre si.
// Útil para testar o aviso de "caminho inexistente" entre vértices de clusters diferentes.
export const grafoDesconexo: Grafo = {
    vertices: [
        { id: "A", x: 120, y: 150, rotulo: "A" },
        { id: "B", x: 280, y: 100, rotulo: "B" },
        { id: "C", x: 280, y: 230, rotulo: "C" },
        { id: "D", x: 440, y: 150, rotulo: "D" },

        { id: "E", x: 120, y: 450, rotulo: "E" },
        { id: "F", x: 280, y: 400, rotulo: "F" },
        { id: "G", x: 280, y: 500, rotulo: "G" },
        { id: "H", x: 440, y: 450, rotulo: "H" }
    ],

    arestas: [
        { id: "1", origem: "A", destino: "B", distancia: 3, direcionada: false },
        { id: "2", origem: "A", destino: "C", distancia: 4, direcionada: false },
        { id: "3", origem: "B", destino: "D", distancia: 5, direcionada: false },
        { id: "4", origem: "C", destino: "D", distancia: 2, direcionada: false },

        { id: "5", origem: "E", destino: "F", distancia: 3, direcionada: false },
        { id: "6", origem: "E", destino: "G", distancia: 4, direcionada: false },
        { id: "7", origem: "F", destino: "H", distancia: 5, direcionada: false },
        { id: "8", origem: "G", destino: "H", distancia: 2, direcionada: false }
    ],

    ehPonderado: true,
    ehDirecionado: false
};

// Grafo direcionado com vértice "sumidouro" (H) — H recebe arestas, mas não envia.
// Sair de H em direção a qualquer outro vértice é impossível.
export const grafoDirecionado: Grafo = {
    vertices: [
        { id: "A", x: 120, y: 120, rotulo: "A" },
        { id: "B", x: 320, y: 120, rotulo: "B" },
        { id: "C", x: 520, y: 120, rotulo: "C" },

        { id: "D", x: 220, y: 280, rotulo: "D" },
        { id: "E", x: 420, y: 280, rotulo: "E" },

        { id: "F", x: 120, y: 440, rotulo: "F" },
        { id: "G", x: 320, y: 440, rotulo: "G" },
        { id: "H", x: 520, y: 440, rotulo: "H" }
    ],

    arestas: [
        { id: "1", origem: "A", destino: "B", distancia: 4, direcionada: true },
        { id: "2", origem: "B", destino: "C", distancia: 6, direcionada: true },
        { id: "3", origem: "A", destino: "D", distancia: 3, direcionada: true },
        { id: "4", origem: "D", destino: "E", distancia: 5, direcionada: true },
        { id: "5", origem: "C", destino: "E", distancia: 4, direcionada: true },
        { id: "6", origem: "D", destino: "G", distancia: 6, direcionada: true },
        { id: "7", origem: "E", destino: "H", distancia: 3, direcionada: true },
        { id: "8", origem: "F", destino: "G", distancia: 4, direcionada: true },
        { id: "9", origem: "G", destino: "H", distancia: 1, direcionada: true }
    ],

    ehPonderado: true,
    ehDirecionado: true
};

// Catálogo de grafos disponíveis no seletor da interface.
export const grafosDisponiveis: Record<string, { nome: string; grafo: Grafo }> = {
    exemplo: { nome: "Conexo (padrão)", grafo: grafoExemplo },
    desconexo: { nome: "Desconexo (dois clusters)", grafo: grafoDesconexo },
    direcionado: { nome: "Direcionado (com sumidouro)", grafo: grafoDirecionado }
};
