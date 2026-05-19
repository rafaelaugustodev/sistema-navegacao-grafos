import { useEffect, useMemo, useRef, useState } from "react";
import type { Grafo } from "../../../shared/types/grafo";

// A partir desse limite, o grafo usa renderização simplificada
const LIMITE_GRAFO_GRANDE = 100;

const LARGURA_CANVAS = 1080;
const ALTURA_CANVAS = 720;

// Configurações de zoom
const ZOOM_MINIMO = 0.5;
const ZOOM_MAXIMO = 20;
const FATOR_ZOOM = 1.15;

// Movimento máximo para ainda considerar como clique
const LIMITE_CLIQUE = 4;

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

    // Define se o grafo é grande
    const ehGrafoGrande = grafo.vertices.length > LIMITE_GRAFO_GRANDE;

    const raioVertice = ehGrafoGrande ? 2 : 20;

    // Estado do zoom
    const [escala, setEscala] = useState(1);

    // Estado do deslocamento do canvas
    const [offset, setOffset] = useState({
        x: 0,
        y: 0
    });

    // Guarda informações do arrasto sem causar renderização a cada movimento
    const arrasto = useRef({
        ativo: false,
        inicioX: 0,
        inicioY: 0,
        offsetInicialX: 0,
        offsetInicialY: 0,
        moveu: false
    });

    // Mapa para buscar vértices pelo id com mais eficiência
    const mapaVertices = useMemo(() => {
        const mapa = new Map<string, (typeof grafo.vertices)[number]>();

        for (const vertice of grafo.vertices) {
            mapa.set(vertice.id, vertice);
        }

        return mapa;
    }, [grafo]);

    // Reseta zoom e posição quando o grafo muda
    useEffect(() => {
        setEscala(1);
        setOffset({
            x: 0,
            y: 0
        });
    }, [grafo]);

    // Converte coordenadas da tela para coordenadas internas do grafo
    const telaParaMundo = (xTela: number, yTela: number) => ({
        x: (xTela - offset.x) / escala,
        y: (yTela - offset.y) / escala
    });

    // Inicia o arrasto do canvas
    const handleMouseDown = (
        event: React.MouseEvent<HTMLCanvasElement>
    ) => {
        const canvas = canvasRef.current;

        if (!canvas) return;

        const rect = canvas.getBoundingClientRect();

        arrasto.current = {
            ativo: true,
            inicioX: event.clientX - rect.left,
            inicioY: event.clientY - rect.top,
            offsetInicialX: offset.x,
            offsetInicialY: offset.y,
            moveu: false
        };
    };

    // Move o canvas durante o arrasto
    const handleMouseMove = (
        event: React.MouseEvent<HTMLCanvasElement>
    ) => {
        if (!arrasto.current.ativo) return;

        const canvas = canvasRef.current;

        if (!canvas) return;

        const rect = canvas.getBoundingClientRect();

        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        const dx = x - arrasto.current.inicioX;
        const dy = y - arrasto.current.inicioY;

        // Só considera arrasto se o movimento passar do limite
        if (
            Math.abs(dx) > LIMITE_CLIQUE ||
            Math.abs(dy) > LIMITE_CLIQUE
        ) {
            arrasto.current.moveu = true;

            setOffset({
                x: arrasto.current.offsetInicialX + dx,
                y: arrasto.current.offsetInicialY + dy
            });
        }
    };

    // Finaliza clique ou arrasto
    const handleMouseUp = (
        event: React.MouseEvent<HTMLCanvasElement>
    ) => {
        if (!arrasto.current.ativo) return;

        // Se moveu, foi arrasto e não clique
        if (arrasto.current.moveu) {
            arrasto.current.ativo = false;
            return;
        }

        arrasto.current.ativo = false;

        const canvas = canvasRef.current;

        if (!canvas) return;

        const rect = canvas.getBoundingClientRect();

        const mouseX = event.clientX - rect.left;
        const mouseY = event.clientY - rect.top;

        // Converte clique para coordenadas internas do grafo
        const mundo = telaParaMundo(mouseX, mouseY);

        // Define área de clique do vértice
        const raioCliqueAlvo = Math.max(raioVertice, 10) / escala;

        // Procura vértice clicado
        const verticeClicado = grafo.vertices.find((vertice) => {
            const distancia = Math.sqrt(
                (mundo.x - vertice.x) ** 2 +
                (mundo.y - vertice.y) ** 2
            );

            return distancia <= raioCliqueAlvo;
        });

        // Se clicou fora de vértice
        if (!verticeClicado) {
            onClickFora();
            return;
        }

        // Se clicou em vértice
        onClickVertice(verticeClicado.id);
    };

    // Controla zoom pelo scroll do mouse
    const handleWheel = (
        event: React.WheelEvent<HTMLCanvasElement>
    ) => {
        const canvas = canvasRef.current;

        if (!canvas) return;

        const rect = canvas.getBoundingClientRect();

        const mouseX = event.clientX - rect.left;
        const mouseY = event.clientY - rect.top;

        // Scroll para cima aproxima; scroll para baixo afasta
        const fator =
            event.deltaY < 0
                ? FATOR_ZOOM
                : 1 / FATOR_ZOOM;

        const novaEscala = Math.max(
            ZOOM_MINIMO,
            Math.min(ZOOM_MAXIMO, escala * fator)
        );

        if (novaEscala === escala) return;

        // Mantém o zoom centralizado no ponto do mouse
        const mundoAntes = telaParaMundo(mouseX, mouseY);

        const novoOffsetX = mouseX - mundoAntes.x * novaEscala;
        const novoOffsetY = mouseY - mundoAntes.y * novaEscala;

        setEscala(novaEscala);

        setOffset({
            x: novoOffsetX,
            y: novoOffsetY
        });
    };

    useEffect(() => {
        const canvas = canvasRef.current;

        if (!canvas) return;

        const ctx = canvas.getContext("2d");

        if (!ctx) return;

        // Limpa o fundo
        ctx.fillStyle = "#111827";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Salva estado original do canvas
        ctx.save();

        // Aplica deslocamento e zoom
        ctx.translate(offset.x, offset.y);
        ctx.scale(escala, escala);

        // Ajusta espessura para manter aparência estável com zoom
        const espessuraAresta = 2 / escala;
        const espessuraCaminho = 5 / escala;

        // Desenha arestas
        grafo.arestas.forEach((aresta) => {
            const origem = mapaVertices.get(aresta.origem);
            const destino = mapaVertices.get(aresta.destino);

            if (!origem || !destino) return;

            // Verifica se a aresta faz parte do menor caminho
            const estaNoMenorCaminho = menorCaminho.some(
                (verticeId, index) => {
                    const proximoVerticeId = menorCaminho[index + 1];

                    return (
                        (
                            verticeId === aresta.origem &&
                            proximoVerticeId === aresta.destino
                        ) ||
                        (
                            !aresta.direcionada &&
                            verticeId === aresta.destino &&
                            proximoVerticeId === aresta.origem
                        )
                    );
                }
            );

            // Desenha a aresta
            ctx.beginPath();
            ctx.moveTo(origem.x, origem.y);
            ctx.lineTo(destino.x, destino.y);

            ctx.strokeStyle = estaNoMenorCaminho
                ? "#f97316"
                : "white";

            ctx.lineWidth = estaNoMenorCaminho
                ? espessuraCaminho
                : espessuraAresta;

            ctx.stroke();

            // Desenha seta para arestas direcionadas
            if (aresta.direcionada) {
                const tamanhoSeta =
                    (ehGrafoGrande ? 6 : 12) / escala;

                const anguloAbertura = Math.PI / 6;

                const angulo = Math.atan2(
                    destino.y - origem.y,
                    destino.x - origem.x
                );

                const pontaX =
                    destino.x - raioVertice * Math.cos(angulo);

                const pontaY =
                    destino.y - raioVertice * Math.sin(angulo);

                ctx.beginPath();

                ctx.moveTo(pontaX, pontaY);

                ctx.lineTo(
                    pontaX -
                        tamanhoSeta *
                            Math.cos(angulo - anguloAbertura),
                    pontaY -
                        tamanhoSeta *
                            Math.sin(angulo - anguloAbertura)
                );

                ctx.lineTo(
                    pontaX -
                        tamanhoSeta *
                            Math.cos(angulo + anguloAbertura),
                    pontaY -
                        tamanhoSeta *
                            Math.sin(angulo + anguloAbertura)
                );

                ctx.closePath();

                ctx.fillStyle = estaNoMenorCaminho
                    ? "#f97316"
                    : "white";

                ctx.fill();
            }

            // Em grafos pequenos, mostra o peso da aresta
            if (!ehGrafoGrande) {
                const meioX = (origem.x + destino.x) / 2;
                const meioY = (origem.y + destino.y) / 2;

                ctx.fillStyle = "yellow";
                ctx.font = `${12 / escala}px Arial`;
                ctx.textAlign = "center";
                ctx.textBaseline = "middle";

                ctx.fillText(
                    String(aresta.distancia),
                    meioX,
                    meioY
                );
            }
        });

        // Desenha vértices
        grafo.vertices.forEach((vertice) => {
            ctx.beginPath();

            ctx.arc(
                vertice.x,
                vertice.y,
                raioVertice,
                0,
                Math.PI * 2
            );

            if (vertice.id === origemSelecionada) {
                ctx.fillStyle = "#22c55e";
            } else if (vertice.id === destinoSelecionado) {
                ctx.fillStyle = "#ef4444";
            } else {
                ctx.fillStyle = "#3b82f6";
            }

            ctx.fill();

            // Em grafos pequenos, mostra o nome do vértice
            if (!ehGrafoGrande) {
                ctx.fillStyle = "white";
                ctx.font = `${14 / escala}px Arial`;
                ctx.textAlign = "center";
                ctx.textBaseline = "middle";

                ctx.fillText(
                    vertice.rotulo ?? vertice.id,
                    vertice.x,
                    vertice.y
                );
            }
        });

        // Restaura estado original do canvas
        ctx.restore();
    }, [
        grafo,
        origemSelecionada,
        destinoSelecionado,
        menorCaminho,
        mapaVertices,
        ehGrafoGrande,
        raioVertice,
        escala,
        offset
    ]);

    return (
        <canvas
            ref={canvasRef}
            width={LARGURA_CANVAS}
            height={ALTURA_CANVAS}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onWheel={handleWheel}
            style={{
                cursor: arrasto.current.ativo ? "grabbing" : "grab"
            }}
        />
    );
};