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
- dotenv

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
- Interface responsiva (desktop, tablet e mobile) com suporte a gestos de toque

## Organização do Projeto

```txt
frontend/  → React + Vite + Canvas (interface, viewport, edição visual)
  src/
    api/         → comunicação com o backend
    algoritmos/  → Dijkstra e MinHeap
    canvas/      → renderização do grafo, zoom/pan
    components/  → Modal, PainelLateral
    edicao/      → editor de grafo (criação e edição via mouse/touch)
    types/       → tipos do Grafo

backend/   → Node.js + Express (upload e parsing dos arquivos de mapa)
  src/
    parsers/     → .poly, .osm/.xml, .txt
    routes/      → /api/upload
    types/       → tipos do Grafo
```

## Documentação e Artefatos

A documentação do projeto, arquivos auxiliares e demais artefatos utilizados no desenvolvimento estão disponíveis em:

[Google Drive - Documentação do Projeto](https://drive.google.com/drive/folders/1GO0rBSrr5jF-awCXLVV6ccvmhYqSQZy-?usp=sharing)

## Pré-requisitos

- Node.js 18 ou superior
- npm (vem com o Node)

## Configuração de Variáveis de Ambiente

Cada projeto possui um `.env.example` na sua raiz. Copie para `.env` e ajuste conforme seu ambiente.

### Backend (`backend/.env`)

```env
PORT=3000
CORS_ORIGIN=http://localhost:5173
```

| Variável | Descrição |
|----------|-----------|
| `PORT` | Porta onde o servidor Express vai rodar |
| `CORS_ORIGIN` | URL do frontend autorizada a fazer requisições. Em produção, use a URL pública. Use `*` para permitir qualquer origem (não recomendado em produção) |

### Frontend (`frontend/.env`)

```env
VITE_API_URL=http://localhost:3000/api
```

| Variável | Descrição |
|----------|-----------|
| `VITE_API_URL` | URL base da API do backend. O upload faz `POST` em `${VITE_API_URL}/upload` |

> **Importante:** todas as variáveis do frontend precisam começar com `VITE_` para serem expostas pelo Vite ao código do cliente.

## Como executar o projeto (desenvolvimento)

### 1. Backend

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

Para testar a API:

```txt
http://localhost:3000/api
```

### 2. Frontend

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

## Deploy em Produção

Cada pasta é completamente autônoma e pode ser publicada em uma plataforma diferente.

> **Ordem recomendada:** primeiro deploy o backend, copie a URL pública gerada e use-a como `VITE_API_URL` no deploy do frontend. Caso contrário, o frontend em produção vai tentar acessar `localhost`.

### Backend (Render, Railway, Fly.io, etc.)

1. Conecte o repositório no serviço escolhido.
2. Aponte o **root directory** para `backend/`.
3. Configure os comandos:
   - **Build:** `npm install && npm run build`
   - **Start:** `npm start`
4. Defina as variáveis de ambiente no painel da plataforma:

   | Variável | Valor |
   |----------|-------|
   | `PORT` | normalmente injetada automaticamente pela plataforma |
   | `CORS_ORIGIN` | URL pública do frontend (ex.: `https://navega-grafos.vercel.app`) |

5. Faça o deploy e copie a URL pública gerada (ex.: `https://navega-grafos-api.onrender.com`).

### Frontend (Vercel, Netlify, Cloudflare Pages, etc.)

1. Conecte o repositório no serviço escolhido.
2. Aponte o **root directory** para `frontend/`.
3. Configure os comandos:
   - **Build:** `npm install && npm run build`
   - **Output:** `dist/`
4. Defina a variável de ambiente:

   | Variável | Valor |
   |----------|-------|
   | `VITE_API_URL` | URL pública do backend + `/api` (ex.: `https://navega-grafos-api.onrender.com/api`) |

5. Faça o deploy.

### Verificação pós-deploy

1. Acesse a URL pública do frontend.
2. Clique em **Importar arquivo** e envie um `.poly` ou `.osm` de teste.
3. Se o mapa carregar, a comunicação entre frontend e backend está funcionando.
4. Caso receba um erro de CORS, verifique se o `CORS_ORIGIN` do backend está exatamente igual ao domínio do frontend (sem barra no final).

## Estrutura dos arquivos `.env`

| Arquivo | Versionado no Git? | Função |
|---------|--------------------|--------|
| `.env.example` | ✅ Sim | Template com nomes das variáveis, sem valores sensíveis |
| `.env` | ❌ Não (está no `.gitignore`) | Valores reais usados em dev local |

Ao clonar o repositório, sempre execute `cp .env.example .env` em cada projeto antes do `npm install`.
