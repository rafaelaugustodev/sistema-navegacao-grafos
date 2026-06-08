/**
 * RF08: copia o conteúdo do <canvas> do grafo para a área de transferência
 * como uma imagem PNG. Usa a Clipboard API nativa do navegador — não
 * depende de backend nem de bibliotecas externas.
 */

export type ResultadoCopia = {
    sucesso: boolean;
    mensagem: string;
};

export async function copiarCanvasParaClipboard(
    canvas: HTMLCanvasElement
): Promise<ResultadoCopia> {
    // ClipboardItem com imagem só está disponível em ambientes seguros
    // (localhost ou HTTPS) e em navegadores que suportam image/png no clipboard.
    if (
        typeof window === "undefined" ||
        typeof window.ClipboardItem === "undefined" ||
        !navigator.clipboard ||
        typeof navigator.clipboard.write !== "function"
    ) {
        return {
            sucesso: false,
            mensagem:
                "Seu navegador não suporta copiar imagens para a área de transferência."
        };
    }

    const blob = await new Promise<Blob | null>((resolver) => {
        canvas.toBlob((b) => resolver(b), "image/png");
    });

    if (!blob) {
        return {
            sucesso: false,
            mensagem: "Não foi possível gerar a imagem do grafo."
        };
    }

    try {
        await navigator.clipboard.write([
            new ClipboardItem({ "image/png": blob })
        ]);
        return {
            sucesso: true,
            mensagem: "Imagem do grafo copiada para a área de transferência."
        };
    } catch (erro) {
        return {
            sucesso: false,
            mensagem:
                erro instanceof Error
                    ? `Falha ao copiar: ${erro.message}`
                    : "Falha ao copiar imagem."
        };
    }
}
