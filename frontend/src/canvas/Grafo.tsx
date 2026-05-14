import { useEffect, useRef } from "react";

export const Grafo = () => {

    const canvasRef = useRef<HTMLCanvasElement>(null); // referência para o canvas

    useEffect(() => {
        const canvas = canvasRef.current; // elemento real do canvas

        if (!canvas) return;

        const ctx = canvas.getContext("2d"); // ferramenta de desenho

        if (!ctx) return;

        // Fundo
        ctx.fillStyle = "#111827";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Linha
        ctx.strokeStyle = "white";
        ctx.lineWidth = 2;

        // Aresta
        ctx.beginPath();
        ctx.moveTo(100, 100);
        ctx.lineTo(300, 100);
        ctx.stroke();

        // Vertice A
        ctx.beginPath();
        ctx.arc(100, 100, 20, 0, Math.PI * 2);
        ctx.fillStyle = "#3b82f6";
        ctx.fill();

        // Vertice B
        ctx.beginPath();
        ctx.arc(300, 100, 20, 0, Math.PI * 2);
        ctx.fillStyle = "#3b82f6";
        ctx.fill();
    })

    return (
       <canvas
        ref={canvasRef}
        width={800}
        height={600}
       />
    )
}
