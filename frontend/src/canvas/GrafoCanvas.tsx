import { useEffect, useRef, useState } from "react";
import type { Grafo } from "../../../shared/types/grafo";

export const GrafoCanvas = () => {

    // Objeto do tipo Grafo usado para testes do canvas
    const grafo: Grafo = {
        vertices: [
            { id: "A", x: 100, y: 100, rotulo: "A" },
            { id: "B", x: 300, y: 100, rotulo: "B" },
            { id: "C", x: 200, y: 250, rotulo: "C" }
        ],
        arestas: [
            { id: "1", origem: "A", destino: "B", distancia: 10, direcionada: false },
            { id: "2", origem: "A", destino: "C", distancia: 15, direcionada: false },
            { id: "3", origem: "B", destino: "C", distancia: 20, direcionada: false }
        ],
        ehPonderado: true,
        ehDirecionado: false
    };

    // Referência para acessar o canvas real do DOM
    const canvasRef = useRef<HTMLCanvasElement>(null);

    // Estado que armazena o vértice de origem selecionado
    const [origemSelecionada, setOrigemSelecionada] = useState<string | null>(null);

    // Estado que armazena o vértice de destino selecionado
    const [destinoSelecionado, setDestinoSelecionado] = useState<string | null>(null);

    // Função chamada toda vez que o usuário clicar no canvas
    const handleClick = (event: React.MouseEvent<HTMLCanvasElement>) => {

        // Recupera o canvas real
        const canvas = canvasRef.current;

        if (!canvas) return;

        // Recupera posição e tamanho do canvas na tela
        const rect = canvas.getBoundingClientRect();

        // Converte posição horizontal do mouse para coordenada interna do canvas
        const mouseX = event.clientX - rect.left;

        // Converte posição vertical do mouse para coordenada interna do canvas
        const mouseY = event.clientY - rect.top;

        // Procura o vértice clicado
        const verticeClicado = grafo.vertices.find((vertice) => {

            // Calcula distância entre o mouse e o centro do vértice
            const distancia = Math.sqrt(
                (mouseX - vertice.x) ** 2 +
                (mouseY - vertice.y) ** 2
            );

            // Verifica se o clique ocorreu dentro do raio do vértice
            return distancia <= 20;
        });

        // Se não clicou em nenhum vértice, encerra função
        if (!verticeClicado) return;

        // Define o primeiro clique como origem
        if (!origemSelecionada) {
            setOrigemSelecionada(verticeClicado.id);
            return;
        }

        // Define o segundo clique como destino
        if (!destinoSelecionado) {
            setDestinoSelecionado(verticeClicado.id);
            return;
        }

        // Reinicia seleção após terceiro clique
        setOrigemSelecionada(verticeClicado.id);
        setDestinoSelecionado(null);
    };

    useEffect(() => {

        // Recupera o canvas real
        const canvas = canvasRef.current;

        if (!canvas) return;

        // Recupera a API de desenho 2D
        const ctx = canvas.getContext("2d");

        if (!ctx) return;

        // Desenha o fundo do canvas
        ctx.fillStyle = "#111827";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Percorre todas as arestas do grafo
        grafo.arestas.forEach((aresta) => {

            // Procura vértice de origem
            const origem = grafo.vertices.find(
                (v) => v.id === aresta.origem
            );

            // Procura vértice de destino
            const destino = grafo.vertices.find(
                (v) => v.id === aresta.destino
            );

            // Se não encontrar origem ou destino, não desenha
            if (!origem || !destino) return;

            // Inicia desenho da aresta
            ctx.beginPath();

            // Move cursor para vértice de origem
            ctx.moveTo(origem.x, origem.y);

            // Cria linha até vértice de destino
            ctx.lineTo(destino.x, destino.y);

            // Define cor da aresta
            ctx.strokeStyle = "white";

            // Define espessura da aresta
            ctx.lineWidth = 2;

            // Renderiza a linha
            ctx.stroke();

            // Calcula ponto médio da aresta
            const meioX = (origem.x + destino.x) / 2;
            const meioY = (origem.y + destino.y) / 2;

            // Configuração do texto da distância
            ctx.fillStyle = "yellow";
            ctx.font = "12px Arial";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";

            // Desenha distância da aresta
            ctx.fillText(
                String(aresta.distancia),
                meioX,
                meioY
            );
        });

        // Percorre todos os vértices do grafo
        grafo.vertices.forEach((vertice) => {

            // Inicia desenho do vértice
            ctx.beginPath();

            // Desenha círculo do vértice
            ctx.arc(
                vertice.x,
                vertice.y,
                20,
                0,
                Math.PI * 2
            );

            // Vértice de origem fica verde
            if (vertice.id === origemSelecionada) {
                ctx.fillStyle = "#22c55e";

            // Vértice de destino fica vermelho
            } else if (vertice.id === destinoSelecionado) {
                ctx.fillStyle = "#ef4444";

            // Vértices normais ficam azuis
            } else {
                ctx.fillStyle = "#3b82f6";
            }

            // Preenche o círculo do vértice
            ctx.fill();

            // Configuração do texto do vértice
            ctx.fillStyle = "white";
            ctx.font = "14px Arial";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";

            // Desenha rótulo do vértice
            ctx.fillText(
                vertice.rotulo ?? vertice.id,
                vertice.x,
                vertice.y
            );
        });

    // Executa novamente toda vez que origem ou destino mudar
    }, [origemSelecionada, destinoSelecionado]);

    return (
        <canvas
            ref={canvasRef}
            width={800}
            height={600}
            onClick={handleClick}
        />
    );
};