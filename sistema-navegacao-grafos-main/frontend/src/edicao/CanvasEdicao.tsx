import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import type { Grafo } from "../types/grafo";
import {
    adicionarVertice,
    moverVertice,
    removerVertice,
    adicionarAresta
} from "../utils/editorGrafo";
import { desenharGrafo } from "../canvas/desenharGrafo";
import { LIMITE_GRAFO_GRANDE } from "../canvas/GrafoCanvas";
import { Modal } from "../components/Modal";
import "../canvas/GrafoCanvas.css";
import "./CanvasEdicao.css";

// Margem (px) deixada ao redor do grafo no encaixe inicial.
const PADDING_ENCAIXE = 24;

// Distância máxima (em pixels de tela) entre o clique e o vértice mais próximo.
const TOLERANCIA_CLIQUE_PX = 30;

// Limites de zoom relativos ao encaixe inicial.
const ZOOM_MIN_RELATIVO = 0.4;
const ZOOM_MAX_RELATIVO = 50;
const FATOR_ZOOM = 1.15;

export type ModoEdicao =
    | "selecionar"
    | "adicionar"
    | "excluir"
    | "criar-aresta";

type CanvasEdicaoProps = {
    grafo: Grafo;
    modo: ModoEdicao;
    onGrafoMudou: (novo: Grafo) => void;
    // Sinaliza ao painel a próxima ação esperada do usuário.
    onMensagem: (mensagem: string | null) => void;
};

// Calcula encaixe inicial para que o grafo caiba no canvas.
function calcularEncaixe(grafo: Grafo, largura: number, altura: number) {
    if (grafo.vertices.length === 0 || largura === 0 || altura === 0) {
        return { escala: 1, offset: { x: largura / 2, y: altura / 2 } };
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

    const escala = Math.min(
        (largura - 2 * PADDING_ENCAIXE) / larguraGrafo,
        (altura - 2 * PADDING_ENCAIXE) / alturaGrafo,
        2.5
    );

    const offsetX = (largura - larguraGrafo * escala) / 2 - minX * escala;
    const offsetY = (altura - alturaGrafo * escala) / 2 - minY * escala;

    return { escala, offset: { x: offsetX, y: offsetY } };
}

export const CanvasEdicao = ({
    grafo,
    modo,
    onGrafoMudou,
    onMensagem
}: CanvasEdicaoProps) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const [tamanho, setTamanho] = useState({ largura: 0, altura: 0 });

    // Viewport atual (zoom + pan).
    const [escala, setEscala] = useState(1);
    const [offset, setOffset] = useState({ x: 0, y: 0 });
    const [escalaAjuste, setEscalaAjuste] = useState(1);

    // Aplicado apenas no primeiro layout / ao mudar de grafo via "Editar".
    const precisaAjustar = useRef(true);

    const offsetPendenteRef = useRef<{ x: number; y: number } | null>(null);
    const rafIdRef = useRef<number | null>(null);

    const agendarOffset = (novo: { x: number; y: number }) => {
        offsetPendenteRef.current = novo;
        if (rafIdRef.current !== null) return;
        rafIdRef.current = requestAnimationFrame(() => {
            rafIdRef.current = null;
            if (offsetPendenteRef.current) {
                setOffset(offsetPendenteRef.current);
                offsetPendenteRef.current = null;
            }
        });
    };

    useEffect(() => {
        return () => {
            if (rafIdRef.current !== null) {
                cancelAnimationFrame(rafIdRef.current);
            }
        };
    }, []);

    // Estado interno do gesto em curso.
    const arrasto = useRef({
        ativo: false,
        moveu: false,
        // Se preenchido, está arrastando um vértice (não fazendo pan).
        idVertice: null as string | null,
        inicioX: 0,
        inicioY: 0,
        offsetInicialX: 0,
        offsetInicialY: 0,
        verticeInicialX: 0,
        verticeInicialY: 0
    });

    const [arrastando, setArrastando] = useState(false);

    // Primeiro vértice clicado no modo "criar-aresta" — espera o segundo.
    const [arestaOrigem, setArestaOrigem] = useState<string | null>(null);

    // Aresta aguardando peso (modal aberto, esperando o usuário informar).
    const [arestaPendente, setArestaPendente] = useState<
        { origem: string; destino: string } | null
    >(null);

    // Observa tamanho do container.
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

    // Encaixe inicial — só dispara uma vez por sessão de edição.
    // O ref `precisaAjustar` é zerado dentro do bloco, garantindo idempotência.
    useEffect(() => {
        if (
            precisaAjustar.current &&
            tamanho.largura > 0 &&
            tamanho.altura > 0
        ) {
            const encaixe = calcularEncaixe(
                grafo,
                tamanho.largura,
                tamanho.altura
            );
            setEscala(encaixe.escala);
            setOffset(encaixe.offset);
            setEscalaAjuste(encaixe.escala);
            precisaAjustar.current = false;
        }
    }, [tamanho, grafo]);

    // Sai do modo "criar-aresta" → descarta vértice em espera.
    // Padrão "ajustar estado durante render" (React docs, useState):
    // compara o modo anterior usando outro estado, sem precisar de effect.
    const [modoAnterior, setModoAnterior] = useState(modo);
    if (modoAnterior !== modo) {
        setModoAnterior(modo);
        if (modo !== "criar-aresta" && arestaOrigem !== null) {
            setArestaOrigem(null);
        }
    }

    // Mensagens guiando o usuário em cada modo.
    useEffect(() => {
        if (modo === "adicionar") {
            onMensagem("Clique em um espaço vazio para criar um nó.");
        } else if (modo === "excluir") {
            onMensagem("Clique em um nó para excluí-lo (remove arestas também).");
        } else if (modo === "criar-aresta") {
            onMensagem(
                arestaOrigem === null
                    ? "Selecione o primeiro nó da aresta."
                    : `Origem: ${arestaOrigem}. Agora selecione o segundo nó.`
            );
        } else {
            onMensagem(null);
        }
    }, [modo, arestaOrigem, onMensagem]);

    const mapaVertices = useMemo(() => {
        const mapa = new Map<string, (typeof grafo.vertices)[number]>();
        for (const v of grafo.vertices) mapa.set(v.id, v);
        return mapa;
    }, [grafo]);

    // Converte coordenadas de tela para o mundo do grafo.
    const telaParaMundo = (xTela: number, yTela: number) => ({
        x: (xTela - offset.x) / escala,
        y: (yTela - offset.y) / escala
    });

    // Vértice mais próximo do clique dentro da tolerância (ou null).
    //
    // Em mapas importados, os vértices das ruas ficam invisíveis. Vértices
    // criados nesta sessão (visíveis como círculos azuis) têm prioridade:
    // se algum estiver dentro da tolerância, ele vence — mesmo que um vértice
    // de rua oculto esteja a poucos pixels mais perto. Sem isso, clicar em
    // um nó recém-criado às vezes pegava uma esquina invisível ao lado.
    const verticeProximo = (mundoX: number, mundoY: number) => {
        const tolerancia = TOLERANCIA_CLIQUE_PX / escala;

        let melhorNovo: (typeof grafo.vertices)[number] | null = null;
        let menorNovo = Infinity;
        let melhorTodos: (typeof grafo.vertices)[number] | null = null;
        let menorTodos = Infinity;

        for (const v of grafo.vertices) {
            const d = Math.hypot(v.x - mundoX, v.y - mundoY);

            if (d < menorTodos) {
                menorTodos = d;
                melhorTodos = v;
            }

            if (!idsVerticesIniciais.has(v.id) && d < menorNovo) {
                menorNovo = d;
                melhorNovo = v;
            }
        }

        // Prioriza vértices criados nesta sessão se algum está no alcance.
        if (melhorNovo && menorNovo <= tolerancia) return melhorNovo;
        if (melhorTodos && menorTodos <= tolerancia) return melhorTodos;
        return null;
    };

    const posicaoNoCanvas = (event: React.MouseEvent<HTMLCanvasElement>) => {
        const rect = event.currentTarget.getBoundingClientRect();
        return {
            x: event.clientX - rect.left,
            y: event.clientY - rect.top
        };
    };

    const onMouseDown = (event: React.MouseEvent<HTMLCanvasElement>) => {
        const { x, y } = posicaoNoCanvas(event);
        const mundo = telaParaMundo(x, y);

        // No modo "selecionar", arrastar um vértice move-o.
        const verticeSob = verticeProximo(mundo.x, mundo.y);

        if (modo === "selecionar" && verticeSob !== null) {
            arrasto.current = {
                ativo: true,
                moveu: false,
                idVertice: verticeSob.id,
                inicioX: x,
                inicioY: y,
                offsetInicialX: offset.x,
                offsetInicialY: offset.y,
                verticeInicialX: verticeSob.x,
                verticeInicialY: verticeSob.y
            };
            setArrastando(true);
            return;
        }

        // Caso contrário, inicia pan do canvas.
        arrasto.current = {
            ativo: true,
            moveu: false,
            idVertice: null,
            inicioX: x,
            inicioY: y,
            offsetInicialX: offset.x,
            offsetInicialY: offset.y,
            verticeInicialX: 0,
            verticeInicialY: 0
        };
        setArrastando(true);
    };

    const onMouseMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
        if (!arrasto.current.ativo) return;

        const { x, y } = posicaoNoCanvas(event);
        const dx = x - arrasto.current.inicioX;
        const dy = y - arrasto.current.inicioY;

        if (Math.abs(dx) <= 4 && Math.abs(dy) <= 4) return;

        arrasto.current.moveu = true;

        if (arrasto.current.idVertice !== null) {
            // Arrastando vértice: converte delta de tela em delta de mundo.
            const novaX =
                arrasto.current.verticeInicialX + dx / escala;
            const novaY =
                arrasto.current.verticeInicialY + dy / escala;
            onGrafoMudou(
                moverVertice(grafo, arrasto.current.idVertice, novaX, novaY)
            );
        } else {
            agendarOffset({
                x: arrasto.current.offsetInicialX + dx,
                y: arrasto.current.offsetInicialY + dy
            });
        }
    };

    const onMouseUp = (event: React.MouseEvent<HTMLCanvasElement>) => {
        if (!arrasto.current.ativo) return;

        const moveu = arrasto.current.moveu;
        arrasto.current.ativo = false;
        setArrastando(false);

        // Se houve arrasto, não trata como clique.
        if (moveu) return;

        const { x, y } = posicaoNoCanvas(event);
        const mundo = telaParaMundo(x, y);
        const verticeSob = verticeProximo(mundo.x, mundo.y);

        if (modo === "adicionar") {
            // Cria vértice na posição clicada, mesmo se estiver perto de outro.
            onGrafoMudou(adicionarVertice(grafo, mundo.x, mundo.y));
            return;
        }

        if (modo === "excluir") {
            if (verticeSob !== null) {
                onGrafoMudou(removerVertice(grafo, verticeSob.id));
            }
            return;
        }

        if (modo === "criar-aresta") {
            if (verticeSob === null) return;
            if (arestaOrigem === null) {
                setArestaOrigem(verticeSob.id);
                return;
            }
            if (arestaOrigem === verticeSob.id) {
                // Mesmo vértice: cancela a seleção, sem criar laço.
                setArestaOrigem(null);
                return;
            }

            // Em grafos não-ponderados, cria com peso 1 direto.
            if (!grafo.ehPonderado) {
                onGrafoMudou(
                    adicionarAresta(
                        grafo,
                        arestaOrigem,
                        verticeSob.id,
                        1,
                        grafo.ehDirecionado
                    )
                );
                setArestaOrigem(null);
                return;
            }

            // Em ponderados, abre modal para pedir o peso. A criação real
            // acontece no callback de confirmar do modal.
            setArestaPendente({ origem: arestaOrigem, destino: verticeSob.id });
            return;
        }
    };

    const onTouchStart = (event: React.TouchEvent<HTMLCanvasElement>) => {
        if (event.touches.length !== 1) return;
        const touch = event.touches[0];
        const rect = event.currentTarget.getBoundingClientRect();
        const x = touch.clientX - rect.left;
        const y = touch.clientY - rect.top;
        const mundo = telaParaMundo(x, y);
        const verticeSob = verticeProximo(mundo.x, mundo.y);

        if (modo === "selecionar" && verticeSob !== null) {
            arrasto.current = {
                ativo: true,
                moveu: false,
                idVertice: verticeSob.id,
                inicioX: x,
                inicioY: y,
                offsetInicialX: offset.x,
                offsetInicialY: offset.y,
                verticeInicialX: verticeSob.x,
                verticeInicialY: verticeSob.y
            };
            setArrastando(true);
            return;
        }

        arrasto.current = {
            ativo: true,
            moveu: false,
            idVertice: null,
            inicioX: x,
            inicioY: y,
            offsetInicialX: offset.x,
            offsetInicialY: offset.y,
            verticeInicialX: 0,
            verticeInicialY: 0
        };
        setArrastando(true);
    };

    const onTouchMove = (event: React.TouchEvent<HTMLCanvasElement>) => {
        if (!arrasto.current.ativo) return;
        if (event.touches.length !== 1) return;
        const touch = event.touches[0];
        const rect = event.currentTarget.getBoundingClientRect();
        const x = touch.clientX - rect.left;
        const y = touch.clientY - rect.top;
        const dx = x - arrasto.current.inicioX;
        const dy = y - arrasto.current.inicioY;

        if (Math.abs(dx) <= 4 && Math.abs(dy) <= 4) return;

        arrasto.current.moveu = true;

        if (arrasto.current.idVertice !== null) {
            const novaX = arrasto.current.verticeInicialX + dx / escala;
            const novaY = arrasto.current.verticeInicialY + dy / escala;
            onGrafoMudou(
                moverVertice(grafo, arrasto.current.idVertice, novaX, novaY)
            );
        } else {
            agendarOffset({
                x: arrasto.current.offsetInicialX + dx,
                y: arrasto.current.offsetInicialY + dy
            });
        }
    };

    const onTouchEnd = (event: React.TouchEvent<HTMLCanvasElement>) => {
        if (!arrasto.current.ativo) return;

        const moveu = arrasto.current.moveu;
        arrasto.current.ativo = false;
        setArrastando(false);

        if (moveu) return;

        const touch = event.changedTouches[0];
        if (!touch) return;
        const rect = event.currentTarget.getBoundingClientRect();
        const x = touch.clientX - rect.left;
        const y = touch.clientY - rect.top;
        const mundo = telaParaMundo(x, y);
        const verticeSob = verticeProximo(mundo.x, mundo.y);

        if (modo === "adicionar") {
            onGrafoMudou(adicionarVertice(grafo, mundo.x, mundo.y));
            return;
        }

        if (modo === "excluir") {
            if (verticeSob !== null) {
                onGrafoMudou(removerVertice(grafo, verticeSob.id));
            }
            return;
        }

        if (modo === "criar-aresta") {
            if (verticeSob === null) return;
            if (arestaOrigem === null) {
                setArestaOrigem(verticeSob.id);
                return;
            }
            if (arestaOrigem === verticeSob.id) {
                setArestaOrigem(null);
                return;
            }

            if (!grafo.ehPonderado) {
                onGrafoMudou(
                    adicionarAresta(
                        grafo,
                        arestaOrigem,
                        verticeSob.id,
                        1,
                        grafo.ehDirecionado
                    )
                );
                setArestaOrigem(null);
                return;
            }

            setArestaPendente({ origem: arestaOrigem, destino: verticeSob.id });
            return;
        }
    };

    const onWheel = (event: React.WheelEvent<HTMLCanvasElement>) => {
        const rect = event.currentTarget.getBoundingClientRect();
        const cx = event.clientX - rect.left;
        const cy = event.clientY - rect.top;
        const fator = event.deltaY < 0 ? FATOR_ZOOM : 1 / FATOR_ZOOM;

        const minE = escalaAjuste * ZOOM_MIN_RELATIVO;
        const maxE = escalaAjuste * ZOOM_MAX_RELATIVO;
        const novaE = Math.max(minE, Math.min(maxE, escala * fator));
        if (novaE === escala) return;

        const mundoAntes = telaParaMundo(cx, cy);
        setEscala(novaE);
        setOffset({
            x: cx - mundoAntes.x * novaE,
            y: cy - mundoAntes.y * novaE
        });
    };

    // Em grafos grandes (mapas importados), esconde todos os vértices e
    // rótulos de peso durante a edição — caso contrário, desenhar milhares
    // de círculos a cada gesto trava o navegador. Só o vértice selecionado
    // para criar aresta fica visível, como pediu o usuário.
    const ehGrafoGrande = grafo.vertices.length > LIMITE_GRAFO_GRANDE;
    const raioVertice = ehGrafoGrande ? 3 : 18;

    // Snapshot dos ids que JÁ existiam ao entrar no modo edição.
    // Vértices adicionados depois ficam de fora desse set e são desenhados
    // por cima do mapa, mesmo em grafos grandes — assim o usuário vê o que
    // acabou de criar, sem perder a performance da renderização de mapa.
    const [idsVerticesIniciais] = useState(
        () => new Set(grafo.vertices.map((v) => v.id))
    );

    // Redesenha.
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
            // Em modo edição, destaca em verde a origem em espera (aresta).
            origemSelecionada: arestaOrigem,
            destinoSelecionado: null,
            menorCaminho: [],
            // Grafo grande: oculta vértices em massa e pesos das arestas.
            mostrarVertices: !ehGrafoGrande,
            mostrarPesos: !ehGrafoGrande
        });

        // Em mapas, desenha por cima os vértices que NÃO existiam ao entrar
        // no editor — ou seja, os criados pelo próprio usuário nesta sessão.
        if (ehGrafoGrande) {
            ctx.save();
            ctx.translate(offset.x, offset.y);
            ctx.scale(escala, escala);

            const raioTela = 10 / escala;
            const tamanhoFonte = 13 / escala;

            for (const v of grafo.vertices) {
                if (idsVerticesIniciais.has(v.id)) continue;

                ctx.beginPath();
                ctx.arc(v.x, v.y, raioTela, 0, Math.PI * 2);
                ctx.fillStyle = "#3b82f6";
                ctx.fill();
                ctx.lineWidth = 2 / escala;
                ctx.strokeStyle = "white";
                ctx.stroke();

                ctx.fillStyle = "white";
                ctx.font = `${tamanhoFonte}px Arial`;
                ctx.textAlign = "center";
                ctx.textBaseline = "middle";
                ctx.fillText(v.rotulo ?? v.id, v.x, v.y);
            }

            ctx.restore();
        }
    }, [
        grafo,
        mapaVertices,
        escala,
        offset,
        tamanho,
        arestaOrigem,
        ehGrafoGrande,
        raioVertice,
        idsVerticesIniciais
    ]);

    const cursor =
        modo === "adicionar"
            ? "crosshair"
            : modo === "excluir"
                ? "not-allowed"
                : modo === "criar-aresta"
                    ? "cell"
                    : arrastando
                        ? "grabbing"
                        : "grab";

    return (
        <div className="canvas-container" ref={containerRef}>
            <canvas
                ref={canvasRef}
                width={tamanho.largura}
                height={tamanho.altura}
                onMouseDown={onMouseDown}
                onMouseMove={onMouseMove}
                onMouseUp={onMouseUp}
                onWheel={onWheel}
                onTouchStart={onTouchStart}
                onTouchMove={onTouchMove}
                onTouchEnd={onTouchEnd}
                style={{ cursor }}
            />

            <div className="edicao-rodape" data-modo={modo}>
                <span className="edicao-rodape-rotulo">Modo</span>
                <strong>
                    {modo === "adicionar"
                        ? "Adicionar nó"
                        : modo === "excluir"
                            ? "Excluir nó"
                            : modo === "criar-aresta"
                                ? "Criar aresta"
                                : "Selecionar / arrastar"}
                </strong>
            </div>

            <Modal
                aberto={arestaPendente !== null}
                titulo="Peso da aresta"
                mensagem={
                    arestaPendente
                        ? `De ${arestaPendente.origem} para ${arestaPendente.destino}`
                        : undefined
                }
                comInput
                valorInicial="1"
                placeholder="Ex.: 5"
                validar={(valor) => {
                    const numero = Number(valor.replace(",", "."));
                    if (!Number.isFinite(numero) || numero <= 0) {
                        return "Peso inválido. Use um número positivo (ex.: 5).";
                    }
                    return null;
                }}
                onConfirmar={(valor) => {
                    if (!arestaPendente) return;
                    const distancia = Number(valor.replace(",", "."));
                    onGrafoMudou(
                        adicionarAresta(
                            grafo,
                            arestaPendente.origem,
                            arestaPendente.destino,
                            distancia,
                            grafo.ehDirecionado
                        )
                    );
                    setArestaPendente(null);
                    setArestaOrigem(null);
                }}
                onCancelar={() => {
                    setArestaPendente(null);
                    setArestaOrigem(null);
                }}
            />
        </div>
    );
};
