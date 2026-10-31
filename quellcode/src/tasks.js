/* ====================================================================== Aufgaben
   Jede Aufgabe erzeugt mit einem Zufallsgenerator r eigene Zahlen (params), daraus Text, Kontrollpunkte und Musterlösung.
   Kontrollpunkte: k (Schlüssel), sym (LaTeX), name, q (Größenart für die Einheitenprüfung), unit (Einheit in der Musterlösung),
   v(p) = Sollwert in SI-Einheiten, tol = relative Toleranz (Standard 1 %). */
const G = 9.81, C = 299792458, R_GAS = 8.314, LY = 9.4607e15;
const rad = d => d * Math.PI / 180;
const gam = b => 1 / Math.sqrt(1 - b * b);

const TASKS = [
  // ------------------------------------------------------------------ 1 Kinematik
  { id: "k1-avg", ch: "1", lvl: 1, title: "Fahrt mit zwei Abschnitten", refs: ["1.1"],
    params: r => ({ s1: r.step(40, 120, 10), v1: r.step(90, 130, 10), s2: r.step(10, 50, 5), v2: r.step(30, 60, 10) }),
    text: p => String.raw`Ein Auto fährt zuerst $s_1 = ${tx(p.s1)}\,\mathrm{km}$ auf der Autobahn mit konstant $v_1 = ${tx(p.v1)}\,\mathrm{km/h}$ und danach $s_2 = ${tx(p.s2)}\,\mathrm{km}$ durch eine Baustelle mit $v_2 = ${tx(p.v2)}\,\mathrm{km/h}$.

Berechnen Sie die **Gesamtfahrzeit** $t_\mathrm{ges}$ und die **Durchschnittsgeschwindigkeit** $\bar v$ über die ganze Strecke.`,
    checks: [
      { k: "t", sym: "t_\\mathrm{ges}", name: "Gesamtfahrzeit", q: "time", unit: "min", v: p => (p.s1 / p.v1 + p.s2 / p.v2) * 3600 },
      { k: "v", sym: "\\bar v", name: "Durchschnittsgeschwindigkeit", q: "velocity", unit: "km/h", v: p => (p.s1 + p.s2) / (p.s1 / p.v1 + p.s2 / p.v2) / 3.6 },
    ],
    solution: p => { const t1 = p.s1 / p.v1, t2 = p.s2 / p.v2, t = t1 + t2; return String.raw`Zeiten der Abschnitte: $t_1 = \frac{s_1}{v_1} = ${tx(t1, 4)}\,\mathrm{h}$, $t_2 = \frac{s_2}{v_2} = ${tx(t2, 4)}\,\mathrm{h}$

$$t_\mathrm{ges} = t_1 + t_2 = ${tx(t, 4)}\,\mathrm{h} = ${tx(t * 60)}\,\mathrm{min}$$

$$\bar v = \frac{s_1 + s_2}{t_\mathrm{ges}} = \frac{${tx(p.s1 + p.s2)}\,\mathrm{km}}{${tx(t, 4)}\,\mathrm{h}} = ${tx((p.s1 + p.s2) / t)}\,\mathrm{km/h}$$

Typischer Fehler: der Mittelwert $\frac{v_1 + v_2}{2} = ${tx((p.v1 + p.v2) / 2)}\,\mathrm{km/h}$ – er ist falsch, weil das Auto nicht gleich lange in beiden Abschnitten fährt.`; } },

  { id: "k1-train", ch: "1", lvl: 1, title: "Anfahrender Zug", refs: ["1.2"],
    params: r => ({ a: r.step(0.3, 1.2, 0.1), t: r.step(15, 60, 5) }),
    text: p => String.raw`Ein Regionalzug fährt aus dem Stand mit der konstanten Beschleunigung $a = ${tx(p.a)}\,\mathrm{m/s^2}$ an.

Welche **Geschwindigkeit** $v$ hat er nach $t = ${tx(p.t)}\,\mathrm{s}$, und welchen **Weg** $s$ hat er bis dahin zurückgelegt?`,
    checks: [
      { k: "v", sym: "v", name: "Geschwindigkeit", q: "velocity", unit: "km/h", v: p => p.a * p.t },
      { k: "s", sym: "s", name: "Weg", q: "length", unit: "m", v: p => 0.5 * p.a * p.t * p.t },
    ],
    solution: p => String.raw`Aus dem Stand ($v_0 = 0$) mit konstanter Beschleunigung:

$$v = a\,t = ${tx(p.a)}\,\mathrm{m/s^2} \cdot ${tx(p.t)}\,\mathrm{s} = ${tx(p.a * p.t)}\,\mathrm{m/s} = ${tx(p.a * p.t * 3.6)}\,\mathrm{km/h}$$

$$s = \tfrac{1}{2}\,a\,t^2 = \tfrac{1}{2} \cdot ${tx(p.a)}\,\mathrm{m/s^2} \cdot (${tx(p.t)}\,\mathrm{s})^2 = ${tx(0.5 * p.a * p.t * p.t)}\,\mathrm{m}$$` },

  { id: "k1-brake", ch: "1", lvl: 2, title: "Anhalteweg", refs: ["1.2"],
    params: r => ({ v: r.step(50, 130, 10), tr: r.pick([0.8, 1.0, 1.2]), a: r.step(5, 8, 0.5) }),
    text: p => String.raw`Eine Autofahrerin fährt mit $v_0 = ${tx(p.v)}\,\mathrm{km/h}$, als ein Hindernis auftaucht. Ihre Reaktionszeit beträgt $t_R = ${tx(p.tr)}\,\mathrm{s}$, danach bremst sie mit der konstanten Verzögerung $a = ${tx(p.a)}\,\mathrm{m/s^2}$ bis zum Stillstand.

Berechnen Sie den **Reaktionsweg** $s_R$, den **Bremsweg** $s_B$ und den **Anhalteweg** $s_A$.`,
    checks: [
      { k: "sR", sym: "s_R", name: "Reaktionsweg", q: "length", unit: "m", v: p => p.v / 3.6 * p.tr },
      { k: "sB", sym: "s_B", name: "Bremsweg", q: "length", unit: "m", v: p => (p.v / 3.6) ** 2 / (2 * p.a) },
      { k: "sA", sym: "s_A", name: "Anhalteweg", q: "length", unit: "m", v: p => p.v / 3.6 * p.tr + (p.v / 3.6) ** 2 / (2 * p.a) },
    ],
    solution: p => { const v = p.v / 3.6, sR = v * p.tr, sB = v * v / (2 * p.a); return String.raw`Zuerst in SI-Einheiten umrechnen: $v_0 = \frac{${tx(p.v)}}{3{,}6}\,\mathrm{m/s} = ${tx(v, 4)}\,\mathrm{m/s}$

$$s_R = v_0\,t_R = ${tx(sR)}\,\mathrm{m}, \qquad s_B = \frac{v_0^2}{2a} = \frac{(${tx(v, 4)}\,\mathrm{m/s})^2}{2 \cdot ${tx(p.a)}\,\mathrm{m/s^2}} = ${tx(sB)}\,\mathrm{m}$$

$$s_A = s_R + s_B = ${tx(sR + sB)}\,\mathrm{m}$$`; } },

  { id: "k1-vertical", ch: "1", lvl: 2, title: "Ball senkrecht nach oben", refs: ["1.3"],
    params: r => ({ v0: r.step(8, 22, 1), h0: r.step(1.2, 2.0, 0.1) }),
    text: p => String.raw`Ein Ball wird aus $h_0 = ${tx(p.h0)}\,\mathrm{m}$ Höhe mit $v_0 = ${tx(p.v0)}\,\mathrm{m/s}$ senkrecht nach oben geworfen (ohne Luftwiderstand, $g = 9{,}81\,\mathrm{m/s^2}$).

Berechnen Sie die **Steigzeit** $t_S$, die **maximale Höhe** $h_{\max}$ über dem Boden und die **Flugzeit** $t_F$ bis zum Aufprall auf dem Boden.`,
    checks: [
      { k: "tS", sym: "t_S", name: "Steigzeit", q: "time", unit: "s", v: p => p.v0 / G },
      { k: "h", sym: "h_{\\max}", name: "maximale Höhe", q: "length", unit: "m", v: p => p.h0 + p.v0 * p.v0 / (2 * G) },
      { k: "tF", sym: "t_F", name: "Flugzeit", q: "time", unit: "s", v: p => (p.v0 + Math.sqrt(p.v0 * p.v0 + 2 * G * p.h0)) / G },
    ],
    solution: p => { const tS = p.v0 / G, h = p.h0 + p.v0 * p.v0 / (2 * G), tF = (p.v0 + Math.sqrt(p.v0 * p.v0 + 2 * G * p.h0)) / G; return String.raw`Am höchsten Punkt ist $v = 0$: $\;t_S = \frac{v_0}{g} = ${tx(tS)}\,\mathrm{s}$

$$h_{\max} = h_0 + \frac{v_0^2}{2g} = ${tx(p.h0)}\,\mathrm{m} + ${tx(p.v0 * p.v0 / (2 * G))}\,\mathrm{m} = ${tx(h)}\,\mathrm{m}$$

Aufprall bei $h(t) = h_0 + v_0 t - \tfrac{1}{2} g t^2 = 0$. Die positive Lösung der quadratischen Gleichung ist

$$t_F = \frac{v_0 + \sqrt{v_0^2 + 2 g h_0}}{g} = ${tx(tF)}\,\mathrm{s}$$`; } },

  { id: "k1-projectile", ch: "1", lvl: 3, title: "Schiefer Wurf beim Kugelstoßen", refs: ["1.4"],
    params: r => ({ v0: r.step(10, 16, 0.5), a: r.step(30, 60, 5) }),
    text: p => String.raw`Eine Kugel wird mit $v_0 = ${tx(p.v0)}\,\mathrm{m/s}$ unter dem Winkel $\alpha = ${tx(p.a)}^\circ$ gegen die Horizontale abgeworfen. Vereinfachend landet sie auf derselben Höhe, aus der sie abgeworfen wurde (ohne Luftwiderstand).

Berechnen Sie die **Flugzeit** $T$, die **Wurfweite** $W$ und die **Gipfelhöhe** $H$ über der Abwurfhöhe.`,
    checks: [
      { k: "T", sym: "T", name: "Flugzeit", q: "time", unit: "s", v: p => 2 * p.v0 * Math.sin(rad(p.a)) / G },
      { k: "W", sym: "W", name: "Wurfweite", q: "length", unit: "m", v: p => p.v0 * p.v0 * Math.sin(rad(2 * p.a)) / G },
      { k: "H", sym: "H", name: "Gipfelhöhe", q: "length", unit: "m", v: p => (p.v0 * Math.sin(rad(p.a))) ** 2 / (2 * G) },
    ],
    solution: p => { const vx = p.v0 * Math.cos(rad(p.a)), vy = p.v0 * Math.sin(rad(p.a)), T = 2 * vy / G; return String.raw`Zerlegung der Abwurfgeschwindigkeit: $v_x = v_0 \cos\alpha = ${tx(vx, 4)}\,\mathrm{m/s}$, $\;v_y = v_0 \sin\alpha = ${tx(vy, 4)}\,\mathrm{m/s}$

$$T = \frac{2\,v_y}{g} = ${tx(T)}\,\mathrm{s}, \qquad W = v_x\,T = ${tx(vx * T)}\,\mathrm{m}, \qquad H = \frac{v_y^2}{2g} = ${tx(vy * vy / (2 * G))}\,\mathrm{m}$$

Taschenrechner im Gradmaß! Im Bogenmaß erhält man mit $\alpha = ${tx(p.a)}$ völlig andere Werte.`; } },

  { id: "k1-chase", ch: "1", lvl: 3, title: "Verfolgungsfahrt", refs: ["1.2"],
    params: r => ({ v: r.step(100, 160, 10), dt: r.step(2, 6, 1), a: r.step(2.5, 4, 0.5) }),
    text: p => String.raw`Ein Raser fährt mit konstant $v_R = ${tx(p.v)}\,\mathrm{km/h}$ an einem stehenden Polizeiwagen vorbei. Der Polizeiwagen startet $\Delta t = ${tx(p.dt)}\,\mathrm{s}$ später und beschleunigt konstant mit $a = ${tx(p.a)}\,\mathrm{m/s^2}$.

Nach welcher **Zeit** $t$ (gemessen ab dem Start der Polizei) holt die Polizei den Raser ein, welche **Strecke** $s$ hat sie dann zurückgelegt, und wie **schnell** $v_P$ ist sie in diesem Moment?`,
    checks: [
      { k: "t", sym: "t", name: "Zeit bis zum Einholen", q: "time", unit: "s", v: p => { const v = p.v / 3.6; return (v + Math.sqrt(v * v + 2 * p.a * v * p.dt)) / p.a; } },
      { k: "s", sym: "s", name: "Strecke", q: "length", unit: "m", v: p => { const v = p.v / 3.6, t = (v + Math.sqrt(v * v + 2 * p.a * v * p.dt)) / p.a; return 0.5 * p.a * t * t; } },
      { k: "vP", sym: "v_P", name: "Geschwindigkeit der Polizei", q: "velocity", unit: "km/h", v: p => { const v = p.v / 3.6; return v + Math.sqrt(v * v + 2 * p.a * v * p.dt); } },
    ],
    solution: p => { const v = p.v / 3.6, t = (v + Math.sqrt(v * v + 2 * p.a * v * p.dt)) / p.a; return String.raw`Mit $v_R = ${tx(v, 4)}\,\mathrm{m/s}$ und $t$ ab Start der Polizei: Raser $x_R = v_R\,(t + \Delta t)$, Polizei $x_P = \tfrac{1}{2} a t^2$. Gleichsetzen:

$$\tfrac{1}{2} a t^2 - v_R\,t - v_R\,\Delta t = 0 \quad\Rightarrow\quad t = \frac{v_R + \sqrt{v_R^2 + 2\,a\,v_R\,\Delta t}}{a} = ${tx(t)}\,\mathrm{s}$$

$$s = \tfrac{1}{2} a t^2 = ${tx(0.5 * p.a * t * t)}\,\mathrm{m}, \qquad v_P = a\,t = ${tx(p.a * t)}\,\mathrm{m/s} = ${tx(p.a * t * 3.6)}\,\mathrm{km/h}$$`; } },

  // ------------------------------------------------------------------ 2 Dynamik
  { id: "k2-crate", ch: "2", lvl: 1, title: "Kiste über den Boden schieben", refs: ["2.1", "2.2"],
    params: r => { const m = r.step(20, 80, 5), mu = r.step(0.2, 0.5, 0.05); return { m, mu, F: Math.round(mu * m * G * r.step(1.3, 1.8, 0.1) / 5) * 5 }; },
    text: p => String.raw`Eine Kiste der Masse $m = ${tx(p.m)}\,\mathrm{kg}$ wird mit der waagerechten Kraft $F = ${tx(p.F)}\,\mathrm{N}$ über einen ebenen Boden geschoben. Die Gleitreibungszahl beträgt $\mu = ${tx(p.mu)}$.

Berechnen Sie die **Reibungskraft** $F_R$ und die **Beschleunigung** $a$ der Kiste.`,
    checks: [
      { k: "FR", sym: "F_R", name: "Reibungskraft", q: "force", unit: "N", v: p => p.mu * p.m * G },
      { k: "a", sym: "a", name: "Beschleunigung", q: "accel", unit: "m/s^2", v: p => (p.F - p.mu * p.m * G) / p.m },
    ],
    solution: p => String.raw`Auf ebenem Boden ist $F_N = m\,g = ${tx(p.m * G)}\,\mathrm{N}$, also

$$F_R = \mu\,F_N = ${tx(p.mu)} \cdot ${tx(p.m * G)}\,\mathrm{N} = ${tx(p.mu * p.m * G)}\,\mathrm{N}$$

Die resultierende Kraft beschleunigt die Kiste:

$$a = \frac{F - F_R}{m} = \frac{${tx(p.F)}\,\mathrm{N} - ${tx(p.mu * p.m * G)}\,\mathrm{N}}{${tx(p.m)}\,\mathrm{kg}} = ${tx((p.F - p.mu * p.m * G) / p.m)}\,\mathrm{m/s^2}$$` },

  { id: "k2-elevator", ch: "2", lvl: 1, title: "Personenwaage im Aufzug", refs: ["2.1"],
    params: r => ({ m: r.step(55, 95, 5), a: r.step(0.5, 2.0, 0.25) }),
    text: p => String.raw`Eine Person ($m = ${tx(p.m)}\,\mathrm{kg}$) steht in einem Aufzug auf einer Personenwaage. Der Aufzug fährt an und beschleunigt mit $a = ${tx(p.a)}\,\mathrm{m/s^2}$ **nach oben**.

Wie groß ist die **Normalkraft** $F_N$ der Waage auf die Person, und welche **Masse** $m_\mathrm{Anz}$ zeigt die Waage an (sie ist auf $g = 9{,}81\,\mathrm{m/s^2}$ geeicht)?`,
    checks: [
      { k: "FN", sym: "F_N", name: "Normalkraft", q: "force", unit: "N", v: p => p.m * (G + p.a) },
      { k: "mA", sym: "m_\\mathrm{Anz}", name: "angezeigte Masse", q: "mass", unit: "kg", v: p => p.m * (G + p.a) / G },
    ],
    solution: p => String.raw`Freikörperbild der Person: $F_N$ nach oben, $F_G = m g$ nach unten. Mit der positiven Richtung nach oben:

$$F_N - m\,g = m\,a \quad\Rightarrow\quad F_N = m\,(g + a) = ${tx(p.m)}\,\mathrm{kg} \cdot ${tx(G + p.a, 4)}\,\mathrm{m/s^2} = ${tx(p.m * (G + p.a))}\,\mathrm{N}$$

Die Waage rechnet die Kraft mit $g$ in eine Masse um: $m_\mathrm{Anz} = \frac{F_N}{g} = ${tx(p.m * (G + p.a) / G)}\,\mathrm{kg}$.` },

  { id: "k2-incline", ch: "2", lvl: 2, title: "Kiste auf der Rampe", refs: ["2.3"],
    params: r => ({ m: r.step(10, 50, 5), a: r.step(25, 45, 5), mu: r.step(0.15, 0.35, 0.05) }),
    text: p => String.raw`Eine Kiste ($m = ${tx(p.m)}\,\mathrm{kg}$) rutscht eine Rampe mit dem Neigungswinkel $\alpha = ${tx(p.a)}^\circ$ hinab. Die Gleitreibungszahl beträgt $\mu = ${tx(p.mu)}$.

Berechnen Sie die **Hangabtriebskraft** $F_H$, die **Normalkraft** $F_N$ und die **Beschleunigung** $a$ der Kiste.`,
    checks: [
      { k: "FH", sym: "F_H", name: "Hangabtriebskraft", q: "force", unit: "N", v: p => p.m * G * Math.sin(rad(p.a)) },
      { k: "FN", sym: "F_N", name: "Normalkraft", q: "force", unit: "N", v: p => p.m * G * Math.cos(rad(p.a)) },
      { k: "a", sym: "a", name: "Beschleunigung", q: "accel", unit: "m/s^2", v: p => G * (Math.sin(rad(p.a)) - p.mu * Math.cos(rad(p.a))) },
    ],
    solution: p => { const FH = p.m * G * Math.sin(rad(p.a)), FN = p.m * G * Math.cos(rad(p.a)); return String.raw`Zerlegung der Gewichtskraft $F_G = m g = ${tx(p.m * G)}\,\mathrm{N}$:

$$F_H = m g \sin\alpha = ${tx(FH)}\,\mathrm{N}, \qquad F_N = m g \cos\alpha = ${tx(FN)}\,\mathrm{N}$$

Reibung $F_R = \mu F_N = ${tx(p.mu * FN)}\,\mathrm{N}$ wirkt hangaufwärts:

$$a = \frac{F_H - F_R}{m} = g\,(\sin\alpha - \mu\cos\alpha) = ${tx((FH - p.mu * FN) / p.m)}\,\mathrm{m/s^2}$$`; } },

  { id: "k2-coaster", ch: "2", lvl: 2, title: "Achterbahn", refs: ["2.4"],
    params: r => ({ h1: r.step(30, 60, 5), v1: r.step(2, 6, 1), h2: r.step(12, 25, 1) }),
    text: p => String.raw`Ein Achterbahnwagen erreicht den ersten Gipfel in $h_1 = ${tx(p.h1)}\,\mathrm{m}$ Höhe mit $v_1 = ${tx(p.v1)}\,\mathrm{m/s}$. Danach fährt er hinunter bis auf Bodenhöhe und anschließend in einen Looping, dessen höchster Punkt bei $h_2 = ${tx(p.h2)}\,\mathrm{m}$ liegt. Reibung und Luftwiderstand werden vernachlässigt.

Wie schnell ist der Wagen am **tiefsten Punkt** ($v_u$) und am **höchsten Punkt des Loopings** ($v_2$)?`,
    checks: [
      { k: "vu", sym: "v_u", name: "Geschwindigkeit unten", q: "velocity", unit: "m/s", v: p => Math.sqrt(p.v1 ** 2 + 2 * G * p.h1) },
      { k: "v2", sym: "v_2", name: "Geschwindigkeit oben im Looping", q: "velocity", unit: "m/s", v: p => Math.sqrt(p.v1 ** 2 + 2 * G * (p.h1 - p.h2)) },
    ],
    solution: p => String.raw`Energieerhaltung zwischen Gipfel und tiefstem Punkt (die Masse kürzt sich):

$$\tfrac{1}{2} m v_1^2 + m g h_1 = \tfrac{1}{2} m v_u^2 \quad\Rightarrow\quad v_u = \sqrt{v_1^2 + 2 g h_1} = ${tx(Math.sqrt(p.v1 ** 2 + 2 * G * p.h1))}\,\mathrm{m/s}$$

Genauso zwischen Gipfel und Looping-Scheitel:

$$v_2 = \sqrt{v_1^2 + 2 g (h_1 - h_2)} = ${tx(Math.sqrt(p.v1 ** 2 + 2 * G * (p.h1 - p.h2)))}\,\mathrm{m/s}$$` },

  { id: "k2-pendulum", ch: "2", lvl: 3, title: "Ballistisches Pendel", refs: ["2.5", "2.4"],
    params: r => ({ m: r.step(5, 15, 1), v: r.step(250, 450, 25), M: r.step(1.0, 3.0, 0.5) }),
    text: p => String.raw`Ein Geschoss ($m = ${tx(p.m)}\,\mathrm{g}$, $v = ${tx(p.v)}\,\mathrm{m/s}$) trifft waagerecht einen ruhenden, an Seilen hängenden Holzklotz ($M = ${tx(p.M)}\,\mathrm{kg}$) und bleibt darin stecken.

Berechnen Sie die **Geschwindigkeit** $v'$ von Klotz und Geschoss direkt nach dem Stoß, die **Höhe** $h$, um die das Pendel danach ausschwingt, und den **Anteil der kinetischen Energie**, der beim Stoß in Wärme und Verformung umgewandelt wird.`,
    checks: [
      { k: "v", sym: "v'", name: "Geschwindigkeit nach dem Stoß", q: "velocity", unit: "m/s", v: p => (p.m / 1000) * p.v / (p.m / 1000 + p.M) },
      { k: "h", sym: "h", name: "Steighöhe", q: "length", unit: "cm", v: p => ((p.m / 1000) * p.v / (p.m / 1000 + p.M)) ** 2 / (2 * G) },
      { k: "loss", sym: "\\Delta E / E", name: "Energieverlust", q: "ratio", unit: "%", v: p => p.M / (p.m / 1000 + p.M) },
    ],
    solution: p => { const m = p.m / 1000, vp = m * p.v / (m + p.M), h = vp * vp / (2 * G); return String.raw`**Stoß** (Impulserhaltung, vollständig inelastisch), mit $m = ${tx(m)}\,\mathrm{kg}$:

$$m v = (m + M)\,v' \quad\Rightarrow\quad v' = \frac{m\,v}{m + M} = ${tx(vp)}\,\mathrm{m/s}$$

**Ausschwingen** (Energieerhaltung): $h = \frac{v'^2}{2g} = ${tx(h)}\,\mathrm{m} = ${tx(h * 100)}\,\mathrm{cm}$

**Energiebilanz:** $E = \tfrac{1}{2} m v^2 = ${tx(0.5 * m * p.v * p.v)}\,\mathrm{J}$ vorher, $E' = \tfrac{1}{2}(m+M)v'^2 = ${tx(0.5 * (m + p.M) * vp * vp)}\,\mathrm{J}$ nachher. Umgewandelt wird

$$\frac{E - E'}{E} = \frac{M}{m + M} = ${tx(100 * p.M / (m + p.M), 4)}\,\%$$

Energieerhaltung gilt beim Stoß **nicht** – nur der Impuls bleibt erhalten.`; } },

  { id: "k2-curve", ch: "2", lvl: 3, title: "Kurvenfahrt", refs: ["2.6", "1.5"],
    params: r => ({ r: r.step(40, 150, 10), mu: r.step(0.5, 0.9, 0.1), m: r.step(1000, 1800, 100), vd: r.step(60, 100, 10) }),
    text: p => String.raw`Ein Auto ($m = ${tx(p.m)}\,\mathrm{kg}$) fährt durch eine ebene Kurve mit dem Radius $r = ${tx(p.r)}\,\mathrm{m}$. Die Haftreibungszahl zwischen Reifen und Straße beträgt $\mu_H = ${tx(p.mu)}$.

1. Mit welcher **Höchstgeschwindigkeit** $v_{\max}$ kann das Auto die Kurve gerade noch durchfahren?
2. Wie groß ist dabei die **Zentripetalkraft** $F_Z$?
3. Die Kurve soll so **überhöht** werden, dass ein Auto sie mit $v = ${tx(p.vd)}\,\mathrm{km/h}$ ganz ohne Reibung durchfahren kann. Welchen **Neigungswinkel** $\beta$ braucht die Fahrbahn?`,
    checks: [
      { k: "vmax", sym: "v_{\\max}", name: "Höchstgeschwindigkeit", q: "velocity", unit: "km/h", v: p => Math.sqrt(p.mu * G * p.r) },
      { k: "FZ", sym: "F_Z", name: "Zentripetalkraft", q: "force", unit: "kN", v: p => p.mu * p.m * G },
      { k: "beta", sym: "\\beta", name: "Neigungswinkel", q: "angle", unit: "°", v: p => Math.atan((p.vd / 3.6) ** 2 / (G * p.r)) },
    ],
    solution: p => { const vm = Math.sqrt(p.mu * G * p.r), v = p.vd / 3.6, b = Math.atan(v * v / (G * p.r)) * 180 / Math.PI; return String.raw`1. Die Haftreibung liefert höchstens $\mu_H m g$:

$$\frac{m v_{\max}^2}{r} = \mu_H\,m\,g \quad\Rightarrow\quad v_{\max} = \sqrt{\mu_H\,g\,r} = ${tx(vm)}\,\mathrm{m/s} = ${tx(vm * 3.6)}\,\mathrm{km/h}$$

2. $F_Z = \frac{m v_{\max}^2}{r} = \mu_H\,m\,g = ${tx(p.mu * p.m * G)}\,\mathrm{N}$

3. Mit $v = ${tx(v, 4)}\,\mathrm{m/s}$:

$$\tan\beta = \frac{v^2}{g\,r} = ${tx(v * v / (G * p.r), 4)} \quad\Rightarrow\quad \beta = ${tx(b)}^\circ$$`; } },

  // ------------------------------------------------------------------ 3 Thermodynamik
  { id: "k3-kettle", ch: "3", lvl: 1, title: "Wasserkocher", refs: ["3.2"],
    params: r => ({ V: r.step(0.5, 1.7, 0.1), T1: r.step(10, 20, 1), P: r.step(1800, 2400, 200), eta: r.step(0.8, 0.95, 0.05) }),
    text: p => String.raw`In einem Wasserkocher ($P = ${tx(p.P)}\,\mathrm{W}$, Wirkungsgrad $\eta = ${tx(p.eta)}$) werden $${tx(p.V)}\,\mathrm{l}$ Wasser von $${tx(p.T1)}\,{}^\circ\mathrm{C}$ auf $100\,{}^\circ\mathrm{C}$ erwärmt ($c_W = 4190\,\mathrm{J/(kg\,K)}$, $1\,\mathrm{l}$ Wasser hat die Masse $1\,\mathrm{kg}$).

Berechnen Sie die nötige **Wärme** $Q$ und die **Zeit** $t$, die der Wasserkocher braucht.`,
    checks: [
      { k: "Q", sym: "Q", name: "Wärme", q: "energy", unit: "kJ", v: p => 4190 * p.V * (100 - p.T1) },
      { k: "t", sym: "t", name: "Zeit", q: "time", unit: "s", v: p => 4190 * p.V * (100 - p.T1) / (p.eta * p.P) },
    ],
    solution: p => { const Q = 4190 * p.V * (100 - p.T1); return String.raw`Mit $m = ${tx(p.V)}\,\mathrm{kg}$ und $\Delta T = ${tx(100 - p.T1)}\,\mathrm{K}$:

$$Q = c_W\,m\,\Delta T = 4190\,\tfrac{\mathrm{J}}{\mathrm{kg\,K}} \cdot ${tx(p.V)}\,\mathrm{kg} \cdot ${tx(100 - p.T1)}\,\mathrm{K} = ${tx(Q / 1000)}\,\mathrm{kJ}$$

Nur der Anteil $\eta$ der elektrischen Leistung erwärmt das Wasser:

$$t = \frac{Q}{\eta\,P} = \frac{${tx(Q)}\,\mathrm{J}}{${tx(p.eta)} \cdot ${tx(p.P)}\,\mathrm{W}} = ${tx(Q / (p.eta * p.P))}\,\mathrm{s} \approx ${tx(Q / (p.eta * p.P) / 60, 2)}\,\mathrm{min}$$`; } },

  { id: "k3-bridge", ch: "3", lvl: 1, title: "Dehnfuge einer Stahlbrücke", refs: ["3.1"],
    params: r => ({ L: r.step(50, 300, 10), Tmin: r.step(-25, -10, 1), Tmax: r.step(35, 50, 1) }),
    text: p => String.raw`Eine Stahlbrücke ist $L_0 = ${tx(p.L)}\,\mathrm{m}$ lang ($\alpha = 12 \cdot 10^{-6}\,\mathrm{K^{-1}}$). Im Lauf eines Jahres schwankt die Temperatur des Stahls zwischen $${tx(p.Tmin)}\,{}^\circ\mathrm{C}$ und $${tx(p.Tmax)}\,{}^\circ\mathrm{C}$.

Wie groß ist die **Temperaturdifferenz** $\Delta T$, und wie breit muss die Dehnfuge mindestens sein, also wie groß ist die **Längenänderung** $\Delta L$ zwischen kältestem und wärmstem Zustand?`,
    checks: [
      { k: "dT", sym: "\\Delta T", name: "Temperaturdifferenz", q: "tempdiff", unit: "K", v: p => p.Tmax - p.Tmin },
      { k: "dL", sym: "\\Delta L", name: "Längenänderung", q: "length", unit: "mm", v: p => 12e-6 * p.L * (p.Tmax - p.Tmin) },
    ],
    solution: p => String.raw`$$\Delta T = ${tx(p.Tmax)}\,{}^\circ\mathrm{C} - (${tx(p.Tmin)}\,{}^\circ\mathrm{C}) = ${tx(p.Tmax - p.Tmin)}\,\mathrm{K}$$

$$\Delta L = \alpha\,L_0\,\Delta T = 12 \cdot 10^{-6}\,\mathrm{K^{-1}} \cdot ${tx(p.L)}\,\mathrm{m} \cdot ${tx(p.Tmax - p.Tmin)}\,\mathrm{K} = ${tx(12e-6 * p.L * (p.Tmax - p.Tmin) * 1000)}\,\mathrm{mm}$$

Temperaturdifferenzen sind in Kelvin und Grad Celsius gleich – hier muss nicht in Kelvin umgerechnet werden.` },

  { id: "k3-mix", ch: "3", lvl: 2, title: "Tee abkühlen", refs: ["3.2"],
    params: r => ({ m1: r.step(0.2, 0.4, 0.05), T1: r.step(75, 95, 5), m2: r.step(0.05, 0.15, 0.01), T2: r.step(8, 20, 1), mk: r.step(0.1, 0.3, 0.05) }),
    text: p => String.raw`In eine Kupferkanne ($m_K = ${tx(p.mk)}\,\mathrm{kg}$, $c_K = 385\,\mathrm{J/(kg\,K)}$), die zusammen mit $m_2 = ${tx(p.m2)}\,\mathrm{kg}$ kaltem Wasser die Temperatur $${tx(p.T2)}\,{}^\circ\mathrm{C}$ hat, werden $m_1 = ${tx(p.m1)}\,\mathrm{kg}$ heißer Tee ($${tx(p.T1)}\,{}^\circ\mathrm{C}$) gegossen. Tee und Wasser haben $c_W = 4190\,\mathrm{J/(kg\,K)}$; Wärmeverluste an die Umgebung werden vernachlässigt.

Berechnen Sie die **Mischtemperatur** $T_m$ und die **Wärme** $Q$, die der Tee dabei abgibt.`,
    checks: [
      { k: "Tm", sym: "T_m", name: "Mischtemperatur", q: "temp", unit: "°C", v: p => { const cw = 4190, ck = 385; return (cw * p.m1 * p.T1 + (cw * p.m2 + ck * p.mk) * p.T2) / (cw * p.m1 + cw * p.m2 + ck * p.mk) + 273.15; } },
      { k: "Q", sym: "Q", name: "abgegebene Wärme", q: "energy", unit: "kJ", v: p => { const cw = 4190, ck = 385, Tm = (cw * p.m1 * p.T1 + (cw * p.m2 + ck * p.mk) * p.T2) / (cw * p.m1 + cw * p.m2 + ck * p.mk); return cw * p.m1 * (p.T1 - Tm); } },
    ],
    solution: p => { const cw = 4190, ck = 385, Tm = (cw * p.m1 * p.T1 + (cw * p.m2 + ck * p.mk) * p.T2) / (cw * p.m1 + cw * p.m2 + ck * p.mk); return String.raw`Abgegebene Wärme = aufgenommene Wärme:

$$c_W m_1 (T_1 - T_m) = (c_W m_2 + c_K m_K)(T_m - T_2)$$

$$T_m = \frac{c_W m_1 T_1 + (c_W m_2 + c_K m_K)\,T_2}{c_W m_1 + c_W m_2 + c_K m_K} = ${tx(Tm)}\,{}^\circ\mathrm{C}$$

$$Q = c_W\,m_1\,(T_1 - T_m) = ${tx(cw * p.m1 * (p.T1 - Tm) / 1000)}\,\mathrm{kJ}$$`; } },

  { id: "k3-tire", ch: "3", lvl: 2, title: "Reifendruck im Sommer", refs: ["3.3", "3.1"],
    params: r => ({ pu: r.step(2.0, 2.6, 0.1), T1: r.step(5, 15, 1), T2: r.step(40, 60, 5) }),
    text: p => String.raw`Ein Autoreifen wird morgens bei $${tx(p.T1)}\,{}^\circ\mathrm{C}$ auf einen Überdruck von $p_{\ddot u,1} = ${tx(p.pu)}\,\mathrm{bar}$ aufgepumpt. Nach einer schnellen Fahrt in der Sonne hat die Luft im Reifen $${tx(p.T2)}\,{}^\circ\mathrm{C}$. Das Volumen des Reifens bleibt näherungsweise gleich, der Luftdruck der Umgebung beträgt $1{,}013\,\mathrm{bar}$.

Berechnen Sie den **absoluten Druck** $p_1$ am Morgen und den **Überdruck** $p_{\ddot u,2}$ nach der Fahrt.`,
    checks: [
      { k: "p1", sym: "p_1", name: "absoluter Druck morgens", q: "pressure", unit: "bar", v: p => (p.pu + 1.013) * 1e5 },
      { k: "pu2", sym: "p_{\\ddot u,2}", name: "Überdruck nach der Fahrt", q: "pressure", unit: "bar", v: p => ((p.pu + 1.013) * (p.T2 + 273.15) / (p.T1 + 273.15) - 1.013) * 1e5 },
    ],
    solution: p => { const p1 = p.pu + 1.013, p2 = p1 * (p.T2 + 273.15) / (p.T1 + 273.15); return String.raw`Das Gasgesetz gilt nur mit **absolutem** Druck und **absoluter** Temperatur:

$$p_1 = p_{\ddot u,1} + p_\mathrm{atm} = ${tx(p.pu)}\,\mathrm{bar} + 1{,}013\,\mathrm{bar} = ${tx(p1, 4)}\,\mathrm{bar}$$

Isochor: $\frac{p_2}{T_2} = \frac{p_1}{T_1}$ mit $T_1 = ${tx(p.T1 + 273.15, 5)}\,\mathrm{K}$, $T_2 = ${tx(p.T2 + 273.15, 5)}\,\mathrm{K}$:

$$p_2 = p_1\,\frac{T_2}{T_1} = ${tx(p2, 4)}\,\mathrm{bar}, \qquad p_{\ddot u,2} = p_2 - p_\mathrm{atm} = ${tx(p2 - 1.013, 3)}\,\mathrm{bar}$$`; } },

  { id: "k3-isotherm", ch: "3", lvl: 3, title: "Isotherme Kompression", refs: ["3.3", "3.4"],
    params: r => ({ V1: r.step(2, 6, 1), p1: r.step(1.0, 2.0, 0.1), k: r.pick([2, 3, 4]), T: r.step(15, 30, 5) }),
    text: p => String.raw`In einem Zylinder befinden sich $V_1 = ${tx(p.V1)}\,\mathrm{l}$ Luft bei $p_1 = ${tx(p.p1)}\,\mathrm{bar}$ und $${tx(p.T)}\,{}^\circ\mathrm{C}$ (ideales Gas). Die Luft wird langsam und **isotherm** auf ein Volumen von $V_1 / ${p.k}$ zusammengedrückt.

Berechnen Sie die **Stoffmenge** $n$, den **Enddruck** $p_2$ und die am Gas verrichtete **Arbeit** $W$.`,
    checks: [
      { k: "n", sym: "n", name: "Stoffmenge", q: "amount", unit: "mol", v: p => p.p1 * 1e5 * p.V1 * 1e-3 / (R_GAS * (p.T + 273.15)) },
      { k: "p2", sym: "p_2", name: "Enddruck", q: "pressure", unit: "bar", v: p => p.p1 * p.k * 1e5 },
      { k: "W", sym: "W", name: "Arbeit am Gas", q: "energy", unit: "J", v: p => p.p1 * 1e5 * p.V1 * 1e-3 * Math.log(p.k) },
    ],
    solution: p => { const pV = p.p1 * 1e5 * p.V1 * 1e-3, T = p.T + 273.15; return String.raw`SI-Einheiten: $p_1 = ${tx(p.p1 * 1e5)}\,\mathrm{Pa}$, $V_1 = ${tx(p.V1 * 1e-3)}\,\mathrm{m^3}$, $T = ${tx(T, 5)}\,\mathrm{K}$, also $p_1 V_1 = ${tx(pV)}\,\mathrm{J}$.

$$n = \frac{p_1 V_1}{R\,T} = ${tx(pV / (R_GAS * T))}\,\mathrm{mol}, \qquad p_2 = p_1\,\frac{V_1}{V_2} = ${tx(p.p1 * p.k)}\,\mathrm{bar}$$

$$W = p_1 V_1 \ln\frac{V_1}{V_2} = ${tx(pV)}\,\mathrm{J} \cdot \ln ${p.k} = ${tx(pV * Math.log(p.k))}\,\mathrm{J}$$

Weil $\Delta U = 0$ ist, gibt das Gas genau diese Energie als Wärme ab: $Q = -W$.`; } },

  { id: "k3-plant", ch: "3", lvl: 3, title: "Wirkungsgrad eines Kraftwerks", refs: ["3.5", "3.1"],
    params: r => ({ Th: r.step(500, 600, 10), Tk: r.step(20, 40, 5), P: r.step(200, 800, 50), f: r.step(0.55, 0.7, 0.05) }),
    text: p => String.raw`Ein Dampfkraftwerk arbeitet zwischen einer Frischdampftemperatur von $${tx(p.Th)}\,{}^\circ\mathrm{C}$ und einer Kühlwassertemperatur von $${tx(p.Tk)}\,{}^\circ\mathrm{C}$. Sein tatsächlicher Wirkungsgrad erreicht $${tx(p.f * 100)}\,\%$ des Carnot-Wirkungsgrads; es liefert die Leistung $P = ${tx(p.P)}\,\mathrm{MW}$.

Berechnen Sie den **Carnot-Wirkungsgrad** $\eta_C$, die zugeführte **Wärmeleistung** $\dot Q_\mathrm{zu}$ und die an das Kühlwasser abgegebene **Abwärmeleistung** $\dot Q_\mathrm{ab}$.`,
    checks: [
      { k: "etaC", sym: "\\eta_C", name: "Carnot-Wirkungsgrad", q: "ratio", unit: "%", v: p => 1 - (p.Tk + 273.15) / (p.Th + 273.15) },
      { k: "Qzu", sym: "\\dot Q_\\mathrm{zu}", name: "zugeführte Wärmeleistung", q: "power", unit: "MW", v: p => p.P * 1e6 / (p.f * (1 - (p.Tk + 273.15) / (p.Th + 273.15))) },
      { k: "Qab", sym: "\\dot Q_\\mathrm{ab}", name: "Abwärmeleistung", q: "power", unit: "MW", v: p => p.P * 1e6 / (p.f * (1 - (p.Tk + 273.15) / (p.Th + 273.15))) - p.P * 1e6 },
    ],
    solution: p => { const eC = 1 - (p.Tk + 273.15) / (p.Th + 273.15), e = p.f * eC, Q = p.P / e; return String.raw`Temperaturen in Kelvin: $T_h = ${tx(p.Th + 273.15, 5)}\,\mathrm{K}$, $T_k = ${tx(p.Tk + 273.15, 5)}\,\mathrm{K}$

$$\eta_C = 1 - \frac{T_k}{T_h} = ${tx(eC * 100)}\,\%, \qquad \eta = ${tx(p.f)} \cdot \eta_C = ${tx(e * 100)}\,\%$$

$$\dot Q_\mathrm{zu} = \frac{P}{\eta} = ${tx(Q)}\,\mathrm{MW}, \qquad \dot Q_\mathrm{ab} = \dot Q_\mathrm{zu} - P = ${tx(Q - p.P)}\,\mathrm{MW}$$

Mit Celsius-Temperaturen erhielte man einen viel zu hohen Wirkungsgrad.`; } },

  // ------------------------------------------------------------------ 4 Spezielle Relativitätstheorie
  { id: "k4-muon", ch: "4", lvl: 1, title: "Myonen aus der Höhenstrahlung", refs: ["4.2", "4.1"],
    params: r => ({ b: r.step(0.990, 0.999, 0.001) }),
    text: p => String.raw`Ein Myon hat in seinem Ruhesystem die mittlere Lebensdauer $\tau_0 = 2{,}2\,\mu\mathrm{s}$. Es fliegt mit $v = ${tx(p.b, 3)}\,c$ auf die Erde zu.

Berechnen Sie den **Lorentzfaktor** $\gamma$, die **Lebensdauer** $\tau$ im System der Erde und die **Strecke** $s$, die das Myon in dieser Zeit im Mittel zurücklegt.`,
    checks: [
      { k: "g", sym: "\\gamma", name: "Lorentzfaktor", q: "none", unit: "", v: p => gam(p.b) },
      { k: "tau", sym: "\\tau", name: "Lebensdauer im Erdsystem", q: "time", unit: "µs", v: p => gam(p.b) * 2.2e-6 },
      { k: "s", sym: "s", name: "Flugstrecke", q: "length", unit: "km", v: p => p.b * C * gam(p.b) * 2.2e-6 },
    ],
    solution: p => { const g = gam(p.b); return String.raw`$$\gamma = \frac{1}{\sqrt{1 - \beta^2}} = \frac{1}{\sqrt{1 - ${tx(p.b, 3)}^2}} = ${tx(g)}$$

$$\tau = \gamma\,\tau_0 = ${tx(g)} \cdot 2{,}2\,\mu\mathrm{s} = ${tx(g * 2.2)}\,\mu\mathrm{s}$$

$$s = v\,\tau = ${tx(p.b, 3)} \cdot 3{,}00 \cdot 10^8\,\mathrm{m/s} \cdot ${tx(g * 2.2)} \cdot 10^{-6}\,\mathrm{s} = ${tx(p.b * C * g * 2.2e-6 / 1000)}\,\mathrm{km}$$

Ohne Zeitdilatation wären es nur $${tx(p.b * C * 2.2e-6)}\,\mathrm{m}$.`; } },

  { id: "k4-ship", ch: "4", lvl: 1, title: "Raumschiff im Vorbeiflug", refs: ["4.3", "4.1"],
    params: r => ({ L: r.step(80, 300, 10), b: r.step(0.5, 0.95, 0.05) }),
    text: p => String.raw`Ein Raumschiff hat in seinem Ruhesystem die Länge $L_0 = ${tx(p.L)}\,\mathrm{m}$. Es fliegt mit $v = ${tx(p.b)}\,c$ an einer Raumstation vorbei.

Berechnen Sie den **Lorentzfaktor** $\gamma$ und die **Länge** $L$, die man auf der Raumstation misst.`,
    checks: [
      { k: "g", sym: "\\gamma", name: "Lorentzfaktor", q: "none", unit: "", v: p => gam(p.b) },
      { k: "L", sym: "L", name: "gemessene Länge", q: "length", unit: "m", v: p => p.L / gam(p.b) },
    ],
    solution: p => String.raw`$$\gamma = \frac{1}{\sqrt{1 - ${tx(p.b)}^2}} = ${tx(gam(p.b), 4)}, \qquad L = \frac{L_0}{\gamma} = \frac{${tx(p.L)}\,\mathrm{m}}{${tx(gam(p.b), 4)}} = ${tx(p.L / gam(p.b))}\,\mathrm{m}$$

Die Länge schrumpft nur in Flugrichtung; Breite und Höhe bleiben gleich.` },

  { id: "k4-travel", ch: "4", lvl: 2, title: "Reise zu einem Stern", refs: ["4.2", "4.3"],
    params: r => { const s = r.pick([["Proxima Centauri", 4.2], ["Sirius", 8.6], ["Epsilon Eridani", 10.5], ["Altair", 16.7]]); return { star: s[0], d: s[1], b: r.step(0.6, 0.95, 0.05) }; },
    text: p => String.raw`Ein Raumschiff fliegt mit konstant $v = ${tx(p.b)}\,c$ zum Stern ${p.star}, der von der Erde $d = ${tx(p.d)}$ Lichtjahre entfernt ist (Beschleunigungsphasen vernachlässigt).

Wie lange dauert der Flug **im System der Erde** ($t_E$) und **für die Besatzung** ($t_S$)? Wie lang ist die **Strecke** $d'$ aus Sicht der Besatzung?`,
    checks: [
      { k: "tE", sym: "t_E", name: "Flugdauer im Erdsystem", q: "time", unit: "a", v: p => p.d / p.b * 3.15576e7 },
      { k: "tS", sym: "t_S", name: "Flugdauer für die Besatzung", q: "time", unit: "a", v: p => p.d / p.b / gam(p.b) * 3.15576e7 },
      { k: "d2", sym: "d'", name: "Strecke für die Besatzung", q: "length", unit: "Lj", v: p => p.d / gam(p.b) * LY },
    ],
    solution: p => { const tE = p.d / p.b, g = gam(p.b); return String.raw`Ein Lichtjahr ist die Strecke, die Licht in einem Jahr zurücklegt. Deshalb gilt in Jahren:

$$t_E = \frac{d}{v} = \frac{${tx(p.d)}\,\mathrm{Lj}}{${tx(p.b)}\,c} = ${tx(tE)}\,\mathrm{Jahre}$$

Mit $\gamma = ${tx(g, 4)}$ vergeht für die Besatzung $t_S = \frac{t_E}{\gamma} = ${tx(tE / g)}\,\mathrm{Jahre}$.

Für die Besatzung ist die Strecke verkürzt: $d' = \frac{d}{\gamma} = ${tx(p.d / g)}\,\mathrm{Lj}$ – und tatsächlich ist $d'/v = t_S$.`; } },

  { id: "k4-electron", ch: "4", lvl: 2, title: "Elektronen in einer Beschleunigerröhre", refs: ["4.4", "4.1"],
    params: r => ({ U: r.step(100, 800, 50) }),
    text: p => String.raw`Elektronen ($m_e c^2 = 0{,}511\,\mathrm{MeV}$) werden aus der Ruhe durch die Spannung $U = ${tx(p.U)}\,\mathrm{kV}$ beschleunigt.

Berechnen Sie ihre **kinetische Energie** $E_\mathrm{kin}$, den **Lorentzfaktor** $\gamma$ und ihre **Geschwindigkeit** $v$ (gern als Vielfaches von $c$).`,
    checks: [
      { k: "E", sym: "E_\\mathrm{kin}", name: "kinetische Energie", q: "energy", unit: "keV", v: p => p.U * 1e3 * 1.602176634e-19 },
      { k: "g", sym: "\\gamma", name: "Lorentzfaktor", q: "none", unit: "", v: p => 1 + p.U / 511 },
      { k: "v", sym: "v", name: "Geschwindigkeit", q: "velocity", unit: "c", v: p => { const g = 1 + p.U / 511; return Math.sqrt(1 - 1 / (g * g)) * C; } },
    ],
    solution: p => { const g = 1 + p.U / 511, b = Math.sqrt(1 - 1 / (g * g)), bk = Math.sqrt(2 * p.U / 511); return String.raw`Jedes Elektron gewinnt $E_\mathrm{kin} = e\,U = ${tx(p.U)}\,\mathrm{keV}$.

$$\gamma = 1 + \frac{E_\mathrm{kin}}{m_e c^2} = 1 + \frac{${tx(p.U)}\,\mathrm{keV}}{511\,\mathrm{keV}} = ${tx(g, 4)}$$

$$\beta = \sqrt{1 - \frac{1}{\gamma^2}} = ${tx(b, 4)} \quad\Rightarrow\quad v = ${tx(b, 4)}\,c = ${tx(b * C)}\,\mathrm{m/s}$$

Klassisch ergäbe sich $v = \sqrt{2 E_\mathrm{kin}/m_e} = ${tx(bk, 3)}\,c$${bk > 1 ? " – schneller als das Licht, also unmöglich" : " – zu groß"}.`; } },

  { id: "k4-probe", ch: "4", lvl: 3, title: "Sonden vom Raumschiff", refs: ["4.5", "4.1"],
    params: r => ({ u: r.step(0.5, 0.9, 0.1), w: r.step(0.5, 0.9, 0.1) }),
    text: p => String.raw`Ein Raumschiff fliegt mit $u = ${tx(p.u)}\,c$ von der Erde weg. Es startet zwei Sonden, jede mit $v' = ${tx(p.w)}\,c$ relativ zum Raumschiff: eine **nach vorn** und eine **nach hinten** (in Richtung Erde).

Berechnen Sie die Geschwindigkeiten $v_\mathrm{vor}$ und $v_\mathrm{r\ddot{u}ck}$ der beiden Sonden im System der Erde (positiv = von der Erde weg) sowie den **Lorentzfaktor** $\gamma_\mathrm{vor}$ der vorderen Sonde gegenüber der Erde.`,
    checks: [
      { k: "vv", sym: "v_\\mathrm{vor}", name: "Sonde nach vorn", q: "velocity", unit: "c", v: p => (p.u + p.w) / (1 + p.u * p.w) * C },
      { k: "vr", sym: "v_\\mathrm{r\\ddot{u}ck}", name: "Sonde nach hinten", q: "velocity", unit: "c", v: p => (p.u - p.w) / (1 - p.u * p.w) * C, abs: 1e-6 * C },
      { k: "g", sym: "\\gamma_\\mathrm{vor}", name: "Lorentzfaktor der vorderen Sonde", q: "none", unit: "", v: p => gam((p.u + p.w) / (1 + p.u * p.w)) },
    ],
    solution: p => { const vv = (p.u + p.w) / (1 + p.u * p.w), vr = (p.u - p.w) / (1 - p.u * p.w); return String.raw`$$v_\mathrm{vor} = \frac{u + v'}{1 + u v'/c^2} = \frac{${tx(p.u)} + ${tx(p.w)}}{1 + ${tx(p.u)} \cdot ${tx(p.w)}}\,c = ${tx(vv, 4)}\,c$$

Für die hintere Sonde $v'$ durch $-v'$ ersetzen:

$$v_\mathrm{r\ddot{u}ck} = \frac{u - v'}{1 - u v'/c^2} = ${tx(vr, 4)}\,c$$

${Math.abs(vr) < 1e-9 ? "Die hintere Sonde steht also relativ zur Erde still." : vr < 0 ? "Das negative Vorzeichen bedeutet: Die hintere Sonde fliegt auf die Erde zu." : "Die hintere Sonde fliegt also langsamer, aber weiter von der Erde weg."}

$$\gamma_\mathrm{vor} = \frac{1}{\sqrt{1 - ${tx(vv, 4)}^2}} = ${tx(gam(vv), 4)}$$

Klassisch wäre $v_\mathrm{vor} = ${tx(p.u + p.w)}\,c$${p.u + p.w > 1 ? " – schneller als das Licht" : ""}.`; } },

  { id: "k4-proton", ch: "4", lvl: 3, title: "Protonen im Ringbeschleuniger", refs: ["4.4", "4.1"],
    params: r => ({ E: r.pick([450, 1000, 3500, 6800]) }),
    text: p => String.raw`In einem Ringbeschleuniger kreisen Protonen ($m_p c^2 = 938{,}3\,\mathrm{MeV}$) mit der Gesamtenergie $E = ${tx(p.E)}\,\mathrm{GeV}$.

Berechnen Sie den **Lorentzfaktor** $\gamma$, die Größe $1 - \beta$ (wie knapp unter der Lichtgeschwindigkeit fliegen die Protonen?) und den **Impuls** $p$ in $\mathrm{GeV}/c$.`,
    checks: [
      { k: "g", sym: "\\gamma", name: "Lorentzfaktor", q: "none", unit: "", v: p => p.E / 0.9383 },
      { k: "omb", sym: "1 - \\beta", name: "Abstand zur Lichtgeschwindigkeit", q: "none", unit: "", tol: 0.02, v: p => { const g = p.E / 0.9383, ig = 1 / (g * g); return ig / (1 + Math.sqrt(1 - ig)); } },
      { k: "p", sym: "p", name: "Impuls", q: "momentum", unit: "GeV/c", v: p => Math.sqrt(p.E ** 2 - 0.9383 ** 2) * 5.344286e-19 },
    ],
    solution: p => { const g = p.E / 0.9383; return String.raw`$$\gamma = \frac{E}{m_p c^2} = \frac{${tx(p.E)}\,\mathrm{GeV}}{0{,}9383\,\mathrm{GeV}} = ${tx(g, 4)}$$

Der Taschenrechner liefert für $1 - \sqrt{1 - 1/\gamma^2}$ meist 0. Mit $\beta = \sqrt{1 - 1/\gamma^2} \approx 1 - \frac{1}{2\gamma^2}$:

$$1 - \beta \approx \frac{1}{2\gamma^2} = ${tx(1 / (2 * g * g), 3)}$$

$$p\,c = \sqrt{E^2 - (m_p c^2)^2} = ${tx(Math.sqrt(p.E ** 2 - 0.9383 ** 2), 5)}\,\mathrm{GeV} \quad\Rightarrow\quad p = ${tx(Math.sqrt(p.E ** 2 - 0.9383 ** 2), 5)}\,\mathrm{GeV}/c$$

Bei so großen Energien ist $p\,c \approx E$.`; } },
];
