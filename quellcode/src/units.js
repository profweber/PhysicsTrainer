/* ====================================================================== Zahlen und Einheiten
   Eingaben wie „12,5 m/s“, „3,2·10^-6 s“, „40 %“, „0,98 c“ werden in SI-Einheiten umgerechnet. */
const EV = 1.602176634e-19;
const UNITS = {
  length: { m: 1, km: 1e3, cm: 1e-2, mm: 1e-3, um: 1e-6, nm: 1e-9, Lj: LY, ly: LY },
  time: { s: 1, ms: 1e-3, us: 1e-6, ns: 1e-9, min: 60, h: 3600, d: 86400, a: 3.15576e7, Jahre: 3.15576e7, Jahr: 3.15576e7, y: 3.15576e7 },
  velocity: { "m/s": 1, "km/h": 1 / 3.6, "km/s": 1e3, c: C },
  accel: { "m/s2": 1 },
  mass: { kg: 1, g: 1e-3, t: 1e3 },
  force: { N: 1, kN: 1e3, MN: 1e6, mN: 1e-3 },
  energy: { J: 1, kJ: 1e3, MJ: 1e6, GJ: 1e9, Wh: 3600, kWh: 3.6e6, eV: EV, keV: 1e3 * EV, MeV: 1e6 * EV, GeV: 1e9 * EV, TeV: 1e12 * EV, Nm: 1 },
  power: { W: 1, kW: 1e3, MW: 1e6, GW: 1e9, mW: 1e-3 },
  pressure: { Pa: 1, hPa: 1e2, kPa: 1e3, MPa: 1e6, bar: 1e5, mbar: 1e2 },
  temp: { K: [1, 0], "°C": [1, 273.15], C: [1, 273.15] },
  tempdiff: { K: 1, "°C": 1, C: 1 },
  amount: { mol: 1, mmol: 1e-3, kmol: 1e3 },
  angle: { "°": Math.PI / 180, deg: Math.PI / 180, Grad: Math.PI / 180, rad: 1 },
  momentum: { "kgm/s": 1, Ns: 1, "GeV/c": 1e9 * EV / C, "MeV/c": 1e6 * EV / C, "TeV/c": 1e12 * EV / C },
  ratio: { "": 1, "%": 0.01 },
  none: { "": 1 },
};
const QNAMES = { length: "Länge", time: "Zeit", velocity: "Geschwindigkeit", accel: "Beschleunigung", mass: "Masse", force: "Kraft", energy: "Energie", power: "Leistung", pressure: "Druck", temp: "Temperatur", tempdiff: "Temperaturdifferenz", amount: "Stoffmenge", angle: "Winkel", momentum: "Impuls", ratio: "Verhältnis", none: "Zahl ohne Einheit" };
// Einheit vereinheitlichen: Leerzeichen und Malpunkte weg, Hochzahlen als Ziffer, µ als u
const canonUnit = u => u.replace(/[\s·⋅*]/g, "").replace(/\^?²|\^2/g, "2").replace(/\^?³|\^3/g, "3").replace(/[µμ]/g, "u").replace(/^°?([CK])$/, (a, x) => x === "C" ? "°C" : "K").replace(/^grad$/i, "Grad");
function unitTable(q) {
  const t = {};
  for (const [k, v] of Object.entries(UNITS[q] || {})) t[canonUnit(k)] = v;
  return t;
}
// liefert {ok, si, unit, num} oder {ok:false, why}
function parseQuantity(input, q) {
  const s = String(input || "").trim().replace(/−/g, "-");
  if (!s) return { ok: false, why: "empty" };
  const m = /^([+-]?\s*(?:\d+(?:[.,]\d*)?|[.,]\d+))\s*(?:(?:[eE]\s*([+-]?\d+))|(?:[·*x×⋅]\s*10\s*\^\s*\(?\s*([+-]?\d+)\s*\)?))?\s*(.*)$/.exec(s);
  if (!m) return { ok: false, why: "number" };
  let num = parseFloat(m[1].replace(/\s/g, "").replace(",", "."));
  const ex = m[2] ?? m[3];
  if (ex !== undefined) num *= Math.pow(10, parseInt(ex, 10));
  if (!isFinite(num)) return { ok: false, why: "number" };
  const unitRaw = m[4].trim();
  const table = unitTable(q), key = canonUnit(unitRaw);
  if (!(key in table)) {
    if (!unitRaw) return { ok: false, why: "nounit", num };
    // Einheit einer anderen Größe?
    const other = Object.keys(UNITS).find(qq => qq !== q && qq !== "tempdiff" && key in unitTable(qq));
    return { ok: false, why: other ? "wrongq" : "unknownunit", num, unit: unitRaw, other };
  }
  const f = table[key];
  const si = Array.isArray(f) ? num * f[0] + f[1] : num * f;
  return { ok: true, si, num, unit: unitRaw };
}
// Wert in einer Einheit ausgeben (für Musterlösung/Rückmeldung)
function inUnit(si, q, unit) {
  const f = unitTable(q)[canonUnit(unit)];
  if (f === undefined) return si;
  return Array.isArray(f) ? (si - f[1]) / f[0] : si / f;
}
// Prüfung eines Kontrollpunkts: status ok | sign | power | factor2 | wrong | nounit | wrongq | unknownunit | number | empty
function judge(cp, p, input) {
  const exp = cp.v(p);
  const r = parseQuantity(input, cp.q);
  const tolOf = e => cp.q === "temp" ? 0.3 : Math.max(Math.abs(e) * (cp.tol || 0.01), cp.abs || 1e-300);
  const near = (a, e) => Math.abs(a - e) <= tolOf(e);
  if (!r.ok) {
    // Einheit vergessen, Zahl in SI-Einheit wäre richtig?
    if (r.why === "nounit" && near(r.num, exp)) return { st: "nounitsi", exp };
    return { st: r.why, exp, r };
  }
  if (near(r.si, exp)) return { st: "ok", exp, r };
  if (cp.q !== "temp" && near(-r.si, exp) && Math.abs(exp) > 0) return { st: "sign", exp, r };
  if (cp.q !== "temp" && exp !== 0 && r.si !== 0) {
    const ratio = r.si / exp, k = Math.round(Math.log10(Math.abs(ratio)));
    if (k !== 0 && Math.abs(k) <= 12 && Math.abs(Math.abs(ratio) / Math.pow(10, k) - 1) < 0.02) return { st: "power", exp, r };
    if (Math.abs(Math.abs(ratio) - 2) < 0.02 || Math.abs(Math.abs(ratio) - 0.5) < 0.01) return { st: "factor2", exp, r };
  }
  return { st: "wrong", exp, r };
}
