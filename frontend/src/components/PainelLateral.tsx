import { useRef } from "react";
import type { Grafo, Vertice } from "../types/grafo";
import "./PainelLateral.css";

type PainelLateralProps = {
    grafosDisponiveis: Record<string, { nome: string; grafo: Grafo }>;
    grafoSelecionado: string;
    onSelecionarGrafo: (chave: string) => void;
    origemSelecionada: string | null;
    destinoSelecionado: string | null;
    distanciaTotal: number | null;
    metrosPorUnidade: number | null;
    tipoViaCaminho: "unica" | "dupla" | "mista" | null;
    tempoExecucaoMs: number | null;
    nosExplorados: number | null;
    totalVertices: number;
    totalArestas: number;
    verticesCaminho: Vertice[];
    caminhoInexistente: boolean;
    ehGrafoGrande: boolean;
    mostrarVertices: boolean;
    mostrarPesos: boolean;
    onAlternarVertices: () => void;
    onAlternarPesos: () => void;
    onDesfazerSelecao: () => void;
    onImportarArquivo: (arquivo: File) => void;
    carregandoUpload: boolean;
    erroUpload: string | null;
    onCriarGrafo: () => void;
    onEditarGrafo: () => void;
    onCopiarImagem: () => void;
    mensagemCopia: string | null;
};

export const PainelLateral = ({
    grafosDisponiveis,
    grafoSelecionado,
    onSelecionarGrafo,
    origemSelecionada,
    destinoSelecionado,
    distanciaTotal,
    metrosPorUnidade,
    tipoViaCaminho,
    tempoExecucaoMs,
    nosExplorados,
    totalVertices,
    totalArestas,
    verticesCaminho,
    caminhoInexistente,
    ehGrafoGrande,
    mostrarVertices,
    mostrarPesos,
    onAlternarVertices,
    onAlternarPesos,
    onDesfazerSelecao,
    onImportarArquivo,
    carregandoUpload,
    erroUpload,
    onCriarGrafo,
    onEditarGrafo,
    onCopiarImagem,
    mensagemCopia
}: PainelLateralProps) => {

    // Verifica se existe origem ou destino selecionado
    const possuiSelecao =
        origemSelecionada !== null ||
        destinoSelecionado !== null;

    // Referência para acessar o input de arquivo escondido
    const inputArquivoRef = useRef<HTMLInputElement>(null);

    // Abre a janela de seleção de arquivo
    const handleClickImportar = () => {
        inputArquivoRef.current?.click();
    };

    // Captura o arquivo escolhido pelo usuário
    const handleMudancaArquivo = (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        const arquivo = event.target.files?.[0];

        if (arquivo) {
            onImportarArquivo(arquivo);
        }

        // Limpa o input para permitir importar o mesmo arquivo novamente
        event.target.value = "";
    };

    // Quantidade de vértices no caminho retornado pelo Dijkstra
    const quantidadeNosNoCaminho = verticesCaminho.length;

    // Quantidade de arestas no caminho
    const quantidadeArestasNoCaminho =
        verticesCaminho.length > 0
            ? verticesCaminho.length - 1
            : 0;

    // Indica se existe um caminho válido calculado
    const possuiCaminho =
        verticesCaminho.length > 0 &&
        !caminhoInexistente;

    // Distância em pixels (unidade do canvas), sem casas decimais
    const distanciaPixels =
        distanciaTotal !== null ? Math.round(distanciaTotal) : null;

    // Distância aproximada em metros, quando a escala do mapa é conhecida
    const distanciaMetros =
        distanciaTotal !== null && metrosPorUnidade !== null
            ? Math.round(distanciaTotal * metrosPorUnidade)
            : null;

    // Texto amigável do tipo de via do trajeto encontrado
    const rotuloTipoVia =
        tipoViaCaminho === "unica"
            ? "Mão única"
            : tipoViaCaminho === "dupla"
                ? "Mão dupla"
                : tipoViaCaminho === "mista"
                    ? "Mista (mão única e dupla)"
                    : null;

    return (
        <aside className="painel">

            <h1 className="painel-titulo">
                Sistema de Navegação
            </h1>

            {/* RF05: ações de criação e edição do grafo no topo do painel */}
            <section className="painel-bloco">
                <button
                    type="button"
                    onClick={onCriarGrafo}
                    className="painel-botao primario"
                >
                    Criar Grafo +
                </button>

                <button
                    type="button"
                    onClick={onEditarGrafo}
                    className="painel-botao"
                >
                    Editar Grafo
                </button>
            </section>

            <section className="painel-bloco">

                <h2 className="painel-subtitulo">
                    Grafo
                </h2>

                {/* Seleção de grafo pré-carregado */}
                <select
                    value={grafoSelecionado}
                    onChange={(event) =>
                        onSelecionarGrafo(event.target.value)
                    }
                    className="painel-select"
                >
                    {Object.entries(grafosDisponiveis).map(
                        ([chave, { nome }]) => (
                            <option key={chave} value={chave}>
                                {nome}
                            </option>
                        )
                    )}
                </select>

                {/* Input escondido para upload de arquivo */}
                <input
                    ref={inputArquivoRef}
                    type="file"
                    accept=".poly,.txt,.osm,.xml"
                    onChange={handleMudancaArquivo}
                    className="painel-input-arquivo"
                />

                {/* Botão visível que aciona o input escondido */}
                <button
                    type="button"
                    onClick={handleClickImportar}
                    disabled={carregandoUpload}
                    className={`painel-botao${carregandoUpload ? " carregando" : ""}`}
                >
                    {carregandoUpload
                        ? "Importando..."
                        : "Importar arquivo (.poly, .txt, .osm)"}
                </button>

                {/* Mensagem de erro do upload */}
                {erroUpload && (
                    <p className="painel-aviso">
                        {erroUpload}
                    </p>
                )}
            </section>

            {/* Opções de exibição: só fazem sentido em mapas grandes,
                onde vértices e pesos ficam ocultos por padrão. */}
            {ehGrafoGrande && (
                <section className="painel-bloco">

                    <h2 className="painel-subtitulo">
                        Exibição
                    </h2>

                    <label className="painel-checkbox">
                        <input
                            type="checkbox"
                            checked={mostrarVertices}
                            onChange={onAlternarVertices}
                        />
                        Mostrar vértices
                    </label>

                    <label className="painel-checkbox">
                        <input
                            type="checkbox"
                            checked={mostrarPesos}
                            onChange={onAlternarPesos}
                        />
                        Mostrar pesos das arestas
                    </label>
                </section>
            )}

            <section className="painel-bloco">

                <h2 className="painel-subtitulo">
                    Seleção
                </h2>

                <p className="painel-linha">
                    <span className="painel-rotulo">Origem:</span>{" "}
                    <span className="cor-origem">
                        {origemSelecionada ?? "—"}
                    </span>
                </p>

                <p className="painel-linha">
                    <span className="painel-rotulo">Destino:</span>{" "}
                    <span className="cor-destino">
                        {destinoSelecionado ?? "—"}
                    </span>
                </p>
            </section>

            <section className="painel-bloco">

                <h2 className="painel-subtitulo">
                    Dados Gerais
                </h2>

                <p className="painel-linha">
                    <span className="painel-rotulo">Total de vértices:</span>{" "}
                    <span className="cor-destaque">
                        {totalVertices}
                    </span>
                </p>

                <p className="painel-linha">
                    <span className="painel-rotulo">Total de arestas:</span>{" "}
                    <span className="cor-destaque">
                        {totalArestas}
                    </span>
                </p>
            </section>

            <section className="painel-bloco">

                <h2 className="painel-subtitulo">
                    Resultado
                </h2>

                {/* Aviso quando não há caminho entre origem e destino */}
                {caminhoInexistente && (
                    <p className="painel-aviso">
                        Não existe caminho possível entre os vértices{" "}
                        <strong>{origemSelecionada}</strong> e{" "}
                        <strong>{destinoSelecionado}</strong>.
                    </p>
                )}

                <p className="painel-linha">
                    <span className="painel-rotulo">Distância total:</span>
                </p>

                <p className="painel-linha painel-subitem">
                    <span className="painel-rotulo">Em pixels:</span>{" "}
                    {distanciaPixels !== null ? (
                        <span className="cor-destaque">
                            {distanciaPixels}
                        </span>
                    ) : (
                        <span className="painel-placeholder">—</span>
                    )}
                </p>

                <p className="painel-linha painel-subitem">
                    <span className="painel-rotulo">Em metros (aprox.):</span>{" "}
                    {distanciaMetros !== null ? (
                        <span className="cor-destaque">
                            {distanciaMetros}
                        </span>
                    ) : (
                        <span className="painel-placeholder">—</span>
                    )}
                </p>

                <p className="painel-linha">
                    <span className="painel-rotulo">Tipo de via no trajeto:</span>{" "}
                    {rotuloTipoVia !== null ? (
                        <span className="cor-destaque">
                            {rotuloTipoVia}
                        </span>
                    ) : (
                        <span className="painel-placeholder">—</span>
                    )}
                </p>

                <p className="painel-linha">
                    <span className="painel-rotulo">Tempo de execução:</span>{" "}
                    {tempoExecucaoMs !== null ? (
                        <span className="cor-destaque">
                            {tempoExecucaoMs.toFixed(6)} ms
                        </span>
                    ) : (
                        <span className="painel-placeholder">—</span>
                    )}
                </p>

                <p className="painel-linha">
                    <span className="painel-rotulo">
                        Nós visitados pelo Dijkstra:
                    </span>{" "}
                    {nosExplorados !== null ? (
                        <span className="cor-destaque">
                            {nosExplorados}
                        </span>
                    ) : (
                        <span className="painel-placeholder">—</span>
                    )}
                </p>

                <p className="painel-linha">
                    <span className="painel-rotulo">
                        Nós no caminho:
                    </span>{" "}
                    {possuiCaminho ? (
                        <span className="cor-destaque">
                            {quantidadeNosNoCaminho}
                        </span>
                    ) : (
                        <span className="painel-placeholder">—</span>
                    )}
                </p>

                <p className="painel-linha">
                    <span className="painel-rotulo">
                        Arestas no caminho:
                    </span>{" "}
                    {possuiCaminho ? (
                        <span className="cor-destaque">
                            {quantidadeArestasNoCaminho}
                        </span>
                    ) : (
                        <span className="painel-placeholder">—</span>
                    )}
                </p>
            </section>

            <section className="painel-bloco">

                {/* Botão para limpar origem, destino e caminho */}
                <button
                    type="button"
                    onClick={onDesfazerSelecao}
                    disabled={!possuiSelecao}
                    className="painel-botao"
                >
                    Desfazer seleção
                </button>

                {/* RF08: copia a imagem do grafo para a área de transferência */}
                <button
                    type="button"
                    onClick={onCopiarImagem}
                    className="painel-botao"
                    title="Copia o canvas atual como imagem PNG"
                >
                    Copiar imagem do grafo
                </button>

                {mensagemCopia && (
                    <p className="painel-dica">{mensagemCopia}</p>
                )}
            </section>

            <section className="painel-bloco">

                <h2 className="painel-subtitulo">
                    Nós explorados
                </h2>

                {/* Lista os vértices que compõem o menor caminho */}
                {possuiCaminho ? (
                    <ul className="painel-lista">
                        {verticesCaminho.map((vertice) => (
                            <li key={vertice.id} className="painel-linha">
                                <span className="cor-destaque">
                                    {vertice.id}
                                </span>

                                <span className="painel-rotulo">
                                    {" "}(x= {vertice.x.toFixed(2)}, y= {vertice.y.toFixed(2)})
                                </span>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="painel-linha painel-placeholder">
                        Nenhum caminho traçado.
                    </p>
                )}
            </section>
        </aside>
    );
};