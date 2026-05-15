import { useEffect, useRef } from "react";
import type { Grafo } from "../../../shared/types/grafo";

export const GrafoCanvas = () => {

    // Objeto do tipo Grafo
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

    // Referência para acessar o elemento canvas do DOM
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        // Recupera o canvas real
        const canvas = canvasRef.current;

        if (!canvas) return;

        // Recupera a API de desenho 2D
        const ctx = canvas.getContext("2d");

        if (!ctx) return;

        // Fundo do canvas
        ctx.fillStyle = "#111827";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Percorre todas as arestas
        grafo.arestas.forEach((aresta) => {

            // Procura vértice de origem
            const origem = grafo.vertices.find(
                (v) => v.id === aresta.origem
            );

            // Procura vértice de destino
            const destino = grafo.vertices.find(
                (v) => v.id === aresta.destino
            );

            // Se não encontrar origem ou destino, cancela desenho
            if (!origem || !destino) return;

            // Inicia desenho da aresta
            ctx.beginPath();

            // Move cursor para origem
            ctx.moveTo(origem.x, origem.y);

            // Cria linha até destino
            ctx.lineTo(destino.x, destino.y);

            // Cor da aresta
            ctx.strokeStyle = "white";

            // Espessura da aresta
            ctx.lineWidth = 2;

            // Desenha a linha
            ctx.stroke();

            // Calcula ponto médio da aresta
            const meioX = (origem.x + destino.x) / 2;
            const meioY = (origem.y + destino.y) / 2;

            // Desenha distância da aresta
            ctx.fillStyle = "yellow";
            ctx.font = "12px Arial";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";

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

            // Cor do vértice
            ctx.fillStyle = "#3b82f6";

            // Preenche círculo
            ctx.fill();

            // Configuração do texto
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

    }, []);

    return (
        <canvas
            ref={canvasRef}
            width={800}
            height={600}
        />
    );
};