import type { Grafo } from "../../../shared/types/grafo";

const URL_BACKEND = "http://localhost:3000/api/upload";

/**
 * Envia um arquivo de mapa para o backend.
 *
 * O backend recebe o arquivo, identifica a extensão
 * e converte o conteúdo para um objeto Grafo.
 *
 * Formatos aceitos:
 * - .poly
 * - .txt
 * - .osm
 * - .xml
 */
export async function importarGrafo(arquivo: File): Promise<Grafo> {
    // Cria o formulário usado para enviar arquivos via HTTP
    const formData = new FormData();

    // Adiciona o arquivo no campo esperado pelo backend
    formData.append("arquivo", arquivo);

    // Envia o arquivo para a rota de upload
    const resposta = await fetch(URL_BACKEND, {
        method: "POST",
        body: formData
    });

    // Se o backend retornar erro, captura a mensagem
    if (!resposta.ok) {
        const corpo = await resposta.json().catch(() => null);

        const mensagem =
            corpo?.erro ?? `Erro ${resposta.status} ao importar arquivo`;

        throw new Error(mensagem);
    }

    // Retorna o grafo convertido pelo backend
    return resposta.json();
}