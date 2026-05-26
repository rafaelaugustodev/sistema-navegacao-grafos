import { useEffect, useRef, useState } from "react";

// Sensibilidade do zoom
const FATOR_ZOOM = 1.15;        // por "tique" da roda do mouse
const FATOR_ZOOM_BOTAO = 1.4;   // por clique nos botões (passo maior)

// Limites de zoom RELATIVOS ao encaixe inicial.
const ZOOM_MIN_RELATIVO = 0.4;
const ZOOM_MAX_RELATIVO = 50;

// Movimento máximo (em pixels) ainda considerado clique, não arrasto
const LIMITE_CLIQUE = 4;

type Viewport = {
    escala: number;
    offset: { x: number; y: number };
};

type OpcoesZoomPan = {
    // Clique de verdade (sem arrastar), já em coordenadas do "mundo" do grafo.
    onClique: (mundoX: number, mundoY: number) => void;
    // Encaixe do grafo na tela (escala + offset que fazem ele caber).
    ajuste: Viewport;
    // Quando esta chave muda (ex.: troca de grafo), a visão volta ao encaixe.
    // Redimensionar o canvas NÃO reseta a visão — só revela mais espaço.
    chaveReset: unknown;
    // Dimensões atuais do canvas, usadas para zoom centrado pelos botões.
    largura: number;
    altura: number;
};

/**
 * Gerencia o "viewport" do canvas: zoom (roda/botões) e pan (arrastar).
 *
 * Encaixa o grafo na tela quando ele é carregado (ou ao clicar em "ajustar"),
 * mas mantém a visão estável ao redimensionar — assim fechar o painel não faz
 * o mapa pular nem resetar o zoom do usuário.
 */
export function useZoomPan({
    onClique,
    ajuste,
    chaveReset,
    largura,
    altura
}: OpcoesZoomPan) {
    const [escala, setEscala] = useState(ajuste.escala);
    const [offset, setOffset] = useState(ajuste.offset);

    // Escala do encaixe que está valendo como "100%" na barra de zoom.
    const [escalaAjuste, setEscalaAjuste] = useState(ajuste.escala);

    // Espelha o estado de arrasto para o render (o ref não pode ser lido no
    // corpo do componente). Usado só para trocar o cursor.
    const [arrastando, setArrastando] = useState(false);

    // Sinaliza que a visão precisa ser reencaixada (grafo novo, ainda sem fit).
    const precisaAjustar = useRef(true);

    const arrasto = useRef({
        ativo: false,
        inicioX: 0,
        inicioY: 0,
        offsetInicialX: 0,
        offsetInicialY: 0,
        moveu: false
    });

    // Troca de grafo marca que precisa reencaixar.
    useEffect(() => {
        precisaAjustar.current = true;
    }, [chaveReset]);

    // Aplica o encaixe quando há um pendente E o canvas já tem tamanho válido.
    // Redimensionamentos posteriores não entram aqui (precisaAjustar = false).
    useEffect(() => {
        if (precisaAjustar.current && largura > 0 && altura > 0) {
            setEscala(ajuste.escala);
            setOffset(ajuste.offset);
            setEscalaAjuste(ajuste.escala);
            precisaAjustar.current = false;
        }
    }, [ajuste, largura, altura]);

    const telaParaMundo = (xTela: number, yTela: number) => ({
        x: (xTela - offset.x) / escala,
        y: (yTela - offset.y) / escala
    });

    const posicaoNoCanvas = (event: React.MouseEvent<HTMLCanvasElement>) => {
        const rect = event.currentTarget.getBoundingClientRect();
        return {
            x: event.clientX - rect.left,
            y: event.clientY - rect.top
        };
    };

    const onMouseDown = (event: React.MouseEvent<HTMLCanvasElement>) => {
        const { x, y } = posicaoNoCanvas(event);
        arrasto.current = {
            ativo: true,
            inicioX: x,
            inicioY: y,
            offsetInicialX: offset.x,
            offsetInicialY: offset.y,
            moveu: false
        };
        setArrastando(true);
    };

    const onMouseMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
        if (!arrasto.current.ativo) return;

        const { x, y } = posicaoNoCanvas(event);
        const dx = x - arrasto.current.inicioX;
        const dy = y - arrasto.current.inicioY;

        if (Math.abs(dx) > LIMITE_CLIQUE || Math.abs(dy) > LIMITE_CLIQUE) {
            arrasto.current.moveu = true;
            setOffset({
                x: arrasto.current.offsetInicialX + dx,
                y: arrasto.current.offsetInicialY + dy
            });
        }
    };

    const onMouseUp = (event: React.MouseEvent<HTMLCanvasElement>) => {
        if (!arrasto.current.ativo) return;

        if (arrasto.current.moveu) {
            arrasto.current.ativo = false;
            setArrastando(false);
            return;
        }
        arrasto.current.ativo = false;
        setArrastando(false);

        const { x, y } = posicaoNoCanvas(event);
        const mundo = telaParaMundo(x, y);
        onClique(mundo.x, mundo.y);
    };

    const aplicarZoom = (fator: number, centroX: number, centroY: number) => {
        const minEscala = escalaAjuste * ZOOM_MIN_RELATIVO;
        const maxEscala = escalaAjuste * ZOOM_MAX_RELATIVO;

        const novaEscala = Math.max(
            minEscala,
            Math.min(maxEscala, escala * fator)
        );
        if (novaEscala === escala) return;

        const mundoAntes = telaParaMundo(centroX, centroY);
        setEscala(novaEscala);
        setOffset({
            x: centroX - mundoAntes.x * novaEscala,
            y: centroY - mundoAntes.y * novaEscala
        });
    };

    const onWheel = (event: React.WheelEvent<HTMLCanvasElement>) => {
        const rect = event.currentTarget.getBoundingClientRect();
        const mouseX = event.clientX - rect.left;
        const mouseY = event.clientY - rect.top;
        const fator = event.deltaY < 0 ? FATOR_ZOOM : 1 / FATOR_ZOOM;
        aplicarZoom(fator, mouseX, mouseY);
    };

    const ampliar = () => aplicarZoom(FATOR_ZOOM_BOTAO, largura / 2, altura / 2);
    const reduzir = () => aplicarZoom(1 / FATOR_ZOOM_BOTAO, largura / 2, altura / 2);

    // Reencaixa na visão atual do canvas (usado pelo botão "ajustar à tela").
    const resetarVisao = () => {
        setEscala(ajuste.escala);
        setOffset(ajuste.offset);
        setEscalaAjuste(ajuste.escala);
    };

    return {
        escala,
        offset,
        escalaAjuste,
        arrastando,
        handlers: { onMouseDown, onMouseMove, onMouseUp, onWheel },
        ampliar,
        reduzir,
        resetarVisao
    };
}
