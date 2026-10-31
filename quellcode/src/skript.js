/* ====================================================================== Demo-Skript
   Platzhalter-Skript für den Vorführprototypen: kurze Abschnitte mit den Formeln, die die Aufgaben brauchen.
   Jeder Abschnitt: id, Titel, Text (Markdown mit $…$ und $$…$$). */
const SKRIPT_TITLE = "Physik für Ingenieurinnen und Ingenieure";
const SKRIPT = [
  { ch: "1", title: "Kinematik", sections: [
    { id: "1.1", title: "Ort, Geschwindigkeit und Beschleunigung", text: String.raw`Die Kinematik beschreibt Bewegungen, ohne nach ihren Ursachen zu fragen. Für eine Bewegung entlang einer Geraden genügt der Ort $x(t)$. Die **Geschwindigkeit** ist die Änderung des Ortes pro Zeit, die **Beschleunigung** die Änderung der Geschwindigkeit pro Zeit:

$$v = \frac{\mathrm{d}x}{\mathrm{d}t}, \qquad a = \frac{\mathrm{d}v}{\mathrm{d}t}$$

Die **Durchschnittsgeschwindigkeit** über eine Strecke ist immer Gesamtweg durch Gesamtzeit, $\bar v = s_\mathrm{ges} / t_\mathrm{ges}$ – nicht der Mittelwert der Einzelgeschwindigkeiten.

**Einheiten:** $1\,\mathrm{m/s} = 3{,}6\,\mathrm{km/h}$. Rechnen Sie Zwischenergebnisse in SI-Einheiten und rechnen Sie erst am Ende um.` },
    { id: "1.2", title: "Gleichmäßig beschleunigte Bewegung", text: String.raw`Bei konstanter Beschleunigung $a$ gelten mit Anfangsgeschwindigkeit $v_0$ und Anfangsort $x_0$:

$$v(t) = v_0 + a\,t, \qquad x(t) = x_0 + v_0\,t + \tfrac{1}{2}\,a\,t^2$$

Eliminiert man die Zeit, erhält man die zeitfreie Gleichung $v^2 = v_0^2 + 2\,a\,s$. Sie ist besonders nützlich für Bremswege: Aus $v = 0$ folgt $s_B = \dfrac{v_0^2}{2\,a}$ (mit dem Betrag der Bremsverzögerung $a$).

Der **Anhalteweg** setzt sich aus Reaktionsweg $s_R = v_0\,t_R$ (konstante Geschwindigkeit während der Reaktionszeit) und Bremsweg zusammen.

Treffen sich zwei Körper, setzt man ihre Orte gleich, $x_1(t) = x_2(t)$, und löst nach $t$ auf – oft führt das auf eine quadratische Gleichung.` },
    { id: "1.3", title: "Freier Fall und senkrechter Wurf", text: String.raw`In der Nähe der Erdoberfläche erfahren alle Körper (ohne Luftwiderstand) dieselbe Fallbeschleunigung $g = 9{,}81\,\mathrm{m/s^2}$. Zählt man die Höhe $h$ nach oben positiv, gilt für einen senkrechten Wurf mit Abwurfhöhe $h_0$:

$$h(t) = h_0 + v_0\,t - \tfrac{1}{2}\,g\,t^2, \qquad v(t) = v_0 - g\,t$$

Am höchsten Punkt ist $v = 0$; daraus folgen Steigzeit $t_S = v_0/g$ und Steighöhe $\Delta h = \dfrac{v_0^2}{2g}$. Die Flugzeit bis zum Boden erhält man aus $h(t) = 0$ – von den beiden Lösungen der quadratischen Gleichung ist nur die positive physikalisch sinnvoll.` },
    { id: "1.4", title: "Schiefer Wurf", text: String.raw`Beim schiefen Wurf mit Abwurfgeschwindigkeit $v_0$ unter dem Winkel $\alpha$ zerlegt man die Bewegung in zwei unabhängige Anteile: horizontal gleichförmig, vertikal gleichmäßig beschleunigt.

$$x(t) = v_0 \cos\alpha \cdot t, \qquad y(t) = v_0 \sin\alpha \cdot t - \tfrac{1}{2}\,g\,t^2$$

Für Abwurf und Landung auf gleicher Höhe ergeben sich

$$T = \frac{2\,v_0 \sin\alpha}{g}, \qquad W = \frac{v_0^2 \sin(2\alpha)}{g}, \qquad H = \frac{v_0^2 \sin^2\alpha}{2g}$$

Die größte Wurfweite erreicht man (ohne Luftwiderstand) bei $\alpha = 45^\circ$. Achten Sie darauf, ob Ihr Taschenrechner im Grad- oder Bogenmaß rechnet.` },
    { id: "1.5", title: "Kreisbewegung", text: String.raw`Bewegt sich ein Körper mit konstantem Betrag der Geschwindigkeit $v$ auf einem Kreis mit Radius $r$, ändert sich ständig die Richtung der Geschwindigkeit. Dazu ist eine zum Mittelpunkt gerichtete **Zentripetalbeschleunigung** nötig:

$$a_Z = \frac{v^2}{r} = \omega^2 r, \qquad \omega = \frac{2\pi}{T}$$

Die zugehörige Kraft behandelt Abschnitt [[2.6]].` },
  ] },
  { ch: "2", title: "Dynamik", sections: [
    { id: "2.1", title: "Die Newtonschen Axiome", text: String.raw`1. **Trägheitsprinzip:** Ein Körper bleibt in Ruhe oder in gleichförmiger Bewegung, solange keine resultierende Kraft auf ihn wirkt.
2. **Aktionsprinzip:** $\vec F_\mathrm{res} = m\,\vec a$. Die Einheit der Kraft ist $1\,\mathrm{N} = 1\,\mathrm{kg\,m/s^2}$.
3. **Wechselwirkungsprinzip:** Übt ein Körper A eine Kraft auf B aus, so übt B eine gleich große, entgegengesetzte Kraft auf A aus.

**Vorgehen:** Zeichnen Sie für jeden Körper ein Freikörperbild mit allen angreifenden Kräften, legen Sie eine positive Richtung fest und stellen Sie $F_\mathrm{res} = m\,a$ für jede Richtung auf.

In einem beschleunigten Aufzug zeigt eine Personenwaage die **Normalkraft** an, nicht die Gewichtskraft: Bei Beschleunigung $a$ nach oben gilt $F_N = m\,(g + a)$.` },
    { id: "2.2", title: "Gewichtskraft, Normalkraft und Reibung", text: String.raw`Die **Gewichtskraft** ist $F_G = m\,g$. Die **Normalkraft** $F_N$ steht senkrecht auf der Kontaktfläche; auf waagerechtem Boden ohne weitere vertikale Kräfte ist $F_N = F_G$.

Die **Gleitreibungskraft** wirkt der Bewegung entgegen und ist proportional zur Normalkraft:

$$F_R = \mu \, F_N$$

mit der Gleitreibungszahl $\mu$ (z.B. Holz auf Holz etwa 0,3). Die Haftreibung kann bis zu $F_{H,\max} = \mu_H F_N$ betragen; $\mu_H$ ist meist größer als $\mu$.` },
    { id: "2.3", title: "Die schiefe Ebene", text: String.raw`Auf einer schiefen Ebene mit Neigungswinkel $\alpha$ zerlegt man die Gewichtskraft in eine Komponente parallel zur Ebene (**Hangabtriebskraft**) und eine senkrecht dazu:

$$F_H = m\,g \sin\alpha, \qquad F_N = m\,g \cos\alpha$$

Rutscht ein Körper die Ebene hinab, wirkt die Reibung $F_R = \mu\,m\,g\cos\alpha$ nach oben. Die Beschleunigung ist dann

$$a = g\,(\sin\alpha - \mu \cos\alpha)$$

Der Körper rutscht nur, wenn $\tan\alpha > \mu_H$ ist.` },
    { id: "2.4", title: "Arbeit, Energie und Leistung", text: String.raw`Arbeit ist Kraft mal Weg in Kraftrichtung, $W = F\,s\cos\varphi$. Wichtige Energieformen:

$$E_\mathrm{kin} = \tfrac{1}{2}\,m\,v^2, \qquad E_\mathrm{pot} = m\,g\,h$$

**Energieerhaltung:** Ohne Reibung bleibt die mechanische Energie erhalten, $E_\mathrm{kin} + E_\mathrm{pot} = \text{konst.}$ Daraus folgt für einen Körper, der von der Höhe $h_1$ mit $v_1$ auf die Höhe $h_2$ gelangt:

$$v_2 = \sqrt{v_1^2 + 2\,g\,(h_1 - h_2)}$$

Die Masse kürzt sich heraus. **Leistung** ist Arbeit pro Zeit, $P = W/t$, Einheit $1\,\mathrm{W} = 1\,\mathrm{J/s}$.` },
    { id: "2.5", title: "Impuls und Stoß", text: String.raw`Der Impuls ist $\vec p = m\,\vec v$. In einem abgeschlossenen System bleibt der Gesamtimpuls erhalten – bei jedem Stoß.

Beim **vollständig inelastischen Stoß** bewegen sich die Körper danach gemeinsam:

$$m_1 v_1 + m_2 v_2 = (m_1 + m_2)\,v'$$

Die kinetische Energie bleibt dabei **nicht** erhalten; ein Teil wird in Wärme und Verformung umgewandelt. Beim **ballistischen Pendel** nutzt man nacheinander Impulserhaltung (Stoß) und Energieerhaltung (Ausschwingen auf die Höhe $h$).` },
    { id: "2.6", title: "Zentripetalkraft und Kurvenfahrt", text: String.raw`Für eine Kreisbewegung (siehe [[1.5]]) ist die resultierende Kraft zum Mittelpunkt

$$F_Z = \frac{m\,v^2}{r}$$

Bei einem Auto in einer ebenen Kurve muss die Haftreibung diese Kraft aufbringen: $\frac{m v^2}{r} \le \mu_H\,m\,g$, also $v_{\max} = \sqrt{\mu_H\,g\,r}$.

In einer **überhöhten Kurve** mit Neigungswinkel $\beta$ liefert ohne Reibung die Normalkraft die Zentripetalkraft. Für die Auslegungsgeschwindigkeit $v$ gilt

$$\tan\beta = \frac{v^2}{g\,r}$$` },
  ] },
  { ch: "3", title: "Thermodynamik", sections: [
    { id: "3.1", title: "Temperatur und Wärmeausdehnung", text: String.raw`Die absolute Temperatur $T$ wird in Kelvin gemessen: $T/\mathrm{K} = \vartheta/{}^\circ\mathrm{C} + 273{,}15$. **Temperaturdifferenzen** sind in Kelvin und Grad Celsius gleich groß.

Feste Körper dehnen sich bei Erwärmung aus. Für die Längenänderung gilt

$$\Delta L = \alpha\,L_0\,\Delta T$$

mit dem Längenausdehnungskoeffizienten $\alpha$ (Stahl: $12 \cdot 10^{-6}\,\mathrm{K^{-1}}$, Aluminium: $23 \cdot 10^{-6}\,\mathrm{K^{-1}}$). Brücken und Schienen brauchen deshalb Dehnfugen.` },
    { id: "3.2", title: "Wärmemenge und spezifische Wärmekapazität", text: String.raw`Um einen Körper der Masse $m$ um $\Delta T$ zu erwärmen, braucht man die Wärme

$$Q = c\,m\,\Delta T$$

mit der spezifischen Wärmekapazität $c$ (Wasser: $4190\,\mathrm{J/(kg\,K)}$, Kupfer: $385\,\mathrm{J/(kg\,K)}$).

**Mischtemperatur:** Bringt man Körper unterschiedlicher Temperatur zusammen (ohne Wärmeverluste), gibt der wärmere so viel Wärme ab, wie der kältere aufnimmt:

$$\sum_i c_i\,m_i\,(T_m - T_i) = 0 \quad\Rightarrow\quad T_m = \frac{\sum c_i m_i T_i}{\sum c_i m_i}$$

Liefert ein Heizgerät die elektrische Leistung $P$ mit Wirkungsgrad $\eta$, dauert das Erwärmen $t = \dfrac{Q}{\eta\,P}$.` },
    { id: "3.3", title: "Das ideale Gas", text: String.raw`Für ein ideales Gas mit der Stoffmenge $n$ gilt die thermische Zustandsgleichung

$$p\,V = n\,R\,T, \qquad R = 8{,}314\,\mathrm{J/(mol\,K)}$$

Dabei sind $p$ der **absolute** Druck und $T$ die **absolute** Temperatur. Bei konstantem Volumen (isochor) folgt $\dfrac{p_1}{T_1} = \dfrac{p_2}{T_2}$, bei konstanter Temperatur (isotherm) $p_1 V_1 = p_2 V_2$.

**Achtung bei Reifen und Druckbehältern:** Manometer zeigen meist den Überdruck gegenüber der Umgebung an, $p_\mathrm{abs} = p_{\ddot{u}} + p_\mathrm{atm}$ mit $p_\mathrm{atm} \approx 1{,}013\,\mathrm{bar}$.` },
    { id: "3.4", title: "Der erste Hauptsatz", text: String.raw`Die innere Energie $U$ eines Systems ändert sich durch zugeführte Wärme $Q$ und am System verrichtete Arbeit $W$:

$$\Delta U = Q + W$$

Bei einem idealen Gas hängt $U$ nur von der Temperatur ab. Bei einer **isothermen** Zustandsänderung ist deshalb $\Delta U = 0$ und $Q = -W$. Für die am Gas verrichtete Arbeit bei isothermer Kompression von $V_1$ auf $V_2$ gilt

$$W = n\,R\,T\,\ln\frac{V_1}{V_2} = p_1 V_1 \ln\frac{V_1}{V_2}$$

Das Gas gibt bei der Kompression also genau diese Arbeit als Wärme an die Umgebung ab.` },
    { id: "3.5", title: "Wärmekraftmaschinen und Wirkungsgrad", text: String.raw`Eine Wärmekraftmaschine nimmt die Wärme $Q_\mathrm{zu}$ bei hoher Temperatur auf, gibt Arbeit $W$ ab und führt die Abwärme $Q_\mathrm{ab} = Q_\mathrm{zu} - W$ an ein kälteres Reservoir ab. Der Wirkungsgrad ist

$$\eta = \frac{W}{Q_\mathrm{zu}}$$

Keine Maschine zwischen den Temperaturen $T_h$ und $T_k$ kann den **Carnot-Wirkungsgrad** übertreffen:

$$\eta_C = 1 - \frac{T_k}{T_h} \qquad (T \text{ in Kelvin!})$$

Für Leistungen gelten dieselben Beziehungen mit $P = \eta\,\dot Q_\mathrm{zu}$.` },
  ] },
  { ch: "4", title: "Spezielle Relativitätstheorie", sections: [
    { id: "4.1", title: "Die Postulate und der Lorentzfaktor", text: String.raw`Einstein stellte zwei Postulate auf: Die Naturgesetze gelten in allen Inertialsystemen gleich, und die Lichtgeschwindigkeit im Vakuum hat in jedem Inertialsystem denselben Wert $c = 299\,792\,458\,\mathrm{m/s}$.

Viele Effekte lassen sich mit dem **Lorentzfaktor** ausdrücken:

$$\beta = \frac{v}{c}, \qquad \gamma = \frac{1}{\sqrt{1 - \beta^2}} \ge 1$$

Für Alltagsgeschwindigkeiten ist $\gamma \approx 1$; erst nahe der Lichtgeschwindigkeit wird $\gamma$ groß.` },
    { id: "4.2", title: "Zeitdilatation", text: String.raw`Eine bewegte Uhr geht langsamer. Vergeht im Ruhesystem der Uhr die **Eigenzeit** $\tau_0$, misst ein Beobachter, gegenüber dem sich die Uhr mit $v$ bewegt, die Zeit

$$\tau = \gamma\,\tau_0$$

**Beispiel Myonen:** Myonen entstehen in etwa 10 km Höhe und haben eine mittlere Lebensdauer von $2{,}2\,\mu\mathrm{s}$. Klassisch kämen sie im Mittel nur rund 660 m weit; dank Zeitdilatation erreichen viele den Erdboden.

Bei Reisen gilt: Für die Reisenden vergeht die Zeit $t' = t/\gamma$, wenn auf der Erde $t$ vergeht.` },
    { id: "4.3", title: "Längenkontraktion", text: String.raw`Ein bewegter Körper ist in Bewegungsrichtung verkürzt. Hat er in seinem Ruhesystem die **Eigenlänge** $L_0$, misst ein Beobachter

$$L = \frac{L_0}{\gamma}$$

Quer zur Bewegungsrichtung tritt keine Verkürzung auf. Aus Sicht von Raumfahrenden ist auch die Strecke zu einem Ziel verkürzt: Statt $d$ legen sie nur $d/\gamma$ zurück – das ist dieselbe Physik wie die Zeitdilatation, nur aus dem anderen System betrachtet.` },
    { id: "4.4", title: "Relativistische Energie und Impuls", text: String.raw`Ein Teilchen mit Ruhemasse $m$ hat die Ruheenergie $E_0 = m c^2$ und die Gesamtenergie

$$E = \gamma\,m c^2, \qquad E_\mathrm{kin} = E - m c^2 = (\gamma - 1)\,m c^2$$

Für den Impuls gilt $p = \gamma\,m\,v$ und der Zusammenhang $E^2 = (p c)^2 + (m c^2)^2$. In der Teilchenphysik gibt man Energien in Elektronenvolt an ($1\,\mathrm{eV} = 1{,}602 \cdot 10^{-19}\,\mathrm{J}$), Impulse in $\mathrm{eV}/c$.

Ruheenergien: Elektron $0{,}511\,\mathrm{MeV}$, Proton $938{,}3\,\mathrm{MeV}$. Ein Elektron, das die Spannung $U$ durchläuft, gewinnt die Energie $E_\mathrm{kin} = e\,U$.

**Rechentipp:** Für sehr große $\gamma$ liefert $1 - \beta$ auf dem Taschenrechner oft 0. Nutzen Sie dann $1 - \beta \approx \dfrac{1}{2\gamma^2}$.` },
    { id: "4.5", title: "Relativistische Geschwindigkeitsaddition", text: String.raw`Bewegt sich ein Raumschiff mit $u$ gegenüber der Erde und startet es eine Sonde mit $v'$ (gemessen im Raumschiff) in Flugrichtung, so hat die Sonde gegenüber der Erde die Geschwindigkeit

$$v = \frac{u + v'}{1 + \dfrac{u\,v'}{c^2}}$$

Das Ergebnis ist immer kleiner als $c$. Für eine Sonde, die nach hinten gestartet wird, ersetzt man $v'$ durch $-v'$. Für kleine Geschwindigkeiten geht die Formel in die klassische Addition $v = u + v'$ über.` },
  ] },
];
