/* Word (.docx) export of the weekly report, no libraries. */
/* ---------- .docx builder (no external libraries) ---------- */
function wfX(s){ return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }
function wfRun(text, o){
  o = o || {};
  const rp = `<w:rPr><w:rFonts w:ascii="Arial" w:hAnsi="Arial" w:cs="Arial"/>${o.b ? "<w:b/><w:bCs/>" : ""}${o.i ? "<w:i/><w:iCs/>" : ""}${o.c ? `<w:color w:val="${o.c}"/>` : ""}<w:sz w:val="${o.sz || 21}"/><w:szCs w:val="${o.sz || 21}"/>${/[\u0590-\u05FF]/.test(text) ? "<w:rtl/>" : ""}</w:rPr>`;
  return String(text).split("\n").map((ln, i) => `${i ? `<w:r>${rp}<w:br/></w:r>` : ""}<w:r>${rp}<w:t xml:space="preserve">${wfX(ln)}</w:t></w:r>`).join("");
}
function wfP(text, o){
  o = o || {};
  return `<w:p><w:pPr><w:bidi/><w:spacing w:before="${o.before || 0}" w:after="${o.after == null ? 80 : o.after}"/>${o.center ? '<w:jc w:val="center"/>' : ""}</w:pPr>${wfRun(text, o)}</w:p>`;
}
function wfCell(text, w, o){
  o = o || {};
  return `<w:tc><w:tcPr><w:tcW w:w="${w}" w:type="dxa"/>${o.fill ? `<w:shd w:val="clear" w:color="auto" w:fill="${o.fill}"/>` : ""}</w:tcPr>${wfP(text || "", { b: o.b, center: o.center, after: 40, c: o.c })}</w:tc>`;
}
function wfTable(rows, widths){
  const total = widths.reduce((a, b) => a + b, 0);
  const bd = s => `<w:${s} w:val="single" w:sz="4" w:space="0" w:color="9DBBD0"/>`;
  return `<w:tbl><w:tblPr><w:bidiVisual/><w:tblW w:w="${total}" w:type="dxa"/><w:tblBorders>${["top", "left", "bottom", "right", "insideH", "insideV"].map(bd).join("")}</w:tblBorders><w:tblCellMar><w:top w:w="60" w:type="dxa"/><w:left w:w="90" w:type="dxa"/><w:bottom w:w="60" w:type="dxa"/><w:right w:w="90" w:type="dxa"/></w:tblCellMar></w:tblPr><w:tblGrid>${widths.map(x => `<w:gridCol w:w="${x}"/>`).join("")}</w:tblGrid>${rows.join("")}</w:tbl>${wfP("", { after: 60 })}`;
}
const WF_W = 10200;
function wfDocBody(wk){
  const w = wk.id, v = id => (wfVal(id) || "").trim();
  const hdrFill = "DCEBF5", lblFill = "F1F7FB";
  let out = wfP("סיכום שבוע · פורמט 2027", { b: true, sz: 36, c: "003E5A", center: true, after: 60 });
  out += wfP(`${wk.n} · \u202A${wk.d}\u202C · פינגווין וואלטורנס`, { sz: 22, c: "5B7B8C", center: true, after: 160 });
  out += wfP("שימו לב: סיכום שבוע מוגש יום אחרי ההגעה החדשה, ומתייחס לעזיבה + ההגעה שקרו אתמול + השבוע שקדם להן. בהיעדר פירוט אפשר לכתוב 'ללא'.", { i: true, sz: 19, c: "5B7B8C", after: 160 });
  WF.forEach(s => {
    out += wfP(s.h, { b: true, sz: 28, c: "003E5A", before: 200, after: 40 });
    if (s.sub) out += wfP(s.sub, { i: true, sz: 19, c: "5B7B8C", after: 80 });
    s.b.forEach(b => {
      if (b.h3) out += wfP(b.h3, { b: true, sz: 23, c: "00496B", before: 80, after: 40 });
      if (b.note) out += wfP(b.note, { i: true, sz: 19, c: "5B7B8C", after: 60 });
      if (b.t === "text") {
        out += wfTable([`<w:tr>${wfCell(b.l, WF_W, { b: true, fill: hdrFill, center: true })}</w:tr>`, `<w:tr>${wfCell(v("s-" + w) || "ללא", WF_W)}</w:tr>`], [WF_W]);
      } else if (b.t === "pair") {
        const h = WF_W / 2;
        out += wfTable([`<w:tr>${b.l.map(l => wfCell(l, h, { b: true, fill: hdrFill, center: true })).join("")}</w:tr>`, `<w:tr>${b.l.map((l, i) => wfCell(v(wfId(w, b.k, 0, i)) || "ללא", h)).join("")}</w:tr>`], [h, h]);
      } else if (b.t === "hotels") {
        const labs = ["התנהלות כללית עם המלון ועבודה משותפת", "לקוחות", "דברים נוספים שעלו לחיוב / שלילה"];
        let any = false;
        WF_HOTELS.forEach((n, r) => {
          const vals = labs.map((l, i) => v(wfId(w, b.k, r, i + 1)));
          if (!vals.some(Boolean) && !v(wfId(w, b.k, r, 0))) return;
          any = true;
          const a = 3600, c = WF_W - a;
          out += wfTable([`<w:tr>${wfCell(v(wfId(w, b.k, r, 0)) || n, a, { b: true, fill: hdrFill })}${wfCell("הערות כלליות, מספר הזמנה אם רלוונטי", c, { b: true, fill: hdrFill, center: true })}</w:tr>`]
            .concat(labs.map((l, i) => `<w:tr>${wfCell(l, a, { b: true, fill: lblFill })}${wfCell(vals[i], c)}</w:tr>`)), [a, c]);
        });
        if (!any) out += wfP("ללא", { after: 80 });
      } else {
        const n = b.cols.length, cw = Math.floor(WF_W / n), widths = b.cols.map(() => cw);
        const def = b.def ? b.def(wk) : null;
        const rows = [`<w:tr>${b.cols.map(c => wfCell(c, cw, { b: true, fill: hdrFill, center: true })).join("")}</w:tr>`];
        b.rows.forEach((row, r) => {
          const cells = b.cols.map((c, ci) => (ci === 0 && row.l) ? null : v(wfId(w, b.k, r, ci)));
          if (b.free && r > 0 && !cells.some(Boolean)) return;
          rows.push(`<w:tr>${b.cols.map((c, ci) => {
            if (ci === 0 && row.l) return wfCell(row.l, cw, { b: true, fill: lblFill });
            let val = cells[ci];
            if (!val && def && def[ci] && k0(b.k, ci)) val = def[ci];
            if (!val && ci === 0 && row.p) return wfCell(row.p, cw, { b: true, fill: lblFill });
            return wfCell(val, cw);
          }).join("")}</w:tr>`);
        });
        out += wfTable(rows, widths);
      }
    });
  });
  return out;
}
function k0(k, ci){ return k === "gen" && ci < 2; } /* site + dates fall back to defaults */
function wfDocx(body){
  const doc = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body>${body}<w:sectPr><w:pgSz w:w="11906" w:h="16838"/><w:pgMar w:top="1000" w:right="850" w:bottom="1000" w:left="850" w:header="600" w:footer="600" w:gutter="0"/><w:bidi/></w:sectPr></w:body></w:document>`;
  const styles = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:docDefaults><w:rPrDefault><w:rPr><w:rFonts w:ascii="Arial" w:hAnsi="Arial" w:cs="Arial" w:eastAsia="Arial"/><w:sz w:val="21"/><w:szCs w:val="21"/><w:lang w:val="he-IL" w:bidi="he-IL"/></w:rPr></w:rPrDefault><w:pPrDefault><w:pPr><w:bidi/></w:pPr></w:pPrDefault></w:docDefaults></w:styles>`;
  const files = {
    "[Content_Types].xml": `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/><Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/></Types>`,
    "_rels/.rels": `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>`,
    "word/_rels/document.xml.rels": `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>`,
    "word/document.xml": doc,
    "word/styles.xml": styles
  };
  return wfZip(files);
}
const WF_CRC = (() => { const t = new Uint32Array(256); for (let n = 0; n < 256; n++){ let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; } return t; })();
function wfCrc(b){ let c = 0xFFFFFFFF; for (let i = 0; i < b.length; i++) c = WF_CRC[(c ^ b[i]) & 0xFF] ^ (c >>> 8); return (c ^ 0xFFFFFFFF) >>> 0; }
function wfZip(files){
  const enc = new TextEncoder(), parts = [], central = [];
  let off = 0;
  for (const name in files){
    const nm = enc.encode(name), data = enc.encode(files[name]), crc = wfCrc(data);
    const lh = new DataView(new ArrayBuffer(30));
    lh.setUint32(0, 0x04034b50, true); lh.setUint16(4, 20, true); lh.setUint16(6, 0x0800, true); lh.setUint16(8, 0, true);
    lh.setUint16(10, 0, true); lh.setUint16(12, 0x21, true); lh.setUint32(14, crc, true); lh.setUint32(18, data.length, true); lh.setUint32(22, data.length, true);
    lh.setUint16(26, nm.length, true); lh.setUint16(28, 0, true);
    parts.push(new Uint8Array(lh.buffer), nm, data);
    const ch = new DataView(new ArrayBuffer(46));
    ch.setUint32(0, 0x02014b50, true); ch.setUint16(4, 20, true); ch.setUint16(6, 20, true); ch.setUint16(8, 0x0800, true); ch.setUint16(10, 0, true);
    ch.setUint16(12, 0, true); ch.setUint16(14, 0x21, true); ch.setUint32(16, crc, true); ch.setUint32(20, data.length, true); ch.setUint32(24, data.length, true);
    ch.setUint16(28, nm.length, true); ch.setUint16(30, 0, true); ch.setUint16(32, 0, true); ch.setUint16(34, 0, true); ch.setUint16(36, 0, true); ch.setUint32(38, 0, true); ch.setUint32(42, off, true);
    central.push(new Uint8Array(ch.buffer), nm);
    off += 30 + nm.length + data.length;
  }
  const csize = central.reduce((a, p) => a + p.length, 0);
  const end = new DataView(new ArrayBuffer(22));
  end.setUint32(0, 0x06054b50, true); end.setUint16(8, Object.keys(files).length, true); end.setUint16(10, Object.keys(files).length, true);
  end.setUint32(12, csize, true); end.setUint32(16, off, true);
  return new Blob(parts.concat(central, [new Uint8Array(end.buffer)]));
}
async function wfDownload(){
  const wk = WEEKS.find(x => x.id === wfWeek);
  const blob = wfDocx(wfDocBody(wk));
  const name = `סיכום ${wk.n} - פינגווין וואלטורנס 2027.docx`;
  const dl = window.claude && claude.use ? await claude.use("downloads").catch(() => null) : null;
  if (!dl){
    try { const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = name; document.body.appendChild(a); a.click(); a.remove(); toast("הקובץ ירד"); }
    catch (e){ toast("הורדת קבצים לא זמינה בתצוגה הזו"); }
    return;
  }
  try { await dl.save({ filename: name, data: blob }); toast("קובץ ה-Word נשמר"); }
  catch (e){ if (!e || e.code !== "declined") toast("הקובץ לא נשמר"); }
}

function copyText(txt, okMsg){
  const done = () => toast(okMsg || "הועתק");
  if (navigator.clipboard && navigator.clipboard.writeText){
    navigator.clipboard.writeText(txt).then(done).catch(() => fallback());
  } else fallback();
  function fallback(){
    const ta = document.createElement("textarea");
    ta.value = txt; document.body.appendChild(ta); ta.select();
    try { document.execCommand("copy"); done(); } catch(e){}
    document.body.removeChild(ta);
  }
}

const copySums = document.getElementById("copySums");
if (copySums) copySums.addEventListener("click", () => {
  const out = WEEKS.map(w => {
    const v = tstore(TKEY.sums)["s-" + w.id] || "";
    return `${w.n} (${w.d})\n${v.trim() || "—"}\n`;
  }).join("\n");
  copyText(out, "כל הסיכומים הועתקו");
});
