(function(){
  "use strict";
  var BOY = window.BOY = {};

  /* ---------- catálogos ---------- */
  var PROPIETARIOS = ["", "MARIA FATIMA", "MARIA DE GRACIA", "BODEGA EN TIERRA"];
  var ESTADOS      = ["Dada de alta", "Dada de baja"];
  var ESTADOS2     = ["", "A BORDO PARA VIAJE", "ACTIVA", "POR RECUPERAR", "FUERA DE RANGO", "IRRECUPERABLE"];
  var ORIGENES     = ["", "COMPRADA", "RECUPERADA"];
  var DONDE        = ["", "MANTA", "GALAPAGOS", "OTRO"];
  var ROLES_EDIT   = ["operaciones", "admin", "master"];
  var SIN = "__SIN__";

  var SEED = [{"numero": "259", "isn": "T8E066271604", "propietario": "", "estado": "Dada de baja", "fechaAlta": "", "fechaBaja": "2026-08-04", "estado2": "", "veces": 0, "donde": "", "origen": ""}, {"numero": "286", "isn": "T8E075285963", "propietario": "", "estado": "Dada de baja", "fechaAlta": "", "fechaBaja": "2026-08-04", "estado2": "", "veces": 0, "donde": "", "origen": ""}, {"numero": "299", "isn": "T8E080292541", "propietario": "", "estado": "Dada de baja", "fechaAlta": "", "fechaBaja": "2026-08-04", "estado2": "", "veces": 0, "donde": "", "origen": ""}, {"numero": "318", "isn": "T8E084297810", "propietario": "", "estado": "Dada de baja", "fechaAlta": "", "fechaBaja": "2026-08-04", "estado2": "", "veces": 0, "donde": "", "origen": ""}, {"numero": "320", "isn": "T8E088301623", "propietario": "", "estado": "Dada de baja", "fechaAlta": "", "fechaBaja": "2026-08-04", "estado2": "", "veces": 0, "donde": "", "origen": ""}, {"numero": "330", "isn": "T8E102316604", "propietario": "", "estado": "Dada de baja", "fechaAlta": "", "fechaBaja": "2026-08-04", "estado2": "", "veces": 0, "donde": "", "origen": ""}, {"numero": "340", "isn": "T8E101312587", "propietario": "", "estado": "Dada de alta", "fechaAlta": "2026-01-28", "fechaBaja": "", "estado2": "", "veces": 0, "donde": "", "origen": ""}, {"numero": "347", "isn": "T8E101309591", "propietario": "", "estado": "Dada de baja", "fechaAlta": "", "fechaBaja": "2026-08-04", "estado2": "", "veces": 0, "donde": "", "origen": ""}, {"numero": "351", "isn": "T8E103323401", "propietario": "", "estado": "Dada de baja", "fechaAlta": "", "fechaBaja": "2026-03-01", "estado2": "", "veces": 0, "donde": "", "origen": ""}, {"numero": "354", "isn": "T8E101323388", "propietario": "", "estado": "Dada de alta", "fechaAlta": "2026-01-28", "fechaBaja": "", "estado2": "", "veces": 0, "donde": "", "origen": ""}, {"numero": "356", "isn": "T8E101324903", "propietario": "", "estado": "Dada de alta", "fechaAlta": "2026-01-28", "fechaBaja": "", "estado2": "", "veces": 0, "donde": "", "origen": ""}, {"numero": "365", "isn": "T8E106331528", "propietario": "", "estado": "Dada de baja", "fechaAlta": "", "fechaBaja": "2026-08-04", "estado2": "", "veces": 0, "donde": "", "origen": ""}, {"numero": "369", "isn": "T8E106333150", "propietario": "", "estado": "Dada de alta", "fechaAlta": "2026-08-04", "fechaBaja": "", "estado2": "", "veces": 0, "donde": "", "origen": ""}, {"numero": "370", "isn": "T8E106332906", "propietario": "", "estado": "Dada de alta", "fechaAlta": "", "fechaBaja": "", "estado2": "", "veces": 0, "donde": "", "origen": ""}, {"numero": "371", "isn": "T8E106333145", "propietario": "", "estado": "Dada de alta", "fechaAlta": "2026-01-28", "fechaBaja": "", "estado2": "", "veces": 0, "donde": "", "origen": ""}, {"numero": "378", "isn": "T8E107336563", "propietario": "", "estado": "Dada de baja", "fechaAlta": "", "fechaBaja": "2026-08-04", "estado2": "", "veces": 0, "donde": "", "origen": ""}, {"numero": "381", "isn": "T8E108351097", "propietario": "", "estado": "Dada de alta", "fechaAlta": "2026-01-28", "fechaBaja": "", "estado2": "", "veces": 0, "donde": "", "origen": ""}, {"numero": "382", "isn": "T8E108351117", "propietario": "", "estado": "Dada de baja", "fechaAlta": "", "fechaBaja": "2026-03-01", "estado2": "", "veces": 0, "donde": "", "origen": ""}, {"numero": "387", "isn": "T8E112358661", "propietario": "", "estado": "Dada de alta", "fechaAlta": "2026-01-28", "fechaBaja": "", "estado2": "", "veces": 0, "donde": "", "origen": ""}, {"numero": "388", "isn": "T8E112358595", "propietario": "", "estado": "Dada de alta", "fechaAlta": "", "fechaBaja": "", "estado2": "", "veces": 0, "donde": "", "origen": ""}, {"numero": "389", "isn": "T8E112358587", "propietario": "", "estado": "Dada de baja", "fechaAlta": "", "fechaBaja": "2026-08-04", "estado2": "", "veces": 0, "donde": "", "origen": ""}, {"numero": "390", "isn": "T8E112358589", "propietario": "", "estado": "Dada de alta", "fechaAlta": "2026-01-28", "fechaBaja": "", "estado2": "", "veces": 0, "donde": "", "origen": ""}, {"numero": "398", "isn": "T8E112359866", "propietario": "", "estado": "Dada de alta", "fechaAlta": "2026-01-28", "fechaBaja": "", "estado2": "", "veces": 0, "donde": "", "origen": ""}, {"numero": "401", "isn": "T8E112359904", "propietario": "", "estado": "Dada de baja", "fechaAlta": "", "fechaBaja": "2026-03-01", "estado2": "", "veces": 0, "donde": "", "origen": ""}, {"numero": "405", "isn": "T8E114363431", "propietario": "", "estado": "Dada de alta", "fechaAlta": "2026-01-28", "fechaBaja": "", "estado2": "", "veces": 0, "donde": "", "origen": ""}, {"numero": "406", "isn": "T8E114364040", "propietario": "", "estado": "Dada de alta", "fechaAlta": "", "fechaBaja": "", "estado2": "", "veces": 0, "donde": "", "origen": ""}, {"numero": "408", "isn": "T8E114364035", "propietario": "", "estado": "Dada de alta", "fechaAlta": "", "fechaBaja": "", "estado2": "", "veces": 0, "donde": "", "origen": ""}, {"numero": "410", "isn": "T8E115365114", "propietario": "", "estado": "Dada de alta", "fechaAlta": "2026-01-28", "fechaBaja": "", "estado2": "", "veces": 0, "donde": "", "origen": ""}, {"numero": "412", "isn": "T8E115365020", "propietario": "", "estado": "Dada de baja", "fechaAlta": "", "fechaBaja": "2026-08-04", "estado2": "", "veces": 0, "donde": "", "origen": ""}, {"numero": "413", "isn": "T8E115365100", "propietario": "", "estado": "Dada de baja", "fechaAlta": "", "fechaBaja": "2026-03-01", "estado2": "", "veces": 0, "donde": "", "origen": ""}, {"numero": "415", "isn": "T8E114363920", "propietario": "", "estado": "Dada de alta", "fechaAlta": "2026-01-28", "fechaBaja": "", "estado2": "", "veces": 0, "donde": "", "origen": ""}, {"numero": "416", "isn": "T8E114363926", "propietario": "", "estado": "Dada de alta", "fechaAlta": "2026-08-04", "fechaBaja": "", "estado2": "", "veces": 0, "donde": "", "origen": ""}, {"numero": "419", "isn": "T8E113374955", "propietario": "", "estado": "Dada de baja", "fechaAlta": "", "fechaBaja": "2026-03-01", "estado2": "", "veces": 0, "donde": "", "origen": ""}, {"numero": "420", "isn": "T8E114374934", "propietario": "", "estado": "Dada de alta", "fechaAlta": "2026-08-04", "fechaBaja": "", "estado2": "", "veces": 0, "donde": "", "origen": ""}, {"numero": "421", "isn": "T8E114374942", "propietario": "", "estado": "Dada de baja", "fechaAlta": "", "fechaBaja": "2026-08-04", "estado2": "", "veces": 0, "donde": "", "origen": ""}, {"numero": "422", "isn": "T8E113374819", "propietario": "", "estado": "Dada de baja", "fechaAlta": "", "fechaBaja": "2026-08-04", "estado2": "", "veces": 0, "donde": "", "origen": ""}, {"numero": "423", "isn": "T8E113374902", "propietario": "", "estado": "Dada de baja", "fechaAlta": "", "fechaBaja": "2026-08-04", "estado2": "", "veces": 0, "donde": "", "origen": ""}, {"numero": "424", "isn": "T8E113374949", "propietario": "", "estado": "Dada de baja", "fechaAlta": "", "fechaBaja": "2026-08-04", "estado2": "", "veces": 0, "donde": "", "origen": ""}, {"numero": "425", "isn": "T8E113374962", "propietario": "", "estado": "Dada de alta", "fechaAlta": "", "fechaBaja": "", "estado2": "", "veces": 0, "donde": "", "origen": ""}, {"numero": "426", "isn": "T8E113374943", "propietario": "", "estado": "Dada de alta", "fechaAlta": "2026-01-28", "fechaBaja": "", "estado2": "", "veces": 0, "donde": "", "origen": ""}, {"numero": "427", "isn": "T8E113374952", "propietario": "", "estado": "Dada de baja", "fechaAlta": "", "fechaBaja": "2026-08-04", "estado2": "", "veces": 0, "donde": "", "origen": ""}, {"numero": "428", "isn": "T8E113374970", "propietario": "", "estado": "Dada de alta", "fechaAlta": "", "fechaBaja": "", "estado2": "", "veces": 0, "donde": "", "origen": ""}, {"numero": "430", "isn": "T8E113374978", "propietario": "", "estado": "Dada de alta", "fechaAlta": "2026-01-28", "fechaBaja": "", "estado2": "", "veces": 0, "donde": "", "origen": ""}, {"numero": "431", "isn": "T8E094380776", "propietario": "", "estado": "Dada de baja", "fechaAlta": "", "fechaBaja": "2026-08-04", "estado2": "", "veces": 0, "donde": "", "origen": ""}, {"numero": "434", "isn": "T8E094380906", "propietario": "", "estado": "Dada de baja", "fechaAlta": "", "fechaBaja": "2026-08-04", "estado2": "", "veces": 0, "donde": "", "origen": ""}, {"numero": "436", "isn": "T8E094380769", "propietario": "", "estado": "Dada de baja", "fechaAlta": "", "fechaBaja": "2026-08-04", "estado2": "", "veces": 0, "donde": "", "origen": ""}, {"numero": "437", "isn": "T8E094380795", "propietario": "", "estado": "Dada de alta", "fechaAlta": "2026-08-04", "fechaBaja": "", "estado2": "", "veces": 0, "donde": "", "origen": ""}, {"numero": "438", "isn": "T8E094379874", "propietario": "", "estado": "Dada de baja", "fechaAlta": "", "fechaBaja": "2026-08-04", "estado2": "", "veces": 0, "donde": "", "origen": ""}, {"numero": "439", "isn": "T8E094380768", "propietario": "", "estado": "Dada de alta", "fechaAlta": "2026-04-16", "fechaBaja": "", "estado2": "", "veces": 0, "donde": "", "origen": ""}, {"numero": "440", "isn": "T8E094380836", "propietario": "", "estado": "Dada de alta", "fechaAlta": "2026-01-28", "fechaBaja": "", "estado2": "", "veces": 0, "donde": "", "origen": ""}, {"numero": "441", "isn": "T8E094379855", "propietario": "", "estado": "Dada de alta", "fechaAlta": "2026-01-28", "fechaBaja": "", "estado2": "", "veces": 0, "donde": "", "origen": ""}, {"numero": "442", "isn": "T8E094379885", "propietario": "", "estado": "Dada de alta", "fechaAlta": "2026-08-04", "fechaBaja": "", "estado2": "", "veces": 0, "donde": "", "origen": ""}, {"numero": "443", "isn": "T8E094379864", "propietario": "", "estado": "Dada de alta", "fechaAlta": "2026-01-28", "fechaBaja": "", "estado2": "", "veces": 0, "donde": "", "origen": ""}, {"numero": "444", "isn": "T8E094381981", "propietario": "", "estado": "Dada de alta", "fechaAlta": "2026-01-28", "fechaBaja": "", "estado2": "", "veces": 0, "donde": "", "origen": ""}, {"numero": "445", "isn": "T8E094381987", "propietario": "", "estado": "Dada de baja", "fechaAlta": "", "fechaBaja": "2026-08-04", "estado2": "", "veces": 0, "donde": "", "origen": ""}, {"numero": "446", "isn": "T8E094382005", "propietario": "", "estado": "Dada de baja", "fechaAlta": "", "fechaBaja": "2026-08-04", "estado2": "", "veces": 0, "donde": "", "origen": ""}, {"numero": "447", "isn": "T8E094382011", "propietario": "", "estado": "Dada de baja", "fechaAlta": "", "fechaBaja": "2026-08-04", "estado2": "", "veces": 0, "donde": "", "origen": ""}, {"numero": "448", "isn": "T8E094382013", "propietario": "", "estado": "Dada de baja", "fechaAlta": "", "fechaBaja": "2026-08-04", "estado2": "", "veces": 0, "donde": "", "origen": ""}, {"numero": "450", "isn": "T8E094382159", "propietario": "", "estado": "Dada de alta", "fechaAlta": "2026-01-28", "fechaBaja": "", "estado2": "", "veces": 0, "donde": "", "origen": ""}, {"numero": "451", "isn": "T8E094382198", "propietario": "", "estado": "Dada de alta", "fechaAlta": "2026-04-16", "fechaBaja": "", "estado2": "", "veces": 0, "donde": "", "origen": ""}, {"numero": "452", "isn": "T8E094382038", "propietario": "", "estado": "Dada de baja", "fechaAlta": "", "fechaBaja": "2026-08-04", "estado2": "", "veces": 0, "donde": "", "origen": ""}, {"numero": "453", "isn": "T8E094379875", "propietario": "", "estado": "Dada de baja", "fechaAlta": "", "fechaBaja": "2026-08-04", "estado2": "", "veces": 0, "donde": "", "origen": ""}, {"numero": "454", "isn": "T8E094382196", "propietario": "", "estado": "Dada de alta", "fechaAlta": "2026-01-28", "fechaBaja": "", "estado2": "", "veces": 0, "donde": "", "origen": ""}, {"numero": "455", "isn": "T8E094382182", "propietario": "", "estado": "Dada de alta", "fechaAlta": "2026-08-04", "fechaBaja": "", "estado2": "", "veces": 0, "donde": "", "origen": ""}, {"numero": "456", "isn": "T8E094382119", "propietario": "", "estado": "Dada de alta", "fechaAlta": "2026-04-16", "fechaBaja": "", "estado2": "", "veces": 0, "donde": "", "origen": ""}, {"numero": "457", "isn": "T8E094380440", "propietario": "", "estado": "Dada de baja", "fechaAlta": "", "fechaBaja": "2026-08-04", "estado2": "", "veces": 0, "donde": "", "origen": ""}, {"numero": "458", "isn": "T8E094382163", "propietario": "", "estado": "Dada de alta", "fechaAlta": "2026-01-28", "fechaBaja": "", "estado2": "", "veces": 0, "donde": "", "origen": ""}, {"numero": "459", "isn": "T8E094380441", "propietario": "", "estado": "Dada de baja", "fechaAlta": "", "fechaBaja": "2026-08-04", "estado2": "", "veces": 0, "donde": "", "origen": ""}, {"numero": "461", "isn": "T8E094380080", "propietario": "", "estado": "Dada de baja", "fechaAlta": "", "fechaBaja": "2026-08-04", "estado2": "", "veces": 0, "donde": "", "origen": ""}, {"numero": "462", "isn": "T8E092389863", "propietario": "", "estado": "Dada de alta", "fechaAlta": "2026-01-28", "fechaBaja": "", "estado2": "", "veces": 0, "donde": "", "origen": ""}, {"numero": "463", "isn": "T8E092389761", "propietario": "", "estado": "Dada de alta", "fechaAlta": "", "fechaBaja": "", "estado2": "", "veces": 0, "donde": "", "origen": ""}, {"numero": "464", "isn": "T8E092389866", "propietario": "", "estado": "Dada de alta", "fechaAlta": "2026-01-28", "fechaBaja": "", "estado2": "", "veces": 0, "donde": "", "origen": ""}, {"numero": "465", "isn": "T8E092389873", "propietario": "", "estado": "Dada de baja", "fechaAlta": "", "fechaBaja": "2026-08-04", "estado2": "", "veces": 0, "donde": "", "origen": ""}, {"numero": "466", "isn": "T8E092389852", "propietario": "", "estado": "Dada de alta", "fechaAlta": "2026-01-28", "fechaBaja": "", "estado2": "", "veces": 0, "donde": "", "origen": ""}, {"numero": "467", "isn": "T8E092389864", "propietario": "", "estado": "Dada de baja", "fechaAlta": "", "fechaBaja": "2026-08-04", "estado2": "", "veces": 0, "donde": "", "origen": ""}, {"numero": "468", "isn": "T8E092389867", "propietario": "", "estado": "Dada de alta", "fechaAlta": "2026-01-28", "fechaBaja": "", "estado2": "", "veces": 0, "donde": "", "origen": ""}, {"numero": "470", "isn": "T8E092389854", "propietario": "", "estado": "Dada de baja", "fechaAlta": "", "fechaBaja": "2026-08-04", "estado2": "", "veces": 0, "donde": "", "origen": ""}, {"numero": "471", "isn": "T8E091389608", "propietario": "", "estado": "Dada de baja", "fechaAlta": "", "fechaBaja": "2026-08-04", "estado2": "", "veces": 0, "donde": "", "origen": ""}, {"numero": "472", "isn": "T8E092389850", "propietario": "", "estado": "Dada de alta", "fechaAlta": "2026-01-28", "fechaBaja": "", "estado2": "", "veces": 0, "donde": "", "origen": ""}, {"numero": "473", "isn": "T8E092389879", "propietario": "", "estado": "Dada de baja", "fechaAlta": "", "fechaBaja": "2026-08-04", "estado2": "", "veces": 0, "donde": "", "origen": ""}, {"numero": "474", "isn": "T8E092389886", "propietario": "", "estado": "Dada de alta", "fechaAlta": "2026-04-16", "fechaBaja": "", "estado2": "", "veces": 0, "donde": "", "origen": ""}, {"numero": "475", "isn": "T8E092389892", "propietario": "", "estado": "Dada de baja", "fechaAlta": "", "fechaBaja": "2026-08-04", "estado2": "", "veces": 0, "donde": "", "origen": ""}, {"numero": "476", "isn": "T8E092389857", "propietario": "", "estado": "Dada de baja", "fechaAlta": "", "fechaBaja": "2026-08-04", "estado2": "", "veces": 0, "donde": "", "origen": ""}, {"numero": "477", "isn": "T8E092389875", "propietario": "", "estado": "Dada de baja", "fechaAlta": "", "fechaBaja": "2026-08-04", "estado2": "", "veces": 0, "donde": "", "origen": ""}, {"numero": "478", "isn": "T8E091389859", "propietario": "", "estado": "Dada de alta", "fechaAlta": "2026-03-01", "fechaBaja": "", "estado2": "", "veces": 0, "donde": "", "origen": ""}, {"numero": "479", "isn": "T8E092389870", "propietario": "", "estado": "Dada de baja", "fechaAlta": "", "fechaBaja": "2026-08-04", "estado2": "", "veces": 0, "donde": "", "origen": ""}, {"numero": "480", "isn": "T8E092389861", "propietario": "", "estado": "Dada de alta", "fechaAlta": "2026-01-28", "fechaBaja": "", "estado2": "", "veces": 0, "donde": "", "origen": ""}, {"numero": "481", "isn": "T8E092389907", "propietario": "", "estado": "Dada de alta", "fechaAlta": "2026-01-28", "fechaBaja": "", "estado2": "", "veces": 0, "donde": "", "origen": ""}, {"numero": "482", "isn": "T8E133403390", "propietario": "", "estado": "Dada de alta", "fechaAlta": "2026-01-28", "fechaBaja": "", "estado2": "", "veces": 0, "donde": "", "origen": ""}, {"numero": "483", "isn": "T8E133403394", "propietario": "", "estado": "Dada de alta", "fechaAlta": "2026-01-28", "fechaBaja": "", "estado2": "", "veces": 0, "donde": "", "origen": ""}, {"numero": "484", "isn": "T8E133403416", "propietario": "", "estado": "Dada de alta", "fechaAlta": "2026-01-28", "fechaBaja": "", "estado2": "", "veces": 0, "donde": "", "origen": ""}, {"numero": "485", "isn": "T8E133403426", "propietario": "", "estado": "Dada de baja", "fechaAlta": "", "fechaBaja": "2026-08-04", "estado2": "", "veces": 0, "donde": "", "origen": ""}, {"numero": "486", "isn": "T8E133403572", "propietario": "", "estado": "Dada de alta", "fechaAlta": "2026-01-28", "fechaBaja": "", "estado2": "", "veces": 0, "donde": "", "origen": ""}, {"numero": "487", "isn": "T8E097399159", "propietario": "", "estado": "Dada de alta", "fechaAlta": "2026-01-28", "fechaBaja": "", "estado2": "", "veces": 0, "donde": "", "origen": ""}, {"numero": "488", "isn": "T8E097399414", "propietario": "", "estado": "Dada de alta", "fechaAlta": "2026-01-28", "fechaBaja": "", "estado2": "", "veces": 0, "donde": "", "origen": ""}, {"numero": "489", "isn": "T8E097399419", "propietario": "", "estado": "Dada de alta", "fechaAlta": "2026-08-04", "fechaBaja": "", "estado2": "", "veces": 0, "donde": "", "origen": ""}, {"numero": "490", "isn": "T8E097399386", "propietario": "", "estado": "Dada de alta", "fechaAlta": "2026-01-28", "fechaBaja": "", "estado2": "", "veces": 0, "donde": "", "origen": ""}, {"numero": "491", "isn": "T8E091387716", "propietario": "", "estado": "Dada de alta", "fechaAlta": "2026-01-28", "fechaBaja": "", "estado2": "", "veces": 0, "donde": "", "origen": ""}, {"numero": "492", "isn": "T8E092387682", "propietario": "", "estado": "Dada de alta", "fechaAlta": "2026-01-28", "fechaBaja": "", "estado2": "", "veces": 0, "donde": "", "origen": ""}, {"numero": "493", "isn": "T8E092387707", "propietario": "", "estado": "Dada de alta", "fechaAlta": "2026-01-28", "fechaBaja": "", "estado2": "", "veces": 0, "donde": "", "origen": ""}, {"numero": "494", "isn": "T8E094379833", "propietario": "", "estado": "Dada de alta", "fechaAlta": "2026-01-28", "fechaBaja": "", "estado2": "", "veces": 0, "donde": "", "origen": ""}, {"numero": "495", "isn": "T8E094380981", "propietario": "", "estado": "Dada de baja", "fechaAlta": "", "fechaBaja": "2026-08-04", "estado2": "", "veces": 0, "donde": "", "origen": ""}, {"numero": "496", "isn": "T8E094381013", "propietario": "", "estado": "Dada de alta", "fechaAlta": "", "fechaBaja": "", "estado2": "", "veces": 0, "donde": "", "origen": ""}, {"numero": "497", "isn": "T8E091387713", "propietario": "", "estado": "Dada de alta", "fechaAlta": "2026-01-28", "fechaBaja": "", "estado2": "", "veces": 0, "donde": "", "origen": ""}, {"numero": "498", "isn": "T8E092387670", "propietario": "", "estado": "Dada de alta", "fechaAlta": "2026-01-28", "fechaBaja": "", "estado2": "", "veces": 0, "donde": "", "origen": ""}, {"numero": "499", "isn": "T8E092387686", "propietario": "", "estado": "Dada de baja", "fechaAlta": "", "fechaBaja": "2026-08-04", "estado2": "", "veces": 0, "donde": "", "origen": ""}, {"numero": "500", "isn": "T8E092387697", "propietario": "", "estado": "Dada de baja", "fechaAlta": "", "fechaBaja": "2026-08-04", "estado2": "", "veces": 0, "donde": "", "origen": ""}, {"numero": "501", "isn": "T8E092386046", "propietario": "", "estado": "Dada de alta", "fechaAlta": "2026-02-09", "fechaBaja": "", "estado2": "", "veces": 0, "donde": "", "origen": ""}, {"numero": "502", "isn": "T8E092386062", "propietario": "", "estado": "Dada de baja", "fechaAlta": "", "fechaBaja": "2026-08-04", "estado2": "", "veces": 0, "donde": "", "origen": ""}, {"numero": "503", "isn": "T8E092386063", "propietario": "", "estado": "Dada de alta", "fechaAlta": "2026-02-09", "fechaBaja": "", "estado2": "", "veces": 0, "donde": "", "origen": ""}, {"numero": "504", "isn": "T8E096394321", "propietario": "", "estado": "Dada de alta", "fechaAlta": "2026-08-04", "fechaBaja": "", "estado2": "", "veces": 0, "donde": "", "origen": ""}, {"numero": "505", "isn": "T8E096394420", "propietario": "", "estado": "Dada de baja", "fechaAlta": "", "fechaBaja": "2026-08-04", "estado2": "", "veces": 0, "donde": "", "origen": ""}, {"numero": "506", "isn": "T8E096394439", "propietario": "", "estado": "Dada de alta", "fechaAlta": "2026-08-04", "fechaBaja": "", "estado2": "", "veces": 0, "donde": "", "origen": ""}, {"numero": "507", "isn": "T8E096394445", "propietario": "", "estado": "Dada de alta", "fechaAlta": "2026-02-09", "fechaBaja": "", "estado2": "", "veces": 0, "donde": "", "origen": ""}, {"numero": "508", "isn": "T8E096394447", "propietario": "", "estado": "Dada de baja", "fechaAlta": "", "fechaBaja": "2026-08-04", "estado2": "", "veces": 0, "donde": "", "origen": ""}, {"numero": "509", "isn": "T8E096394451", "propietario": "", "estado": "Dada de baja", "fechaAlta": "", "fechaBaja": "2026-08-04", "estado2": "", "veces": 0, "donde": "", "origen": ""}, {"numero": "510", "isn": "T8E096394452", "propietario": "", "estado": "Dada de alta", "fechaAlta": "2026-02-09", "fechaBaja": "", "estado2": "", "veces": 0, "donde": "", "origen": ""}, {"numero": "511", "isn": "T8E096394461", "propietario": "", "estado": "Dada de alta", "fechaAlta": "2026-02-09", "fechaBaja": "", "estado2": "", "veces": 0, "donde": "", "origen": ""}, {"numero": "512", "isn": "T8E096394467", "propietario": "", "estado": "Dada de alta", "fechaAlta": "2026-02-09", "fechaBaja": "", "estado2": "", "veces": 0, "donde": "", "origen": ""}, {"numero": "513", "isn": "T8E093392426", "propietario": "", "estado": "Dada de alta", "fechaAlta": "", "fechaBaja": "", "estado2": "", "veces": 0, "donde": "", "origen": ""}, {"numero": "514", "isn": "T8E119420450", "propietario": "", "estado": "Dada de alta", "fechaAlta": "2026-08-04", "fechaBaja": "", "estado2": "", "veces": 0, "donde": "", "origen": ""}, {"numero": "515", "isn": "T8E119421140", "propietario": "", "estado": "Dada de alta", "fechaAlta": "", "fechaBaja": "", "estado2": "", "veces": 0, "donde": "", "origen": ""}, {"numero": "516", "isn": "T8E119421153", "propietario": "", "estado": "Dada de alta", "fechaAlta": "2026-08-04", "fechaBaja": "", "estado2": "", "veces": 0, "donde": "", "origen": ""}, {"numero": "517", "isn": "T8E119421156", "propietario": "", "estado": "Dada de alta", "fechaAlta": "2026-08-04", "fechaBaja": "", "estado2": "", "veces": 0, "donde": "", "origen": ""}, {"numero": "518", "isn": "T8E119421157", "propietario": "", "estado": "Dada de alta", "fechaAlta": "2026-08-04", "fechaBaja": "", "estado2": "", "veces": 0, "donde": "", "origen": ""}, {"numero": "519", "isn": "T8E119421279", "propietario": "", "estado": "Dada de alta", "fechaAlta": "2026-08-04", "fechaBaja": "", "estado2": "", "veces": 0, "donde": "", "origen": ""}, {"numero": "520", "isn": "T8E119421280", "propietario": "", "estado": "Dada de alta", "fechaAlta": "2026-08-04", "fechaBaja": "", "estado2": "", "veces": 0, "donde": "", "origen": ""}, {"numero": "623", "isn": "T8E073284268", "propietario": "", "estado": "Dada de alta", "fechaAlta": "2026-01-28", "fechaBaja": "", "estado2": "", "veces": 0, "donde": "", "origen": ""}, {"numero": "636", "isn": "T8E075285743", "propietario": "", "estado": "Dada de baja", "fechaAlta": "", "fechaBaja": "2026-08-04", "estado2": "", "veces": 0, "donde": "", "origen": ""}, {"numero": "645", "isn": "T8E080292580", "propietario": "", "estado": "Dada de alta", "fechaAlta": "2026-08-04", "fechaBaja": "", "estado2": "", "veces": 0, "donde": "", "origen": ""}, {"numero": "694", "isn": "T8E086300127", "propietario": "", "estado": "Dada de alta", "fechaAlta": "2026-01-28", "fechaBaja": "", "estado2": "", "veces": 0, "donde": "", "origen": ""}, {"numero": "709", "isn": "T8E101311164", "propietario": "", "estado": "Dada de alta", "fechaAlta": "2026-01-28", "fechaBaja": "", "estado2": "", "veces": 0, "donde": "", "origen": ""}, {"numero": "727", "isn": "T8E101312607", "propietario": "", "estado": "Dada de baja", "fechaAlta": "", "fechaBaja": "2026-08-04", "estado2": "", "veces": 0, "donde": "", "origen": ""}, {"numero": "737", "isn": "T8E101312661", "propietario": "", "estado": "Dada de alta", "fechaAlta": "2026-01-28", "fechaBaja": "", "estado2": "", "veces": 0, "donde": "", "origen": ""}, {"numero": "765", "isn": "T8E106331798", "propietario": "", "estado": "Dada de alta", "fechaAlta": "2026-08-04", "fechaBaja": "", "estado2": "", "veces": 0, "donde": "", "origen": ""}, {"numero": "804", "isn": "T8E107336244", "propietario": "", "estado": "Dada de alta", "fechaAlta": "2026-01-28", "fechaBaja": "", "estado2": "", "veces": 0, "donde": "", "origen": ""}, {"numero": "849", "isn": "T8E107336200", "propietario": "", "estado": "Dada de baja", "fechaAlta": "", "fechaBaja": "2026-08-04", "estado2": "", "veces": 0, "donde": "", "origen": ""}, {"numero": "886", "isn": "T8E108350658", "propietario": "", "estado": "Dada de alta", "fechaAlta": "", "fechaBaja": "", "estado2": "", "veces": 0, "donde": "", "origen": ""}, {"numero": "919", "isn": "T8E108350893", "propietario": "", "estado": "Dada de alta", "fechaAlta": "2026-01-28", "fechaBaja": "", "estado2": "", "veces": 0, "donde": "", "origen": ""}, {"numero": "924", "isn": "T8E108350920", "propietario": "", "estado": "Dada de alta", "fechaAlta": "2026-01-28", "fechaBaja": "", "estado2": "", "veces": 0, "donde": "", "origen": ""}];

  var datos = {}, ref = null, sel = {}, isTyping = false, typingTimer = null, saveTimer = {};
  var histKey = null;   // boya abierta en el modal de historial

  /* ---------- historial de recuperaciones ---------- */
  function hist(b){
    var r = b && b.recuperaciones;
    if(!r) return [];
    if(Array.isArray(r)) return r.filter(Boolean);
    return Object.keys(r).sort().map(function(k){ return r[k]; }).filter(Boolean);
  }
  function nRec(b){ var x = hist(b); return x.length ? x.length : (parseInt(b && b.veces,10)||0); }
  function ultimoLugar(b){ var x = hist(b); return x.length ? (x[x.length-1].lugar||'') : ((b&&b.donde)||''); }
  function guardarHist(key, lista){
    var b = datos[key]; if(!b) return;
    b.recuperaciones = lista;
    b.veces = lista.length;
    b.donde = lista.length ? (lista[lista.length-1].lugar||'') : '';
    if(ref) ref.child(key).update({recuperaciones:lista, veces:b.veces, donde:b.donde});
  }
  function agregarRec(key, fecha, lugar){
    var l = hist(datos[key]).slice();
    l.push({fecha: fecha || hoy(), lugar: lugar || ''});
    guardarHist(key, l);
  }

  function rolActual(){
    try{
      var s = JSON.parse(sessionStorage.getItem('atuntro_session') || 'null');
      if(s){
        if(window.AUTH && AUTH.users && AUTH.users[s.id]) return String(AUTH.users[s.id].role||'').toLowerCase().trim();
        if(s.role) return String(s.role).toLowerCase().trim();
      }
    }catch(e){}
    return '';
  }
  function puedeEditar(){ var r = rolActual(); return !r || ROLES_EDIT.indexOf(r) !== -1; }
  function msg(t){
    var e = document.getElementById('boyMsg'); if(!e) return;
    e.textContent = t; clearTimeout(e._t); e._t = setTimeout(function(){ e.textContent=''; }, 2600);
  }
  function marcarTyping(){ isTyping = true; clearTimeout(typingTimer); typingTimer = setTimeout(function(){ isTyping=false; }, 1500); }
  function hoy(){ return new Date().toISOString().slice(0,10); }

  /* ---------- Firebase ---------- */
  function db(){
    try{
      if(typeof firebase === 'undefined') return null;
      if(!firebase.apps.length) firebase.initializeApp({
        apiKey:"AIzaSyDT0hq4WYxcAxxKvGNmTlH9Ha2lp6fW3y0",
        authDomain:"atuntro-portal.firebaseapp.com",
        databaseURL:"https://atuntro-portal-default-rtdb.firebaseio.com",
        projectId:"atuntro-portal",
        storageBucket:"atuntro-portal.firebasestorage.app",
        messagingSenderId:"390090673795",
        appId:"1:390090673795:web:e01a5d03e5543c8dc415b6"
      });
      return firebase.database();
    }catch(e){ return null; }
  }
  BOY.init = function(){
    if(ref) return;
    var d = db(); if(!d){ setTimeout(BOY.init, 800); return; }
    ref = d.ref('atuntro_boyas/data');
    ref.on('value', function(snap){
      var v = snap.val();
      if(v === null){ sembrar(); return; }
      datos = v;
      if(!isTyping) render();
    });
  };
  function sembrar(){
    var obj = {};
    SEED.forEach(function(b,i){ obj['b'+String(i+1).padStart(4,'0')] = b; });
    ref.set(obj).then(function(){ msg('Catálogo inicial cargado ('+SEED.length+' boyas)'); });
  }
  function guardar(key, campo, valor){
    if(!ref) return;
    if(datos[key]) datos[key][campo] = valor;
    clearTimeout(saveTimer[key+campo]);
    saveTimer[key+campo] = setTimeout(function(){
      ref.child(key).child(campo).set(valor).then(function(){ msg('Guardado'); });
    }, 600);
  }

  /* ---------- resumen ---------- */
  function calcular(){
    var r = {fatima:0,gracia:0,bodega:0,porRec:0,activa:0,activaF:0,activaG:0,fuera:0,irrec:0,alta:0,baja:0,total:0};
    Object.keys(datos).forEach(function(k){
      var b = datos[k]||{}; r.total++;
      if(b.estado==='Dada de alta') r.alta++;
      if(b.estado==='Dada de baja') r.baja++;
      if(b.estado2==='POR RECUPERAR') r.porRec++;
      if(b.estado2==='ACTIVA'){
        r.activa++;
        if(b.propietario==='MARIA FATIMA') r.activaF++;
        if(b.propietario==='MARIA DE GRACIA') r.activaG++;
      }
      if(b.estado2==='FUERA DE RANGO') r.fuera++;
      if(b.estado2==='IRRECUPERABLE') r.irrec++;
      if(b.propietario==='BODEGA EN TIERRA') r.bodega++;
      if(b.estado2==='A BORDO PARA VIAJE'){
        r.activa++;
        if(b.propietario==='MARIA FATIMA') { r.fatima++; r.activaF++; }
        if(b.propietario==='MARIA DE GRACIA') { r.gracia++; r.activaG++; }
      }
    });
    return r;
  }
  var CARDS = [
    ['fat','fatima','Viaje María Fátima',       {propietario:'MARIA FATIMA', estado2:'A BORDO PARA VIAJE'}],
    ['gra','gracia','Viaje María de Gracia',    {propietario:'MARIA DE GRACIA', estado2:'A BORDO PARA VIAJE'}],
    ['bod','bodega','En bodega (tierra)',       {propietario:'BODEGA EN TIERRA'}],
    ['act','activaF','Activas — María Fátima',   {propietario:'MARIA FATIMA', estado2:'ACTIVA'}],
    ['act','activaG','Activas — María de Gracia',{propietario:'MARIA DE GRACIA', estado2:'ACTIVA'}],
    ['rec','porRec','Por recuperar',            {estado2:'POR RECUPERAR'}],
    ['fue','fuera', 'Fuera de rango',           {estado2:'FUERA DE RANGO'}],
    ['irr','irrec', 'Irrecuperables',           {estado2:'IRRECUPERABLE'}],
    ['',   'alta',  'Dadas de alta',            {estado:'Dada de alta'}],
    ['baja','baja', 'Dadas de baja',            {estado:'Dada de baja'}]
  ];
  function filtroActivo(f){
    var v = {
      propietario: document.getElementById('boyFPropietario').value,
      estado:      document.getElementById('boyFEstado').value,
      estado2:     document.getElementById('boyFEstado2').value
    };
    var campos = ['propietario','estado','estado2'];
    return campos.every(function(c){ return (v[c]||'') === (f[c]||''); }) &&
           campos.some(function(c){ return f[c]; });
  }
  function aplicarFiltroCard(i){
    var f = CARDS[i][3];
    var activo = filtroActivo(f);
    document.getElementById('boyBuscar').value = '';
    document.getElementById('boyFOrigen').value = '';
    ['boyFPropietario','boyFEstado','boyFEstado2'].forEach(function(id){ document.getElementById(id).value = ''; });
    if(!activo){
      if(f.propietario) document.getElementById('boyFPropietario').value = f.propietario;
      if(f.estado)      document.getElementById('boyFEstado').value      = f.estado;
      if(f.estado2)     document.getElementById('boyFEstado2').value     = f.estado2;
    }
    isTyping = false;
    render();
    var t = document.querySelector('.boy-tabla-box');
    if(t && t.scrollIntoView) t.scrollIntoView({behavior:'smooth', block:'nearest'});
  }
  function renderCards(){
    var r = calcular();
    document.getElementById('boyCards').innerHTML = CARDS.map(function(c,i){
      var on = filtroActivo(c[3]);
      return '<div class="boy-card '+c[0]+(on?' on':'')+'" data-card="'+i+'" title="Clic para filtrar el listado">' +
             '<div class="lbl">'+c[2]+'</div><div class="val">'+r[c[1]]+'</div>' +
             '<div class="fx">✕ quitar filtro</div></div>';
    }).join('');
  }

  /* ---------- helpers de selects ---------- */
  function opts(lista, selv){
    return lista.map(function(o){
      return '<option value="'+o+'"'+(String(selv||'')===o?' selected':'')+'>'+(o===''?'—':o)+'</option>';
    }).join('');
  }
  function optsSin(lista){
    return '<option value="'+SIN+'">(sin cambio)</option>' +
           lista.map(function(o){ return '<option value="'+o+'">'+(o===''?'(vaciar)':o)+'</option>'; }).join('');
  }
  function optsFiltro(lista, todos){
    return '<option value="">'+todos+'</option>' +
           lista.filter(Boolean).map(function(o){ return '<option>'+o+'</option>'; }).join('');
  }

  /* ---------- filtro y tabla ---------- */
  function filtrar(){
    var q  = (document.getElementById('boyBuscar').value||'').toLowerCase().trim();
    var fp = document.getElementById('boyFPropietario').value;
    var fe = document.getElementById('boyFEstado').value;
    var f2 = document.getElementById('boyFEstado2').value;
    var fo = document.getElementById('boyFOrigen').value;
    return Object.keys(datos).filter(function(k){
      var b = datos[k]||{};
      if(fp && (b.propietario||'') !== fp) return false;
      if(fe && (b.estado||'') !== fe) return false;
      if(f2 && (b.estado2||'') !== f2) return false;
      if(fo && (b.origen||'') !== fo) return false;
      if(q && (((b.numero||'')+' '+(b.isn||'')).toLowerCase().indexOf(q) === -1)) return false;
      return true;
    }).sort(function(a,b){ return (parseInt(datos[a].numero,10)||0) - (parseInt(datos[b].numero,10)||0); });
  }
  function nSel(){ return Object.keys(sel).filter(function(k){ return sel[k] && datos[k]; }).length; }
  function refrescarBarraSel(){
    var n = nSel();
    document.getElementById('boySelCount').textContent = n;
    document.getElementById('boyPanelMasivo').style.display = (n && puedeEditar()) ? 'block' : 'none';
  }
  function render(){
    renderCards();
    var edit = puedeEditar(), keys = filtrar(), body = document.getElementById('boyBody');
    document.getElementById('boyCount').textContent = keys.length+' de '+Object.keys(datos).length+' boyas';
    if(!keys.length){
      body.innerHTML = '<tr><td colspan="12" class="boy-empty">Sin boyas que coincidan con el filtro.</td></tr>';
      refrescarBarraSel(); return;
    }
    body.innerHTML = keys.map(function(k){
      var b = datos[k]||{}, s = !!sel[k];
      function ro(v){ return '<span class="boy-ro">'+(v||'—')+'</span>'; }
      return '<tr data-k="'+k+'"'+(s?' class="sel"':'')+'>' +
        '<td style="text-align:center">'+(edit?'<input type="checkbox" data-sel'+(s?' checked':'')+'>':'')+'</td>' +
        '<td class="num">'+(edit?'<input data-c="numero" value="'+(b.numero||'')+'" style="color:#000080;font-weight:bold">':ro(b.numero))+'</td>' +
        '<td>'+(edit?'<input data-c="isn" value="'+(b.isn||'')+'">':ro(b.isn))+'</td>' +
        '<td>'+(edit?'<select data-c="propietario">'+opts(PROPIETARIOS,b.propietario)+'</select>':ro(b.propietario))+'</td>' +
        '<td>'+(edit?'<select data-c="estado">'+opts(ESTADOS,b.estado||'Dada de alta')+'</select>'
                    :'<span class="boy-pill '+(b.estado==='Dada de baja'?'baja':'alta')+'">'+(b.estado||'')+'</span>')+'</td>' +
        '<td>'+(edit?'<input type="date" data-c="fechaAlta" value="'+(b.fechaAlta||'')+'">':ro(b.fechaAlta))+'</td>' +
        '<td>'+(b.estado==='Dada de alta'?'<span class="boy-ro">—</span>':(edit?'<input type="date" data-c="fechaBaja" value="'+(b.fechaBaja||'')+'">':ro(b.fechaBaja)))+'</td>' +
        '<td>'+(edit?'<select data-c="estado2">'+opts(ESTADOS2,b.estado2)+'</select>':ro(b.estado2))+'</td>' +
        '<td>'+(edit?'<select data-c="origen">'+opts(ORIGENES,b.origen)+'</select>':ro(b.origen))+'</td>' +
        '<td style="text-align:center"><span class="boy-ro" style="font-weight:bold">'+nRec(b)+'</span></td>' +
        '<td><button class="boy-hist-btn" data-hist="'+k+'">'+(nRec(b)?(ultimoLugar(b)||'sin lugar'):'— registrar')+'</button></td>' +
        '<td style="text-align:center">'+(edit?'<button class="boy-btn del" data-del="'+k+'" style="padding:3px 7px;font-size:11px">✕</button>':'')+'</td>' +
      '</tr>';
    }).join('');
    var all = document.getElementById('boyChkAll');
    all.checked = keys.length > 0 && keys.every(function(k){ return sel[k]; });
    refrescarBarraSel();
  }

  /* ---------- acciones masivas ---------- */
  function aplicarMasivo(){
    var keys = Object.keys(sel).filter(function(k){ return sel[k] && datos[k]; });
    if(!keys.length) return;
    var lugar = document.getElementById('boyMDonde').value;
    var camposFijos = [
      ['propietario', document.getElementById('boyMProp').value],
      ['estado',      document.getElementById('boyMEstado').value],
      ['estado2',     document.getElementById('boyMEstado2').value],
      ['origen',      document.getElementById('boyMOrigen').value]
    ].filter(function(p){ return p[1] !== SIN; });
    var fecha = document.getElementById('boyMFecha').value;
    var campoFecha = document.getElementById('boyMFechaCampo').value;
    var sumar = document.getElementById('boyMSumar').checked;

    if(!camposFijos.length && !fecha && !sumar){ alert('Elige al menos un cambio que aplicar.'); return; }
    if(!confirm('Se aplicarán los cambios a '+keys.length+' boya(s). ¿Continuar?')) return;

    var upd = {};
    keys.forEach(function(k){
      camposFijos.forEach(function(p){ upd[k+'/'+p[0]] = p[1]; datos[k][p[0]] = p[1]; });
      if(fecha){ upd[k+'/'+campoFecha] = fecha; datos[k][campoFecha] = fecha; }
    });
    if(sumar) keys.forEach(function(k){ agregarRec(k, fecha || hoy(), lugar === SIN ? '' : lugar); });
    ref.update(upd).then(function(){ msg(keys.length+' boyas actualizadas'); });
    resetMasivo(); render();
  }
  /* alta / baja rápida sobre lo seleccionado */
  function altaBajaSeleccion(nuevoEstado){
    var keys = Object.keys(sel).filter(function(k){ return sel[k] && datos[k]; });
    if(!keys.length){ alert('No hay boyas seleccionadas.'); return; }
    var fecha = document.getElementById('boyMFecha').value || hoy();
    var accion = nuevoEstado === 'Dada de alta' ? 'DAR DE ALTA' : 'DAR DE BAJA';
    if(!confirm('Se van a '+accion+' '+keys.length+' boya(s) con fecha '+fecha+'. ¿Continuar?')) return;
    var upd = {};
    keys.forEach(function(k){ Object.keys(cambioEstado(nuevoEstado, fecha)).forEach(function(c){
      var v = cambioEstado(nuevoEstado, fecha)[c]; upd[k+'/'+c] = v; datos[k][c] = v;
    }); });
    ref.update(upd).then(function(){ msg(keys.length+' boyas: '+accion.toLowerCase()); });
    render();
  }
  function cambioEstado(nuevoEstado, fecha){
    return nuevoEstado === 'Dada de alta'
      ? {estado:'Dada de alta', fechaAlta:fecha, fechaBaja:''}
      : {estado:'Dada de baja', fechaBaja:fecha};
  }

  /* alta / baja pegando una lista de números o ISN */
  function parsearLista(){
    return (document.getElementById('boyListaTexto').value||'')
      .split(/[\r\n,;\t]+/).map(function(t){ return t.trim(); }).filter(Boolean);
  }
  function buscarPorTexto(t){
    var u = t.toUpperCase(), n = u.replace(/[^0-9]/g,'');
    return Object.keys(datos).filter(function(k){
      var b = datos[k]||{};
      return (b.isn && b.isn.toUpperCase() === u) || (n && String(b.numero||'') === n);
    });
  }
  function aplicarLista(){
    var lista = parsearLista();
    if(!lista.length){ alert('Pega al menos un número o ISN.'); return; }
    var estado = document.getElementById('boyListaAccion').value;
    var fecha  = document.getElementById('boyListaFecha').value || hoy();
    var prop   = document.getElementById('boyListaProp').value;
    var est2   = document.getElementById('boyListaEstado2').value;
    var enc = {}, noEnc = [];
    lista.forEach(function(t){
      var ks = buscarPorTexto(t);
      if(!ks.length) noEnc.push(t); else ks.forEach(function(k){ enc[k] = 1; });
    });
    var keys = Object.keys(enc);
    if(!keys.length){ alert('Ninguna de las boyas de la lista existe en el sistema.'); return; }
    var txt = 'Se van a '+(estado==='Dada de alta'?'DAR DE ALTA':'DAR DE BAJA')+' '+keys.length+' boya(s) con fecha '+fecha+'.';
    if(noEnc.length) txt += '\n\nNo se encontraron ('+noEnc.length+'): '+noEnc.slice(0,15).join(', ')+(noEnc.length>15?'...':'');
    if(!confirm(txt+'\n\n¿Continuar?')) return;
    var base = cambioEstado(estado, fecha);
    var upd = {};
    keys.forEach(function(k){
      Object.keys(base).forEach(function(c){ upd[k+'/'+c] = base[c]; datos[k][c] = base[c]; });
      if(prop){ upd[k+'/propietario'] = prop; datos[k].propietario = prop; }
      if(est2){ upd[k+'/estado2'] = est2; datos[k].estado2 = est2; }
    });
    ref.update(upd).then(function(){ msg(keys.length+' boyas actualizadas'+(noEnc.length?' ('+noEnc.length+' no encontradas)':'')); });
    document.getElementById('boyListaTexto').value = '';
    document.getElementById('boyListaPrev').textContent = '';
    document.getElementById('boyPanelLista').style.display = 'none';
    render();
  }

  function resetMasivo(){
    ['boyMProp','boyMEstado','boyMEstado2','boyMOrigen','boyMDonde'].forEach(function(id){ document.getElementById(id).value = SIN; });
    document.getElementById('boyMFecha').value = '';
    document.getElementById('boyMSumar').checked = false;
  }
  function parsearAltas(){
    var txt = document.getElementById('boyAltaTexto').value || '';
    return txt.split(/\r?\n/).map(function(l){ return l.trim(); }).filter(Boolean).map(function(l){
      var p = l.split(/[\t;,]+|\s{1,}/).map(function(x){ return x.trim(); }).filter(Boolean);
      var numero = '', isn = '';
      p.forEach(function(t){
        if(/^[0-9]+$/.test(t) && !numero) numero = t;
        else if(!isn) isn = t.toUpperCase();
      });
      return {numero:numero, isn:isn};
    }).filter(function(x){ return x.numero || x.isn; });
  }
  function aplicarAltas(){
    var lista = parsearAltas();
    if(!lista.length){ alert('Pega al menos una boya.'); return; }
    var isns = {}; Object.keys(datos).forEach(function(k){ if(datos[k].isn) isns[datos[k].isn.toUpperCase()] = 1; });
    var nuevas = lista.filter(function(b){ return !(b.isn && isns[b.isn]); });
    var dup = lista.length - nuevas.length;
    if(!nuevas.length){ alert('Todas las boyas pegadas ya existen en el sistema.'); return; }
    var base = {
      propietario: document.getElementById('boyAltaProp').value,
      estado: 'Dada de alta',
      fechaAlta: document.getElementById('boyAltaFecha').value || hoy(),
      fechaBaja: '',
      estado2: document.getElementById('boyAltaEstado2').value,
      origen: document.getElementById('boyAltaOrigen').value,
      donde: document.getElementById('boyAltaDonde').value,
      veces: 0
    };
    var esRecuperada = base.origen === 'RECUPERADA' && base.donde;
    if(!confirm('Se ingresarán '+nuevas.length+' boya(s)'+(dup?' ('+dup+' repetidas se omiten)':'')+'. ¿Continuar?')) return;
    var upd = {};
    nuevas.forEach(function(b, i){
      var k = 'n'+Date.now()+'_'+i;
      var obj = {numero:b.numero, isn:b.isn};
      Object.keys(base).forEach(function(c){ obj[c] = base[c]; });
      if(esRecuperada){ obj.recuperaciones = [{fecha:base.fechaAlta, lugar:base.donde}]; obj.veces = 1; }
      upd[k] = obj; datos[k] = obj;
    });
    ref.update(upd).then(function(){ msg(nuevas.length+' boyas ingresadas'); });
    document.getElementById('boyAltaTexto').value = '';
    document.getElementById('boyPanelAlta').style.display = 'none';
    document.getElementById('boyAltaPrev').textContent = '';
    render();
  }

  /* ---------- modal de historial ---------- */
  function abrirHist(k){
    histKey = k;
    var b = datos[k]||{};
    document.getElementById('boyHistTitulo').textContent = 'Recuperaciones — boya '+(b.numero||'')+' · '+(b.isn||'');
    document.getElementById('boyHistFecha').value = hoy();
    var puede = puedeEditar();
    document.getElementById('boyHistForm').style.display = puede ? 'grid' : 'none';
    document.getElementById('boyHistAcc').style.display  = puede ? 'flex' : 'none';
    renderHist();
    document.getElementById('boyHistBg').style.display = 'flex';
  }
  function cerrarHist(){ histKey = null; document.getElementById('boyHistBg').style.display = 'none'; }
  function renderHist(){
    if(!histKey) return;
    var l = hist(datos[histKey]), puede = puedeEditar();
    var el = document.getElementById('boyHistLista');
    if(!l.length){ el.innerHTML = '<div class="boy-hist-vacio">Sin recuperaciones registradas.</div>'; return; }
    el.innerHTML = l.map(function(r,i){
      return '<div class="boy-hist-item"><span class="n">'+(i+1)+'</span>' +
             '<span class="lg">'+(r.lugar||'sin lugar')+'</span>' +
             '<span class="fc">'+(r.fecha||'')+'</span>' +
             (puede?'<button data-rm="'+i+'" title="Eliminar">✕</button>':'') + '</div>';
    }).join('');
  }

  /* ---------- eventos ---------- */
  function bind(){
    document.getElementById('boyFPropietario').innerHTML = optsFiltro(PROPIETARIOS,'Todos los propietarios');
    document.getElementById('boyFEstado2').innerHTML     = optsFiltro(ESTADOS2,'Todos los estados');
    document.getElementById('boyFOrigen').innerHTML      = optsFiltro(ORIGENES,'Todos los orígenes');
    document.getElementById('boyMProp').innerHTML    = optsSin(PROPIETARIOS);
    document.getElementById('boyMEstado').innerHTML  = optsSin(ESTADOS);
    document.getElementById('boyMEstado2').innerHTML = optsSin(ESTADOS2);
    document.getElementById('boyMOrigen').innerHTML  = optsSin(ORIGENES);
    document.getElementById('boyMDonde').innerHTML   = optsSin(DONDE);
    document.getElementById('boyAltaProp').innerHTML    = opts(PROPIETARIOS,'');
    document.getElementById('boyAltaEstado2').innerHTML = opts(ESTADOS2,'');
    document.getElementById('boyAltaDonde').innerHTML   = opts(DONDE,'');
    document.getElementById('boyAltaFecha').value = hoy();

    var body = document.getElementById('boyBody');
    body.addEventListener('input', function(e){
      var el = e.target;
      if(el.hasAttribute('data-sel')) return;
      if(!el.dataset.c) return;
      marcarTyping();
      guardar(el.closest('tr').dataset.k, el.dataset.c, el.type==='number' ? (parseInt(el.value,10)||0) : el.value);
    });
    body.addEventListener('change', function(e){
      var el = e.target, tr = el.closest('tr'); if(!tr) return;
      if(el.hasAttribute('data-sel')){
        sel[tr.dataset.k] = el.checked;
        tr.classList.toggle('sel', el.checked);
        refrescarBarraSel();
        var keys = filtrar();
        document.getElementById('boyChkAll').checked = keys.every(function(k){ return sel[k]; });
        return;
      }
      if(!el.dataset.c) return;
      guardar(tr.dataset.k, el.dataset.c, el.type==='number' ? (parseInt(el.value,10)||0) : el.value);
      if(el.dataset.c === 'estado' && el.value === 'Dada de alta'){
        guardar(tr.dataset.k, 'fechaBaja', '');
      }
      if(['propietario','estado','estado2'].indexOf(el.dataset.c) !== -1) renderCards();
    });
    body.addEventListener('click', function(e){
      var hk = e.target.getAttribute && e.target.getAttribute('data-hist');
      if(hk){ abrirHist(hk); return; }
      var k = e.target.getAttribute && e.target.getAttribute('data-del'); if(!k) return;
      var b = datos[k]||{};
      if(confirm('¿Eliminar la boya '+(b.numero||'')+' ('+(b.isn||'')+')?')){ delete sel[k]; ref.child(k).remove(); }
    });

    document.getElementById('boyChkAll').addEventListener('change', function(e){
      filtrar().forEach(function(k){ sel[k] = e.target.checked; });
      render();
    });

    ['boyBuscar','boyFPropietario','boyFEstado','boyFEstado2','boyFOrigen'].forEach(function(id){
      var el = document.getElementById(id);
      el.addEventListener('input', function(){ isTyping = false; render(); });
      el.addEventListener('change', function(){ isTyping = false; render(); });
    });

    document.getElementById('boyListaProp').innerHTML    = opts(PROPIETARIOS,'');
    document.getElementById('boyListaEstado2').innerHTML = opts(ESTADOS2,'');
    document.getElementById('boyListaFecha').value = hoy();

    document.getElementById('boyBtnLista').addEventListener('click', function(){
      if(!puedeEditar()){ alert('Sin permisos para editar boyas.'); return; }
      var p = document.getElementById('boyPanelLista');
      p.style.display = p.style.display === 'none' ? 'block' : 'none';
    });
    document.getElementById('boyListaCancelar').addEventListener('click', function(){
      document.getElementById('boyPanelLista').style.display = 'none';
    });
    document.getElementById('boyListaAplicar').addEventListener('click', aplicarLista);
    document.getElementById('boyListaTexto').addEventListener('input', function(){
      var lista = parsearLista(), ok = lista.filter(function(t){ return buscarPorTexto(t).length; }).length;
      document.getElementById('boyListaPrev').textContent =
        lista.length ? lista.length+' en la lista · '+ok+' encontradas · '+(lista.length-ok)+' sin coincidencia' : '';
    });
    document.getElementById('boyMDarAlta').addEventListener('click', function(){ altaBajaSeleccion('Dada de alta'); });
    document.getElementById('boyMDarBaja').addEventListener('click', function(){ altaBajaSeleccion('Dada de baja'); });

    document.getElementById('boyHistLugar').innerHTML = opts(DONDE,'');
    document.getElementById('boyHistCerrar').addEventListener('click', cerrarHist);
    document.getElementById('boyHistBg').addEventListener('click', function(e){ if(e.target.id==='boyHistBg') cerrarHist(); });
    document.getElementById('boyHistAgregar').addEventListener('click', function(){
      if(!histKey) return;
      agregarRec(histKey, document.getElementById('boyHistFecha').value, document.getElementById('boyHistLugar').value);
      renderHist(); render();
      msg('Recuperación registrada');
    });
    document.getElementById('boyHistLista').addEventListener('click', function(e){
      var i = e.target.getAttribute && e.target.getAttribute('data-rm');
      if(i === null || i === undefined || !histKey) return;
      var l = hist(datos[histKey]).slice();
      l.splice(parseInt(i,10),1);
      guardarHist(histKey, l);
      renderHist(); render();
    });

    document.getElementById('boyCards').addEventListener('click', function(e){
      var c = e.target.closest ? e.target.closest('[data-card]') : null;
      if(c) aplicarFiltroCard(parseInt(c.getAttribute('data-card'),10));
    });

    document.getElementById('boyMAplicar').addEventListener('click', aplicarMasivo);
    document.getElementById('boyMLimpiar').addEventListener('click', function(){ sel = {}; resetMasivo(); render(); });
    document.getElementById('boyMEliminar').addEventListener('click', function(){
      var keys = Object.keys(sel).filter(function(k){ return sel[k] && datos[k]; });
      if(!keys.length) return;
      if(!confirm('Se ELIMINARÁN '+keys.length+' boya(s) de forma permanente. ¿Continuar?')) return;
      var upd = {}; keys.forEach(function(k){ upd[k] = null; delete datos[k]; delete sel[k]; });
      ref.update(upd).then(function(){ msg(keys.length+' boyas eliminadas'); });
      render();
    });

    document.getElementById('boyBtnAlta').addEventListener('click', function(){
      if(!puedeEditar()){ alert('Sin permisos para editar boyas.'); return; }
      var p = document.getElementById('boyPanelAlta');
      p.style.display = p.style.display === 'none' ? 'block' : 'none';
    });
    document.getElementById('boyAltaCancelar').addEventListener('click', function(){
      document.getElementById('boyPanelAlta').style.display = 'none';
    });
    document.getElementById('boyAltaAplicar').addEventListener('click', aplicarAltas);
    document.getElementById('boyAltaTexto').addEventListener('input', function(){
      var n = parsearAltas().length;
      document.getElementById('boyAltaPrev').textContent = n ? n+' boya(s) detectada(s)' : '';
    });

    document.getElementById('boyBtnPrint').addEventListener('click', function(){ window.print(); });
    document.getElementById('boyBtnVolver').addEventListener('click', function(){
      if(typeof goBackFromBoyas === 'function') goBackFromBoyas();
    });
    document.getElementById('boyBtnExport').addEventListener('click', function(){
      if(typeof XLSX === 'undefined'){ alert('Exportador no disponible en esta pantalla.'); return; }
      var rows = [['Numero','ISN','Propietario','Estado','Fecha Alta','Fecha Baja','Estado 2','Origen','# Recuperada','Ultimo lugar','Historial de recuperaciones']];
      filtrar().forEach(function(k){
        var b = datos[k];
        var hl = hist(b).map(function(r){ return (r.fecha||'')+' '+(r.lugar||''); }).join(' | ');
        rows.push([b.numero,b.isn,b.propietario,b.estado,b.fechaAlta,b.fechaBaja,b.estado2,b.origen,nRec(b),ultimoLugar(b),hl]);
      });
      var r = calcular();
      rows.push([], ['RESUMEN'], ['Viaje María Fátima',r.fatima], ['Viaje María de Gracia',r.gracia],
                ['Bodega en tierra',r.bodega],
                ['Activas - María Fátima',r.activaF], ['Activas - María de Gracia',r.activaG],
                ['Activas (total)',r.activa], ['Por recuperar',r.porRec],
                ['Fuera de rango',r.fuera], ['Irrecuperables',r.irrec],
                ['Dadas de alta',r.alta], ['Dadas de baja',r.baja]);
      var wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(rows), 'Boyas');
      XLSX.writeFile(wb, 'Control_de_Boyas_'+hoy()+'.xlsx');
    });
  }

  BOY.mostrar = function(){ BOY.init(); render(); };
  BOY.ocultar = function(){ document.getElementById('vistaBoyas').style.display = 'none'; };

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', function(){ bind(); BOY.init(); });
  } else { bind(); BOY.init(); }
})();
