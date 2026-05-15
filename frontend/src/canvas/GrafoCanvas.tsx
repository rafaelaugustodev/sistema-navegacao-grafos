import { useEffect, useRef, useState } from "react";
import type { Grafo } from "../../../shared/types/grafo";
import { dijkstra } from "../../../shared/algoritmos/dijkstra";

export const GrafoCanvas = () => {

    // Grafo utilizado para testes da renderização e do Dijkstra
    const grafo: Grafo = {
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

    // Referência para acessar o canvas real do DOM
    const canvasRef = useRef<HTMLCanvasElement>(null);

    // Estado que armazena vértice de origem
    const [origemSelecionada, setOrigemSelecionada] = useState<string | null>(null);

    // Estado que armazena vértice de destino
    const [destinoSelecionado, setDestinoSelecionado] = useState<string | null>(null);

    // Estado que armazena o menor caminho encontrado
    const [menorCaminho, setMenorCaminho] = useState<string[]>([]);

    // Estado que armazena a distância total do caminho
    const [distanciaTotal, setDistanciaTotal] = useState<number | null>(null);

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

        // Se não encontrou vértice, encerra
        if (!verticeClicado) return;

        // Primeiro clique define origem
        if (!origemSelecionada) {
            setOrigemSelecionada(verticeClicado.id);
            return;
        }

        // Segundo clique define destino
        if (!destinoSelecionado) {
            setDestinoSelecionado(verticeClicado.id);
            return;
        }

        // Terceiro clique reinicia seleção
        setOrigemSelecionada(verticeClicado.id);
        setDestinoSelecionado(null);

        // Limpa caminho anterior
        setMenorCaminho([]);
        setDistanciaTotal(null);
    };

    // Executa Dijkstra quando origem e destino forem selecionados
    useEffect(() => {

        if (!origemSelecionada || !destinoSelecionado) return;

        const resultado = dijkstra(
            grafo,
            origemSelecionada,
            destinoSelecionado
        );

        if (!resultado) return;

        setMenorCaminho(resultado.caminho);
        setDistanciaTotal(resultado.distanciaTotal);

    }, [origemSelecionada, destinoSelecionado]);

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
        origemSelecionada,
        destinoSelecionado,
        menorCaminho
    ]);

    return (
        <>
            <canvas
                ref={canvasRef}
                width={800}
                height={600}
                onClick={handleClick}
            />

            {/* Exibe distância total encontrada */}
            {distanciaTotal !== null && (
                <p
                    style={{
                        color: "white",
                        fontSize: "18px"
                    }}
                >
                    Distância total: {distanciaTotal}
                </p>
            )}
        </>
    );
};