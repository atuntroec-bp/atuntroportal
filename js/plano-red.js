/* ════════════════════════════════════════
   PLANO DE RED — scoped module
   Namespace: PR | Firebase: plano_red_v1
   Buques: María Fátima · María de Gracia
════════════════════════════════════════ */
var PR = (function() {

const FB_PATH = 'plano_red_v1';

const ESTADOS = [
  { id:'nuevo',          label:'Nuevo',          color:'#16a34a' },
  { id:'bueno',          label:'Bueno',          color:'#1c6dc4' },
  { id:'regular',        label:'Regular',        color:'#b87300' },
  { id:'malo',           label:'Malo / Dañado',  color:'#c41e1e' },
  { id:'cambio_urgente', label:'Cambio Urgente', color:'#c84800' },
  { id:'sin_asignar',    label:'Sin Asignar',    color:'#8fa3b8', dark:true },
];

const STATUS_CLASSES = {
  nuevo:'pr-s-nuevo', bueno:'pr-s-bueno', regular:'pr-s-regular',
  malo:'pr-s-malo', cambio_urgente:'pr-s-urgente', sin_asignar:'pr-s-sin'
};
const ALL_S_CLASSES = Object.values(STATUS_CLASSES);

/* ═════ B/P MARÍA FÁTIMA — 08 oct. 2022 ═════
   583 estiradas / 474 armadas · 15 paños (84 bz. de alto) */
const SECTIONS_FATIMA = [
  {
    id:'spa', name:'PARADO', estiradas:15, armadas:12,
    cuerdaFlot:'', cuerdaPlom:'CADENA',
    tirantes:'—',
    cols:4, vertical:true,
    panels:[
      {t:'300 × 5"×10 × 100', s:'sin_asignar'},
      {t:'300 × 5"×10 × 200', s:'sin_asignar'},
      {t:'72 × 4.1/4 × 100 × 550', s:'nuevo'},
      {t:'72 × 4.1/4 × 100 × 750', s:'nuevo'},
    ]
  },
  {
    id:'s5', name:'5 SECCIÓN', estiradas:80, armadas:66,
    cuerdaFlot:'132 × 5 × 10  H.EA', cuerdaPlom:'120 × 5 × 10',
    tirantes:'19 TIRANTES — CADENA 3/8"',
    cols:2,
    panos:[
      [{t:'—',s:'sin_asignar',span:2}],
      [{t:'72 × 4.1/8" × 100',s:'cambio_urgente'}, {t:'42 × 4.1/4" × 100',s:'nuevo'}],
      [{t:'42 × 8" × 66',s:'nuevo',span:2}],
      [{t:'36 × 4.1/4"',s:'nuevo',span:2}],
      [{t:'36 × 4.1/4"',s:'nuevo',span:2}],
      [{t:'36 × 4.1/4"',s:'nuevo',span:2}],
      [{t:'36 × 4.1/4"',s:'nuevo',span:2}],
      [{t:'84 × 8" × 120',s:'bueno',span:2}],
      [{t:'42 × 4.1/4"',s:'nuevo'}, {t:'42 × 6"',s:'nuevo'}],
      [{t:'42 × 4.1/4"',s:'nuevo'}, {t:'38 × 6"',s:'nuevo'}],
      [{t:'42 × 4.1/4"',s:'nuevo'}, {t:'38 × 6"',s:'nuevo'}],
      [{t:'42 × 4.1/4"',s:'nuevo'}, {t:'38 × 8"',s:'nuevo'}],
      [{t:'42 × 4.1/4"',s:'nuevo'}, {t:'36 × 4.1/4"',s:'nuevo'}],
      [{t:'42 × 4.1/4"',s:'nuevo'}, {t:'42 × 4.1/4"',s:'nuevo'}],
      [{t:'120 × 5 × 10',s:'sin_asignar',span:2}],
    ]
  },
  {
    id:'s4', name:'4 SECCIÓN', estiradas:131, armadas:105,
    cuerdaFlot:'132 × 5 × 10  H.EA', cuerdaPlom:'120 × 5 × 10',
    tirantes:'24 TIRANTES — CADENA 3/8"',
    cols:1,
    panos:[
      [{t:'—',s:'sin_asignar'}],
      [{t:'42 × 4.1/4" × 100',s:'nuevo'}],
      [{t:'42 × 4.1/4" × 100',s:'nuevo'}],
      [{t:'42 × 4.1/4" × 100',s:'nuevo'}],
      [{t:'42 × 6" × 66',s:'nuevo'}],
      [{t:'42 × 6" × 66',s:'nuevo'}],
      [{t:'42 × 8" × 66',s:'nuevo'}],
      [{t:'36 × 8" × 66',s:'nuevo'}],
      [{t:'36 × 8" × 66',s:'nuevo'}],
      [{t:'36 × 8" × 66',s:'nuevo'}],
      [{t:'36 × 8" × 66',s:'nuevo'}],
      [{t:'36 × 8" × 66',s:'nuevo'}],
      [{t:'36 × 4.1/4" × 100',s:'nuevo'}],
      [{t:'42 × 4.1/4" × 100',s:'nuevo'}],
      [{t:'—',s:'sin_asignar'}],
    ]
  },
  {
    id:'s3', name:'3 SECCIÓN', estiradas:124, armadas:100,
    cuerdaFlot:'132 × 5 × 10', cuerdaPlom:'120 × 5 × 10',
    tirantes:'13 TIRANTES — CADENA 3/8"',
    cols:6,
    panos:[
      [{t:'—',s:'sin_asignar',span:6}],
      [{t:'42 × 41/4 × 100',s:'regular',span:6}],
      [{t:'42 × 414 × 100',s:'regular',span:6}],
      [{t:'42 × 4.1/4" × 100',s:'nuevo',span:3},{t:'—',s:'sin_asignar',span:3}],
      [{t:'36 × 4.1/4" × 100',s:'nuevo',span:3},{t:'—',s:'sin_asignar',span:3}],
      [{t:'36 × 4.1/4"',s:'nuevo',span:2},{t:'36 × 4.1/4" × 100',s:'nuevo',span:2},{t:'—',s:'sin_asignar',span:2}],
      [{t:'36 × 4.1/4"',s:'nuevo',span:2},{t:'36 × 4.1/4" × 100',s:'nuevo',span:2},{t:'—',s:'sin_asignar',span:2}],
      [{t:'36 × 8" × 66',s:'nuevo',span:3},{t:'36 × 8" × 66',s:'nuevo',span:3}],
      [{t:'36 × 6" × 56',s:'nuevo',span:6}],
      [{t:'36 × 6" × 56',s:'nuevo',span:6}],
      [{t:'36 × 6" × 66',s:'nuevo',span:6}],
      [{t:'36 × 6" × 66',s:'nuevo',span:6}],
      [{t:'36 × 4.1/4" × 100',s:'nuevo',span:6}],
      [{t:'42 × 4.1/4" × 100',s:'nuevo',span:6}],
      [{t:'—',s:'sin_asignar',span:6}],
    ]
  },
  {
    id:'s2', name:'2 SECCIÓN', estiradas:112, armadas:90,
    cuerdaFlot:'132 × 5 × 10', cuerdaPlom:'120 × 5 × 10',
    tirantes:'—',
    cols:6,
    panos:[
      [{t:'—',s:'sin_asignar',span:6}],
      [{t:'42 × 4.1/4" × 100',s:'nuevo',span:2},{t:'—',s:'sin_asignar',span:2},{t:'—',s:'sin_asignar',span:2}],
      [{t:'42 × 414 × 100',s:'regular',span:3},{t:'—',s:'sin_asignar',span:3}],
      [{t:'36 × 4.1/4" × 100',s:'nuevo',span:6}],
      [{t:'36 × 4.1/4" × 100',s:'nuevo',span:6}],
      [{t:'36 × 4.1/4" × 100',s:'nuevo',span:6}],
      [{t:'36 × 4.1/4" × 100',s:'nuevo',span:6}],
      [{t:'42 × 4.1/4" × 100',s:'nuevo',span:6}],
      [{t:'36 × 4.1/4" × 100',s:'nuevo',span:6}],
      [{t:'36 × 4.1/4" × 100',s:'regular',span:6}],
      [{t:'36 × 4.1/4" × 100',s:'regular',span:6}],
      [{t:'42 × 4.1/4" × 100',s:'regular',span:3},{t:'—',s:'sin_asignar',span:3}],
      [{t:'42 × 4.1/4" × 100',s:'regular',span:6}],
      [{t:'48 × 3.1/2" × 122',s:'nuevo',span:6}],
      [{t:'—',s:'sin_asignar',span:6}],
    ]
  },
  {
    id:'s1', name:'1 SECCIÓN', estiradas:62, armadas:51,
    cuerdaFlot:'132AS × 10', cuerdaPlom:'120 × 5 × 10',
    tirantes:'7 TIRANTES — CADENA 3/8"',
    cols:12,
    panos:[
      [{t:'—',s:'sin_asignar',span:6},{t:'—',s:'sin_asignar',span:6}],
      [{t:'42 × 4.1/4" × 100',s:'regular',span:6},{t:'42 × 4.1/4" × 100',s:'nuevo',span:6}],
      [{t:'42 × 4.1/4" × 100',s:'regular',span:12}],
      [{t:'42 × 4.1/4" × 100',s:'nuevo',span:12}],
      [{t:'42 × 4.1/4" × 100',s:'nuevo',span:12}],
      [{t:'42 × 4.1/4" × 100',s:'nuevo',span:12}],
      [{t:'42 × 4.1/4" × 100',s:'nuevo',span:12}],
      [{t:'42 × 4.1/4" × 100',s:'nuevo',span:12}],
      [{t:'42 × 4.1/4" × 100',s:'regular',span:12}],
      [{t:'36 × 4.1/4" × 100',s:'regular',span:12}],
      [{t:'36 × 4.1/4" × 100',s:'regular',span:12}],
      [{t:'36 × 4.1/4"',s:'nuevo',span:6},{t:'36 × 4.1/4"',s:'nuevo',span:6}],
      [{t:'36 × 4.1/4"',s:'nuevo',span:3},{t:'36 × 4.1/4"',s:'nuevo',span:3},{t:'—',s:'sin_asignar',span:3},{t:'—',s:'sin_asignar',span:3}],
      [{t:'48 × 3.1/2" × 122',s:'regular',span:4},{t:'—',s:'sin_asignar',span:4},{t:'—',s:'sin_asignar',span:4}],
      [{t:'—',s:'sin_asignar',span:12}],
    ]
  },
  {
    id:'sac', name:'ANTECABECERO', estiradas:33, armadas:28,
    cuerdaFlot:'300 × 5 × 10', cuerdaPlom:'300 × 5 × 10',
    tirantes:'7 TIRANTES — CADENA 3/8"',
    cols:2,
    panos:[
      [{t:'—',s:'sin_asignar',span:2}],
      [{t:'60 × 3.1/2"',s:'nuevo',span:2}],
      [{t:'60 × 3.1/2"',s:'nuevo',span:2}],
      [{t:'60 × 3.1/2"',s:'nuevo',span:2}],
      [{t:'60 × 3.1/2"',s:'nuevo',span:2}],
      [{t:'48 × 3.1/2"',s:'nuevo',span:2}],
      [{t:'48 × 3.1/2"',s:'nuevo',span:2}],
      [{t:'42 × 3.1/2"',s:'regular'}, {t:'42 × 3.1/2"',s:'regular'}],
      [{t:'42 × 3.1/2"',s:'regular'}, {t:'42 × 3.1/2"',s:'regular'}],
      [{t:'48 × 3.1/2"',s:'nuevo',span:2}],
      [{t:'48 × 3.1/2"',s:'nuevo'}, {t:'—',s:'bueno'}],
      [{t:'—',s:'bueno',span:2}],
      [{t:'—',s:'bueno',span:2}],
      [{t:'42 × 3.1/2" × 122',s:'regular',span:2}],
      [{t:'—',s:'sin_asignar',span:2}],
    ]
  },
  {
    id:'scb', name:'CABECERO', estiradas:26, armadas:22,
    cuerdaFlot:'300 × 5 × 10', cuerdaPlom:'300 × 5 × 10',
    tirantes:'—',
    cols:2,
    panos:[
      [{t:'—',s:'sin_asignar',span:2}],
      [{t:'120 × 3.1/2"',s:'nuevo',span:2}],
      [{t:'120 × 3.1/2"',s:'nuevo',span:2}],
      [{t:'96 × 3.1/2"',s:'nuevo',span:2}],
      [{t:'96 × 3.1/2"',s:'nuevo',span:2}],
      [{t:'84 × 3.1/2"',s:'nuevo',span:2}],
      [{t:'84 × 3.1/2"',s:'nuevo',span:2}],
      [{t:'72 × 3.1/2"',s:'nuevo',span:2}],
      [{t:'60 × 3.1/2"',s:'nuevo',span:2}],
      [{t:'—',s:'bueno',span:2}],
      [{t:'—',s:'bueno',span:2}],
      [{t:'—',s:'bueno',span:2}],
      [{t:'—',s:'bueno',span:2}],
      [{t:'42×3.1/2" / 60×5.1/2"',s:'regular'},{t:'—',s:'sin_asignar'}],
      [{t:'—',s:'sin_asignar',span:2}],
    ]
  },
  {
    id:'sab', name:'ABANICO', estiradas:'—', armadas:'—',
    cuerdaFlot:'—', cuerdaPlom:'—', tirantes:'—',
    cols:2, vertical:true,
    panels:[
      {t:'—', s:'sin_asignar'},
      {t:'—', s:'sin_asignar'},
    ]
  },
];
/* ═════ B/P MARÍA DE GRACIA — 17 sep. 2024 ═════
   710 estiradas / 565 armadas · 16 paños (96 bz. de alto) */
const SECTIONS_GRACIA = [
  {
    id:'gpa', name:'PARADO / ABANICO', estiradas:18, armadas:15,
    relingaSup:'', cuerdaPlom:'', cadenaCal:'1/2', tirantes:'—',
    cols:5, vertical:true,
    panels:[
      {t:'210 × 5 × 10 × 150', s:'sin_asignar'},
      {t:'210 × 5 × 10 × 300', s:'sin_asignar'},
      {t:'84 × 3.1/2 × 122 × 480', s:'sin_asignar'},
      {t:'48 × 3.1/2 × 122 × 600', s:'sin_asignar'},
      {t:'42 × 4.1/4 × 100 × 600', s:'sin_asignar'},
    ]
  },
  {
    id:'g6', name:'6 SECCIÓN', estiradas:92, armadas:75,
    relingaSup:'132 × 5 × 10', cuerdaPlom:'132 × 5 × 10',
    cadenaCal:'1/2 · 1/2 · 7/16', tirantes:'—', cols:1,
    panos:[
      [{t:'42 × 4.1/4 × 100',s:'sin_asignar'}],
      [{t:'36 × 4.1/4 × 100',s:'sin_asignar'}],
      [{t:'36 × 4.1/4 × 100',s:'sin_asignar'}],
      [{t:'36 × 6 × 66',s:'sin_asignar'}],
      [{t:'36 × 6 × 66',s:'sin_asignar'}],
      [{t:'36 × 6 × 66',s:'sin_asignar'}],
      [{t:'36 × 6 × 66',s:'sin_asignar'}],
      [{t:'36 × 6 × 66',s:'sin_asignar'}],
      [{t:'36 × 6 × 66',s:'sin_asignar'}],
      [{t:'36 × 6 × 66',s:'sin_asignar'}],
      [{t:'36 × 6 × 66',s:'sin_asignar'}],
      [{t:'36 × 6 × 66',s:'sin_asignar'}],
      [{t:'36 × 4.1/4 × 100',s:'sin_asignar'}],
      [{t:'36 × 4.1/4 × 100',s:'sin_asignar'}],
      [{t:'42 × 4.1/4 × 100',s:'sin_asignar'}],
      [{t:'42 × 4.1/4 × 100',s:'sin_asignar'}],
    ]
  },
  {
    id:'g5', name:'5 SECCIÓN', estiradas:104, armadas:80,
    relingaSup:'132 × 5 × 10', cuerdaPlom:'132 × 5 × 10',
    cadenaCal:'7/16 · 7/16', tirantes:'—', cols:2,
    panos:[
      [{t:'42 × 4.1/4 × 100',s:'sin_asignar',span:2}],
      [{t:'36 × 4.1/4 × 100',s:'sin_asignar',span:2}],
      [{t:'36 × 4.1/4 × 100',s:'sin_asignar',span:2}],
      [{t:'36 × 6 × 66',s:'sin_asignar',span:2}],
      [{t:'36 × 6 × 66',s:'sin_asignar',span:2}],
      [{t:'36 × 6 × 66',s:'sin_asignar',span:2}],
      [{t:'36 × 6 × 66',s:'sin_asignar',span:2}],
      [{t:'36 × 6 × 66',s:'sin_asignar',span:2}],
      [{t:'36 × 6 × 66',s:'sin_asignar',span:2}],
      [{t:'36 × 6 × 66',s:'sin_asignar',span:2}],
      [{t:'36 × 6 × 66',s:'sin_asignar',span:2}],
      [{t:'36 × 6 × 66',s:'sin_asignar',span:2}],
      [{t:'36 × 4.1/4 × 100',s:'sin_asignar',span:2}],
      [{t:'36 × 4.1/4 × 100',s:'sin_asignar',span:2}],
      [{t:'36 × 4.1/4 × 100',s:'sin_asignar',span:2}],
      [{t:'42 × 4.1/4 × 100',s:'sin_asignar',span:2}],
    ]
  },
  {
    id:'g4', name:'4 SECCIÓN', estiradas:120, armadas:95,
    relingaSup:'132 × 5 × 10', cuerdaPlom:'132 × 5 × 10',
    cadenaCal:'7/16 · 7/16 · 7/16', tirantes:'—', cols:1,
    panos:[
      [{t:'42 × 4.1/4 × 100',s:'sin_asignar'}],
      [{t:'36 × 4.1/4 × 100',s:'sin_asignar'}],
      [{t:'36 × 4.1/4 × 100',s:'sin_asignar'}],
      [{t:'36 × 4.1/4 × 100',s:'sin_asignar'}],
      [{t:'36 × 4.1/4 × 100',s:'sin_asignar'}],
      [{t:'36 × 4.1/4 × 100',s:'sin_asignar'}],
      [{t:'36 × 6 × 66',s:'sin_asignar'}],
      [{t:'36 × 6 × 66',s:'sin_asignar'}],
      [{t:'36 × 6 × 66',s:'sin_asignar'}],
      [{t:'36 × 6 × 66',s:'sin_asignar'}],
      [{t:'36 × 6 × 66',s:'sin_asignar'}],
      [{t:'36 × 6 × 66',s:'sin_asignar'}],
      [{t:'42 × 6 × 66',s:'sin_asignar'}],
      [{t:'42 × 6 × 66',s:'sin_asignar'}],
      [{t:'42 × 6 × 66',s:'sin_asignar'}],
      [{t:'42 × 4.1/4 × 100',s:'sin_asignar'}],
    ]
  },
  {
    id:'g3', name:'3 SECCIÓN', estiradas:86, armadas:64,
    relingaSup:'132 × 5 × 10', cuerdaPlom:'132 × 5 × 10',
    cadenaCal:'7/16 · 7/16 · 7/16', tirantes:'—', cols:2,
    panos:[
      [{t:'42 × 4.1/4 × 100',s:'sin_asignar',span:2}],
      [{t:'36 × 4.1/4 × 100',s:'sin_asignar',span:2}],
      [{t:'36 × 4.1/4 × 100',s:'sin_asignar',span:2}],
      [{t:'36 × 4.1/4 × 100',s:'sin_asignar',span:2}],
      [{t:'36 × 4.1/4 × 100',s:'sin_asignar',span:2}],
      [{t:'36 × 4.1/4 × 100',s:'sin_asignar',span:2}],
      [{t:'36 × 4.1/4 × 100',s:'sin_asignar'},{t:'42 × 4.1/4 × 100',s:'sin_asignar'}],
      [{t:'36 × 4.1/4 × 100',s:'sin_asignar'},{t:'42 × 4.1/4 × 100',s:'sin_asignar'}],
      [{t:'36 × 4.1/4 × 100',s:'sin_asignar'},{t:'42 × 4.1/4 × 100',s:'sin_asignar'}],
      [{t:'36 × 4.1/4 × 100',s:'sin_asignar',span:2}],
      [{t:'36 × 4.1/4 × 100',s:'sin_asignar',span:2}],
      [{t:'36 × 4.1/4 × 100',s:'sin_asignar',span:2}],
      [{t:'36 × 4.1/4 × 100',s:'sin_asignar',span:2}],
      [{t:'36 × 4.1/4 × 100',s:'sin_asignar',span:2}],
      [{t:'36 × 4.1/4 × 100',s:'sin_asignar'},{t:'36 × 6 × 66',s:'sin_asignar'}],
      [{t:'42 × 4.1/4 × 100',s:'sin_asignar',span:2}],
    ]
  },
  {
    /* 2ª y 1ª SECCIÓN comparten 190 estiradas / 155 armadas en el plano
       original, y el paño de la fila 13 cruza de una a otra: por eso van
       en un solo bloque. Rejilla base de 24 unidades → 2ªA=6, 2ªB=6, 1ª=12 */
    id:'g21', name:'2 SECCIÓN  —  1 SECCIÓN', estiradas:190, armadas:155,
    relingaSup:'132 × 5 × 10', cuerdaPlom:'132 × 5 × 10',
    cadenaCal:'7/16 · 7/16 · 1/2 · 1/2 · 7/16', tirantes:'—', cols:24,
    panos:[
      [{t:'42 × 4.1/4 × 100',s:'sin_asignar',span:6},{t:'42 × 4.1/4 × 100',s:'sin_asignar',span:6},{t:'42 × 4.1/4 × 100',s:'sin_asignar',span:12}],
      [{t:'42 × 4.1/4 × 100',s:'sin_asignar',span:6},{t:'36 × 4.1/4 × 100',s:'sin_asignar',span:6},{t:'36 × 4.1/4 × 100',s:'sin_asignar',span:12}],
      [{t:'42 × 4.1/4 × 100',s:'sin_asignar',span:6},{t:'36 × 4.1/4 × 100',s:'sin_asignar',span:6},{t:'36 × 4.1/4 × 100',s:'sin_asignar',span:12}],
      [{t:'36 × 4.1/4 × 100',s:'sin_asignar',span:6},{t:'36 × 4.1/4 × 100',s:'sin_asignar',span:6},{t:'36×4.1/4',s:'sin_asignar',span:2},{t:'36 × 4.1/4 × 100',s:'sin_asignar',span:10}],
      [{t:'36 × 4.1/4 × 100',s:'sin_asignar',span:6},{t:'36 × 4.1/4 × 100',s:'sin_asignar',span:6},{t:'36×4.1/4',s:'sin_asignar',span:2},{t:'36 × 4.1/4 × 100',s:'sin_asignar',span:10}],
      [{t:'36 × 4.1/4 × 100',s:'sin_asignar',span:3},{t:'42 × 4.1/4 × 100',s:'sin_asignar',span:3},{t:'36 × 4.1/4 × 100',s:'sin_asignar',span:6},{t:'36×4.1/4',s:'sin_asignar',span:2},{t:'36 × 4.1/4 × 100',s:'sin_asignar',span:10}],
      [{t:'36 × 4.1/4 × 100',s:'sin_asignar',span:6},{t:'36 × 4.1/4 × 100',s:'sin_asignar',span:3},{t:'42 × 4.1/4',s:'sin_asignar',span:3},{t:'36×4.1/4',s:'sin_asignar',span:2},{t:'36 × 4.1/4 × 100',s:'sin_asignar',span:10}],
      [{t:'36 × 4.1/4 × 100',s:'sin_asignar',span:6},{t:'36 × 4.1/4 × 100',s:'sin_asignar',span:6},{t:'36×4.1/4',s:'sin_asignar',span:2},{t:'36 × 4.1/4 × 100',s:'sin_asignar',span:10}],
      [{t:'36 × 4.1/4 × 100',s:'sin_asignar',span:6},{t:'36 × 4.1/4 × 100',s:'sin_asignar',span:6},{t:'36×4.1/4',s:'sin_asignar',span:2},{t:'36 × 4.1/4 × 100',s:'sin_asignar',span:10}],
      [{t:'36 × 4.1/4 × 100',s:'sin_asignar',span:6},{t:'36 × 4.1/4 × 100',s:'sin_asignar',span:6},{t:'36×4.1/4',s:'sin_asignar',span:2},{t:'36 × 4.1/4 × 100',s:'sin_asignar',span:10}],
      [{t:'36 × 4.1/4 × 100',s:'sin_asignar',span:6},{t:'36 × 4.1/4 × 100',s:'sin_asignar',span:6},{t:'36×4.1/4',s:'sin_asignar',span:2},{t:'36 × 4.1/4 × 100',s:'sin_asignar',span:10}],
      [{t:'42 × 8 × 50',s:'sin_asignar',span:3},{t:'42 × 4.1/4 × 100',s:'sin_asignar',span:3},{t:'36 × 4.1/4 × 100',s:'sin_asignar',span:6},{t:'36×4.1/4',s:'sin_asignar',span:2},{t:'36 × 4.1/4 × 100',s:'sin_asignar',span:10}],
      [{t:'42 × 8 × 50',s:'sin_asignar',span:3},{t:'42 × 4.1/4 × 100',s:'sin_asignar',span:3},{t:'36×4.1/4',s:'sin_asignar',span:2},{t:'36 × 4.1/4 × 100',s:'sin_asignar',span:14},{t:'42×4.1/4',s:'sin_asignar',span:2}],
      [{t:'42 × 8 × 50',s:'sin_asignar',span:3},{t:'42 × 8 × 50',s:'sin_asignar',span:3},{t:'36 × 4.1/4 × 100',s:'sin_asignar',span:6},{t:'36 × 4.1/4 × 100',s:'sin_asignar',span:10},{t:'42×4.1/4',s:'sin_asignar',span:2}],
      [{t:'42 × 8 × 50',s:'sin_asignar',span:3},{t:'42 × 8 × 50',s:'sin_asignar',span:3},{t:'36 × 4.1/4 × 100',s:'sin_asignar',span:6},{t:'36 × 4.1/4 × 100',s:'sin_asignar',span:10},{t:'36×4.1/4',s:'sin_asignar',span:2}],
      [{t:'42 × 4.1/4 × 100',s:'sin_asignar',span:6},{t:'42 × 4.1/4 × 100',s:'sin_asignar',span:6},{t:'42 × 4.1/4 × 100',s:'sin_asignar',span:12}],
    ]
  },
  {
    id:'gac', name:'ANTECABECERO', estiradas:50, armadas:41,
    relingaSup:'132 × 5 × 10', cuerdaPlom:'132 × 5 × 10',
    cadenaCal:'1/2 · 1/2', tirantes:'—', cols:1,
    panos:[
      [{t:'54 × 3.1/2',s:'sin_asignar'}],
      [{t:'48 × 3.1/2',s:'sin_asignar'}],
      [{t:'48 × 3.1/2',s:'sin_asignar'}],
      [{t:'48 × 3.1/2',s:'sin_asignar'}],
      [{t:'48 × 3.1/2',s:'sin_asignar'}],
      [{t:'48 × 3.1/2',s:'sin_asignar'}],
      [{t:'48 × 3.1/2',s:'sin_asignar'}],
      [{t:'48 × 3.1/2',s:'sin_asignar'}],
      [{t:'48 × 3.1/2',s:'sin_asignar'}],
      [{t:'48 × 3.1/2',s:'sin_asignar'}],
      [{t:'48 × 3.1/2',s:'sin_asignar'}],
      [{t:'42 × 3.1/2',s:'sin_asignar'}],
      [{t:'42 × 3.1/2',s:'sin_asignar'}],
      [{t:'48 × 3.1/2',s:'sin_asignar'}],
      [{t:'48 × 3.1/2',s:'sin_asignar'}],
      [{t:'54 × 3.1/2 × 122',s:'sin_asignar'}],
    ]
  },
  {
    id:'gcb', name:'CABECERO', estiradas:50, armadas:40, noDivider:true,
    relingaSup:'300 × 5 × 10', cuerdaPlom:'132 × 5 × 10',
    cadenaCal:'1/2 · 1/2', tirantes:'—', cols:2,
    panos:[
      [{t:'96 × 3.1/2',s:'sin_asignar'},{t:'132 × 3.1/2',s:'sin_asignar'}],
      [{t:'96 × 3.1/2',s:'sin_asignar'},{t:'132 × 3.1/2',s:'sin_asignar'}],
      [{t:'84 × 3.1/2',s:'sin_asignar'},{t:'120 × 3.1/2',s:'sin_asignar'}],
      [{t:'84 × 3.1/2',s:'sin_asignar'},{t:'120 × 3.1/2',s:'sin_asignar'}],
      [{t:'96 × 3.1/2',s:'sin_asignar',span:2}],
      [{t:'96 × 3.1/2',s:'sin_asignar',span:2}],
      [{t:'96 × 3.1/2',s:'sin_asignar',span:2}],
      [{t:'84 × 3.1/2',s:'sin_asignar',span:2}],
      [{t:'84 × 3.1/2',s:'sin_asignar',span:2}],
      [{t:'72 × 3.1/2',s:'sin_asignar',span:2}],
      [{t:'60 × 3.1/2',s:'sin_asignar',span:2}],
      [{t:'54 × 3.1/2',s:'sin_asignar',span:2}],
      [{t:'—',s:'sin_asignar',span:2,cuchilla:'1 CUCHILLA'}],
      [{t:'—',s:'sin_asignar',span:2,cuchilla:'2 CUCHILLA'}],
      [{t:'—',s:'sin_asignar',span:2,cuchilla:'3 CUCHILLA'}],
      [{t:'54 × 3.1/2',s:'sin_asignar',span:2}],
    ]
  },
  {
    id:'gab', name:'ABANICO', estiradas:'—', armadas:'—',
    relingaSup:'', cuerdaPlom:'', cadenaCal:'—', tirantes:'—',
    cols:2, vertical:true,
    panels:[
      {t:'300 × 5 × 10 × 300', s:'sin_asignar'},
      {t:'300 × 5 × 10 × 150', s:'sin_asignar'},
    ]
  },
];

/* ═════ REGISTRO DE BUQUES ═════
   Cada red define sus propias secciones, su número de paños y qué filas
   auxiliares se dibujan arriba y abajo de los paños. Agregar un buque
   nuevo es agregar una entrada aquí. */
const NETS = {
  fatima: {
    label:'María Fátima', short:'M. Fátima',
    estiradas:583, armadas:474, numPanos:15, alto:84, fecha:'08 oct. 2022',
    topRows:[],
    bottomRows:[
      { key:'rp',  label:'CADENA',   field:'cuerdaPlom' },
      { key:'tir', label:'TIRANTES', field:'tirantes'   },
    ],
    sections: SECTIONS_FATIMA,
  },
  gracia: {
    label:'María de Gracia', short:'M. de Gracia',
    estiradas:710, armadas:565, numPanos:16, alto:96, fecha:'17 sep. 2024',
    topRows:[
      { key:'rs', label:'RELINGA', field:'relingaSup' },
    ],
    bottomRows:[
      { key:'rp',  label:'CADENA',  field:'cuerdaPlom' },
      { key:'cal', label:'CALIBRE', field:'cadenaCal'  },
    ],
    sections: SECTIONS_GRACIA,
  },
};

/* Separadores delgados entre cada par de secciones.
   Una sección con noDivider:true se pega a la anterior sin separador
   (en el plano original ANTECABECERO y CABECERO van juntos, sin espacio). */
Object.keys(NETS).forEach(function(v) {
  NETS[v].sections = NETS[v].sections.reduce(function(acc, sec, i) {
    if (i > 0 && !sec.noDivider) acc.push({
      id:'div_'+v+'_'+i, divider:true, vertical:true, cols:1,
      name:'', estiradas:'', armadas:'',
      relingaSup:'', cuerdaPlom:'', cadenaCal:'', tirantes:'',
      panels:[{t:'', s:'sin_asignar'}]
    });
    acc.push(sec);
    return acc;
  }, []);
});

/* ── estado del módulo ── */
let currentVessel = 'fatima';
let data = { fatima:{estados:{},textos:{},fechas:{}}, gracia:{estados:{},textos:{},fechas:{}} };
let activeUser = null;
let db = null, fbReady = false, applyingRemote = false;
let isTyping = false, typingTimer = null, persistTimer = null;
let activeCell = null, editingText = false, origText = '';

/* ── helpers ── */
function net()      { return NETS[currentVessel]; }
function sections() { return net().sections; }
function bucket()   { return data[currentVessel]; }
function lsKey(v)   { return 'atuntro_plano_red_v1_' + v; }
function canReset() { return !!activeUser && (activeUser.role === 'master' || activeUser.role === 'admin'); }
function cellId(secId, pIdx, colOff) { return secId + '_p' + (pIdx + 1) + '_c' + colOff; }
function statusClass(s) { return STATUS_CLASSES[s] || 'pr-s-sin'; }
function getEstado(id) {
  for (var i = 0; i < ESTADOS.length; i++) if (ESTADOS[i].id === id) return ESTADOS[i];
  return ESTADOS[ESTADOS.length - 1];
}
function getStatus(id, def)     { var e = bucket().estados; return e[id] !== undefined ? e[id] : def; }
function getCustomText(id, def) { var t = bucket().textos;  return t[id] !== undefined ? t[id] : def; }
function getCellDate(id)        { return bucket().fechas[id] || ''; }

function formatCellDate(raw) {
  if (!raw) return '';
  try {
    var p = raw.split('-');
    var meses = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'];
    return parseInt(p[2], 10) + ' ' + meses[parseInt(p[1], 10) - 1] + '. ' + p[0];
  } catch (e) { return raw; }
}

/* Estado por defecto de una celda, leído de la red del buque activo */
function getDefaultStatus(id) {
  var secs = sections();
  for (var b = 0; b < net().topRows.length; b++)
    if (id.slice(-3) === '_' + net().topRows[b].key || id.endsWith('_' + net().topRows[b].key)) return 'sin_asignar';
  for (var b2 = 0; b2 < net().bottomRows.length; b2++)
    if (id.endsWith('_' + net().bottomRows[b2].key)) return 'sin_asignar';
  if (id.indexOf('_vert_') !== -1) {
    var parts = id.split('_vert_');
    for (var i = 0; i < secs.length; i++) {
      var s = secs[i];
      if (s.id === parts[0] && s.panels && s.panels[+parts[1]]) return s.panels[+parts[1]].s;
    }
    return 'sin_asignar';
  }
  for (var k = 0; k < secs.length; k++) {
    var sec = secs[k];
    if (!sec.panos) continue;
    for (var pi = 0; pi < sec.panos.length; pi++) {
      var off = 0, row = sec.panos[pi];
      for (var c = 0; c < row.length; c++) {
        if (cellId(sec.id, pi, off) === id) return row[c].s;
        off += (row[c].span || 1);
      }
    }
  }
  return 'sin_asignar';
}

/* ── sync ── */
function markTyping() {
  isTyping = true;
  clearTimeout(typingTimer);
  typingTimer = setTimeout(function () { isTyping = false; }, 900);
}
function setSync(cls, label) {
  var d = document.getElementById('pr-syncDot'); if (d) d.className = 'sync-dot ' + cls;
  var l = document.getElementById('pr-syncLbl'); if (l) l.textContent = label;
}

function persistDebounced() {
  clearTimeout(persistTimer);
  persistTimer = setTimeout(persistNow, 600);
}
function persistNow() {
  var v = currentVessel;
  try { localStorage.setItem(lsKey(v), JSON.stringify(data[v])); } catch (e) {}
  if (fbReady && !applyingRemote) {
    setSync('saving', 'Guardando…');
    db.ref(FB_PATH + '/' + v).set(data[v])
      .then(function () { setSync('ok', 'Sincronizado'); renderLastMod(); })
      .catch(function () { setSync('local', 'Solo local'); renderLastMod(); });
  } else {
    setSync('local', 'Solo local'); renderLastMod();
  }
}

function loadLocal(v) {
  try {
    var r = localStorage.getItem(lsKey(v));
    if (!r) return null;
    return normalize(JSON.parse(r));
  } catch (e) { return null; }
}
function normalize(d) {
  return { estados:(d && d.estados) || {}, textos:(d && d.textos) || {}, fechas:(d && d.fechas) || {} };
}

/* El modal está abierto o el usuario escribe → no redibujar la tabla */
function isBusy() {
  var ov = document.getElementById('pr-overlay');
  if (ov && !ov.classList.contains('pr-hidden')) return true;
  return isTyping;
}

function initFirebase() {
  try {
    db = firebase.database(); fbReady = true; setSync('ok', 'Sincronizado');
    Object.keys(NETS).forEach(function (v) {
      db.ref(FB_PATH + '/' + v).on('value', function (snap) {
        if (isTyping) return;
        var r = snap.val();
        if (!r) return;
        var n = normalize(r);
        if (JSON.stringify(n) === JSON.stringify(data[v])) return;
        applyingRemote = true;
        data[v] = n;
        try { localStorage.setItem(lsKey(v), JSON.stringify(n)); } catch (e) {}
        if (v === currentVessel) {
          if (!isBusy()) renderTable();
          renderLastMod();
        }
        applyingRemote = false;
      });
    });
  } catch (e) { setSync('local', 'Solo local'); }
}

/* ── DOM helpers ── */
function th(row, text, opts) {
  opts = opts || {};
  var el = document.createElement('th');
  el.textContent = text;
  if (opts.cls) el.className = opts.cls;
  if (opts.colspan > 1) el.colSpan = opts.colspan;
  if (opts.rowspan > 1) el.rowSpan = opts.rowspan;
  if (opts.style) el.style.cssText = opts.style;
  row.appendChild(el);
  return el;
}
function td(row, text, opts) {
  opts = opts || {};
  var el = document.createElement('td');
  el.textContent = text;
  if (opts.cls) el.className = opts.cls;
  if (opts.colspan > 1) el.colSpan = opts.colspan;
  if (opts.style) el.style.cssText = opts.style;
  row.appendChild(el);
  return el;
}

function mkCell(tr, text, status, id, colspan, rawText, secName, panoNum, isFirst, rowspan, cuchilla) {
  rowspan = rowspan || 1;
  var el = document.createElement('td');
  el.className = 'pr-cell ' + statusClass(status) + (isFirst ? ' pr-sec-first' : '');
  el.colSpan = colspan;
  if (rowspan > 1) el.rowSpan = rowspan;
  el.tabIndex = 0;
  el.title = getEstado(status).label;
  el.dataset.id = id;
  el.dataset.rawText = rawText || '—';
  el.dataset.secName = secName;
  el.dataset.panoNum = panoNum;
  el.textContent = getCustomText(id, text || '—');
  if (cuchilla) {
    var cu = document.createElement('span');
    cu.className = 'pr-cuchilla';
    cu.textContent = '✂ ' + cuchilla;
    el.appendChild(cu);
    el.classList.add('pr-has-cuchilla');
  }
  var dt = getCellDate(id);
  if (dt) {
    var ds = document.createElement('span');
    ds.className = 'pr-cell-date';
    ds.textContent = formatCellDate(dt);
    el.appendChild(ds);
  }
  el.addEventListener('click', function () { openModal(el); });
  el.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openModal(el); }
  });
  tr.appendChild(el);
  return el;
}

function refreshCellDate(el, raw) {
  if (!el) return;
  var ds = el.querySelector('.pr-cell-date');
  if (raw) {
    if (!ds) { ds = document.createElement('span'); ds.className = 'pr-cell-date'; el.appendChild(ds); }
    ds.textContent = formatCellDate(raw);
  } else if (ds) { ds.remove(); }
}

/* Fila auxiliar (relinga / cadena / tirantes / calibre) */
function auxRow(tbody, spec, cls) {
  var tr = document.createElement('tr');
  tr.className = cls;
  td(tr, spec.label, { cls:'pr-td-label', style:'font-size:8px;letter-spacing:.04em' });
  sections().forEach(function (sec, si) {
    var val = sec[spec.field] || '';
    if (sec.vertical) {
      td(tr, sec.divider ? '' : val, {
        colspan: sec.cols,
        style: sec.divider ? 'width:18px;max-width:22px;padding:0;background:#0d3258;border:1px solid #07213a;'
                           : 'text-align:center;font-size:9px;'
      });
      return;
    }
    var id = sec.id + '_' + spec.key;
    mkCell(tr, val, getStatus(id, 'sin_asignar'), id, sec.cols, val, sec.name, spec.label, si === 0);
  });
  tbody.appendChild(tr);
}

/* ── render tabla ── */
function renderTable() {
  var tbl = document.getElementById('pr-netPlan');
  if (!tbl) return;
  var N = net(), secs = sections(), NUM = N.numPanos;
  tbl.innerHTML = '';
  var thead = document.createElement('thead');
  var tbody = document.createElement('tbody');

  var hr1 = document.createElement('tr');
  th(hr1, 'PAÑO', { cls:'pr-th-label pr-th-section', rowspan:2, style:'vertical-align:middle' });
  secs.forEach(function (sec, si) {
    if (sec.divider) { th(hr1, '', { cls:'pr-th-divider-hdr', colspan:1, rowspan:2 }); return; }
    th(hr1, sec.name, { cls:'pr-th-section' + (si === 0 ? ' pr-th-section-first' : ''), colspan:sec.cols });
  });
  thead.appendChild(hr1);

  var hr2 = document.createElement('tr');
  secs.forEach(function (sec) {
    if (sec.divider) return;
    var cell = th(hr2, '', { cls:'pr-th-stats', colspan:sec.cols });
    if (sec.estiradas !== '') {
      cell.innerHTML = '<span class="pr-est">' + sec.estiradas + ' est.</span>' +
                       '<span class="pr-arm">' + sec.armadas + ' arm.</span>';
    }
  });
  thead.appendChild(hr2);
  tbl.appendChild(thead);

  /* filas auxiliares superiores (relinga) */
  N.topRows.forEach(function (spec) { auxRow(tbody, spec, 'pr-row-relinga-sup'); });

  var covered = {};
  for (var pIdx = 0; pIdx < NUM; pIdx++) {
    (function (pIdx) {
      var tr = document.createElement('tr');
      if (pIdx % 2 === 1) tr.classList.add('pr-row-even');
      td(tr, pIdx + 1, { cls:'pr-td-label' });

      secs.forEach(function (sec, si) {
        if (sec.vertical) {
          if (pIdx === 0) {
            sec.panels.forEach(function (p, pi) {
              var id = sec.id + '_vert_' + pi;
              var status = getStatus(id, p.s);
              var el = document.createElement('td');
              el.className = 'pr-cell pr-cell-vert ' + (sec.divider ? 'pr-cell-div ' : ' ') +
                             statusClass(status) + (si === 0 && pi === 0 ? ' pr-sec-first' : '');
              el.rowSpan = NUM;
              el.tabIndex = 0;
              el.title = getEstado(status).label;
              el.dataset.id = id;
              el.dataset.rawText = p.t;
              el.dataset.secName = sec.name;
              el.dataset.panoNum = 'Panel ' + (pi + 1);
              var vSpan = document.createElement('span');
              vSpan.className = 'pr-cell-vert-text';
              vSpan.textContent = getCustomText(id, p.t);
              el.appendChild(vSpan);
              var vDt = getCellDate(id);
              if (vDt) {
                var vDs = document.createElement('span');
                vDs.className = 'pr-cell-date';
                vDs.textContent = formatCellDate(vDt);
                el.appendChild(vDs);
              }
              el.addEventListener('click', function () { openModal(el); });
              el.addEventListener('keydown', function (e) {
                if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openModal(el); }
              });
              tr.appendChild(el);
            });
          }
          return;
        }

        var isCovered = false;
        for (var s = 0; s < sec.cols; s++) {
          if (covered[sec.id + '_' + pIdx + '_' + s]) { isCovered = true; break; }
        }
        if (isCovered) return;

        var cells = sec.panos[pIdx] || [];
        if (!cells.length) {
          mkCell(tr, '—', 'sin_asignar', cellId(sec.id, pIdx, 0), sec.cols, '—', sec.name, pIdx + 1, si === 0);
          return;
        }
        var off = 0;
        cells.forEach(function (c) {
          var span = c.span || 1, rspan = c.rowspan || 1;
          var id = cellId(sec.id, pIdx, off);
          mkCell(tr, c.t, getStatus(id, c.s), id, span, c.t, sec.name, pIdx + 1,
                 si === 0 && off === 0, rspan, c.cuchilla);
          if (rspan > 1) {
            for (var r = 1; r < rspan; r++) {
              for (var q = 0; q < span; q++) covered[sec.id + '_' + (pIdx + r) + '_' + (off + q)] = true;
            }
          }
          off += span;
        });
      });
      tbody.appendChild(tr);
    })(pIdx);
  }

  /* filas auxiliares inferiores (cadena / tirantes / calibre) */
  N.bottomRows.forEach(function (spec, i) {
    auxRow(tbody, spec, i === 0 ? 'pr-row-relinga' : 'pr-row-tirantes');
  });

  tbl.appendChild(tbody);
  updateStats();
  renderVesselHeader();
}

/* ── cabecera del buque ── */
function renderVesselHeader() {
  var N = net();
  var sub = document.getElementById('pr-vessel-sub');
  if (sub) sub.textContent = 'B/P ' + N.label + '  ·  plano ' + N.fecha;
  var mid = document.getElementById('pr-header-mid');
  if (mid) {
    mid.innerHTML = '<span>Estiradas <b>' + N.estiradas + ' brazas</b> · Armadas <b>' + N.armadas + ' brazas</b></span>' +
                    '<span>' + N.numPanos + ' paños · ' + N.alto + ' bz. de profundidad</span>';
  }
}

function switchVessel(v, btn) {
  if (!NETS[v] || v === currentVessel) return;
  currentVessel = v;
  var tabs = document.querySelectorAll('#pr-vessel-tabs .vtab');
  tabs.forEach(function (b) { b.classList.remove('active'); });
  if (btn) btn.classList.add('active');
  renderTable();
  renderLastMod();
}

/* ── totales ── */
function updateStats() {
  var counts = {};
  ESTADOS.forEach(function (e) { counts[e.id] = 0; });
  document.querySelectorAll('#pr-netPlan .pr-cell').forEach(function (el) {
    var s = getStatus(el.dataset.id, getDefaultStatus(el.dataset.id));
    if (counts[s] !== undefined) counts[s]++;
  });
  var bar = document.getElementById('pr-statsBar');
  if (!bar) return;
  bar.innerHTML = '<span class="pr-stats-label">Totales</span>';
  ESTADOS.forEach(function (e) {
    if (!counts[e.id]) return;
    var chip = document.createElement('span');
    chip.className = 'pr-stat-chip';
    var badge = document.createElement('span');
    badge.className = 'pr-stat-badge';
    badge.style.background = e.color;
    if (e.dark) badge.style.color = '#0b1f38';
    badge.textContent = counts[e.id];
    chip.appendChild(badge);
    chip.appendChild(document.createTextNode(' ' + e.label));
    bar.appendChild(chip);
  });
}

function renderLastMod() {
  var el = document.getElementById('pr-lastMod');
  if (!el) return;
  var f = bucket().fechas, last = '';
  Object.keys(f).forEach(function (k) { if (f[k] > last) last = f[k]; });
  el.textContent = last ? 'Último cambio registrado: ' + formatCellDate(last) : '';
}

/* ── modal ── */
function openModal(el) {
  activeCell = el;
  var id = el.dataset.id;
  var cur = getStatus(id, getDefaultStatus(id));
  var pn = el.dataset.panoNum;
  var panoLabel = (typeof pn === 'string' && (pn.indexOf('Panel') === 0 || isNaN(+pn))) ? pn : 'Paño ' + pn;

  document.getElementById('pr-mSub').textContent = el.dataset.secName + '  —  ' + panoLabel;
  document.getElementById('pr-mMeas').textContent = getCustomText(id, el.dataset.rawText || '—');
  resetEditBtn();

  var grid = document.getElementById('pr-mGrid');
  grid.innerHTML = '';
  ESTADOS.forEach(function (e) {
    var btn = document.createElement('button');
    btn.className = 'pr-s-btn' + (e.dark ? ' pr-s-btn-sin' : '') + (e.id === cur ? ' active' : '');
    btn.style.background = e.color;
    if (e.dark) btn.style.color = '#0b1f38';
    btn.innerHTML = '<span>' + e.label + '</span><span class="pr-chk">✓</span>';
    btn.addEventListener('click', function () { applyStatus(e.id); });
    grid.appendChild(btn);
  });

  var dateInp = document.getElementById('pr-mDateInput');
  if (dateInp) {
    dateInp.value = getCellDate(id);
    dateInp.onchange = function () {
      if (!activeCell) return;
      var v = dateInp.value;
      if (v) bucket().fechas[activeCell.dataset.id] = v;
      else delete bucket().fechas[activeCell.dataset.id];
      markTyping();
      persistDebounced();
      refreshCellDate(activeCell, v);
      renderLastMod();
    };
  }

  document.getElementById('pr-overlay').classList.remove('pr-hidden');
  setTimeout(function () { var b = grid.querySelector('button'); if (b) b.focus(); }, 40);
}

function applyStatus(statusId) {
  if (!activeCell) return;
  bucket().estados[activeCell.dataset.id] = statusId;
  markTyping();
  persistDebounced();
  activeCell.classList.remove.apply(activeCell.classList, ALL_S_CLASSES);
  activeCell.classList.add(statusClass(statusId));
  activeCell.title = getEstado(statusId).label;
  updateStats();
  closeModal();
}

function clearCellDate() {
  if (!activeCell) return;
  var dateInp = document.getElementById('pr-mDateInput');
  if (dateInp) dateInp.value = '';
  delete bucket().fechas[activeCell.dataset.id];
  markTyping();
  persistDebounced();
  refreshCellDate(activeCell, '');
  renderLastMod();
}

function closeModal() {
  resetEditBtn();
  document.getElementById('pr-overlay').classList.add('pr-hidden');
  if (activeCell) activeCell.focus();
  activeCell = null;
}

/* ── edición de texto ── */
function enableTextEdit() {
  if (editingText) return;
  editingText = true;
  var meas = document.getElementById('pr-mMeas');
  origText = meas.textContent;
  meas.innerHTML = '';
  var inp = document.createElement('input');
  inp.type = 'text';
  inp.className = 'pr-text-edit-input';
  inp.value = origText === '—' ? '' : origText;
  inp.placeholder = 'Ej: 42 × 4.1/4 × 100';
  inp.addEventListener('input', markTyping);
  inp.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') { e.preventDefault(); saveTextEdit(); }
    if (e.key === 'Escape') { e.preventDefault(); cancelTextEdit(); }
  });
  meas.appendChild(inp);
  inp.focus(); inp.select();
  var btn = document.getElementById('pr-btnEditTxt');
  btn.textContent = '✓'; btn.title = 'Guardar texto';
  btn.classList.add('saving');
  btn.onclick = saveTextEdit;
}

function saveTextEdit() {
  if (!activeCell || !editingText) return;
  var inp = document.querySelector('.pr-text-edit-input');
  var newText = inp ? inp.value.trim() : '';
  var id = activeCell.dataset.id;
  if (newText) bucket().textos[id] = newText; else delete bucket().textos[id];
  markTyping();
  persistDebounced();

  var final = newText || activeCell.dataset.rawText || '—';
  if (activeCell.classList.contains('pr-cell-vert')) {
    var vs = activeCell.querySelector('.pr-cell-vert-text');
    if (vs) vs.textContent = final;
  } else {
    var keepDate = activeCell.querySelector('.pr-cell-date');
    var keepCu   = activeCell.querySelector('.pr-cuchilla');
    activeCell.textContent = final;
    if (keepCu) activeCell.appendChild(keepCu);
    if (keepDate) activeCell.appendChild(keepDate);
  }
  document.getElementById('pr-mMeas').textContent = final;
  resetEditBtn();
}

function cancelTextEdit() {
  document.getElementById('pr-mMeas').textContent = origText;
  resetEditBtn();
}

function resetEditBtn() {
  editingText = false; origText = '';
  var btn = document.getElementById('pr-btnEditTxt');
  if (!btn) return;
  btn.textContent = '✎'; btn.title = 'Editar texto de la celda';
  btn.classList.remove('saving');
  btn.onclick = enableTextEdit;
}

/* ── reset (solo master/admin) ── */
function resetAll() {
  if (!canReset()) {
    alert('Solo un usuario master o administrador puede resetear el plano.');
    return;
  }
  if (!confirm('¿Resetear TODOS los paños de ' + net().label + ' a gris?\n\nSe conservan los textos y las fechas de último cambio.')) return;

  var est = {};
  var N = net();
  sections().forEach(function (sec) {
    if (sec.vertical && sec.panels) {
      sec.panels.forEach(function (p, pi) { est[sec.id + '_vert_' + pi] = 'sin_asignar'; });
      if (sec.divider) return;
    }
    if (sec.panos) {
      sec.panos.forEach(function (row, pIdx) {
        if (!row || !row.length) return;
        var off = 0;
        row.forEach(function (c) {
          est[cellId(sec.id, pIdx, off)] = 'sin_asignar';
          off += (c.span || 1);
        });
      });
    }
    if (!sec.divider) {
      N.topRows.concat(N.bottomRows).forEach(function (spec) {
        est[sec.id + '_' + spec.key] = 'sin_asignar';
      });
    }
  });
  bucket().estados = est;
  persistNow();
  renderTable();
}

/* El plano es mucho más ancho que alto: se imprime apaisado y escalado
   para que entre completo. La hoja se inyecta solo durante la impresión
   (@page no se puede condicionar por clase) y se retira al terminar. */
function imprimir() {
  var tbl = document.getElementById('pr-netPlan');
  var st = document.getElementById('pr-print-page');
  if (st) st.remove();
  st = document.createElement('style');
  st.id = 'pr-print-page';

  var zoom = 1;
  if (tbl) {
    // ancho útil de un A4 apaisado con 8 mm de margen ≈ 281 mm ≈ 1062 px @96dpi
    var w = tbl.scrollWidth || tbl.offsetWidth;
    if (w > 0) zoom = Math.min(1, 1062 / w);
  }
  st.textContent =
    '@media print{@page{size:A4 landscape;margin:8mm}' +
    '#pr-netPlan{zoom:' + zoom.toFixed(3) + '}}';
  document.head.appendChild(st);

  var cleanup = function () {
    var s = document.getElementById('pr-print-page');
    if (s) s.remove();
    window.removeEventListener('afterprint', cleanup);
  };
  window.addEventListener('afterprint', cleanup);
  window.print();
  setTimeout(cleanup, 3000);
}

/* ── init ── */
function init(user) {
  activeUser = user || null;
  Object.keys(NETS).forEach(function (v) {
    var l = loadLocal(v);
    if (l) data[v] = l;
  });
  if (!fbReady) initFirebase();
  var rb = document.getElementById('pr-resetBtn');
  if (rb) rb.style.display = canReset() ? '' : 'none';
  currentVessel = 'fatima';
  var tabs = document.querySelectorAll('#pr-vessel-tabs .vtab');
  tabs.forEach(function (b) { b.classList.remove('active'); });
  var ft = document.getElementById('pr-tab-fatima'); if (ft) ft.classList.add('active');
  renderTable();
  renderLastMod();
}

/* listeners globales del modal */
document.addEventListener('DOMContentLoaded', function () {
  var ov = document.getElementById('pr-overlay');
  if (ov) ov.addEventListener('click', function (e) { if (e.target === this) closeModal(); });
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    var o = document.getElementById('pr-overlay');
    if (o && !o.classList.contains('pr-hidden')) closeModal();
  });
});

/* ══════════════════════════════════════════════════════════════════
   EXPORTAR A EXCEL — .xlsx nativo con colores
   SheetJS Community (el que carga el portal) no escribe relleno de
   celda: el estilo es función de la versión Pro. Por eso el archivo
   se arma a mano — un ZIP "stored" + las partes OOXML — sin añadir
   ninguna librería. Se conservan colores, celdas combinadas, texto
   vertical del PARADO/ABANICO y las fechas de último cambio.
   ══════════════════════════════════════════════════════════════════ */

/* ── CRC32 + ZIP (método store, sin compresión) ── */
var _crcTable = null;
function crc32(buf) {
  if (!_crcTable) {
    _crcTable = [];
    for (var n = 0; n < 256; n++) {
      var c = n;
      for (var k = 0; k < 8; k++) c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
      _crcTable[n] = c >>> 0;
    }
  }
  var crc = 0 ^ (-1);
  for (var i = 0; i < buf.length; i++) crc = (crc >>> 8) ^ _crcTable[(crc ^ buf[i]) & 0xFF];
  return (crc ^ (-1)) >>> 0;
}
function strBytes(s) {
  var out = [], i, c;
  for (i = 0; i < s.length; i++) {
    c = s.codePointAt(i);
    if (c > 0xFFFF) i++;
    if (c < 0x80) out.push(c);
    else if (c < 0x800) out.push(0xC0 | (c >> 6), 0x80 | (c & 63));
    else if (c < 0x10000) out.push(0xE0 | (c >> 12), 0x80 | ((c >> 6) & 63), 0x80 | (c & 63));
    else out.push(0xF0 | (c >> 18), 0x80 | ((c >> 12) & 63), 0x80 | ((c >> 6) & 63), 0x80 | (c & 63));
  }
  return new Uint8Array(out);
}
function zipStore(files) {
  var chunks = [], central = [], offset = 0;
  function u16(a, v) { a.push(v & 255, (v >> 8) & 255); }
  function u32(a, v) { a.push(v & 255, (v >> 8) & 255, (v >> 16) & 255, (v >>> 24) & 255); }

  files.forEach(function (f) {
    var name = strBytes(f.name), body = strBytes(f.data), crc = crc32(body);
    var lh = [];
    u32(lh, 0x04034b50); u16(lh, 20); u16(lh, 0x0800); u16(lh, 0); u16(lh, 0); u16(lh, 0);
    u32(lh, crc); u32(lh, body.length); u32(lh, body.length);
    u16(lh, name.length); u16(lh, 0);
    chunks.push(new Uint8Array(lh), name, body);

    var ch = [];
    u32(ch, 0x02014b50); u16(ch, 20); u16(ch, 20); u16(ch, 0x0800); u16(ch, 0); u16(ch, 0); u16(ch, 0);
    u32(ch, crc); u32(ch, body.length); u32(ch, body.length);
    u16(ch, name.length); u16(ch, 0); u16(ch, 0); u16(ch, 0); u16(ch, 0); u32(ch, 0); u32(ch, offset);
    central.push(new Uint8Array(ch), name);
    offset += 30 + name.length + body.length;
  });

  var cdSize = central.reduce(function (s, c) { return s + c.length; }, 0);
  var eo = [];
  u32(eo, 0x06054b50); u16(eo, 0); u16(eo, 0);
  u16(eo, files.length); u16(eo, files.length);
  u32(eo, cdSize); u32(eo, offset); u16(eo, 0);

  var all = chunks.concat(central, [new Uint8Array(eo)]);
  var total = all.reduce(function (s, c) { return s + c.length; }, 0);
  var out = new Uint8Array(total), pos = 0;
  all.forEach(function (c) { out.set(c, pos); pos += c.length; });
  return out;
}

/* ── helpers OOXML ── */
function xe(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/\n/g, '&#10;');
}
function colName(n) { // 1 → A
  var s = '';
  while (n > 0) { var m = (n - 1) % 26; s = String.fromCharCode(65 + m) + s; n = (n - m - 1) / 26; }
  return s;
}

/* Índice de estilo por estado. Base + offset según variante. */
var XF = { TITLE:1, SUB:2, SECHDR:3, STATS:4, ROWLBL:5, AUXLBL:6, DIV:7, LEGEND:8, BASE:9 };
function xfFor(statusId, vertical) {
  var i = 0;
  for (var k = 0; k < ESTADOS.length; k++) if (ESTADOS[k].id === statusId) { i = k; break; }
  return XF.BASE + i + (vertical ? ESTADOS.length : 0);
}

function stylesXml() {
  var navy = '07213A', navyMid = '0D3258';
  var fills = ['<fill><patternFill patternType="none"/></fill>',
               '<fill><patternFill patternType="gray125"/></fill>'];
  ESTADOS.forEach(function (e) {
    fills.push('<fill><patternFill patternType="solid"><fgColor rgb="FF' +
               e.color.replace('#', '').toUpperCase() + '"/><bgColor indexed="64"/></patternFill></fill>');
  });
  var fNavy = fills.length;
  fills.push('<fill><patternFill patternType="solid"><fgColor rgb="FF' + navy + '"/><bgColor indexed="64"/></patternFill></fill>');
  var fNavyMid = fills.length;
  fills.push('<fill><patternFill patternType="solid"><fgColor rgb="FF' + navyMid + '"/><bgColor indexed="64"/></patternFill></fill>');

  var fonts =
    '<font><sz val="9"/><name val="Calibri"/></font>' +                                    /* 0 */
    '<font><b/><sz val="9"/><color rgb="FFFFFFFF"/><name val="Calibri"/></font>' +         /* 1 */
    '<font><sz val="9"/><color rgb="FFFFFFFF"/><name val="Calibri"/></font>' +             /* 2 */
    '<font><sz val="9"/><color rgb="FF0B1F38"/><name val="Calibri"/></font>' +             /* 3 */
    '<font><b/><sz val="15"/><color rgb="FF07213A"/><name val="Calibri"/></font>' +        /* 4 */
    '<font><sz val="10"/><color rgb="FF4E6A88"/><name val="Calibri"/></font>' +            /* 5 */
    '<font><b/><sz val="8"/><color rgb="FF88D4A0"/><name val="Calibri"/></font>';          /* 6 */

  var borders =
    '<border><left/><right/><top/><bottom/><diagonal/></border>' +
    '<border><left style="thin"><color rgb="FFFFFFFF"/></left><right style="thin"><color rgb="FFFFFFFF"/></right>' +
    '<top style="thin"><color rgb="FFFFFFFF"/></top><bottom style="thin"><color rgb="FFFFFFFF"/></bottom><diagonal/></border>';

  var xfs = ['<xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/>'];             /* 0 default */
  xfs.push('<xf fontId="4" fillId="0" borderId="0" applyFont="1"><alignment vertical="center"/></xf>');            /* 1 título */
  xfs.push('<xf fontId="5" fillId="0" borderId="0" applyFont="1"><alignment vertical="center"/></xf>');            /* 2 subtítulo */
  xfs.push('<xf fontId="1" fillId="' + fNavy + '" borderId="1" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment horizontal="center" vertical="center" wrapText="1"/></xf>');  /* 3 sección */
  xfs.push('<xf fontId="6" fillId="' + fNavyMid + '" borderId="1" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment horizontal="center" vertical="center"/></xf>');            /* 4 est/arm */
  xfs.push('<xf fontId="1" fillId="' + fNavy + '" borderId="1" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment horizontal="center" vertical="center"/></xf>');               /* 5 nº paño */
  xfs.push('<xf fontId="2" fillId="' + fNavyMid + '" borderId="1" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment horizontal="center" vertical="center" wrapText="1"/></xf>');/* 6 etiqueta aux */
  xfs.push('<xf fontId="0" fillId="' + fNavy + '" borderId="1" applyFill="1" applyBorder="1"/>');                  /* 7 separador */
  xfs.push('<xf fontId="0" fillId="0" borderId="0" applyAlignment="1"><alignment horizontal="left" vertical="center"/></xf>'); /* 8 leyenda */
  /* 9.. estados horizontales, luego los mismos rotados 90° */
  [0, 1].forEach(function (rot) {
    ESTADOS.forEach(function (e, i) {
      var font = e.dark ? 3 : 2;
      xfs.push('<xf fontId="' + font + '" fillId="' + (2 + i) + '" borderId="1" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1">' +
               '<alignment horizontal="center" vertical="center" wrapText="1"' + (rot ? ' textRotation="90"' : '') + '/></xf>');
    });
  });

  return '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
    '<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">' +
    '<fonts count="7">' + fonts + '</fonts>' +
    '<fills count="' + fills.length + '">' + fills.join('') + '</fills>' +
    '<borders count="2">' + borders + '</borders>' +
    '<cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>' +
    '<cellXfs count="' + xfs.length + '">' + xfs.join('') + '</cellXfs>' +
    '<cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles>' +
    '</styleSheet>';
}

/* ── construcción de la hoja ── */
function buildSheet() {
  var N = net(), secs = sections(), NUM = N.numPanos;

  /* mapa de columnas: A = nº de paño, luego cada sección aporta sec.cols */
  var colOfSec = {}, cursor = 2, cols = [{ w: 10 }];
  secs.forEach(function (sec) {
    colOfSec[sec.id] = cursor;
    var maxCells = 1;
    if (sec.panos) sec.panos.forEach(function (r) { if (r && r.length > maxCells) maxCells = r.length; });
    var unit;
    if (sec.divider) unit = 1.6;
    else if (sec.vertical) unit = 5;
    else unit = Math.max(2, (20 * maxCells) / sec.cols);
    for (var i = 0; i < sec.cols; i++) cols.push({ w: unit });
    cursor += sec.cols;
  });
  var lastCol = cursor - 1;

  var rows = {}, merges = [];
  function put(r, c, text, xf) {
    if (!rows[r]) rows[r] = {};
    rows[r][c] = { t: text, s: xf };
  }
  function merge(r1, c1, r2, c2) {
    if (r1 === r2 && c1 === c2) return;
    merges.push(colName(c1) + r1 + ':' + colName(c2) + r2);
  }
  function cellText(id, base, cuchilla) {
    var t = getCustomText(id, base || '—');
    if (cuchilla) t += '\n✂ ' + cuchilla;
    var d = getCellDate(id);
    if (d) t += '\n' + formatCellDate(d);
    return t;
  }

  /* encabezado del documento */
  put(1, 1, 'PLANO DE RED  ·  B/P ' + N.label, XF.TITLE);      merge(1, 1, 1, Math.min(lastCol, 14));
  put(2, 1, N.estiradas + ' brazas estiradas  ·  ' + N.armadas + ' brazas armadas  ·  ' +
            NUM + ' paños (' + N.alto + ' bz. de alto)  ·  plano ' + N.fecha, XF.SUB);
  merge(2, 1, 2, Math.min(lastCol, 18));
  /* leyenda de colores */
  var lc = 1;
  ESTADOS.forEach(function (e) {
    put(3, lc, '', xfFor(e.id, false));
    put(3, lc + 1, e.label, XF.LEGEND);
    merge(3, lc + 1, 3, lc + 4);
    lc += 6;
  });

  var R_SEC = 5, R_STATS = 6, r = 7;

  /* fila de nombres de sección + fila est/arm */
  secs.forEach(function (sec) {
    var c0 = colOfSec[sec.id], c1 = c0 + sec.cols - 1;
    if (sec.divider) {
      put(R_SEC, c0, '', XF.DIV); put(R_STATS, c0, '', XF.DIV);
      return;
    }
    put(R_SEC, c0, sec.name, XF.SECHDR); merge(R_SEC, c0, R_SEC, c1);
    put(R_STATS, c0, sec.estiradas === '' ? '' : sec.estiradas + ' est.  ·  ' + sec.armadas + ' arm.', XF.STATS);
    merge(R_STATS, c0, R_STATS, c1);
  });

  /* filas auxiliares superiores */
  N.topRows.forEach(function (spec) {
    put(r, 1, spec.label, XF.AUXLBL);
    secs.forEach(function (sec) {
      var c0 = colOfSec[sec.id], c1 = c0 + sec.cols - 1;
      if (sec.divider) { put(r, c0, '', XF.DIV); return; }
      var id = sec.id + '_' + spec.key, val = sec[spec.field] || '—';
      put(r, c0, cellText(id, val), xfFor(getStatus(id, 'sin_asignar'), false));
      merge(r, c0, r, c1);
    });
    r++;
  });

  var firstPano = r;

  /* paños */
  var covered = {};
  for (var p = 0; p < NUM; p++) {
    put(r, 1, p + 1, XF.ROWLBL);
    secs.forEach(function (sec) {
      var c0 = colOfSec[sec.id];
      if (sec.vertical) {
        if (p === 0) {
          sec.panels.forEach(function (pl, pi) {
            var id = sec.id + '_vert_' + pi;
            put(firstPano, c0 + pi, sec.divider ? '' : cellText(id, pl.t),
                sec.divider ? XF.DIV : xfFor(getStatus(id, pl.s), true));
            merge(firstPano, c0 + pi, firstPano + NUM - 1, c0 + pi);
          });
        }
        return;
      }
      var isCov = false;
      for (var s = 0; s < sec.cols; s++) if (covered[sec.id + '_' + p + '_' + s]) { isCov = true; break; }
      if (isCov) return;
      var cells = sec.panos[p] || [];
      if (!cells.length) {
        var idE = cellId(sec.id, p, 0);
        put(r, c0, cellText(idE, '—'), xfFor(getStatus(idE, 'sin_asignar'), false));
        merge(r, c0, r, c0 + sec.cols - 1);
        return;
      }
      var off = 0;
      cells.forEach(function (c) {
        var span = c.span || 1, rspan = c.rowspan || 1, id = cellId(sec.id, p, off);
        put(r, c0 + off, cellText(id, c.t, c.cuchilla), xfFor(getStatus(id, c.s), false));
        merge(r, c0 + off, r + rspan - 1, c0 + off + span - 1);
        if (rspan > 1) for (var k = 1; k < rspan; k++) for (var q = 0; q < span; q++) covered[sec.id + '_' + (p + k) + '_' + (off + q)] = true;
        off += span;
      });
    });
    r++;
  }

  /* filas auxiliares inferiores */
  N.bottomRows.forEach(function (spec) {
    put(r, 1, spec.label, XF.AUXLBL);
    secs.forEach(function (sec) {
      var c0 = colOfSec[sec.id], c1 = c0 + sec.cols - 1;
      if (sec.divider) { put(r, c0, '', XF.DIV); return; }
      var id = sec.id + '_' + spec.key, val = sec[spec.field] || '—';
      put(r, c0, cellText(id, val), xfFor(getStatus(id, 'sin_asignar'), false));
      merge(r, c0, r, c1);
    });
    r++;
  });
  var lastRow = r - 1;

  /* XML */
  var colsXml = '<cols>';
  cols.forEach(function (c, i) {
    colsXml += '<col min="' + (i + 1) + '" max="' + (i + 1) + '" width="' + c.w.toFixed(2) + '" customWidth="1"/>';
  });
  colsXml += '</cols>';

  var body = '';
  Object.keys(rows).map(Number).sort(function (a, b) { return a - b; }).forEach(function (rn) {
    var ht = (rn >= firstPano && rn <= lastRow) ? ' ht="26" customHeight="1"'
           : (rn === 1 ? ' ht="24" customHeight="1"' : '');
    body += '<row r="' + rn + '"' + ht + '>';
    Object.keys(rows[rn]).map(Number).sort(function (a, b) { return a - b; }).forEach(function (cn) {
      var cell = rows[rn][cn], ref = colName(cn) + rn;
      if (cell.t === '' || cell.t == null) body += '<c r="' + ref + '" s="' + cell.s + '"/>';
      else if (typeof cell.t === 'number') body += '<c r="' + ref + '" s="' + cell.s + '"><v>' + cell.t + '</v></c>';
      else body += '<c r="' + ref + '" s="' + cell.s + '" t="inlineStr"><is><t xml:space="preserve">' + xe(cell.t) + '</t></is></c>';
    });
    body += '</row>';
  });

  return '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
    '<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">' +
    '<sheetPr><pageSetUpPr fitToPage="1"/></sheetPr>' +
    '<dimension ref="A1:' + colName(lastCol) + lastRow + '"/>' +
    '<sheetViews><sheetView workbookViewId="0" showGridLines="0">' +
    '<pane xSplit="1" ySplit="' + R_STATS + '" topLeftCell="B' + (R_STATS + 1) + '" activePane="bottomRight" state="frozen"/>' +
    '</sheetView></sheetViews>' +
    '<sheetFormatPr defaultRowHeight="14"/>' +
    colsXml +
    '<sheetData>' + body + '</sheetData>' +
    '<mergeCells count="' + merges.length + '">' +
      merges.map(function (m) { return '<mergeCell ref="' + m + '"/>'; }).join('') +
    '</mergeCells>' +
    '<pageMargins left="0.25" right="0.25" top="0.4" bottom="0.4" header="0.2" footer="0.2"/>' +
    '<pageSetup paperSize="9" orientation="landscape" fitToWidth="1" fitToHeight="0"/>' +
    '</worksheet>';
}

function exportarExcel() {
  try {
    var files = [
      { name:'[Content_Types].xml', data:
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
        '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">' +
        '<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>' +
        '<Default Extension="xml" ContentType="application/xml"/>' +
        '<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>' +
        '<Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>' +
        '<Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>' +
        '</Types>' },
      { name:'_rels/.rels', data:
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
        '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' +
        '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>' +
        '</Relationships>' },
      { name:'xl/workbook.xml', data:
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
        '<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" ' +
        'xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">' +
        '<sheets><sheet name="Plano de Red" sheetId="1" r:id="rId1"/></sheets>' +
        '</workbook>' },
      { name:'xl/_rels/workbook.xml.rels', data:
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
        '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' +
        '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>' +
        '<Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>' +
        '</Relationships>' },
      { name:'xl/styles.xml', data: stylesXml() },
      { name:'xl/worksheets/sheet1.xml', data: buildSheet() },
    ];

    var bytes = zipStore(files);
    var blob = new Blob([bytes], { type:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    var hoy = new Date().toISOString().slice(0, 10);
    var nombre = 'Plano_Red_' + (currentVessel === 'gracia' ? 'Maria_de_Gracia' : 'Maria_Fatima') + '_' + hoy + '.xlsx';
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url; a.download = nombre;
    document.body.appendChild(a); a.click();
    setTimeout(function () { document.body.removeChild(a); URL.revokeObjectURL(url); }, 1500);
  } catch (e) {
    alert('No se pudo generar el Excel: ' + e.message);
  }
}

return {
  init: init,
  switchVessel: switchVessel,
  closeModal: closeModal,
  clearCellDate: clearCellDate,
  enableTextEdit: enableTextEdit,
  resetAll: resetAll,
  imprimir: imprimir,
  exportarExcel: exportarExcel,
};

})();
