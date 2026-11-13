/* Deadlines panel on the overview. */
/* ================= deadlines panel ================= */
const dlHost = document.getElementById("dlGrid");
if (dlHost && typeof DATA !== "undefined"){
  const rows = [];
  DATA.israel.forEach(g => { if (g.dl && g.cat !== "משרדי") rows.push([catLabel(g.cat), g.dl, g.dlnote]); });
  DATA.equip.forEach(g => { if (g.dl && g.cat !== "משרדי") rows.push(["ציוד · " + g.cat, g.dl, g.dlnote]); });
  dlHost.innerHTML = rows.map(([c, d, n]) => `
    <div class="dlrow"><span>${c}</span><b>${d}</b><i>${n || ""}</i></div>`).join("");
}

refreshAll();
