import { useEffect, useRef, useState } from "react";
import "./Modal.css";

type ModalProps = {
    aberto: boolean;
    titulo: string;
    mensagem?: string;
    // Quando true, exibe campo de entrada de texto.
    comInput?: boolean;
    valorInicial?: string;
    placeholder?: string;
    textoConfirmar?: string;
    textoCancelar?: string;
    // Devolve string de erro para mostrar inline, ou null se válido.
    validar?: (valor: string) => string | null;
    // Recebe o valor digitado (ou string vazia se não houver input).
    onConfirmar: (valor: string) => void;
    onCancelar: () => void;
};

/**
 * Modal genérico, com suporte opcional a entrada de texto e validação inline.
 * Substitui window.prompt / window.alert para manter o visual integrado.
 *
 * Atalhos: Enter confirma, Esc cancela.
 */
export const Modal = ({
    aberto,
    titulo,
    mensagem,
    comInput = false,
    valorInicial = "",
    placeholder,
    textoConfirmar = "OK",
    textoCancelar = "Cancelar",
    validar,
    onConfirmar,
    onCancelar
}: ModalProps) => {
    const [valor, setValor] = useState(valorInicial);
    const [erro, setErro] = useState<string | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Ao abrir, reseta o estado e foca/seleciona o input se houver.
    useEffect(() => {
        if (!aberto) return;
        setValor(valorInicial);
        setErro(null);
        // setTimeout 0 garante que o input já está montado.
        const id = setTimeout(() => inputRef.current?.select(), 0);
        return () => clearTimeout(id);
    }, [aberto, valorInicial]);

    if (!aberto) return null;

    const handleConfirmar = () => {
        if (validar) {
            const msg = validar(valor);
            if (msg) {
                setErro(msg);
                return;
            }
        }
        onConfirmar(valor);
    };

    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === "Enter") {
            event.preventDefault();
            handleConfirmar();
        } else if (event.key === "Escape") {
            event.preventDefault();
            onCancelar();
        }
    };

    return (
        <div className="modal-overlay" onClick={onCancelar}>
            <div
                className="modal-card"
                onClick={(e) => e.stopPropagation()}
                role="dialog"
                aria-modal="true"
            >
                <h2 className="modal-titulo">{titulo}</h2>

                {mensagem && <p className="modal-mensagem">{mensagem}</p>}

                {comInput && (
                    <input
                        ref={inputRef}
                        className="modal-input"
                        type="text"
                        value={valor}
                        onChange={(e) => {
                            setValor(e.target.value);
                            setErro(null);
                        }}
                        onKeyDown={handleKeyDown}
                        placeholder={placeholder}
                        autoFocus
                    />
                )}

                {erro && <p className="modal-erro">{erro}</p>}

                <div className="modal-acoes">
                    <button
                        type="button"
                        className="modal-botao"
                        onClick={onCancelar}
                    >
                        {textoCancelar}
                    </button>
                    <button
                        type="button"
                        className="modal-botao modal-botao-confirmar"
                        onClick={handleConfirmar}
                    >
                        {textoConfirmar}
                    </button>
                </div>
            </div>
        </div>
    );
};
