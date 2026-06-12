import type { Aresta, Grafo, Vertice } from "../types/grafo.js";

// Constantes usadas na conversão de latitude/longitude para coordenadas UTM
const A_WGS84 = 6378137.0; // raio aproximado da Terra em metros
const F_WGS84 = 1.0 / 298.257223563; // achatamento da Terra
const K0 = 0.9996; // fator de escala da projeção UTM
const LON0_DEG = -45.0; // meridiano central da zona 23S
const REDUTOR = 2; // reduz a escala do mapa para caber melhor no canvas

// Estrutura auxiliar usada apenas durante o parsing do arquivo OSM
type NoOsm = {
  idOriginal: string;
  lat: number;
  lon: number;
  x: number;
  y: number;
};

/**
 * Converte latitude e longitude para coordenadas UTM.
 *
 * Entrada:
 * - latitude em graus
 * - longitude em graus
 *
 * Saída:
 * - x e y em metros
 */
function converterParaUtm(
  latDeg: number,
  lonDeg: number
): { x: number; y: number } {
  const e2 = F_WGS84 * (2 - F_WGS84);
  const ep2 = e2 / (1 - e2);

  const lat = (latDeg * Math.PI) / 180;
  const lon = (lonDeg * Math.PI) / 180;
  const lon0 = (LON0_DEG * Math.PI) / 180;

  const N = A_WGS84 / Math.sqrt(1 - e2 * Math.sin(lat) ** 2);
  const T = Math.tan(lat) ** 2;
  const C = ep2 * Math.cos(lat) ** 2;
  const Aterm = (lon - lon0) * Math.cos(lat);

  // Arco meridional usado no cálculo da projeção UTM
  const M =
    A_WGS84 *
    ((1 - e2 / 4 - (3 * e2 ** 2) / 64 - (5 * e2 ** 3) / 256) * lat -
      ((3 * e2) / 8 + (3 * e2 ** 2) / 32 + (45 * e2 ** 3) / 1024) *
        Math.sin(2 * lat) +
      ((15 * e2 ** 2) / 256 + (45 * e2 ** 3) / 1024) * Math.sin(4 * lat) -
      ((35 * e2 ** 3) / 3072) * Math.sin(6 * lat));

  // Coordenada X da UTM
  const x =
    K0 *
      N *
      (Aterm +
        ((1 - T + C) * Aterm ** 3) / 6 +
        ((5 - 18 * T + T * T + 72 * C - 58 * ep2) * Aterm ** 5) / 120) +
    500000.0;

  // Coordenada Y da UTM
  let y =
    K0 *
    (M +
      N *
        Math.tan(lat) *
        ((Aterm * Aterm) / 2 +
          ((5 - T + 9 * C + 4 * C * C) * Aterm ** 4) / 24 +
          ((61 - 58 * T + T * T + 600 * C - 330 * ep2) * Aterm ** 6) / 720));

  // Ajuste usado no hemisfério sul
  if (latDeg < 0) {
    y += 10000000.0;
  }

  return { x, y };
}

/**
 * Extrai o valor de um atributo XML.
 *
 * Exemplo:
 * linha: '<node id="1" lat="-16.6" lon="-49.2" />'
 * chave: "lat"
 * retorno: "-16.6"
 */
function extrairAtributo(linha: string, chave: string): string | null {
  const regex = new RegExp(`${chave}="([^"]*)"`);
  const match = linha.match(regex);

  return match ? match[1] : null;
}

/**
 * Converte o conteúdo de um arquivo .osm/.xml em um Grafo.
 *
 * O parser:
 * 1. lê os nós do OSM;
 * 2. converte latitude/longitude para x/y;
 * 3. lê as ruas/caminhos do OSM;
 * 4. transforma os caminhos em arestas;
 * 5. retorna o objeto Grafo.
 */
export function parseOsm(texto: string): Grafo {
  const linhas = texto.split(/\r?\n/);

  const nos: NoOsm[] = [];

  // Mapa usado para converter o id original do OSM em índice interno
  const mapaIdOriginalParaIndice = new Map<string, number>();

  // Cada way representa uma sequência de nós conectados.
  // mãoUnica indica se a via é de mão única (tag oneway no OSM).
  const ways: Array<{ indices: number[]; maoUnica: boolean }> = [];

  let dentroDeWay = false;
  let wayAtual: number[] = [];
  let wayMaoUnica = false;

  // Lê o arquivo linha por linha
  for (const linha of linhas) {
    // Lê um nó OSM
    if (
      linha.includes("<node") &&
      linha.includes("lat=") &&
      linha.includes("lon=")
    ) {
      const id = extrairAtributo(linha, "id");
      const latStr = extrairAtributo(linha, "lat");
      const lonStr = extrairAtributo(linha, "lon");

      if (!id || !latStr || !lonStr) continue;

      const lat = Number.parseFloat(latStr);
      const lon = Number.parseFloat(lonStr);

      const { x, y } = converterParaUtm(lat, lon);

      mapaIdOriginalParaIndice.set(id, nos.length);

      nos.push({
        idOriginal: id,
        lat,
        lon,
        x,
        y,
      });
    }

    // Início de um caminho/rua
    else if (linha.includes("<way")) {
      dentroDeWay = true;
      wayAtual = [];
      wayMaoUnica = false;
    }

    // Nó pertencente a uma way
    else if (dentroDeWay && linha.includes("<nd")) {
      const ref = extrairAtributo(linha, "ref");

      if (!ref) continue;

      const indice = mapaIdOriginalParaIndice.get(ref);

      if (indice !== undefined) {
        wayAtual.push(indice);
      }
    }

    // Tag da way: detecta vias de mão única (oneway=yes/true/1/-1)
    else if (dentroDeWay && linha.includes("<tag")) {
      if (extrairAtributo(linha, "k") === "oneway") {
        const valor = extrairAtributo(linha, "v");
        if (
          valor === "yes" ||
          valor === "true" ||
          valor === "1" ||
          valor === "-1"
        ) {
          wayMaoUnica = true;
        }
      }
    }

    // Fim de uma way
    else if (dentroDeWay && linha.includes("</way>")) {
      dentroDeWay = false;

      if (wayAtual.length > 1) {
        ways.push({ indices: wayAtual, maoUnica: wayMaoUnica });
      }
    }
  }

  if (nos.length === 0) {
    throw new Error("Nenhum nó encontrado no arquivo .osm");
  }

  // Ajusta as coordenadas para começar próximo de 0 no canvas
  let minX = nos[0].x;
  let minY = nos[0].y;

  for (const no of nos) {
    if (no.x < minX) minX = no.x;
    if (no.y < minY) minY = no.y;
  }

  for (const no of nos) {
    no.x = (no.x - minX) / REDUTOR;
    no.y = (no.y - minY) / REDUTOR;
  }

  // Inverte o eixo Y para adaptar ao sistema de coordenadas do canvas
  let maxY = nos[0].y;

  for (const no of nos) {
    if (no.y > maxY) maxY = no.y;
  }

  for (const no of nos) {
    no.y = maxY - no.y;
  }

  // Cria os vértices finais do grafo
  const vertices: Vertice[] = nos.map((no, index) => ({
    id: index.toString(),
    x: no.x,
    y: no.y,
  }));

  const arestas: Aresta[] = [];

  let idAresta = 0;

  // Indica se o mapa possui ao menos uma via de mão única
  let possuiMaoUnica = false;

  // Cada par consecutivo de nós em uma way vira uma aresta
  for (const way of ways) {
    if (way.maoUnica) possuiMaoUnica = true;

    for (let i = 0; i < way.indices.length - 1; i++) {
      const origemIdx = way.indices[i];
      const destinoIdx = way.indices[i + 1];

      const dx = nos[destinoIdx].x - nos[origemIdx].x;
      const dy = nos[destinoIdx].y - nos[origemIdx].y;

      arestas.push({
        id: `e${idAresta++}`,
        origem: origemIdx.toString(),
        destino: destinoIdx.toString(),
        distancia: Math.sqrt(dx * dx + dy * dy),
        direcionada: way.maoUnica,
      });
    }
  }

  return {
    vertices,
    arestas,
    ehPonderado: true,
    ehDirecionado: possuiMaoUnica,
    // REDUTOR foi aplicado às coordenadas (que vieram em metros UTM),
    // então cada unidade do canvas vale REDUTOR metros reais.
    metrosPorUnidade: REDUTOR,
  };
}