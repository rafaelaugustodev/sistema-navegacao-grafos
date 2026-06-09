import type { Grafo } from "../../../shared/types/grafo";
import type { ModoEdicao } from "./CanvasEdicao";
import "../components/PainelLateral.css";
import "./PainelEdicao.css";

type TipoGrafo =
    | "ponderado-nao-direcionado"
    | "ponderado-direcionado"
    | "nao-ponderado-nao-direcionado"
    | "nao-ponderado-direcionado";

function tipoDoGrafo(grafo: Grafo): TipoGrafo {
    if (grafo.ehPonderado && grafo.ehDirecionado)
        return "ponderado-direcionado";
    if (grafo.ehPonderado && !grafo.ehDirecionado)
        return "ponderado-nao-direcionado";
    if (!grafo.ehPonderado && grafo.ehDirecionado)
        return "nao-ponderado-direcionado";
    return "nao-ponderado-nao-direcionado";
}

type PainelEdicaoProps = {
    titulo: string;
    grafo: Grafo;
    modo: ModoEdicao;
    mensagem: string | null;
    onMudarTipo: (
        ehPonderado: boolean,
        ehDirecionado: boolean
    ) => void;
    onMudarModo: (modo: ModoEdicao) => void;
    onSalvar: () => void;
    onCancelar: () => void;
};

export const PainelEdicao = ({
    titulo,
    grafo,
    modo,
    mensagem,
    onMudarTipo,
    onMudarModo,
    onSalvar,
    onCancelar
}: PainelEdicaoProps) => {
    const tipoAtual = tipoDoGrafo(grafo);

    const handleMudarTipo = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const tipo = event.target.value as TipoGrafo;
        const ehPonderado = tipo.startsWith("ponderado");
        const ehDirecionado = tipo.endsWith("direcionado") &&
            !tipo.endsWith("nao-direcionado");
        onMudarTipo(ehPonderado, ehDirecionado);
    };

    const podeSalvar = grafo.vertices.length > 0;

    return (
        <aside className="painel">
            <h1 className="painel-titulo">{titulo}</h1>

            <section className="painel-bloco">
                <h2 className="painel-subtitulo">Tipo do grafo</h2>

                <select
                    value={tipoAtual}
                    onChange={handleMudarTipo}
                    className="painel-select"
                >
                    <option value="ponderado-nao-direcionado">
                        Ponderado, não direcionado
                    </option>
                    <option value="ponderado-direcionado">
                        Ponderado, direcionado
                    </option>
                    <option value="nao-ponderado-nao-direcionado">
                        Não ponderado, não direcionado
                    </option>
                    <option value="nao-ponderado-direcionado">
                        Não ponderado, direcionado
                    </option>
                </select>
            </section>

            <section className="painel-bloco">
                <h2 className="painel-subtitulo">Ferramentas</h2>

                <button
                    type="button"
                    className={`painel-botao${modo === "selecionar" ? " ativo" : ""}`}
                    onClick={() => onMudarModo("selecionar")}
                    title="Mover vértices arrastando, ou navegar pelo canvas"
                >
                    Selecionar / arrastar
                </button>

                <button
                    type="button"
                    className={`painel-botao${modo === "adicionar" ? " ativo" : ""}`}
                    onClick={() => onMudarModo("adicionar")}
                >
                    Adicionar nó
                </button>

                <button
                    type="button"
                    className={`painel-botao${modo === "excluir" ? " ativo" : ""}`}
                    onClick={() => onMudarModo("excluir")}
                >
                    Excluir nó
                </button>

                <button
                    type="button"
                    className={`painel-botao${modo === "criar-aresta" ? " ativo" : ""}`}
                    onClick={() => onMudarModo("criar-aresta")}
                >
                    Criar aresta
                </button>
            </section>

            {mensagem && (
                <section className="painel-bloco">
                    <p className="painel-dica">{mensagem}</p>
                </section>
            )}

            <section className="painel-bloco">
                <h2 className="painel-subtitulo">Dados gerais</h2>

                <p className="painel-linha">
                    <span className="painel-rotulo">Total de vértices:</span>{" "}
                    <span className="cor-destaque">{grafo.vertices.length}</span>
                </p>

                <p className="painel-linha">
                    <span className="painel-rotulo">Total de arestas:</span>{" "}
                    <span className="cor-destaque">{grafo.arestas.length}</span>
                </p>
            </section>

            <section className="painel-bloco painel-bloco-final">
                <button
                    type="button"
                    className="painel-botao primario"
                    onClick={onSalvar}
                    disabled={!podeSalvar}
                    title={
                        podeSalvar
                            ? "Salva e aplica o grafo no resto do programa"
                            : "Adicione pelo menos um vértice para salvar"
                    }
                >
                    Salvar
                </button>

                <button
                    type="button"
                    className="painel-botao"
                    onClick={onCancelar}
                >
                    Cancelar
                </button>
            </section>
        </aside>
    );
};
