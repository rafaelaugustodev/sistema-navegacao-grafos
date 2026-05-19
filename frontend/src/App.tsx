import { useEffect, useState } from "react";
import { GrafoCanvas } from "./canvas/GrafoCanvas";
import { PainelLateral } from "./components/PainelLateral";
import { grafosDisponiveis } from "./data/grafoExemplo";
import { dijkstra } from "../../shared/algoritmos/dijkstra";

function App() {

    // Chave do grafo atualmente selecionado no seletor da barra lateral
    const [grafoSelecionado, setGrafoSelecionado] = useState<string>("exemplo");

    const grafo = grafosDisponiveis[grafoSelecionado].grafo;

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

    // Sinaliza que origem e destino foram escolhidos mas não há caminho entre eles
    const [caminhoInexistente, setCaminhoInexistente] = useState<boolean>(false);

    // Limpa toda a saída calculada (caminho, métricas e aviso)
    const limparResultado = () => {
        setMenorCaminho([]);
        setDistanciaTotal(null);
        setTempoExecucaoMs(null);
        setCaminhoInexistente(false);
    };

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
        limparResultado();
    };

    // Limpa origem, destino e caminho calculado (RF03)
    const handleDesfazerSelecao = () => {
        setOrigemSelecionada(null);
        setDestinoSelecionado(null);
        limparResultado();
    };

    // Clique em área vazia do canvas:
    // se já há um caminho traçado, desfaz toda a seleção
    const handleClickFora = () => {
        if (menorCaminho.length > 0) {
            handleDesfazerSelecao();
        }
    };

    // Troca de grafo: zera qualquer seleção/resultado anterior
    const handleSelecionarGrafo = (chave: string) => {
        setGrafoSelecionado(chave);
        setOrigemSelecionada(null);
        setDestinoSelecionado(null);
        limparResultado();
    };

    // Executa Dijkstra quando origem e destino forem selecionados
    useEffect(() => {

        if (!origemSelecionada || !destinoSelecionado) return;

        const resultado = dijkstra(
            grafo,
            origemSelecionada,
            destinoSelecionado
        );

        // null = não há caminho entre origem e destino → sinaliza o aviso
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

    // Resolve os ids do menor caminho em objetos Vertice para exibição no painel
    const verticesCaminho = menorCaminho
        .map((id) => grafo.vertices.find((v) => v.id === id))
        .filter((v): v is NonNullable<typeof v> => v !== undefined);

    return (
        <div style={estilos.layout}>

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
