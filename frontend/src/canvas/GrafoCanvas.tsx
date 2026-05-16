import { useEffect, useRef } from "react";
import type { Grafo } from "../../../shared/types/grafo";

type GrafoCanvasProps = {
    grafo: Grafo;
    origemSelecionada: string | null;
    destinoSelecionado: string | null;
    menorCaminho: string[];
    onClickVertice: (verticeId: string) => void;
    onClickFora: () => void;
};

export const GrafoCanvas = ({
    grafo,
    origemSelecionada,
    destinoSelecionado,
    menorCaminho,
    onClickVertice,
    onClickFora
}: GrafoCanvasProps) => {

    // Referência para acessar o canvas real do DOM
    const canvasRef = useRef<HTMLCanvasElement>(null);

    // Função chamada ao clicar no canvas
    const handleClick = (event: React.MouseEvent<HTMLCanvasElement>) => {

        const canvas = canvasRef.current;

        if (!canvas) return;

        // Recupera posição do canvas na tela
        const rect = canvas.getBoundingClientRect();

        // Coordenada do clique dentro do canvas
        const mouseX = event.clientX - rect.left;
        const mouseY = event.clientY - rect.top;

        // Procura vértice clicado
        const verticeClicado = grafo.vertices.find((vertice) => {

            // Distância entre mouse e vértice
            const distancia = Math.sqrt(
                (mouseX - vertice.x) ** 2 +
                (mouseY - vertice.y) ** 2
            );

            // Verifica se clique ocorreu dentro do raio do círculo
            return distancia <= 20;
        });

        // Clique fora de qualquer vértice é tratado pelo componente pai
        // (usado para desfazer a seleção quando já existe um caminho traçado)
        if (!verticeClicado) {
            onClickFora();
            return;
        }

        // Delega a decisão de seleção ao componente pai
        onClickVertice(verticeClicado.id);
    };

    // Desenha o grafo
    useEffect(() => {

        const canvas = canvasRef.current;

        if (!canvas) return;

        const ctx = canvas.getContext("2d");

        if (!ctx) return;

        // Fundo do canvas
        ctx.fillStyle = "#111827";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Percorre todas as arestas
        grafo.arestas.forEach((aresta) => {

            const origem = grafo.vertices.find(
                (v) => v.id === aresta.origem
            );

            const destino = grafo.vertices.find(
                (v) => v.id === aresta.destino
            );

            if (!origem || !destino) return;

            // Verifica se aresta faz parte do menor caminho, o código pergunta:
            // essa aresta conecta dois vértices consecutivos da rota calculada pelo dijkstra?
            const estaNoMenorCaminho = menorCaminho.some((verticeId, index) => {

                const proximoVerticeId = menorCaminho[index + 1];

                return (
                    (verticeId === aresta.origem &&
                        proximoVerticeId === aresta.destino) ||

                    (!aresta.direcionada &&
                        verticeId === aresta.destino &&
                        proximoVerticeId === aresta.origem)
                );
            });

            // Inicia desenho da aresta
            ctx.beginPath();

            // Move cursor para origem
            ctx.moveTo(origem.x, origem.y);

            // Desenha linha até destino
            ctx.lineTo(destino.x, destino.y);

            // Cor da aresta
            ctx.strokeStyle = estaNoMenorCaminho
                ? "#f97316"
                : "white";

            // Espessura da aresta
            ctx.lineWidth = estaNoMenorCaminho
                ? 5
                : 2;

            // Renderiza linha
            ctx.stroke();

            // Calcula ponto médio da aresta
            const meioX = (origem.x + destino.x) / 2;
            const meioY = (origem.y + destino.y) / 2;

            // Configuração do texto
            ctx.fillStyle = "yellow";
            ctx.font = "12px Arial";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";

            // Desenha peso da aresta
            ctx.fillText(
                String(aresta.distancia),
                meioX,
                meioY
            );
        });

        // Percorre todos os vértices
        grafo.vertices.forEach((vertice) => {

            // Inicia desenho do vértice
            ctx.beginPath();

            // Desenha círculo
            ctx.arc(
                vertice.x,
                vertice.y,
                20,
                0,
                Math.PI * 2
            );

            // Vértice de origem
            if (vertice.id === origemSelecionada) {

                ctx.fillStyle = "#22c55e";

            // Vértice de destino
            } else if (vertice.id === destinoSelecionado) {

                ctx.fillStyle = "#ef4444";

            // Vértices normais
            } else {

                ctx.fillStyle = "#3b82f6";
            }

            // Preenche círculo
            ctx.fill();

            // Configuração do texto
            ctx.fillStyle = "white";
            ctx.font = "14px Arial";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";

            // Desenha nome do vértice
            ctx.fillText(
                vertice.rotulo ?? vertice.id,
                vertice.x,
                vertice.y
            );
        });

    }, [
        grafo,
        origemSelecionada,
        destinoSelecionado,
        menorCaminho
    ]);

    return (
        <canvas
            ref={canvasRef}
            width={800}
            height={600}
            onClick={handleClick}
        />
    );
};
