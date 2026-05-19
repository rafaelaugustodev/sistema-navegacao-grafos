import type { Grafo, Vertice } from "../../../shared/types/grafo";

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
    onDesfazerSelecao
}: PainelLateralProps) => {

    // Habilita o botão apenas quando há alguma seleção a desfazer
    const possuiSelecao = origemSelecionada !== null || destinoSelecionado !== null;

    // Métricas derivadas do caminho calculado
    const quantidadeNosExplorados = verticesCaminho.length;
    const quantidadeArestasExploradas = verticesCaminho.length > 0
        ? verticesCaminho.length - 1
        : 0;

    // Só consideramos o resultado válido quando há caminho e não há aviso
    const possuiCaminho = verticesCaminho.length > 0 && !caminhoInexistente;

    return (
        <aside style={estilos.painel}>

            <h1 style={estilos.titulo}>
                Sistema de Navegação
            </h1>

            <section style={estilos.bloco}>

                <h2 style={estilos.subtitulo}>
                    Grafo
                </h2>

                <select
                    value={grafoSelecionado}
                    onChange={(e) => onSelecionarGrafo(e.target.value)}
                    style={estilos.select}
                >
                    {Object.entries(grafosDisponiveis).map(([chave, { nome }]) => (
                        <option key={chave} value={chave}>
                            {nome}
                        </option>
                    ))}
                </select>
            </section>

            <section style={estilos.bloco}>

                <h2 style={estilos.subtitulo}>
                    Seleção
                </h2>

                <p style={estilos.linha}>
                    <span style={estilos.rotulo}>Origem:</span>{" "}
                    <span style={{ color: "#22c55e" }}>
                        {origemSelecionada ?? "—"}
                    </span>
                </p>

                <p style={estilos.linha}>
                    <span style={estilos.rotulo}>Destino:</span>{" "}
                    <span style={{ color: "#ef4444" }}>
                        {destinoSelecionado ?? "—"}
                    </span>
                </p>
            </section>

            <section style={estilos.bloco}>

                <h2 style={estilos.subtitulo}>
                    Dados Gerais
                </h2>

                <p style={estilos.linha}>
                    <span style={estilos.rotulo}>Total de vértices:</span>{" "}
                    <span style={{ color: "#f97316" }}>
                        {totalVertices}
                    </span>
                </p>

                <p style={estilos.linha}>
                    <span style={estilos.rotulo}>Total de arestas:</span>{" "}
                    <span style={{ color: "#f97316" }}>
                        {totalArestas}
                    </span>
                </p>
            </section>

            <section style={estilos.bloco}>

                <h2 style={estilos.subtitulo}>
                    Resultado
                </h2>

                {caminhoInexistente && (
                    <p style={estilos.aviso}>
                        Não existe caminho possível entre os vértices{" "}
                        <strong>{origemSelecionada}</strong> e{" "}
                        <strong>{destinoSelecionado}</strong>.
                    </p>
                )}

                <p style={estilos.linha}>
                    <span style={estilos.rotulo}>Distância total:</span>{" "}
                    {distanciaTotal !== null ? (
                        <span style={{ color: "#f97316" }}>
                            {distanciaTotal}
                        </span>
                    ) : (
                        <span style={estilos.placeholder}>—</span>
                    )}
                </p>

                <p style={estilos.linha}>
                    <span style={estilos.rotulo}>Tempo de execução:</span>{" "}
                    {tempoExecucaoMs !== null ? (
                        <span style={{ color: "#f97316" }}>
                            {tempoExecucaoMs.toFixed(6)} ms
                        </span>
                    ) : (
                        <span style={estilos.placeholder}>—</span>
                    )}
                </p>

                <p style={estilos.linha}>
                    <span style={estilos.rotulo}>Quantidade de nós explorados:</span>{" "}
                    {possuiCaminho ? (
                        <span style={{ color: "#f97316" }}>
                            {quantidadeNosExplorados}
                        </span>
                    ) : (
                        <span style={estilos.placeholder}>—</span>
                    )}
                </p>

                <p style={estilos.linha}>
                    <span style={estilos.rotulo}>Quantidade de arestas exploradas:</span>{" "}
                    {possuiCaminho ? (
                        <span style={{ color: "#f97316" }}>
                            {quantidadeArestasExploradas}
                        </span>
                    ) : (
                        <span style={estilos.placeholder}>—</span>
                    )}
                </p>
            </section>

            <section style={estilos.bloco}>

                <button
                    type="button"
                    onClick={onDesfazerSelecao}
                    disabled={!possuiSelecao}
                    style={{
                        ...estilos.botao,
                        opacity: possuiSelecao ? 1 : 0.5,
                        cursor: possuiSelecao ? "pointer" : "not-allowed"
                    }}
                >
                    Desfazer seleção
                </button>
            </section>

            <section style={estilos.bloco}>

                <h2 style={estilos.subtitulo}>
                    Nós explorados
                </h2>

                {possuiCaminho ? (
                    <ul style={estilos.lista}>
                        {verticesCaminho.map((vertice) => (
                            <li key={vertice.id} style={estilos.linha}>
                                <span style={{ color: "#f97316" }}>{vertice.id}</span>
                                <span style={estilos.rotulo}>
                                    {" "}(x= {vertice.x}, y= {vertice.y})
                                </span>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p style={{ ...estilos.linha, ...estilos.placeholder }}>
                        Nenhum caminho traçado.
                    </p>
                )}
            </section>
        </aside>
    );
};

const estilos = {
    painel: {
        width: "280px",
        height: "100vh",
        background: "#1f2937",
        color: "white",
        padding: "20px",
        boxSizing: "border-box" as const,
        borderRight: "1px solid #374151",
        display: "flex",
        flexDirection: "column" as const,
        gap: "20px",
        overflowY: "auto" as const
    },
    titulo: {
        fontSize: "18px",
        fontWeight: 700,
        margin: 0,
        paddingBottom: "10px",
        borderBottom: "1px solid #374151"
    },
    bloco: {
        display: "flex",
        flexDirection: "column" as const,
        gap: "8px"
    },
    subtitulo: {
        fontSize: "13px",
        fontWeight: 600,
        textTransform: "uppercase" as const,
        letterSpacing: "0.5px",
        color: "#9ca3af",
        margin: 0
    },
    linha: {
        fontSize: "14px",
        margin: 0
    },
    rotulo: {
        color: "#d1d5db"
    },
    placeholder: {
        color: "#6b7280"
    },
    aviso: {
        fontSize: "13px",
        margin: 0,
        padding: "8px 10px",
        background: "rgba(239, 68, 68, 0.15)",
        border: "1px solid #ef4444",
        borderRadius: "6px",
        color: "#fecaca"
    },
    select: {
        background: "#111827",
        color: "white",
        border: "1px solid #4b5563",
        borderRadius: "6px",
        padding: "8px 10px",
        fontSize: "14px"
    },
    botao: {
        background: "#374151",
        color: "white",
        border: "1px solid #4b5563",
        padding: "10px 14px",
        borderRadius: "6px",
        fontSize: "14px",
        fontWeight: 500
    },
    lista: {
        listStyle: "none" as const,
        margin: 0,
        padding: 0,
        display: "flex",
        flexDirection: "column" as const,
        gap: "4px"
    }
};
