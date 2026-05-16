import { useEffect, useState } from "react";
import { GrafoCanvas } from "./canvas/GrafoCanvas";
import { PainelLateral } from "./components/PainelLateral";
import { grafoExemplo } from "./data/grafoExemplo";
import { dijkstra } from "../../shared/algoritmos/dijkstra";

function App() {

    // Grafo atual (por enquanto, apenas o exemplo hardcoded)
    const grafo = grafoExemplo;

    // Estado que armazena vértice de origem
    const [origemSelecionada, setOrigemSelecionada] = useState<string | null>(null);

    // Estado que armazena vértice de destino
    const [destinoSelecionado, setDestinoSelecionado] = useState<string | null>(null);

    // Estado que armazena o menor caminho encontrado
    const [menorCaminho, setMenorCaminho] = useState<string[]>([]);

    // Estado que armazena a distância total do caminho
    const [distanciaTotal, setDistanciaTotal] = useState<number | null>(null);

    // Tempo de execução do Dijkstra na última chamada (em milissegundos) — RF07
    const [tempoExecucaoMs, setTempoExecucaoMs] = useState<number | null>(null);

    // Quantidade de nós explorados pelo Dijkstra na última chamada — RF07
    const [nosExplorados, setNosExplorados] = useState<number | null>(null);

    // Decide o que fazer quando o usuário clica em um vértice
    const handleClickVertice = (verticeId: string) => {

        // Primeiro clique define origem
        if (!origemSelecionada) {
            setOrigemSelecionada(verticeId);
            return;
        }

        // Segundo clique define destino
        if (!destinoSelecionado) {
            setDestinoSelecionado(verticeId);
            return;
        }

        // Terceiro clique reinicia seleção
        setOrigemSelecionada(verticeId);
        setDestinoSelecionado(null);
        setMenorCaminho([]);
        setDistanciaTotal(null);
        setTempoExecucaoMs(null);
        setNosExplorados(null);
    };

    // Limpa origem, destino e caminho calculado (RF03)
    const handleDesfazerSelecao = () => {
        setOrigemSelecionada(null);
        setDestinoSelecionado(null);
        setMenorCaminho([]);
        setDistanciaTotal(null);
        setTempoExecucaoMs(null);
        setNosExplorados(null);
    };

    // Clique em área vazia do canvas:
    // se já há um caminho traçado, desfaz toda a seleção
    const handleClickFora = () => {
        if (menorCaminho.length > 0) {
            handleDesfazerSelecao();
        }
    };

    // Executa Dijkstra quando origem e destino forem selecionados
    useEffect(() => {

        if (!origemSelecionada || !destinoSelecionado) return;

        const resultado = dijkstra(
            grafo,
            origemSelecionada,
            destinoSelecionado
        );

        if (!resultado) return;

        setMenorCaminho(resultado.caminho);
        setDistanciaTotal(resultado.distanciaTotal);
        setTempoExecucaoMs(resultado.tempoExecucaoMs);
        setNosExplorados(resultado.nosExplorados);

    }, [origemSelecionada, destinoSelecionado, grafo]);

    return (
        <div style={estilos.layout}>

            <PainelLateral
                origemSelecionada={origemSelecionada}
                destinoSelecionado={destinoSelecionado}
                distanciaTotal={distanciaTotal}
                tempoExecucaoMs={tempoExecucaoMs}
                nosExplorados={nosExplorados}
                onDesfazerSelecao={handleDesfazerSelecao}
            />

            <main style={estilos.areaCanvas}>
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

const estilos = {
    layout: {
        display: "flex",
        width: "100%",
        height: "100vh"
    },
    areaCanvas: {
        flex: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#111827"
    }
};

export default App;
