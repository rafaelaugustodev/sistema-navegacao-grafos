import { useRef } from "react";
import type { Grafo, Vertice } from "../../../shared/types/grafo";
import "./PainelLateral.css";

type PainelLateralProps = {
    grafosDisponiveis: Record<string, { nome: string; grafo: Grafo }>;
    grafoSelecionado: string;
    onSelecionarGrafo: (chave: string) => void;
    origemSelecionada: string | null;
    destinoSelecionado: string | null;
    distanciaTotal: number | null;
    tempoExecucaoMs: number | null;
    totalVertices: number;
    totalArestas: number;
    verticesCaminho: Vertice[];
    caminhoInexistente: boolean;
    onDesfazerSelecao: () => void;
    onImportarArquivo: (arquivo: File) => void;
    carregandoUpload: boolean;
    erroUpload: string | null;
};

export const PainelLateral = ({
    grafosDisponiveis,
    grafoSelecionado,
    onSelecionarGrafo,
    origemSelecionada,
    destinoSelecionado,
    distanciaTotal,
    tempoExecucaoMs,
    totalVertices,
    totalArestas,
    verticesCaminho,
    caminhoInexistente,
    onDesfazerSelecao,
    onImportarArquivo,
    carregandoUpload,
    erroUpload
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
    const quantidadeNosExplorados = verticesCaminho.length;

    // Quantidade de arestas no caminho
    const quantidadeArestasExploradas =
        verticesCaminho.length > 0
            ? verticesCaminho.length - 1
            : 0;

    // Indica se existe um caminho válido calculado
    const possuiCaminho =
        verticesCaminho.length > 0 &&
        !caminhoInexistente;

    return (
        <aside className="painel">

            <h1 className="painel-titulo">
                Sistema de Navegação
            </h1>

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
                    <span className="painel-rotulo">Distância total:</span>{" "}
                    {distanciaTotal !== null ? (
                        <span className="cor-destaque">
                            {distanciaTotal}
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
                        Quantidade de nós explorados:
                    </span>{" "}
                    {possuiCaminho ? (
                        <span className="cor-destaque">
                            {quantidadeNosExplorados}
                        </span>
                    ) : (
                        <span className="painel-placeholder">—</span>
                    )}
                </p>

                <p className="painel-linha">
                    <span className="painel-rotulo">
                        Quantidade de arestas exploradas:
                    </span>{" "}
                    {possuiCaminho ? (
                        <span className="cor-destaque">
                            {quantidadeArestasExploradas}
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
                                    {" "}(x= {vertice.x}, y= {vertice.y})
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