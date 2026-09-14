// ===== Shared/hop-classes.js — Motor puro del "próximo salto" =====
// Decide, dado el grafo y el recorrido en curso, qué clase visual recibe
// CADA ARISTA (línea) del dibujo, para que las líneas "se tiñan" marcando
// el próximo salto y las ya recorridas se apaguen.
//
// Sin DOM ni dependencias: funcione en Node (test) y en el navegador.
//
// Contrato:
//   classify(nodes, edges, adj, walk, choice)
//     nodes : array de ids de nodo (p.ej. enteros 0..n-1)
//     edges : array de pares [u,v] de ids (todas las líneas dibujadas)
//     adj   : fn(id) -> array de ids de nodos adyacentes
//     walk  : array de ids que ya has pisado en orden (recorrido hecho)
//     choice: id del nodo al que vas a saltar AHORA (0..n-1) o null si
//             todavía no elegís (se marcan todos los vecinos disponibles)
//   Retorna { edgeClass: Map<"u|v", "next"|"done"|"idle">,
//             current: último id de walk, nexts: ids disponibles,
//             next: el elegido por choice (o por 'no elegido aún') }
//
// Mapa de clases por arista:
//   "next"  → la línea del futuro salto (se tiñe de color cálido)
//   "done"  → línea ya cruzada en el recorrido (se atenúa)
//   "idle"  → arista no involucrada todavía (queda neutra)

function hopKey(u, v) {
  return u < v ? u + '|' + v : v + '|' + u;
}

function hopClassify(nodes, edges, adj, walk, choice) {
  const edgeClass = new Map();

  // Base: todas "idle".
  edges.forEach(function (e) {
    const k = hopKey(e[0], e[1]);
    if (!edgeClass.has(k)) edgeClass.set(k, 'idle');
  });

  // 1) Aristas yá cruzadas: pares consecutivos dentro de walk.
  for (let i = 0; i + 1 < walk.length; i++) {
    const k = hopKey(walk[i], walk[i + 1]);
    if (edgeClass.has(k)) edgeClass.set(k, 'done');
  }

  // 2) Nodo actual = último pisado.
  const current = walk.length ? walk[walk.length - 1] : null;Å

  // 3) Próximos disponibles = vecinos NO visitados todavía.
  const visited = new Set(walk);
  const prevNexts = current == null ? [] : (adj(current) || []).filter(function (n) {
    return !visited.has(n);
  });

  // 4) Si no hay choice, todos los disponibles son "candidatos próximos".
  //    Si hay choice, solo la arista current→choice es "next"; el resto de
  //    disponibles quedan como candidatos sin teñir (idle) para no marear.
  const nexts = prevNexts;
  let chosen = null;
  if (choice != null && prevNexts.indexOf(choice) !== -1) {
    chosen = choice;
    const k = current == null ? '' : hopKey(current, choice);
    if (edgeClass.has(k)) edgeClass.set(k, 'next');
  } else if (current != null && nexts.length && choice == null) {
    // Sin elección: pintamos TODAS las aristas disponibles como candidatas
    // "next" para que el ojo vea el abanico del próximo salto.
    nexts.forEach(function (n) {
      const k = hopKey(current, n);
      if (edgeClass.has(k)) edgeClass.set(k, 'next');
    });
  }

  return { edgeClass: edgeClass, current: current, nexts: nexts, next: chosen };
}

// Utilidad para tests: devuelve las claves con una clase dada.
function hopKeysByClass(result, cls) {
  const out = [];
  result.edgeClass.forEach(function (v, k) {
    if (v === cls) out.push(k);
  });
  return out;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { hopKey: hopKey, hopClassify: hopClassify, hopKeysByClass: hopKeysByClass };
}
