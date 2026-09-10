// ===== Contadores de disonancia compartidos (polychords, tensiones) =====

function countDissonancePairs(pcs) {
  let b9 = 0, tri = 0;
  for (let i = 0; i < pcs.length; i++) {
    for (let j = i + 1; j < pcs.length; j++) {
      const d = Math.abs(pcs[i] - pcs[j]);
      const dist = Math.min(d, 12 - d);
      if (dist === 1) b9++;
      if (dist === 6) tri++;
    }
  }
  return { b9, tri };
}