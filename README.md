# Áreas Úmidas / Wetlands — Minas Gerais

Mapa interativo para visualização dos resultados do mapeamento de Áreas Úmidas
em Minas Gerais, Brasil.

## Situação

A plataforma está em desenvolvimento.

A versão atual utiliza inicialmente o produto de classificação disponível para
o Norte de Minas Gerais. O produto estadual completo será incorporado após a
conclusão e validação do processamento.

## Conteúdo da plataforma

- Áreas Úmidas classificadas;
- limite de Minas Gerais;
- municípios;
- Regiões Geográficas Imediatas;
- Regiões Geográficas Intermediárias;
- biomas;
- Unidades de Conservação federais, estaduais e municipais;
- bacias hidrográficas.

## Produto científico

O mapeamento de Áreas Úmidas foi produzido por classificação espacial com
Random Forest, utilizando informações espectrais, topográficas e ambientais.

Resolução nominal do produto científico: 10 m.

A plataforma é destinada à visualização e divulgação dos resultados e não
substitui levantamentos de campo, estudos técnicos específicos ou delimitações
legais.

## Dados e código de modelagem

Amostras de treinamento e validação, código de desenvolvimento do Random
Forest e demais artefatos internos de modelagem não fazem parte deste
repositório público.

O acesso a esses materiais poderá ser solicitado à pesquisadora responsável.

## Estrutura

- index.html
- css/style.css
- js/app.js
- docs/

Os rasters científicos e demais arquivos geoespaciais de maior volume não são
armazenados neste repositório.

## Tecnologias

- MapLibre GL JS
- Cloud Optimized GeoTIFF (COG)
- GeoJSON
- OpenFreeMap

A infraestrutura pública de armazenamento e disponibilização dos dados será
documentada na versão de produção.

## Licenciamento

O código-fonte da interface, incluindo HTML, CSS e JavaScript, é
disponibilizado sob a MIT License.

Mapas, documentação e demais conteúdos originais de autoria do projeto são
disponibilizados sob a Creative Commons Attribution 4.0 International
(CC BY 4.0), salvo indicação em contrário.

Dados, mapas-base e demais materiais de terceiros permanecem sujeitos às
respectivas licenças e requisitos de atribuição de suas fontes originais.

Consulte `LICENSE`, `LICENSE-CODE` e `LICENSE-CONTENT.md`.

## Como citar

A referência científica definitiva do produto de mapeamento será adicionada
após a publicação da tese e/ou do artigo científico correspondente.

Até essa atualização, o repositório não deve ser interpretado como substituto
da referência científica definitiva do produto.

