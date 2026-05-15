import { useEffect, useRef } from "react";

export const Grafo = () => {
    // Objeto temporário usado para testar a renderização do grafo no Canvas
    const grafo = {
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

    // Referência para acessar o elemento real do canvas no DOM
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        // Recupera o elemento canvas renderizado na tela
        const canvas = canvasRef.current;

        if (!canvas) return;

        // Recupera o contexto 2D, que fornece as funções de desenho
        const ctx = canvas.getContext("2d");

        if (!ctx) return;

        // Desenha o fundo do canvas
        ctx.fillStyle = "#111827";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Percorre todas as arestas do grafo para desenhá-las
        grafo.arestas.forEach((aresta) => {
            // Procura o vértice de origem da aresta
            const origem = grafo.vertices.find((v) => v.id === aresta.origem);

            // Procura o vértice de destino da aresta
            const destino = grafo.vertices.find((v) => v.id === aresta.destino);

            // Se algum dos vértices não existir, a aresta não é desenhada
            if (!origem || !destino) return;

            // Inicia um novo desenho para a aresta
            ctx.beginPath();

            // Move o cursor para a coordenada do vértice de origem
            ctx.moveTo(origem.x, origem.y);

            // Cria uma linha até a coordenada do vértice de destino
            ctx.lineTo(destino.x, destino.y);

            // Define a cor da aresta
            ctx.strokeStyle = "white";

            // Define a espessura da aresta
            ctx.lineWidth = 2;

            // Renderiza a linha no canvas
            ctx.stroke();

            // Calcula o ponto médio da aresta para exibir a distância
            const meioX = (origem.x + destino.x) / 2;
            const meioY = (origem.y + destino.y) / 2;

            // Desenha o peso/distância da aresta
            ctx.fillStyle = "yellow";
            ctx.font = "12px Arial";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText(String(aresta.distancia), meioX, meioY);
        });

        // Percorre todos os vértices do grafo para desenhá-los
        grafo.vertices.forEach((vertice) => {
            // Inicia um novo desenho para o vértice
            ctx.beginPath();

            // Desenha o círculo que representa o vértice
            ctx.arc(vertice.x, vertice.y, 20, 0, Math.PI * 2);

            // Define a cor do vértice
            ctx.fillStyle = "#3b82f6";

            // Preenche o círculo do vértice
            ctx.fill();

            // Define o estilo do texto do rótulo
            ctx.fillStyle = "white";
            ctx.font = "14px Arial";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";

            // Desenha o rótulo do vértice; se não houver rótulo, usa o id
            ctx.fillText(vertice.rotulo ?? vertice.id, vertice.x, vertice.y);
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