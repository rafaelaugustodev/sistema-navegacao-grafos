# Sistema de Navegação em Grafos

Projeto desenvolvido para a disciplina de Algoritmos e Estruturas de Dados II (AED2), com foco na implementação do algoritmo de Dijkstra para cálculo de menor caminho em grafos ponderados.

O sistema permite importar mapas reais (`.osm`, `.xml`, `.poly` e `.txt`), converter os dados em grafos e exibir visualmente a rota de menor custo entre dois vértices selecionados pelo usuário.

## Tecnologias Utilizadas

### Frontend
- React
- TypeScript
- Vite
- Canvas API

### Backend
- Node.js
- Express
- TypeScript
- Multer
- CORS

### Estruturas e Algoritmos
- Dijkstra
- Lista de Adjacência
- MinHeap
- Vetor de Distâncias
- Vetor de Predecessores
- Conjunto de Visitados

## Funcionalidades

- Importação de mapas reais
- Conversão de mapas para grafos
- Criação e edição de vértices e arestas
- Suporte a grafos direcionados e não direcionados
- Seleção visual de origem e destino
- Cálculo do menor caminho
- Exibição gráfica da rota encontrada
- Estatísticas de execução do algoritmo
- Exportação da imagem do grafo

## Organização do Projeto

```txt
frontend/ → Interface gráfica e renderização do grafo
backend/  → API, upload e processamento dos arquivos
shared/   → Estruturas, algoritmos e tipos compartilhados
docs/     → Documentação do projeto
