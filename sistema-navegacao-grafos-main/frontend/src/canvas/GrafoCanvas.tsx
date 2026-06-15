import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import type { Grafo } from "../types/grafo";
import { useZoomPan } from "./useZoomPan";
import { desenharGrafo } from "./desenharGrafo";
import "./GrafoCanvas.css";

// A partir desse limite, o grafo usa renderização simplificada (modo mapa)
export const LIMITE_GRAFO_GRANDE = 100;

// Margem (px) deixada ao redor do grafo no encaixe inicial
const PADDING_ENCAIXE = 24;

// Distância máxima (em pixels de tela) entre o clique e o vértice mais próximo
const TOLERANCIA_CLIQUE_PX = 60;

type GrafoCanvasProps = {
    grafo: Grafo;
    origemSelecionada: string | null;
    destinoSelecionado: string | null;
    menorCaminho: string[];
    mostrarVertices: boolean;
    mostrarPesos: boolean;
    onClickVertice: (verticeId: string) => void;
    onClickFora: () => void;
};

/**
 * Calcula o viewport (escala + offset) que faz o grafo caber centralizado
 * no canvas, preservando a proporção. É o "encaixe" inicial da visão.
 */
function calcularEncaixe(grafo: Grafo, largura: number, altura: number) {
    if (grafo.vertices.length === 0 || largura === 0 || altura === 0) {
        return { escala: 1, offset: { x: 0, y: 0 } };
    }

    let minX = Infinity;
    let maxX = -Infinity;
    let minY = Infinity;
    let maxY = -Infinity;
    for (const v of grafo.vertices) {
        if (v.x < minX) minX = v.x;
        if (v.x > maxX) maxX = v.x;
        if (v.y < minY) minY = v.y;
        if (v.y > maxY) maxY = v.y;
    }

    const larguraGrafo = maxX - minX || 1;
    const alturaGrafo = maxY - minY || 1;

    // Menor fator garante que tudo cabe sem distorcer.
    const escala = Math.min(
        (largura - 2 * PADDING_ENCAIXE) / larguraGrafo,
        (altura - 2 * PADDING_ENCAIXE) / alturaGrafo
    );

    // Centraliza o grafo na área do canvas.
    const offsetX = (largura - larguraGrafo * escala) / 2 - minX * escala;
    const offsetY = (altura - alturaGrafo * escala) / 2 - minY * escala;

    return { escala, offset: { x: offsetX, y: offsetY } };
}

export const GrafoCanvas = ({
    grafo,
    origemSelecionada,
    destinoSelecionado,
    menorCaminho,
    mostrarVertices,
    mostrarPesos,
    onClickVertice,
    onClickFora
}: GrafoCanvasProps) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    // Tamanho real do canvas, medido do container. Começa em 0 até o
    // ResizeObserver informar o tamanho real (o encaixe só ocorre depois disso).
    const [tamanho, setTamanho] = useState({ largura: 0, altura: 0 });

    const ehGrafoGrande = grafo.vertices.length > LIMITE_GRAFO_GRANDE;
    const raioVertice = ehGrafoGrande ? 2 : 20;

    // Observa o tamanho do container e mantém o buffer do canvas em sincronia.
    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const observer = new ResizeObserver((entries) => {
            const rect = entries[0].contentRect;
            setTamanho({
                largura: Math.round(rect.width),
                altura: Math.round(rect.height)
            });
        });

        observer.observe(container);
        return () => observer.disconnect();
    }, []);

    // Mapa id → vértice, usado no desenho das arestas.
    const mapaVertices = useMemo(() => {
        const mapa = new Map<string, (typeof grafo.vertices)[number]>();
        for (const vertice of grafo.vertices) {
            mapa.set(vertice.id, vertice);
        }
        return mapa;
    }, [grafo]);

    // Encaixe inicial: recalculado quando o grafo ou o tamanho do canvas muda.
    const encaixe = useMemo(
        () => calcularEncaixe(grafo, tamanho.largura, tamanho.altura),
        [grafo, tamanho]
    );

    const {
        escala,
        offset,
        escalaAjuste,
        arrastando,
        handlers,
        ampliar,
        reduzir,
        resetarVisao
    } = useZoomPan({
        ajuste: encaixe,
        chaveReset: grafo,
        largura: tamanho.largura,
        altura: tamanho.altura,
        onClique: (mundoX, mundoY) => {
            // Tolerância convertida de pixels de tela para unidades do mundo.
            const tolerancia = TOLERANCIA_CLIQUE_PX / escala;

            // Procura o vértice MAIS PRÓXIMO do clique (não o primeiro encontrado).
            let verticeMaisProximo: (typeof grafo.vertices)[number] | null = null;
            let menorDistancia = Infinity;

            for (const vertice of grafo.vertices) {
                const distancia = Math.sqrt(
                    (mundoX - vertice.x) ** 2 + (mundoY - vertice.y) ** 2
                );
                if (distancia < menorDistancia) {
                    menorDistancia = distancia;
                    verticeMaisProximo = vertice;
                }
            }

            // Só seleciona se o mais próximo estiver dentro do raio de imã.
            if (!verticeMaisProximo || menorDistancia > tolerancia) {
                onClickFora();
                return;
            }
            onClickVertice(verticeMaisProximo.id);
        }
    });

    // Porcentagem mostrada na barra: 100% = encaixe que está valendo.
    const porcentagemZoom = Math.round((escala / escalaAjuste) * 100);

    // Redesenha sempre que dados, seleção, viewport ou tamanho mudam.
    useLayoutEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        desenharGrafo(ctx, {
            grafo,
            mapaVertices,
            escala,
            offset,
            larguraCanvas: tamanho.largura,
            alturaCanvas: tamanho.altura,
            ehGrafoGrande,
            raioVertice,
            origemSelecionada,
            destinoSelecionado,
            menorCaminho,
            mostrarVertices,
            mostrarPesos
        });
    }, [
        grafo,
        mapaVertices,
        escala,
        offset,
        tamanho,
        ehGrafoGrande,
        raioVertice,
        origemSelecionada,
        destinoSelecionado,
        menorCaminho,
        mostrarVertices,
        mostrarPesos
    ]);

    return (
        <div className="canvas-container" ref={containerRef}>
            <canvas
                ref={canvasRef}
                width={tamanho.largura}
                height={tamanho.altura}
                onMouseDown={handlers.onMouseDown}
                onMouseMove={handlers.onMouseMove}
                onMouseUp={handlers.onMouseUp}
                onWheel={handlers.onWheel}
                onTouchStart={handlers.onTouchStart}
                onTouchMove={handlers.onTouchMove}
                onTouchEnd={handlers.onTouchEnd}
                style={{ cursor: arrastando ? "grabbing" : "grab" }}
            />

            <div className="barra-zoom">
                <span className="zoom-rotulo">🔍 Zoom</span>

                <button
                    type="button"
                    className="zoom-botao"
                    onClick={reduzir}
                    title="Afastar"
                >
                    −
                </button>

                <span className="zoom-porcentagem">{porcentagemZoom}%</span>

                <button
                    type="button"
                    className="zoom-botao"
                    onClick={ampliar}
                    title="Aproximar"
                >
                    +
                </button>

                <span className="zoom-divisor" />

                <button
                    type="button"
                    className="zoom-botao"
                    onClick={resetarVisao}
                    title="Resetar visão"
                >
                    ↻
                </button>
            </div>
        </div>
    );
};
