# Sistema de Navegação em Grafos

Projeto desenvolvido para a disciplina de Algoritmos e Estruturas de Dados II (AED2), com foco na aplicação do algoritmo de Dijkstra para encontrar o menor caminho em grafos ponderados.

O sistema permite importar mapas, converter os dados em grafos, editar vértices e arestas e visualizar a menor rota entre dois pontos selecionados pelo usuário.

## Acesso

https://sistema-navegacao-grafos-frontend.onrender.com

## Tecnologias

### Frontend

* React
* TypeScript
* Vite
* Canvas API

### Backend

* Node.js
* Express
* TypeScript
* Multer
* CORS

### Algoritmos e Estruturas

* Dijkstra
* Lista de adjacência
* MinHeap
* Vetor de distâncias
* Vetor de predecessores
* Conjunto de visitados

## Funcionalidades

* Importação de mapas nos formatos `.osm`, `.xml`, `.poly` e `.txt`
* Conversão dos arquivos importados em grafos
* Criação e edição de vértices e arestas
* Suporte a grafos direcionados e não direcionados
* Seleção visual de origem e destino
* Cálculo do menor caminho com Dijkstra
* Exibição gráfica da rota encontrada
* Estatísticas de execução do algoritmo
* Exportação da imagem do grafo
* Interface responsiva para desktop, tablet e mobile

## Estrutura do Projeto

```txt
frontend/
  src/
    api/          comunicação com o backend
    algoritmos/   Dijkstra e MinHeap
    canvas/       renderização, zoom e pan
    components/   componentes da interface
    edicao/       edição visual do grafo
    types/        tipos do grafo

backend/
  src/
    parsers/      leitura de arquivos .osm, .xml, .poly e .txt
    routes/       rotas da API
    types/        tipos do grafo
```

## Documentação

A documentação, os arquivos auxiliares e os demais artefatos do projeto estão disponíveis em:

[Google Drive - Documentação do Projeto](https://drive.google.com/drive/folders/1GO0rBSrr5jF-awCXLVV6ccvmhYqSQZy-?usp=sharing)

## Pré-requisitos

* Node.js 18 ou superior
* npm

## Variáveis de Ambiente

Cada projeto possui um arquivo `.env.example`. Copie esse arquivo para `.env` antes de executar o projeto localmente.

### Backend

Arquivo: `backend/.env`

```env
PORT=3000
CORS_ORIGIN=http://localhost:5173
```

### Frontend

Arquivo: `frontend/.env`

```env
VITE_API_URL=http://localhost:3000/api
```

No Vite, variáveis usadas no frontend precisam começar com `VITE_`.

## Como executar localmente

### Backend

```bash
cd backend
cp .env.example .env
npm install
npm run dev
```

O backend será executado em:

```txt
http://localhost:3000
```

### Frontend

Em outro terminal:

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

O frontend será executado em:

```txt
http://localhost:5173
```

## Observação

Os arquivos `.env` não devem ser versionados no Git. Apenas os arquivos `.env.example` devem ser mantidos no repositório como modelo de configuração.
