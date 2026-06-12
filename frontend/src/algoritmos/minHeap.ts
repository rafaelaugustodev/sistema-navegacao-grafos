/**
 * MinHeap é uma fila de prioridade.
 *
 * É usada pelo Dijkstra para sempre pegar
 * o vértice com a menor distância conhecida.
 *
 * A menor prioridade fica sempre no topo do heap.
 */
export class MinHeap<T> {
    private heap: T[] = [];

    private compararPrioridade: (a: T, b: T) => number;

    constructor(compararPrioridade: (a: T, b: T) => number) {
        this.compararPrioridade = compararPrioridade;
    }

    // Quantidade de itens no heap
    get tamanho(): number {
        return this.heap.length;
    }

    // Verifica se o heap está vazio
    estaVazio(): boolean {
        return this.heap.length === 0;
    }

    // Insere um item e reorganiza o heap
    inserir(item: T): void {
        this.heap.push(item);
        this.subir(this.heap.length - 1);
    }

    // Remove e retorna o item de menor prioridade
    extrairMinimo(): T | undefined {
        if (this.heap.length === 0) return undefined;

        const minimo = this.heap[0];
        const ultimo = this.heap.pop()!;

        if (this.heap.length > 0) {
            this.heap[0] = ultimo;
            this.descer(0);
        }

        return minimo;
    }

    // Move um item para cima até ele ficar na posição correta
    private subir(indice: number): void {
        while (indice > 0) {
            const indicePai = Math.floor((indice - 1) / 2);

            const deveTrocar =
                this.compararPrioridade(
                    this.heap[indice],
                    this.heap[indicePai]
                ) < 0;

            if (!deveTrocar) break;

            [this.heap[indice], this.heap[indicePai]] =
                [this.heap[indicePai], this.heap[indice]];

            indice = indicePai;
        }
    }

    // Move um item para baixo até ele ficar na posição correta
    private descer(indice: number): void {
        const tamanho = this.heap.length;

        while (true) {
            const esquerda = 2 * indice + 1;
            const direita = 2 * indice + 2;

            let menor = indice;

            if (
                esquerda < tamanho &&
                this.compararPrioridade(
                    this.heap[esquerda],
                    this.heap[menor]
                ) < 0
            ) {
                menor = esquerda;
            }

            if (
                direita < tamanho &&
                this.compararPrioridade(
                    this.heap[direita],
                    this.heap[menor]
                ) < 0
            ) {
                menor = direita;
            }

            if (menor === indice) break;

            [this.heap[indice], this.heap[menor]] =
                [this.heap[menor], this.heap[indice]];

            indice = menor;
        }
    }
}
