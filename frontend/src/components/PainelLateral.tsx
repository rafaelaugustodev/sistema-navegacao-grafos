type PainelLateralProps = {
    origemSelecionada: string | null;
    destinoSelecionado: string | null;
    distanciaTotal: number | null;
    tempoExecucaoMs: number | null;
    nosExplorados: number | null;
    onDesfazerSelecao: () => void;
};

export const PainelLateral = ({
    origemSelecionada,
    destinoSelecionado,
    distanciaTotal,
    tempoExecucaoMs,
    nosExplorados,
    onDesfazerSelecao
}: PainelLateralProps) => {

    // Habilita o botão apenas quando há alguma seleção a desfazer
    const possuiSelecao = origemSelecionada !== null || destinoSelecionado !== null;

    return (
        <aside style={estilos.painel}>

            <h1 style={estilos.titulo}>
                Sistema de Navegação
            </h1>

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
                    Resultado
                </h2>

                <p style={estilos.linha}>
                    <span style={estilos.rotulo}>Distância total:</span>{" "}
                    <span style={{ color: "#f97316" }}>
                        {distanciaTotal !== null ? distanciaTotal : "—"}
                    </span>
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
                    <span style={estilos.rotulo}>Nós explorados:</span>{" "}
                    {nosExplorados !== null ? (
                        <span style={{ color: "#f97316" }}>
                            {nosExplorados}
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
    botao: {
        background: "#374151",
        color: "white",
        border: "1px solid #4b5563",
        padding: "10px 14px",
        borderRadius: "6px",
        fontSize: "14px",
        fontWeight: 500
    }
};
