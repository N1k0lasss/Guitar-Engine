// ===== Shared/hops.js - motor puro del "proximo salto" =====
// Dado un grafo (nodos + aristas), marca cada arista con una clase que
// el CSS convierte en color:
//   'hop-next'  -> la arista que estas por cruzar AHORA (se tiñe de color vivo)
//   'hop-cand'  -> vecino(s) posible(s) desde el nodo actual (candidatos)
//   'hop-done'  -> arista ya cruzada en el recorrido (se apaga/atenua)
//   'hop-idle'  -> el resto (se queda neutra)
// Sin DOM, sin dependencias: corre en Node para el test.
//
// hopKey(u,v) -> clave canonica "min|max" de una arista
// hopClassify(node, adjFn, edges, walk, choice)
//   node   : indice del nodo actual
//   adjFn  : (id) -> [ids vecinos]
//   edges  : [ [u,v], ... ] todas las aristas del dibujo
//   walk   : [ids] nodos ya visitados en orden (walk[0]..walk[last])
//   choice : (opcional) id del nodo elegido como PROXIMO salto
// Devuelve Map clase -> Set de claves de arista y un resumen.

function hopKey(u, v) {
  return u < v ? u + '|' + v : v + '|' + u;
}

function hopClassify(node, adjFn, edges, walk, choice) {
  var cls = {
    'hop-next': new Set(),
    'hop-cand': new Set(),
    'hop-done': new Set(),
    'hop-idle': new Set()
  };
  var all = new Set();
  edges.forEach(function (e) { all.add(hopKey(e[0], e[1])); });

  // aristas ya cruzadas: pares consecutivos del recorrido
  for (var i = 0; i + 1 < walk.length; i++) {
    var k = hopKey(walk[i], walk[i + 1]);
    if (all.has(k)) cls['hop-done'].add(k);
  }

  // vecinos no visitados = candidatos para el proximo salto
  var current = walk.length ? walk[walk.length - 1] : node;
  var seen = new Set(walk);
  var cands = (current === null || current === undefined) ? [] : (adjFn(current) || []).filter(function (n) {
    return !seen.has(n);
  });

  var chosenKey = (choice === null || choice === undefined || current === null || current === undefined)
    ? null
    : hopKey(current, choice);

  var edgesArr = edges.map(function (e) { return hopKey(e[0], e[1]); });

  [['hop-next', chosenKey], ['hop-cand', null]].forEach(function (spec) {
    var specClass = spec[0], fixed = spec[1];
    cands.forEach(function (c) {
      var k = hopKey(current, c);
      if (!all.has(k)) return;
      if (cls['hop-next'].has(k) || cls['hop-done'].has(k)) return;
      if (fixed !== null && k !== fixed) return;
      if (fixed === null) { cls['hop-cand'].add(k); cls['hop-idle'].delete(k); }
    });
  });
  if (chosenKey !== null && all.has(chosenKey)) {
    cls['hop-next'].add(chosenKey);
    cls['hop-cand'].delete(chosenKey);
  }

  all.forEach(function (k) {
    if (!cls['hop-next'].has(k) && !cls['hop-cand'].has(k) && !cls['hop-done'].has(k)) {
      cls['hop-idle'].add(k);
    }
  });

  return { classes: cls, current: current, candidates: cands, next: chosenKey };
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { hopKey: hopKey, hopClassify: hopClassify };
}
