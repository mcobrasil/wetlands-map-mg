import * as maplibregl
from 'https://unpkg.com/maplibre-gl@^6.16.0/dist/maplibre-gl.mjs';

const cogUrl =
 new URL('../NORTH/MG_RF_NORTH_AU_binary_WEB_3857_256.tif',
         window.location.href).href;

const urls = {
 mg: new URL('../vectors/mg_limite.geojson',window.location.href).href,
 municipios: new URL('../vectors/mg_municipios.geojson',window.location.href).href,
 imediatas: new URL('../vectors/mg_regioes_imediatas.geojson',window.location.href).href,
 intermediarias: new URL('../vectors/mg_regioes_intermediarias.geojson',window.location.href).href,
 biomas: new URL('../vectors/mg_biomas.geojson',window.location.href).href,
 uc_federal: new URL('../vectors/mg_uc_federais.geojson',window.location.href).href,
 uc_estadual: new URL('../vectors/mg_uc_estaduais.geojson',window.location.href).href,
 uc_municipal: new URL('../vectors/mg_uc_municipais.geojson',window.location.href).href,
 bacias: new URL('../vectors/mg_bacias_hidrograficas.geojson',window.location.href).href
};

maplibregl.addProtocol('cog',MaplibreCOGProtocol.cogProtocol);

MaplibreCOGProtocol.setColorFunction(
 cogUrl,
 (pixel,color,metadata)=>{
   const v=pixel[0];
   if(v===metadata.noData || v===0) color.set([0,0,0,0]);
   else if(v===1) color.set([53,185,230,255]);
   else color.set([0,0,0,0]);
 }
);

const map=new maplibregl.Map({
 container:'map',
 style:'https://tiles.openfreemap.org/styles/liberty',
 center:[-44.5,-16],
 zoom:6
});

map.addControl(new maplibregl.NavigationControl(),'top-right');
map.addControl(new maplibregl.ScaleControl({maxWidth:120,unit:'metric'}),'bottom-left');

let initialBounds=null;

const vectorDefs = {
 mg:{
   url:urls.mg,
   visible:true,
   color:'#303030',
   width:2.3,
   dash:null
 },
 municipios:{
   url:urls.municipios,
   visible:false,
   color:'#656565',
   width:0.8,
   dash:null
 },
 imediatas:{
   url:urls.imediatas,
   visible:false,
   color:'#e07a00',
   width:1.5,
   dash:[4,2]
 },
 intermediarias:{
   url:urls.intermediarias,
   visible:false,
   color:'#7b2cbf',
   width:1.8,
   dash:null
 },
 biomas:{
   url:urls.biomas,
   visible:false,
   color:'#26894a',
   width:1.8,
   dash:[4,2]
 },
 uc_federal:{
   url:urls.uc_federal,
   visible:false,
   color:'#4C3F91',
   width:1.7,
   dash:null
 },
 uc_estadual:{
   url:urls.uc_estadual,
   visible:false,
   color:'#8B3A62',
   width:1.7,
   dash:null
 },
 uc_municipal:{
   url:urls.uc_municipal,
   visible:false,
   color:'#C9738A',
   width:1.5,
   dash:null
 },
 bacias:{
   url:urls.bacias,
   visible:false,
   color:'#183B66',
   width:1.8,
   dash:[6,3]
 }
};

map.on('load',async()=>{

  // ---------------------------------------------------------
  // RASTER
  // ---------------------------------------------------------

  map.addSource('wetlands',{
    type:'raster',
    url:`cog://${cogUrl}`,
    tileSize:256
  });

  map.addLayer({
    id:'wetlands',
    type:'raster',
    source:'wetlands',
    paint:{
      'raster-opacity':0.75,
      'raster-resampling':'nearest'
    }
  });

  // ---------------------------------------------------------
  // VETORES
  // ---------------------------------------------------------

  for(const [key,d] of Object.entries(vectorDefs)){

    map.addSource(key,{
      type:'geojson',
      data:d.url
    });

    // Fill quase invisível apenas para facilitar clique/hover
    map.addLayer({
      id:key+'-hit',
      type:'fill',
      source:key,
      layout:{
        visibility:d.visible?'visible':'none'
      },
      paint:{
        'fill-color':'#ffffff',
        'fill-opacity':0.001
      }
    });

    if(key==='biomas'){

      map.addLayer({
        id:'biomas-fill',
        type:'fill',
        source:key,
        layout:{
          visibility:d.visible?'visible':'none'
        },
        paint:{
          'fill-color':[
            'match',
            ['get','Bioma'],
            'Mata Atlântica','#1B5E20',
            'Cerrado','#6B7435',
            'Caatinga','#B45F3C',
            '#94a3b8'
          ],
          'fill-opacity':0.18
        }
      });

    }

    if(key.startsWith('uc_')){

      map.addLayer({
        id:key+'-fill',
        type:'fill',
        source:key,
        layout:{
          visibility:d.visible?'visible':'none'
        },
        paint:{
          'fill-color':d.color,
          'fill-opacity':0.12
        }
      });

    }

    const paint={
      'line-color':
        key==='biomas'
        ? [
            'match',
            ['get','Bioma'],
            'Mata Atlântica','#1B5E20',
            'Cerrado','#6B7435',
            'Caatinga','#B45F3C',
            '#64748b'
          ]
        : d.color,
      'line-width':d.width,
      'line-opacity':0.9
    };

    if(d.dash) paint['line-dasharray']=d.dash;

    map.addLayer({
      id:key+'-line',
      type:'line',
      source:key,
      layout:{
        visibility:d.visible?'visible':'none'
      },
      paint:paint
    });

  }

  // ---------------------------------------------------------
  // EXTENSÃO INICIAL = COG NORTE
  // ---------------------------------------------------------

  try{
    const metadata=await MaplibreCOGProtocol.getCogMetadata(cogUrl);

    if(metadata.bbox){

      initialBounds=[
        [metadata.bbox[0],metadata.bbox[1]],
        [metadata.bbox[2],metadata.bbox[3]]
      ];

      map.fitBounds(initialBounds,{
        padding:{top:50,bottom:45,left:360,right:45},
        duration:0
      });
    }

  }catch(err){
    console.warn(err);
  }

});

// -----------------------------------------------------------
// CONTROLES
// -----------------------------------------------------------

function toggleVector(key,visible){
  const state=visible?'visible':'none';
  map.setLayoutProperty(key+'-line','visibility',state);
  map.setLayoutProperty(key+'-hit','visibility',state);

  if(key==='biomas' && map.getLayer('biomas-fill')){
    map.setLayoutProperty('biomas-fill','visibility',state);
  }

  if(key.startsWith('uc_') && map.getLayer(key+'-fill')){
    map.setLayoutProperty(key+'-fill','visibility',state);
  }
}

document.getElementById('toggle-wetlands')
.addEventListener('change',e=>{
 map.setLayoutProperty(
   'wetlands','visibility',
   e.target.checked?'visible':'none'
 );
});

[
 ['mg','toggle-mg'],
 ['municipios','toggle-municipios'],
 ['imediatas','toggle-imediatas'],
 ['intermediarias','toggle-intermediarias'],
 ['uc_federal','toggle-uc-federal'],
 ['uc_estadual','toggle-uc-estadual'],
 ['uc_municipal','toggle-uc-municipal'],
 ['bacias','toggle-bacias']
].forEach(([key,id])=>{
 document.getElementById(id).addEventListener('change',e=>{
   toggleVector(key,e.target.checked);
 });
});

// -----------------------------------------------------------
// BIOMAS — CONTROLES INDEPENDENTES
// Uma única fonte GeoJSON; seleção feita por filtro.
// -----------------------------------------------------------

const biomeControls = {
  'toggle-bioma-mata':'Mata Atlântica',
  'toggle-bioma-cerrado':'Cerrado',
  'toggle-bioma-caatinga':'Caatinga'
};

function updateBiomes(){

  const selected=[];

  for(const [id,name] of Object.entries(biomeControls)){
    const el=document.getElementById(id);

    if(el && el.checked){
      selected.push(name);
    }
  }

  const layerIds=[
    'biomas-line',
    'biomas-fill',
    'biomas-hit'
  ];

  const visibility=
    selected.length ? 'visible' : 'none';

  const filter=[
    'in',
    ['get','Bioma'],
    ['literal',selected]
  ];

  for(const layerId of layerIds){

    if(map.getLayer(layerId)){

      map.setFilter(
        layerId,
        filter
      );

      map.setLayoutProperty(
        layerId,
        'visibility',
        visibility
      );
    }
  }
}

for(const id of Object.keys(biomeControls)){

  document
    .getElementById(id)
    .addEventListener(
      'change',
      updateBiomes
    );
}

const slider=document.getElementById('opacity');
const opacityValue=document.getElementById('opacityValue');

slider.addEventListener('input',()=>{
 const o=Number(slider.value)/100;
 opacityValue.textContent=slider.value+'%';
 map.setPaintProperty('wetlands','raster-opacity',o);
});

document.getElementById('resetView').addEventListener('click',()=>{
 if(initialBounds){
   map.fitBounds(initialBounds,{
     padding:{top:50,bottom:45,left:360,right:45},
     duration:700
   });
 }
});

// -----------------------------------------------------------
// HOVER
// -----------------------------------------------------------

const hoverBox=document.getElementById('hoverBox');

const interactiveLayers=[
 'municipios-hit',
 'imediatas-hit',
 'intermediarias-hit',
 'biomas-hit',
 'uc_federal-hit',
 'uc_estadual-hit',
 'uc_municipal-hit',
 'bacias-hit',
 'mg-hit'
];

function featureName(layerId,p){

 if(layerId==='municipios-hit') return p.NM_MUN || '';
 if(layerId==='imediatas-hit') return 'Região Imediata: '+(p.NM_RGI || '');
 if(layerId==='intermediarias-hit') return 'Região Intermediária: '+(p.NM_RGINT || '');
 if(layerId==='biomas-hit') return 'Bioma: '+(p.Bioma || '');

 if(layerId==='uc_federal-hit')
   return 'UC Federal: '+(p.nome_uc || '');

 if(layerId==='uc_estadual-hit')
   return 'UC Estadual: '+(p.nome_uc || '');

 if(layerId==='uc_municipal-hit')
   return 'UC Municipal: '+(p.nome_uc || '');

 if(layerId==='bacias-hit')
   return 'Bacia: '+(p.nome || '');

 if(layerId==='mg-hit') return p.NM_UF || 'Minas Gerais';

 return '';
}

map.on('mousemove',e=>{

 const existing=interactiveLayers.filter(id=>map.getLayer(id));

 const features=map.queryRenderedFeatures(
   e.point,
   {layers:existing}
 );

 if(!features.length){
   hoverBox.style.display='none';
   map.getCanvas().style.cursor='';
   return;
 }

 const f=features[0];
 const name=featureName(f.layer.id,f.properties);

 if(!name){
   hoverBox.style.display='none';
   return;
 }

 map.getCanvas().style.cursor='pointer';

 hoverBox.textContent=name;
 hoverBox.style.display='block';
 hoverBox.style.left=(e.point.x+15)+'px';
 hoverBox.style.top=(e.point.y+15)+'px';

});

map.on('mouseleave',()=>{
 hoverBox.style.display='none';
 map.getCanvas().style.cursor='';
});

// -----------------------------------------------------------
// CLICK
// -----------------------------------------------------------

function areaText(v){
 const x=Number(v);
 if(!Number.isFinite(x)) return null;
 return x.toLocaleString('pt-BR',{
   maximumFractionDigits:1
 })+' km²';
}

function popupHTML(layerId,p){

 let html='';

 if(layerId==='municipios-hit'){
   html=`<div class="popup-title">${p.NM_MUN || 'Município'}</div>
   <div class="popup-row"><span class="popup-label">Região Imediata:</span> ${p.NM_RGI || '—'}</div>
   <div class="popup-row"><span class="popup-label">Região Intermediária:</span> ${p.NM_RGINT || '—'}</div>`;
 }

 else if(layerId==='imediatas-hit'){
   html=`<div class="popup-title">Região Imediata de ${p.NM_RGI || ''}</div>
   <div class="popup-row"><span class="popup-label">Região Intermediária:</span> ${p.NM_RGINT || '—'}</div>`;
 }

 else if(layerId==='intermediarias-hit'){
   html=`<div class="popup-title">Região Intermediária de ${p.NM_RGINT || ''}</div>`;
 }

 else if(layerId==='biomas-hit'){
   html=`<div class="popup-title">${p.Bioma || 'Bioma'}</div>`;
 }

 else if(layerId==='bacias-hit'){
   html=`
     <div class="popup-title">${p.nome || 'Bacia hidrográfica'}</div>
     <div class="popup-row">
       <span class="popup-label">Camada:</span>
       Bacia hidrográfica
     </div>
   `;
 }

 else if(layerId.startsWith('uc_')){

   const esfera =
     layerId==='uc_federal-hit' ? 'Federal' :
     layerId==='uc_estadual-hit' ? 'Estadual' :
     'Municipal';

   const municipios =
     p.municipios || p.municipio || '—';

   const ato =
     p.ato_legal || p.cria_ato || '—';

   const gestor =
     p.org_gestor || '—';

   html=`
     <div class="popup-title">${p.nome_uc || 'Unidade de Conservação'}</div>

     <div class="popup-row">
       <span class="popup-label">Esfera:</span>
       ${p.esfera || esfera}
     </div>

     <div class="popup-row">
       <span class="popup-label">Categoria:</span>
       ${p.categoria || '—'}
     </div>

     <div class="popup-row">
       <span class="popup-label">Grupo:</span>
       ${p.grupo || '—'}
     </div>

     <div class="popup-row">
       <span class="popup-label">Município(s):</span>
       ${municipios}
     </div>

     ${p.bioma ? `
       <div class="popup-row">
         <span class="popup-label">Bioma:</span>
         ${p.bioma}
       </div>` : ''}

     ${ato !== '—' ? `
       <div class="popup-row">
         <span class="popup-label">Ato legal:</span>
         ${ato}
       </div>` : ''}

     ${gestor !== '—' ? `
       <div class="popup-row">
         <span class="popup-label">Órgão gestor:</span>
         ${gestor}
       </div>` : ''}
   `;
 }

 else if(layerId==='mg-hit'){
   html=`<div class="popup-title">${p.NM_UF || 'Minas Gerais'}</div>`;
 }

 const area=areaText(p.AREA_KM2);

 if(area){
   html+=`<div class="popup-row"><span class="popup-label">Área:</span> ${area}</div>`;
 }

 return html;
}

map.on('click',e=>{

 const existing=interactiveLayers.filter(id=>map.getLayer(id));

 const features=map.queryRenderedFeatures(
   e.point,
   {layers:existing}
 );

 if(!features.length) return;

 const f=features[0];

 new maplibregl.Popup({
   closeButton:true,
   closeOnClick:true,
   maxWidth:'310px'
 })
 .setLngLat(e.lngLat)
 .setHTML(popupHTML(f.layer.id,f.properties))
 .addTo(map);

});
