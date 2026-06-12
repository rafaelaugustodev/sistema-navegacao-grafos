import type { Grafo } from "../types/grafo";

type Vertice = Grafo["vertices"][number];
type Aresta = Grafo["arestas"][number];

type OpcoesDesenho = {
    grafo: Grafo;
    mapaVertices: Map<string, Vertice>;
    escala: number;
    offset: { x: number; y: number };
    larguraCanvas: number;
    alturaCanvas: number;
    ehGrafoGrande: boolean;
    raioVertice: number;
    origemSelecionada: string | null;
    destinoSelecionado: string | null;
    menorCaminho: string[];
    // Em grafos grandes (mapas), controlam o que aparece. Em grafos
    // pequenos não têm efeito: vértices e pesos são sempre desenhados.
    mostrarVertices: boolean;
    mostrarPesos: boolean;
};

/**
 * Desenha o grafo inteiro no contexto 2D do canvas.
 *
 * Função sem React: recebe o ctx e os dados, e pinta. Toda a transformação
 * de zoom/pan é aplicada aqui via translate + scale.
 *
 * Ordem das passadas:
 *   1. arestas comuns (fora do caminho)
 *   2. arestas do caminho, por cima, para nunca ficarem escondidas
 *   3. vértices (todos, se grafo pequeno; só origem/destino, se grande)
 */
export function desenharGrafo(
    ctx: CanvasRenderingContext2D,
    opcoes: OpcoesDesenho
): void {
    const {
        grafo,
        mapaVertices,
        escala,
        offset,
        larguraCanvas,
        alturaCanvas,
        ehGrafoGrande,
        raioVertice,
        origemSelecionada,
        destinoSelecionado,
        menorCaminho,
        mostrarVertices,
        mostrarPesos
    } = opcoes;

    // Limpa o fundo
    ctx.fillStyle = "#0f172a";
    ctx.fillRect(0, 0, larguraCanvas, alturaCanvas);

    // Viewport em coordenadas do mundo (com pequena margem).
    const margemMundo = 50 / escala;
    const xMinV = -offset.x / escala - margemMundo;
    const xMaxV = (larguraCanvas - offset.x) / escala + margemMundo;
    const yMinV = -offset.y / escala - margemMundo;
    const yMaxV = (alturaCanvas - offset.y) / escala + margemMundo;

    ctx.save();

    // Aplica deslocamento e zoom
    ctx.translate(offset.x, offset.y);
    ctx.scale(escala, escala);

    // Pontas e cantos arredondados deixam a malha de ruas mais suave
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    // Espessuras e cores dependem do tamanho do grafo.
    // Grafo grande = visual de mapa (ruas finas e suaves, sem rótulos).
    const espessuraAresta = (ehGrafoGrande ? 1.1 : 2) / escala;
    const espessuraCaminho = (ehGrafoGrande ? 3.5 : 5) / escala;
    const corArestaBase = ehGrafoGrande ? "#64748b" : "#cbd5e1";

    // Conjunto das arestas que fazem parte do caminho (lookup O(1)).
    const arestasCaminho = new Set<string>();
    for (let i = 0; i < menorCaminho.length - 1; i++) {
        arestasCaminho.add(`${menorCaminho[i]}|${menorCaminho[i + 1]}`);
        arestasCaminho.add(`${menorCaminho[i + 1]}|${menorCaminho[i]}`);
    }
    const ehArestaDoCaminho = (aresta: Aresta) =>
        arestasCaminho.has(`${aresta.origem}|${aresta.destino}`);

    // Desenha a ponta de seta de uma aresta direcionada.
    const desenharSeta = (origem: Vertice, destino: Vertice, cor: string) => {
        const tamanhoSeta = (ehGrafoGrande ? 6 : 12) / escala;
        const recuo = raioVertice / escala;
        const anguloAbertura = Math.PI / 6;
        const angulo = Math.atan2(destino.y - origem.y, destino.x - origem.x);
        const pontaX = destino.x - recuo * Math.cos(angulo);
        const pontaY = destino.y - recuo * Math.sin(angulo);

        ctx.beginPath();
        ctx.moveTo(pontaX, pontaY);
        ctx.lineTo(
            pontaX - tamanhoSeta * Math.cos(angulo - anguloAbertura),
            pontaY - tamanhoSeta * Math.sin(angulo - anguloAbertura)
        );
        ctx.lineTo(
            pontaX - tamanhoSeta * Math.cos(angulo + anguloAbertura),
            pontaY - tamanhoSeta * Math.sin(angulo + anguloAbertura)
        );
        ctx.closePath();
        ctx.fillStyle = cor;
        ctx.fill();
    };

    // Desenha uma aresta (linha + seta + peso opcional).
    const desenharAresta = (aresta: Aresta, ehCaminho: boolean) => {
        const origem = mapaVertices.get(aresta.origem);
        const destino = mapaVertices.get(aresta.destino);
        if (!origem || !destino) return;

        // Pula arestas inteiramente fora do viewport (viewport culling).
        const loX = origem.x < destino.x ? origem.x : destino.x;
        const hiX = origem.x > destino.x ? origem.x : destino.x;
        const loY = origem.y < destino.y ? origem.y : destino.y;
        const hiY = origem.y > destino.y ? origem.y : destino.y;
        if (hiX < xMinV || loX > xMaxV || hiY < yMinV || loY > yMaxV) return;

        // No trajeto, a cor revela o tipo de via: mão única em amarelo,
        // mão dupla em laranja. Fora do trajeto usa a cor base do grafo.
        const cor = ehCaminho
            ? aresta.direcionada
                ? "#facc15"
                : "#f97316"
            : corArestaBase;
        ctx.strokeStyle = cor;
        ctx.lineWidth = ehCaminho ? espessuraCaminho : espessuraAresta;

        ctx.beginPath();
        ctx.moveTo(origem.x, origem.y);
        ctx.lineTo(destino.x, destino.y);
        ctx.stroke();

        if (aresta.direcionada) desenharSeta(origem, destino, cor);

        // Grafo pequeno sempre mostra peso; grafo grande só se o usuário pedir.
        if (!ehGrafoGrande || mostrarPesos) {
            const meioX = (origem.x + destino.x) / 2;
            const meioY = (origem.y + destino.y) / 2;
            ctx.fillStyle = "#c4b5fd";
            ctx.font = `${12 / escala}px Arial`;
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText(String(Math.round(aresta.distancia)), meioX, meioY);
        }
    };

    // Passe 1: arestas comuns (fora do caminho).
    grafo.arestas.forEach((aresta) => {
        if (!ehArestaDoCaminho(aresta)) desenharAresta(aresta, false);
    });

    // Passe 2: arestas do caminho, por cima.
    grafo.arestas.forEach((aresta) => {
        if (ehArestaDoCaminho(aresta)) desenharAresta(aresta, true);
    });

    // Passe 3: vértices.
    if (!ehGrafoGrande) {
        // Grafo pequeno: todos os vértices com rótulo.
        // Raio dividido pela escala para manter tamanho constante na tela.
        const raioTela = raioVertice / escala;
        grafo.vertices.forEach((vertice) => {
            if (
                vertice.x < xMinV || vertice.x > xMaxV ||
                vertice.y < yMinV || vertice.y > yMaxV
            ) return;

            ctx.beginPath();
            ctx.arc(vertice.x, vertice.y, raioTela, 0, Math.PI * 2);

            if (vertice.id === origemSelecionada) {
                ctx.fillStyle = "#22c55e";
            } else if (vertice.id === destinoSelecionado) {
                ctx.fillStyle = "#ef4444";
            } else {
                ctx.fillStyle = "#3b82f6";
            }
            ctx.fill();

            const rotulo = vertice.rotulo ?? vertice.id;
            const tamanhoFonte =
                rotulo.length <= 2 ? 14
                    : rotulo.length <= 4 ? 12
                        : rotulo.length <= 6 ? 10
                            : 8;

            ctx.fillStyle = "white";
            ctx.font = `${tamanhoFonte / escala}px Arial`;
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText(rotulo, vertice.x, vertice.y);
        });
    } else {
        // Grafo grande (mapa): por padrão só os marcadores de origem/destino.
        // Se o usuário pedir, desenha também todos os vértices como pontos.
        if (mostrarVertices) {
            const raioTela = raioVertice / escala;
            ctx.fillStyle = "#3b82f6";
            grafo.vertices.forEach((vertice) => {
                if (
                    vertice.x < xMinV || vertice.x > xMaxV ||
                    vertice.y < yMinV || vertice.y > yMaxV
                ) return;

                ctx.beginPath();
                ctx.arc(vertice.x, vertice.y, raioTela, 0, Math.PI * 2);
                ctx.fill();
            });
        }

        const marcar = (id: string | null, cor: string) => {
            if (!id) return;
            const vertice = mapaVertices.get(id);
            if (!vertice) return;

            const raio = 7 / escala;
            ctx.beginPath();
            ctx.arc(vertice.x, vertice.y, raio, 0, Math.PI * 2);
            ctx.fillStyle = cor;
            ctx.fill();
            ctx.lineWidth = 2 / escala;
            ctx.strokeStyle = "white";
            ctx.stroke();
        };

        marcar(origemSelecionada, "#22c55e");
        marcar(destinoSelecionado, "#ef4444");
    }

    ctx.restore();
}
