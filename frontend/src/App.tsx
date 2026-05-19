import { useEffect, useMemo, useState } from "react";
import { GrafoCanvas } from "./canvas/GrafoCanvas";
import { PainelLateral } from "./components/PainelLateral";
import { grafosDisponiveis as grafosBase } from "./data/grafoExemplo";
import { dijkstra } from "../../shared/algoritmos/dijkstra";
import { importarGrafo } from "./api/upload";
import type { Grafo } from "../../shared/types/grafo";
import "./App.css";

const LARGURA_CANVAS = 1080;
const ALTURA_CANVAS = 720;
const PADDING = 30;

/**
 * Ajusta as coordenadas de um grafo para caber dentro do canvas.
 *
 * Isso é necessário porque arquivos reais podem ter coordenadas muito grandes.
 * A função mantém a proporção original do grafo.
 */
function ajustarEscalaParaCanvas(grafo: Grafo): Grafo {
    if (grafo.vertices.length === 0) return grafo;

    let minX = grafo.vertices[0].x;
    let maxX = grafo.vertices[0].x;
    let minY = grafo.vertices[0].y;
    let maxY = grafo.vertices[0].y;

    // Encontra os limites do grafo
    for (const vertice of grafo.vertices) {
        if (vertice.x < minX) minX = vertice.x;
        if (vertice.x > maxX) maxX = vertice.x;
        if (vertice.y < minY) minY = vertice.y;
        if (vertice.y > maxY) maxY = vertice.y;
    }

    const larguraDisponivel = LARGURA_CANVAS - 2 * PADDING;
    const alturaDisponivel = ALTURA_CANVAS - 2 * PADDING;

    const larguraGrafo = maxX - minX || 1;
    const alturaGrafo = maxY - minY || 1;

    // Calcula o fator de escala sem distorcer o grafo
    const fator = Math.min(
        larguraDisponivel / larguraGrafo,
        alturaDisponivel / alturaGrafo
    );

    return {
        ...grafo,
        vertices: grafo.vertices.map((vertice) => ({
            ...vertice,
            x: PADDING + (vertice.x - minX) * fator,
            y: PADDING + (vertice.y - minY) * fator
        }))
    };
}

function App() {
    // Grafo importado via upload
    const [grafoImportado, setGrafoImportado] = useState<Grafo | null>(null);

    // Estado de carregamento do upload
    const [carregandoUpload, setCarregandoUpload] = useState<boolean>(false);

    // Mensagem de erro do upload
    const [erroUpload, setErroUpload] = useState<string | null>(null);

    // Junta os grafos fixos com o grafo importado, se existir
    const grafosDisponiveis = useMemo(() => {
        if (!grafoImportado) return grafosBase;

        return {
            ...grafosBase,
            importado: {
                nome: "Importado (último upload)",
                grafo: grafoImportado
            }
        };
    }, [grafoImportado]);

    // Grafo atualmente selecionado no painel lateral
    const [grafoSelecionado, setGrafoSelecionado] = useState<string>("exemplo");

    // Objeto do grafo atualmente ativo
    const grafo = grafosDisponiveis[grafoSelecionado].grafo;

    // Vértice de origem selecionado pelo usuário
    const [origemSelecionada, setOrigemSelecionada] = useState<string | null>(null);

    // Vértice de destino selecionado pelo usuário
    const [destinoSelecionado, setDestinoSelecionado] = useState<string | null>(null);

    // Sequência de vértices do menor caminho
    const [menorCaminho, setMenorCaminho] = useState<string[]>([]);

    // Distância total do menor caminho
    const [distanciaTotal, setDistanciaTotal] = useState<number | null>(null);

    // Tempo gasto para executar o Dijkstra
    const [tempoExecucaoMs, setTempoExecucaoMs] = useState<number | null>(null);

    // Indica se não existe caminho entre origem e destino
    const [caminhoInexistente, setCaminhoInexistente] = useState<boolean>(false);

    // Limpa o resultado do Dijkstra
    const limparResultado = () => {
        setMenorCaminho([]);
        setDistanciaTotal(null);
        setTempoExecucaoMs(null);
        setCaminhoInexistente(false);
    };

    // Trata clique em um vértice do canvas
    const handleClickVertice = (verticeId: string) => {
        // Primeiro clique define a origem
        if (!origemSelecionada) {
            setOrigemSelecionada(verticeId);
            return;
        }

        // Segundo clique define o destino
        if (!destinoSelecionado) {
            setDestinoSelecionado(verticeId);
            return;
        }

        // Terceiro clique reinicia a seleção
        setOrigemSelecionada(verticeId);
        setDestinoSelecionado(null);
        limparResultado();
    };

    // Limpa origem, destino e resultado
    const handleDesfazerSelecao = () => {
        setOrigemSelecionada(null);
        setDestinoSelecionado(null);
        limparResultado();
    };

    // Clique fora de um vértice limpa a seleção se já houver caminho traçado
    const handleClickFora = () => {
        if (menorCaminho.length > 0) {
            handleDesfazerSelecao();
        }
    };

    // Troca o grafo selecionado no painel
    const handleSelecionarGrafo = (chave: string) => {
        setGrafoSelecionado(chave);
        setOrigemSelecionada(null);
        setDestinoSelecionado(null);
        limparResultado();
    };

    // Importa um arquivo, ajusta a escala e seleciona o grafo importado
    const handleImportarArquivo = async (arquivo: File) => {
        setCarregandoUpload(true);
        setErroUpload(null);

        try {
            const grafoRecebido = await importarGrafo(arquivo);
            const grafoAjustado = ajustarEscalaParaCanvas(grafoRecebido);

            setGrafoImportado(grafoAjustado);
            setGrafoSelecionado("importado");

            setOrigemSelecionada(null);
            setDestinoSelecionado(null);

            limparResultado();
        } catch (erro) {
            setErroUpload(
                erro instanceof Error
                    ? erro.message
                    : "Erro desconhecido"
            );
        } finally {
            setCarregandoUpload(false);
        }
    };

    // Executa o Dijkstra quando origem e destino forem selecionados
    useEffect(() => {
        if (!origemSelecionada || !destinoSelecionado) return;

        const resultado = dijkstra(
            grafo,
            origemSelecionada,
            destinoSelecionado
        );

        if (!resultado) {
            setMenorCaminho([]);
            setDistanciaTotal(null);
            setTempoExecucaoMs(null);
            setCaminhoInexistente(true);
            return;
        }

        setMenorCaminho(resultado.caminho);
        setDistanciaTotal(resultado.distanciaTotal);
        setTempoExecucaoMs(resultado.tempoExecucaoMs);
        setCaminhoInexistente(false);

    }, [origemSelecionada, destinoSelecionado, grafo]);

    // Converte os ids do menor caminho em objetos Vertice
    const verticesCaminho = menorCaminho
        .map((id) => grafo.vertices.find((vertice) => vertice.id === id))
        .filter((vertice): vertice is NonNullable<typeof vertice> =>
            vertice !== undefined
        );

    return (
        <div className="app-layout">
            <PainelLateral
                grafosDisponiveis={grafosDisponiveis}
                grafoSelecionado={grafoSelecionado}
                onSelecionarGrafo={handleSelecionarGrafo}
                origemSelecionada={origemSelecionada}
                destinoSelecionado={destinoSelecionado}
                distanciaTotal={distanciaTotal}
                tempoExecucaoMs={tempoExecucaoMs}
                totalVertices={grafo.vertices.length}
                totalArestas={grafo.arestas.length}
                verticesCaminho={verticesCaminho}
                caminhoInexistente={caminhoInexistente}
                onDesfazerSelecao={handleDesfazerSelecao}
                onImportarArquivo={handleImportarArquivo}
                carregandoUpload={carregandoUpload}
                erroUpload={erroUpload}
            />

            <main className="app-area-canvas">
                <GrafoCanvas
                    grafo={grafo}
                    origemSelecionada={origemSelecionada}
                    destinoSelecionado={destinoSelecionado}
                    menorCaminho={menorCaminho}
                    onClickVertice={handleClickVertice}
                    onClickFora={handleClickFora}
                />
            </main>
        </div>
    );
}

export default App;