import { useCallback, useMemo, useState } from "react";
import { GrafoCanvas, LIMITE_GRAFO_GRANDE } from "./canvas/GrafoCanvas";
import { PainelLateral } from "./components/PainelLateral";
import { PainelEdicao } from "./edicao/PainelEdicao";
import { CanvasEdicao, type ModoEdicao } from "./edicao/CanvasEdicao";
import { grafosDisponiveis as grafosBase } from "./data/grafoExemplo";
import { dijkstra } from "../../shared/algoritmos/dijkstra";
import { grafoVazio } from "../../shared/utils/editorGrafo";
import { importarGrafo } from "./api/upload";
import { copiarCanvasParaClipboard } from "./utils/copiarImagem";
import type { Grafo } from "../../shared/types/grafo";
import "./App.css";

type TipoModoEdicao = "criar" | "editar";

function App() {
    // Grafo importado via upload
    const [grafoImportado, setGrafoImportado] = useState<Grafo | null>(null);

    // Grafos criados/editados pelo usuário em runtime (RF05). Não persistem
    // após reload — apenas memória da sessão atual.
    const [grafosCustomizados, setGrafosCustomizados] = useState<
        Record<string, { nome: string; grafo: Grafo }>
    >({});

    // Estado de carregamento do upload
    const [carregandoUpload, setCarregandoUpload] = useState<boolean>(false);

    // Mensagem de erro do upload
    const [erroUpload, setErroUpload] = useState<string | null>(null);

    // Junta os grafos fixos, o importado e os personalizados.
    const grafosDisponiveis = useMemo(() => {
        const base: Record<string, { nome: string; grafo: Grafo }> = {
            ...grafosBase
        };

        if (grafoImportado) {
            base.importado = {
                nome: "Importado (último upload)",
                grafo: grafoImportado
            };
        }

        return { ...base, ...grafosCustomizados };
    }, [grafoImportado, grafosCustomizados]);

    // Controla se o painel lateral está visível
    const [painelVisivel, setPainelVisivel] = useState<boolean>(true);

    // Grafo atualmente selecionado no painel lateral
    const [grafoSelecionado, setGrafoSelecionado] = useState<string>("exemplo");

    // Objeto do grafo atualmente ativo (com fallback ao padrão caso a chave suma)
    const grafo =
        grafosDisponiveis[grafoSelecionado]?.grafo ?? grafosBase.exemplo.grafo;

    // Vértice de origem selecionado pelo usuário
    const [origemSelecionada, setOrigemSelecionada] = useState<string | null>(null);

    // Vértice de destino selecionado pelo usuário
    const [destinoSelecionado, setDestinoSelecionado] = useState<string | null>(null);

    // Em mapas importados (grafos grandes), controlam o que o canvas exibe
    const [mostrarVertices, setMostrarVertices] = useState<boolean>(false);
    const [mostrarPesos, setMostrarPesos] = useState<boolean>(false);

    // RF05: modo de edição ativo. Quando não-nulo, esconde a interface principal.
    const [tipoModoEdicao, setTipoModoEdicao] = useState<TipoModoEdicao | null>(
        null
    );

    // Grafo sendo construído/editado no momento.
    const [grafoEditando, setGrafoEditando] = useState<Grafo | null>(null);

    // Ferramenta ativa no editor (selecionar, adicionar, etc.)
    const [ferramentaEdicao, setFerramentaEdicao] =
        useState<ModoEdicao>("selecionar");

    // Mensagem-guia exibida pelo editor (vinda do CanvasEdicao).
    const [mensagemEdicao, setMensagemEdicao] = useState<string | null>(null);

    // Origem do grafo sendo editado (para nomear a entrada salva).
    const [nomeOrigemEdicao, setNomeOrigemEdicao] = useState<string>("");

    // Feedback transitório do RF08 (copiar imagem).
    const [mensagemCopia, setMensagemCopia] = useState<string | null>(null);

    // Indica se o grafo atual usa a renderização simplificada de mapa
    const ehGrafoGrande = grafo.vertices.length > LIMITE_GRAFO_GRANDE;

    // Resultado do Dijkstra: estado derivado de origem, destino e grafo.
    // Recalculado só quando uma dessas entradas muda; limpar a seleção
    // (origem/destino = null) zera o resultado automaticamente.
    const resultadoDijkstra = useMemo(() => {
        if (!origemSelecionada || !destinoSelecionado) return null;
        return dijkstra(grafo, origemSelecionada, destinoSelecionado);
    }, [origemSelecionada, destinoSelecionado, grafo]);

    // Sequência de vértices do menor caminho (referência estável por resultado)
    const menorCaminho = useMemo(
        () => resultadoDijkstra?.caminho ?? [],
        [resultadoDijkstra]
    );

    // Distância total do menor caminho
    const distanciaTotal = resultadoDijkstra?.distanciaTotal ?? null;

    // Tempo gasto para executar o Dijkstra
    const tempoExecucaoMs = resultadoDijkstra?.tempoExecucaoMs ?? null;

    // Não existe caminho quando origem e destino foram escolhidos mas o
    // Dijkstra não retornou rota.
    const caminhoInexistente =
        origemSelecionada !== null &&
        destinoSelecionado !== null &&
        resultadoDijkstra === null;

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
    };

    // Limpa origem e destino (o resultado é derivado e zera junto)
    const handleDesfazerSelecao = () => {
        setOrigemSelecionada(null);
        setDestinoSelecionado(null);
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
    };

    // Importa um arquivo, ajusta a escala e seleciona o grafo importado
    const handleImportarArquivo = async (arquivo: File) => {
        setCarregandoUpload(true);
        setErroUpload(null);

        try {
            const grafoRecebido = await importarGrafo(arquivo);

            setGrafoImportado(grafoRecebido);
            setGrafoSelecionado("importado");

            setOrigemSelecionada(null);
            setDestinoSelecionado(null);
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

    // RF05: inicia modo "criar grafo" do zero.
    const handleCriarGrafo = () => {
        setGrafoEditando(grafoVazio(true, false));
        setTipoModoEdicao("criar");
        setFerramentaEdicao("adicionar");
        setNomeOrigemEdicao("");
        setMensagemEdicao(null);
    };

    // RF05: inicia modo "editar grafo" a partir do grafo atualmente selecionado.
    const handleEditarGrafo = () => {
        // Cópia profunda para não mutar o grafo original enquanto edita.
        const copia: Grafo = JSON.parse(JSON.stringify(grafo));
        setGrafoEditando(copia);
        setTipoModoEdicao("editar");
        setFerramentaEdicao("selecionar");
        setNomeOrigemEdicao(
            grafosDisponiveis[grafoSelecionado]?.nome ?? "grafo"
        );
        setMensagemEdicao(null);
    };

    // Troca tipo (ponderado/direcionado) do grafo em edição e propaga para
    // todas as arestas existentes — assim o usuário não fica com mistura.
    const handleMudarTipo = (
        ehPonderado: boolean,
        ehDirecionado: boolean
    ) => {
        if (!grafoEditando) return;
        setGrafoEditando({
            ...grafoEditando,
            ehPonderado,
            ehDirecionado,
            arestas: grafoEditando.arestas.map((a) => ({
                ...a,
                direcionada: ehDirecionado,
                // Sem peso → 1 (peso neutro). Não zera pesos já definidos.
                distancia: ehPonderado ? a.distancia : 1
            }))
        });
    };

    // RF05: salva o grafo em edição como entrada nova no dropdown.
    const handleSalvarEdicao = () => {
        if (!grafoEditando) return;

        const chave = `personalizado_${Date.now()}`;
        const nome =
            tipoModoEdicao === "criar"
                ? `Personalizado #${Object.keys(grafosCustomizados).length + 1}`
                : `Editado: ${nomeOrigemEdicao}`;

        setGrafosCustomizados((prev) => ({
            ...prev,
            [chave]: { nome, grafo: grafoEditando }
        }));

        setGrafoSelecionado(chave);
        setOrigemSelecionada(null);
        setDestinoSelecionado(null);
        setTipoModoEdicao(null);
        setGrafoEditando(null);
        setMensagemEdicao(null);
    };

    const handleCancelarEdicao = () => {
        setTipoModoEdicao(null);
        setGrafoEditando(null);
        setMensagemEdicao(null);
    };

    // RF08: copia o canvas atualmente exibido como imagem PNG.
    const handleCopiarImagem = useCallback(async () => {
        // Há um único canvas por vez (modo navegação ou edição).
        const canvas = document.querySelector<HTMLCanvasElement>(
            ".canvas-container canvas"
        );
        if (!canvas) {
            setMensagemCopia("Canvas não encontrado.");
            return;
        }

        const resultado = await copiarCanvasParaClipboard(canvas);
        setMensagemCopia(resultado.mensagem);

        // Limpa a mensagem após alguns segundos para não poluir o painel.
        window.setTimeout(() => setMensagemCopia(null), 4000);
    }, []);

    // Converte os ids do menor caminho em objetos Vertice
    const verticesCaminho = menorCaminho
        .map((id) => grafo.vertices.find((vertice) => vertice.id === id))
        .filter((vertice): vertice is NonNullable<typeof vertice> =>
            vertice !== undefined
        );

    // Classifica o trajeto quanto ao tipo de via (mão única / dupla / mista).
    // Para cada par de vértices consecutivos do caminho, busca a aresta que os
    // liga e lê se ela é direcionada. Mistura de tipos vira "Mista".
    const tipoViaCaminho = useMemo<
        "unica" | "dupla" | "mista" | null
    >(() => {
        if (menorCaminho.length < 2) return null;

        // Lookup O(1): para cada par origem|destino, guarda se é mão única
        const mapaDirecao = new Map<string, boolean>();
        for (const aresta of grafo.arestas) {
            mapaDirecao.set(
                `${aresta.origem}|${aresta.destino}`,
                aresta.direcionada
            );
            // Aresta de mão dupla também responde no sentido inverso
            if (!aresta.direcionada) {
                mapaDirecao.set(`${aresta.destino}|${aresta.origem}`, false);
            }
        }

        let temUnica = false;
        let temDupla = false;

        for (let i = 0; i < menorCaminho.length - 1; i++) {
            const direta = mapaDirecao.get(
                `${menorCaminho[i]}|${menorCaminho[i + 1]}`
            );
            // Se só existe no sentido inverso, é mão dupla (já registrada acima)
            const ehUnica = direta === true;
            if (ehUnica) temUnica = true;
            else temDupla = true;
        }

        if (temUnica && temDupla) return "mista";
        if (temUnica) return "unica";
        return "dupla";
    }, [menorCaminho, grafo]);

    // === Renderização em modo edição (RF05) ===
    if (tipoModoEdicao !== null && grafoEditando !== null) {
        return (
            <div className="app-layout">
                <div className="painel-wrapper">
                    <PainelEdicao
                        titulo={
                            tipoModoEdicao === "criar"
                                ? "Criar Grafo"
                                : "Editar Grafo"
                        }
                        grafo={grafoEditando}
                        modo={ferramentaEdicao}
                        mensagem={mensagemEdicao}
                        onMudarTipo={handleMudarTipo}
                        onMudarModo={setFerramentaEdicao}
                        onSalvar={handleSalvarEdicao}
                        onCancelar={handleCancelarEdicao}
                    />
                </div>

                <main className="app-area-canvas">
                    <CanvasEdicao
                        grafo={grafoEditando}
                        modo={ferramentaEdicao}
                        onGrafoMudou={setGrafoEditando}
                        onMensagem={setMensagemEdicao}
                    />
                </main>
            </div>
        );
    }

    // === Renderização normal (navegação / Dijkstra) ===
    return (
        <div className="app-layout">
            <div className={`painel-wrapper${painelVisivel ? "" : " oculto"}`}>
                <PainelLateral
                    grafosDisponiveis={grafosDisponiveis}
                    grafoSelecionado={grafoSelecionado}
                    onSelecionarGrafo={handleSelecionarGrafo}
                    origemSelecionada={origemSelecionada}
                    destinoSelecionado={destinoSelecionado}
                    distanciaTotal={distanciaTotal}
                    metrosPorUnidade={grafo.metrosPorUnidade ?? null}
                    tipoViaCaminho={tipoViaCaminho}
                    tempoExecucaoMs={tempoExecucaoMs}
                    totalVertices={grafo.vertices.length}
                    totalArestas={grafo.arestas.length}
                    verticesCaminho={verticesCaminho}
                    caminhoInexistente={caminhoInexistente}
                    ehGrafoGrande={ehGrafoGrande}
                    mostrarVertices={mostrarVertices}
                    mostrarPesos={mostrarPesos}
                    onAlternarVertices={() =>
                        setMostrarVertices((valor) => !valor)
                    }
                    onAlternarPesos={() =>
                        setMostrarPesos((valor) => !valor)
                    }
                    onDesfazerSelecao={handleDesfazerSelecao}
                    onImportarArquivo={handleImportarArquivo}
                    carregandoUpload={carregandoUpload}
                    erroUpload={erroUpload}
                    onCriarGrafo={handleCriarGrafo}
                    onEditarGrafo={handleEditarGrafo}
                    onCopiarImagem={handleCopiarImagem}
                    mensagemCopia={mensagemCopia}
                />
            </div>

            <main className="app-area-canvas">
                <button
                    type="button"
                    className="botao-toggle-painel"
                    onClick={() => setPainelVisivel((visivel) => !visivel)}
                    title={painelVisivel ? "Ocultar painel" : "Mostrar painel"}
                >
                    {painelVisivel ? "‹" : "☰"}
                </button>

                <GrafoCanvas
                    grafo={grafo}
                    origemSelecionada={origemSelecionada}
                    destinoSelecionado={destinoSelecionado}
                    menorCaminho={menorCaminho}
                    mostrarVertices={mostrarVertices}
                    mostrarPesos={mostrarPesos}
                    onClickVertice={handleClickVertice}
                    onClickFora={handleClickFora}
                />
            </main>
        </div>
    );
}

export default App;
