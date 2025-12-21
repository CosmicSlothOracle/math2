
import { LearningUnit, ShopItem, GeometryDefinition } from './types';

export const PROGRESS_LEVELS = [
  { title: "Messy Bun", icon: "🎀" },
  { title: "First Try", icon: "👟" },
  { title: "Soft Focus", icon: "🌫️" },
  { title: "Blurry Mirror", icon: "🪞" },
  { title: "Getting Ready", icon: "💄" },
  { title: "Mirror Check ✔", icon: "✔️" },
  { title: "Lipgloss Level", icon: "✨" },
  { title: "Clean Lines", icon: "📏" },
  { title: "Playlist Ready", icon: "🎧" },
  { title: "Outfit Half-Locked", icon: "👗" },
  { title: "After School Glow", icon: "☀️" },
  { title: "Neon Mood", icon: "🏮" },
  { title: "Angles On Point", icon: "📐" },
  { title: "Friday Feeling", icon: "💃" },
  { title: "Main Character Moment", icon: "🎬" },
  { title: "Late Train Energy", icon: "🚄" },
  { title: "City Lights", icon: "🌃" },
  { title: "Bass In The Floor", icon: "🔊" },
  { title: "Späti Stop", icon: "🥤" },
  { title: "No Filter Needed", icon: "📸" },
  { title: "Everyone Knows", icon: "🌟" },
  { title: "Camera Finds You", icon: "🎥" },
  { title: "Quiet Confidence", icon: "🤫" },
  { title: "Always Invited", icon: "💌" },
  { title: "Outfit Locked", icon: "🔒" },
  { title: "Glow Up I", icon: "🔥" },
  { title: "Glow Up II", icon: "💎" },
  { title: "Glow Up III", icon: "🌌" },
  { title: "Main Character Energy", icon: "⚡" },
  { title: "After Midnight", icon: "🌙" }
];

export const SHOP_ITEMS: ShopItem[] = [
  // --- TIER 1: STARTER / COMMON (0 - 200 Coins) ---
  { id: 'av_1', name: 'Newbie', type: 'avatar', cost: 0, value: '👤', icon: '👤', description: 'Dein Start-Avatar.', rarity: 'common' },
  { id: 'av_npc', name: 'NPC', type: 'avatar', cost: 50, value: '😐', icon: '😐', description: 'Einfach nur da.', rarity: 'common' },
  { id: 'av_sq_intern', name: 'SideQuest Intern', type: 'avatar', cost: 75, value: '☕', icon: '☕', description: 'Holt erst mal Kaffee für die Pros.', rarity: 'common' },
  { id: 'av_voyeur', name: 'Math Voyeur', type: 'avatar', cost: 120, value: '🫣', icon: '🫣', description: 'Guckt nur zu, rechnet nicht.', rarity: 'common' },
  { id: 'av_side_eye', name: 'Side-Eye Scholar', type: 'avatar', cost: 150, value: '😒', icon: '😒', description: 'Beurteilt deine Rechenwege.', rarity: 'common' },
  { id: 'av_trig_trainee', name: 'Trigonometrie Trainee', type: 'avatar', cost: 180, value: '📐', icon: '📐', description: 'Lernt gerade erst, was Sinus ist.', rarity: 'common' },
  { id: 'av_sq_student', name: 'SideQuest Student', type: 'avatar', cost: 200, value: '🎒', icon: '🎒', description: 'Macht nur die optionalen Aufgaben.', rarity: 'common' },

  // --- TIER 2: ADVANCED / RARE (201 - 600 Coins) ---
  { id: 'av_2', name: 'Schlaue Eule', type: 'avatar', cost: 220, value: '🦉', icon: '🦉', description: 'Weise Entscheidungen im Test.', rarity: 'rare' },
  { id: 'av_alg_jaya', name: 'Algebra Jaya', type: 'avatar', cost: 250, value: '🧩', icon: '🧩', description: 'Löst x schneller als du blinzelst.', rarity: 'rare' },
  { id: 'av_geo_gustav', name: 'Geometrie Gustav', type: 'avatar', cost: 275, value: '📏', icon: '📏', description: 'Hat immer ein Geodreieck dabei.', rarity: 'rare' },
  { id: 'av_3', name: 'Math Ninja', type: 'avatar', cost: 300, value: '🥷', icon: '🥷', description: 'Schneller als jeder Taschenrechner.', rarity: 'rare' },
  { id: 'av_back_calc', name: 'Backwards Calculator', type: 'avatar', cost: 350, value: '🙃', icon: '🙃', description: 'Rechnet von hinten nach vorne.', rarity: 'rare' },
  { id: 'av_proofrunner', name: 'Proofrunner', type: 'avatar', cost: 400, value: '🏃', icon: '🏃', description: 'Rennt durch die Beweisführung.', rarity: 'rare' },
  { id: 'av_theron', name: 'Theron', type: 'avatar', cost: 450, value: '🦁', icon: '🦁', description: 'Löwenstark in Stochastik.', rarity: 'rare' },
  { id: 'av_tinkerer', name: 'Tinkerer', type: 'avatar', cost: 500, value: '🔧', icon: '🔧', description: 'Bastelt an den Lösungen.', rarity: 'rare' },
  { id: 'av_lowkey', name: 'Low-Key Genius', type: 'avatar', cost: 550, value: '🧢', icon: '🧢', description: 'Tut so als ob er nix weiß, schreibt aber eine 1.', rarity: 'rare' },

  // --- FEATURES ---
  { id: 'item_rename', name: 'Name Change', type: 'feature', cost: 150, value: 'rename', icon: '🏷️', description: 'Wähle einen neuen, cooleren Namen.', rarity: 'rare' },

  // --- TIER 3: PRO / EPIC (601 - 1500 Coins) ---
  { id: 'av_latex', name: 'Latex Logic', type: 'avatar', cost: 650, value: '✒️', icon: '✒️', description: 'Formatiert schöner als er rechnet.', rarity: 'epic' },
  { id: 'av_alien', name: 'Cosmic Entity', type: 'avatar', cost: 700, value: '👽', icon: '👽', description: 'Wissen aus fremden Galaxien.', rarity: 'epic' },
  { id: 'av_math_off', name: 'Math Me Off', type: 'avatar', cost: 800, value: '😤', icon: '😤', description: 'Genug gerechnet für heute.', rarity: 'epic' },
  { id: 'av_algebra', name: 'Algebra', type: 'avatar', cost: 900, value: '🅰️', icon: '🅰️', description: 'Der Klassiker. Einfach A.', rarity: 'epic' },
  { id: 'av_neon', name: 'Cyber Spirit', type: 'avatar', cost: 1000, value: '⚡', icon: '⚡', description: 'Leuchte im Leaderboard.', rarity: 'epic' },
  { id: 'av_last_bus', name: 'Last Bus Home', type: 'avatar', cost: 1100, value: '🚌', icon: '🚌', description: 'Wenn die Mathe-Klausur zu lange ging.', rarity: 'epic' },
  { id: 'av_white_calc', name: 'White Calculator', type: 'avatar', cost: 1200, value: '⬜', icon: '⬜', description: 'Clean, minimalistisch, korrekt.', rarity: 'epic' },
  { id: 'av_edge_lord', name: 'Edge Lord', type: 'avatar', cost: 1500, value: '🥀', icon: '🥀', description: 'Mathe ist Schmerz.', rarity: 'epic' },

  // --- TIER 4: LEGENDARY / ULTRA (1501+ Coins) ---
  { id: 'av_night_tinker', name: 'Night Shift Tinkerer', type: 'avatar', cost: 1600, value: '🔦', icon: '🔦', description: 'Lernt, wenn andere schlafen.', rarity: 'legendary' },
  { id: 'av_spaeti', name: 'Späti-Besitzer', type: 'avatar', cost: 1800, value: '🏪', icon: '🏪', description: 'Der wahre Boss im Kiez. Kennt alle Zahlen.', rarity: 'legendary' },
  { id: 'av_chaos', name: 'Chaos Constant', type: 'avatar', cost: 2200, value: '🌀', icon: '🌀', description: 'Entropie ist mein zweiter Vorname.', rarity: 'legendary' },
  { id: 'av_diamond', name: 'Diamond Lord', type: 'avatar', cost: 2500, value: '💎', icon: '💎', description: 'Der ultimative Flex für Profis.', rarity: 'legendary' },
  { id: 'av_null', name: 'Nullpunkt', type: 'avatar', cost: 3000, value: '⭕', icon: '⭕', description: 'Alles beginnt und endet hier.', rarity: 'legendary' },
  { id: 'av_winkel', name: 'Winkeladvokat', type: 'avatar', cost: 3500, value: '⚖️', icon: '⚖️', description: 'Diskutiert jeden Grad aus.', rarity: 'legendary' },
  { id: 'av_meister_dreieck', name: 'Meister des Dreiecks', type: 'avatar', cost: 4500, value: '🔺', icon: '🔺', description: 'Illuminati confirmed.', rarity: 'legendary' },
  { id: 'av_chosen', name: 'The Chosen One', type: 'avatar', cost: 10000, value: '👁️', icon: '👁️', description: 'Du siehst die Matrix. Du bist MathMaster.', rarity: 'legendary' },

  // --- TASCHENRECHNER SKINS ---
  { id: 'calc_default', name: 'Standard Glass', type: 'calculator', cost: 0, value: 'default', icon: '🧮', description: 'Kristallklares Glas-Design mit eleganten Schatten. Zeitlos und professionell.', rarity: 'common' },
  { id: 'calc_neon', name: 'Neon Hacker', type: 'calculator', cost: 300, value: 'neon', icon: '📟', description: 'Matrix-grüne Cyber-Optik mit leuchtenden Rändern. Terminal-Feeling pur!', rarity: 'rare' },
  { id: 'calc_chaos', name: 'Chaos Mode', type: 'calculator', cost: 500, value: 'chaos', icon: '🤪', description: 'Wilde Rotation und lila-pink Farbverläufe. Macht Spaß beim Rechnen!', rarity: 'epic' },
  { id: 'calc_soup', name: 'Alphabet Soup', type: 'calculator', cost: 800, value: 'soup', icon: '🍲', description: 'Zahlen werden zu Buchstaben! Mathe-Rätsel im warmen Bernstein-Look.', rarity: 'legendary' },
  { id: 'calc_quantum', name: 'Quantum Matrix', type: 'calculator', cost: 1200, value: 'quantum', icon: '⚛️', description: 'Holographische UI mit Teilchen-Effekten. Rechnen in der vierten Dimension.', rarity: 'legendary' },

  // --- EFFEKTE ---
  { id: 'eff_rain', name: 'Matrix Rain', type: 'effect', cost: 250, value: 'rain', icon: '📟', description: 'Lass Zahlen auf dem Screen regnen.', rarity: 'rare' },
  { id: 'eff_storm', name: 'Electric Storm', type: 'effect', cost: 400, value: 'storm', icon: '🌩️', description: 'Deine Maus sprüht Funken und Blitze.', rarity: 'epic' },
  { id: 'eff_dark', name: 'Void Protocol', type: 'effect', cost: 500, value: 'dark', icon: '🌑', description: 'Schalte das Dark Theme permanent frei.', rarity: 'epic' },
  { id: 'eff_neon', name: 'Neon Dreams', type: 'effect', cost: 550, value: 'neon', icon: '🔮', description: 'Der Hintergrund pulsiert im Neon-Takt.', rarity: 'epic' },
  { id: 'eff_unicorn', name: 'Unicorn Magic', type: 'effect', cost: 600, value: 'unicorn', icon: '🦄', description: 'Echte Einhörner! Überall!', rarity: 'epic' },
  { id: 'eff_fire', name: 'Fire Blaze', type: 'effect', cost: 700, value: 'fire', icon: '🔥', description: 'Brennender Ehrgeiz visuell dargestellt.', rarity: 'legendary' },
  { id: 'eff_rainbow', name: 'Chroma Aura', type: 'effect', cost: 750, value: 'rainbow', icon: '🌈', description: 'Dein Avatar leuchtet in Regenbogenfarben.', rarity: 'epic' },
  { id: 'eff_galaxy', name: 'Galaxy Mode', type: 'effect', cost: 800, value: 'galaxy', icon: '🌌', description: 'Ein Sternenmeer für echte Entdecker.', rarity: 'legendary' },
  { id: 'eff_singularity', name: 'Singularity Engine', type: 'effect', cost: 2000, value: 'singularity', icon: '🕳️', description: 'Krümme die Raumzeit. Gott-Modus für deine UI.', rarity: 'legendary' },
  { id: 'eff_event_horizon', name: 'Event Horizon UI', type: 'effect', cost: 2500, value: 'eventHorizon', icon: '🛰️', description: 'Ultra-dunkler Fokusmodus mit Gravitations-Glow.', rarity: 'legendary' },
  { id: 'eff_quantum', name: 'Quantum Afterimage', type: 'effect', cost: 1800, value: 'quantum', icon: '⚛️', description: 'Probabilistische Verdopplung: UI-Elemente existieren mehrere Zustände gleichzeitig.', rarity: 'legendary' },

  // --- GUTSCHEINE ---
  { id: 'vc_10', name: '10€ Amazon Gutschein', type: 'voucher', cost: 2000, value: '10', icon: '💶', description: 'Ein echter Gutschein für deinen Fleiß.', rarity: 'legendary' },
  { id: 'vc_25', name: '25€ Amazon Gutschein', type: 'voucher', cost: 5000, value: '25', icon: '💰', description: 'Belohne dich selbst mit Shopping-Guthaben.', rarity: 'legendary' },
  { id: 'vc_50', name: '50€ Amazon Gutschein', type: 'voucher', cost: 10000, value: '50', icon: '💎', description: 'Der große Bonus für Mathe-Meister.', rarity: 'legendary' },
  { id: 'vc_100', name: '100€ Amazon Gutschein', type: 'voucher', cost: 20000, value: '100', icon: '👑', description: 'Die ultimative Belohnung. Du bist eine Legende!', rarity: 'legendary' },

  // --- PREISE ---
  { id: 'prize_smartphone', name: 'Xiaomi POCO M7 4G 128GB', type: 'prize', cost: 50000, value: 'smartphone', icon: '📱', description: 'Das ultimative Smartphone für echte Mathe-Meister. 4G, 128GB Speicher - perfekt für unterwegs!', rarity: 'legendary' }
];

export const GEOMETRY_DEFINITIONS: GeometryDefinition[] = [
  {
    id: 'shapes',
    groupId: 'A',
    title: 'Figuren & Haus der Vierecke',
    description: 'Hier lernst du, Vierecke nach ihren Eigenschaften zu ordnen. Alles beginnt beim allgemeinen Viereck.',
    formula: 'Winkelsumme = 360°',
    terms: [
      { term: 'Trapez', definition: 'Mindestens zwei parallele Seiten.', visual: 'M 20,80 L 180,80 L 140,20 L 60,20 Z' },
      { term: 'Parallelogramm', definition: 'Je zwei Seiten parallel und gleich lang.', visual: 'M 30,80 L 170,80 L 190,20 L 50,20 Z' },
      { term: 'Raute', definition: 'Ein Parallelogramm mit vier gleich langen Seiten (wie ein Drache).', visual: 'M 100,90 L 150,50 L 100,10 L 50,50 Z' },
      { term: 'Rechteck', definition: 'Ein Parallelogramm mit vier rechten Winkeln (90°).', visual: 'M 30,80 L 170,80 L 170,20 L 30,20 Z' },
      { term: 'Quadrat', definition: 'Die perfekte Form. Alle Seiten gleich lang UND alle Winkel 90°.', visual: 'M 60,80 L 140,80 L 140,20 L 60,20 Z' },
      { term: 'Drachenviereck', definition: 'Zwei Paare gleich langer Nachbarseiten. Eine Symmetrieachse.', visual: 'M 100,90 L 140,50 L 100,10 L 60,50 Z' }
    ],
    visual: 'shapes'
  },
  {
    id: 'angles',
    groupId: 'A',
    title: 'Winkel & Thaleskreis',
    description: 'Winkel an Geraden und der magische 90°-Kreis.',
    formula: 'Nebenwinkel = 180° | Thales = 90°',
    terms: [
      { term: 'Scheitelwinkel', definition: 'Liegen sich gegenüber und sind exakt gleich groß.', visual: 'M 20,80 L 180,20 M 20,20 L 180,80' },
      { term: 'Nebenwinkel', definition: 'Liegen nebeneinander auf einer Geraden. Summe = 180°.', visual: 'M 20,80 L 180,80 M 100,80 L 140,20' },
      { term: 'Satz des Thales', definition: 'Jeder Punkt auf einem Halbkreis bildet mit dem Durchmesser ein rechtwinkliges Dreieck.', visual: 'M 20,80 A 80,80 0 0,1 180,80 L 100,80 Z M 20,80 L 120,20 L 180,80' },
      { term: 'Innenwinkelsumme', definition: 'Im Dreieck immer 180°, im Viereck immer 360°.', visual: 'M 50,80 L 150,80 L 100,20 Z' },
      { term: 'Stufenwinkel', definition: 'Entstehen an parallelen Geraden und sind gleich groß.', visual: 'M 20,30 L 180,30 M 20,70 L 180,70 M 60,90 L 140,10' }
    ],
    visual: 'angles'
  },
  {
    id: 'areas',
    groupId: 'B',
    title: 'Flächen & Zerlegung',
    description: 'Wie man komplizierte Flächen einfach berechnet.',
    formula: 'A(Trapez) = (a + c) / 2 * h',
    terms: [
      { term: 'Parallelogramm', definition: 'A = Grundseite * Höhe (g * h).', visual: 'M 30,80 L 170,80 L 190,20 L 50,20 Z' },
      { term: 'Dreieck', definition: 'A = (g * h) / 2. Jedes Dreieck ist ein halbes Parallelogramm.', visual: 'M 30,80 L 170,80 L 100,20 Z' },
      { term: 'Trapez', definition: 'A = Mittelparallele (m) * Höhe. Wobei m = (a+c)/2 ist.', visual: 'M 20,80 L 180,80 L 140,20 L 60,20 Z' },
      { term: 'Zerlegung', definition: 'Teile wilde Formen in Rechtecke auf und addiere sie.', visual: 'M 20,20 H 80 V 80 H 20 Z M 80,50 H 140 V 80 H 80 Z' },
      { term: 'Ergänzung', definition: 'Rechne ein großes Rechteck minus die "Lücken".', visual: 'M 20,20 H 140 V 80 H 20 Z' }
    ],
    visual: 'shapes'
  },
  {
    id: 'volumes',
    groupId: 'B',
    title: 'Körper & Oberflächen',
    description: 'Vom flachen Blatt zum 3D-Körper.',
    formula: 'V = G * h | O = 2*G + M',
    terms: [
      { term: 'Prisma', definition: 'Ein Körper mit zwei identischen Vielecken als Deck- und Grundfläche.', visual: 'M 50,80 L 100,90 L 150,80 L 150,30 L 100,40 L 50,30 Z M 50,30 L 100,40 L 150,30' },
      { term: 'Zylinder', definition: 'Ein rundes Prisma. Grundfläche G = π * r².', visual: 'M 50,20 A 50,10 0 0,0 150,20 A 50,10 0 0,0 50,20 M 50,20 V 80 A 50,10 0 0,0 150,80 V 20' },
      { term: 'Mantelfläche', definition: 'Die äußere Wand. Beim Zylinder ist M = Umfang * Höhe (2*π*r*h).', visual: 'M 40,20 H 160 V 80 H 40 Z' },
      { term: 'Volumen', definition: 'Gibt an, wie viel Platz drinnen ist (Einheit: cm³, dm³, m³).', visual: 'M 40,40 H 100 V 100 H 40 Z M 40,40 L 60,20 H 120 V 80 L 100,100' },
      { term: 'Oberfläche', definition: 'Alles, was man anmalen kann. 2x Boden + 1x Mantel.', visual: 'M 20,50 H 80 V 80 H 20 Z M 100,50 A 20,20 0 1,0 140,50' }
    ],
    visual: 'pythagoras'
  },
  {
    id: 'transform',
    groupId: 'A',
    title: 'Ähnlichkeit & Streckung',
    description: 'Formen skalieren ohne sie zu verzerren.',
    formula: 'L_neu = k * L_alt',
    terms: [
      { term: 'Ähnlichkeit', definition: 'Figuren sind ähnlich, wenn ihre Winkel gleich sind (Form bleibt gleich).', visual: 'M 20,80 L 60,80 L 40,50 Z M 80,80 L 160,80 L 120,20 Z' },
      { term: 'Streckfaktor k', definition: 'k > 1 vergrößert, k < 1 verkleinert.', visual: 'M 20,50 H 60 M 80,50 H 160' },
      { term: 'Flächenfaktor', definition: 'Die Fläche ändert sich um k². (Bsp: k=2 -> 4x Fläche).', visual: 'M 20,20 H 40 V 40 H 20 Z M 60,20 H 100 V 60 H 60 Z' },
      { term: 'Volumenfaktor', definition: 'Das Volumen ändert sich um k³. (Bsp: k=2 -> 8x Volumen).', visual: 'M 20,40 H 40 V 60 H 20 Z M 20,40 L 30,30 H 50 V 50 L 40,60' },
      { term: 'Maßstab', definition: '1:100 bedeutet 1cm auf der Karte sind 100cm (1m) in echt.', visual: 'M 20,50 H 180 M 20,45 V 55 M 180,45 V 55' }
    ],
    visual: 'angles' // Using generic visual, but terms have specific SVGs
  },
  {
    id: 'context',
    groupId: 'C',
    title: 'Transfer & Modellierung',
    description: 'Mathe im echten Leben anwenden.',
    formula: 'V = G * h (Alltagstransfer)',
    terms: [
      { term: 'Umrechnung', definition: 'Wichtig! 1 Liter ist exakt 1 dm³.', visual: 'M 50,20 V 80 H 100 V 20 M 50,50 H 100' },
      { term: 'Flüssigkeiten', definition: 'Wenn du cm³ hast, teile durch 1000, um Liter zu bekommen.', visual: 'M 60,80 V 40 A 20,5 0 0,0 100,40 V 80 A 20,5 0 0,0 60,80' },
      { term: 'Sachaufgaben', definition: 'Lies genau! Wird nach dem Volumen (Inhalt) oder der Oberfläche (Material) gefragt?', visual: 'M 40,20 H 120 V 80 H 40 Z M 50,30 H 110 M 50,50 H 90' },
      { term: 'Rundung', definition: 'Im echten Leben rundet man oft auf zwei Nachkommastellen.', visual: 'M 50,50 H 100' },
      { term: 'Zusammengesetzte Körper', definition: 'Ein Haus ist oft ein Quader mit einem Prisma-Dach.', visual: 'M 40,50 H 100 V 90 H 40 Z M 40,50 L 70,20 L 100,50' }
    ],
    visual: 'pythagoras'
  }
];

export const LEARNING_UNITS: LearningUnit[] = [
  {
    id: 'u1', group: 'A', category: 'Basics', title: 'Figuren verstehen',
    description: 'Erkennen, beschreiben, ordnen.',
    detailedInfo: 'Werde zum Profi im Identifizieren von Vierecken. Verstehe, warum jedes Quadrat ein Rechteck ist, aber nicht jedes Rechteck ein Quadrat.',
    examples: ['Quadrat = Rechteck + Raute'],
    keywords: ['form', 'viereck', 'eigenschaft', 'klassifikation', 'viereckshaus'],
    difficulty: 'Einfach', coinsReward: 50, bounty: 150,
    definitionId: 'shapes',
    tasks: []
  },
  {
    id: 'u2', group: 'A', category: 'Basics', title: 'Winkel & Beziehungen',
    description: 'Winkel sicher lesen & begründen.',
    detailedInfo: 'Lerne die Geheimsprache der Geradenkreuzungen. Nutze den Thaleskreis, um perfekte rechte Winkel zu finden.',
    examples: ['Nebenwinkel = 180°', 'Thales: γ = 90°'],
    keywords: ['winkel', 'thales', 'nebenwinkel', 'grad', 'kreis'],
    difficulty: 'Mittel', coinsReward: 60, bounty: 200,
    definitionId: 'angles',
    tasks: []
  },
  {
    id: 'u3', group: 'B', category: 'Berechnung', title: 'Flächen & Terme',
    description: 'Flächen sehen statt nur rechnen.',
    detailedInfo: 'Trapeze und Parallelogramme lauern überall. Lerne, wie man sie mit einfachen Formeln bändigt.',
    examples: ['A(Trapez) = m * h'],
    keywords: ['fläche', 'trapez', 'zerlegung', 'cm2'],
    difficulty: 'Mittel', coinsReward: 80, bounty: 250,
    definitionId: 'areas',
    tasks: []
  },
  {
    id: 'u4', group: 'B', category: 'Berechnung', title: 'Körper & Oberflächen',
    description: '3D-Denken & Volumina.',
    detailedInfo: 'Stell dir vor, du baust eine Dose. Wie viel Blech brauchst du? Wie viel Limo passt rein? Hier erfährst du es.',
    examples: ['V = G * h', 'M = u * h'],
    keywords: ['volumen', 'zylinder', 'prisma', 'oberfläche', '3d'],
    difficulty: 'Schwer', coinsReward: 100, bounty: 350,
    definitionId: 'volumes',
    tasks: []
  },
  {
    id: 'u5', group: 'A', category: 'Transformation', title: 'Ähnlichkeit & Skalierung',
    description: 'Vergrößern, Verkleinern & Maßstäbe.',
    detailedInfo: 'Entdecke die Macht des Streckfaktors k. Wenn du eine Pizza doppelt so breit machst, hast du viermal so viel Belag! Lerne, warum das so ist.',
    examples: ['Länge * k', 'Fläche * k²'],
    keywords: ['ähnlichkeit', 'streckung', 'maßstab', 'faktor', 'verhältnis'],
    difficulty: 'Mittel', coinsReward: 70, bounty: 300,
    definitionId: 'transform',
    tasks: []
  },
  {
    id: 'u6', group: 'C', category: 'Modellierung', title: 'Alltags-Geometrie',
    description: 'Mathe für echte Probleme.',
    detailedInfo: 'Hausbau, Poolbefüllung oder Zeltlager – hier zeigst du, dass du Geometrie im Griff hast.',
    examples: ['Verschnitt berechnen', 'Füllmengen'],
    keywords: ['sachaufgabe', 'transfer', 'modell', 'alltag'],
    difficulty: 'Schwer', coinsReward: 120, bounty: 500,
    definitionId: 'context',
    tasks: []
  }
];
