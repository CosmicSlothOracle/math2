# Integrationsanleitung: MUNDO-Geometrie-Aufgaben

**Erstellt:** 26.12.2025
**Ziel:** Integration der neuen Quest- und Bounty-Aufgaben basierend auf MUNDO-Inhalten

---

## Übersicht der erstellten Dateien

1. **GEOMETRIE_MUNDO_KLASSE_9_10.md** - Übersicht aller gefundenen MUNDO-Inhalte
2. **GEOMETRIE_QUESTS_UND_BOUNTIES_MUNDO.md** - Detaillierte Beschreibung aller neuen Aufgaben
3. **GEOMETRIE_BOUNTIES_CODE.ts** - TypeScript-Code für Bounty-Aufgaben
4. **GEOMETRIE_QUESTS_CODE.ts** - TypeScript-Code für Quest-Aufgaben (Standard)
5. **GEOMETRIE_INTEGRATION_ANLEITUNG.md** - Diese Datei

---

## Integration in bestehende Struktur

### Option 1: Erweiterung bestehender Units

#### Unit u2 (Winkel & Beziehungen) erweitern
```typescript
// In bountyCatalog.ts
import { KONGRUENZ_BOUNTIES } from './GEOMETRIE_BOUNTIES_CODE';

const BASE_BOUNTIES: Record<UnitId, Task[]> = {
  u2: [
    ...existing_u2_bounties,
    ...KONGRUENZ_BOUNTIES,
  ],
  // ...
};
```

```typescript
// In taskFactory.ts
import { createKongruenzQuest } from './GEOMETRIE_QUESTS_CODE';

generateTasks(unitId: string, count: number): Task[] {
  const pool = this.getTaskPool(unitId);

  if (unitId === 'u2') {
    // Neue Kongruenz-Aufgaben hinzufügen
    pool.push(...Array.from({length: 2}, (_, i) =>
      createKongruenzQuest(i, Date.now())
    ));
  }

  // ... restliche Logik
}
```

#### Unit u4 (Körper & Oberflächen) erweitern
```typescript
// In bountyCatalog.ts
import { KOERPER_BOUNTIES } from './GEOMETRIE_BOUNTIES_CODE';

const BASE_BOUNTIES: Record<UnitId, Task[]> = {
  u4: [
    ...existing_u4_bounties,
    ...KOERPER_BOUNTIES,
  ],
  // ...
};
```

```typescript
// In taskFactory.ts
import { createKoerperQuest } from './GEOMETRIE_QUESTS_CODE';

generateTasks(unitId: string, count: number): Task[] {
  // ...
  if (unitId === 'u4') {
    pool.push(...Array.from({length: 3}, (_, i) =>
      createKoerperQuest(i, Date.now())
    ));
  }
  // ...
}
```

#### Unit u5 (Ähnlichkeit & Maßstab) erweitern
```typescript
// In bountyCatalog.ts
import { STRAHLENSATZ_BOUNTIES } from './GEOMETRIE_BOUNTIES_CODE';

const BASE_BOUNTIES: Record<UnitId, Task[]> = {
  u5: [
    ...existing_u5_bounties,
    ...STRAHLENSATZ_BOUNTIES,
  ],
  // ...
};
```

```typescript
// In taskFactory.ts
import { createStrahlensatzQuest } from './GEOMETRIE_QUESTS_CODE';

generateTasks(unitId: string, count: number): Task[] {
  // ...
  if (unitId === 'u5') {
    pool.push(...Array.from({length: 2}, (_, i) =>
      createStrahlensatzQuest(i, Date.now())
    ));
  }
  // ...
}
```

#### Unit u6 (Kontext & Anwendung) erweitern
```typescript
// In bountyCatalog.ts
import { PYTHAGORAS_BOUNTIES } from './GEOMETRIE_BOUNTIES_CODE';

const BASE_BOUNTIES: Record<UnitId, Task[]> = {
  u6: [
    ...existing_u6_bounties,
    ...PYTHAGORAS_BOUNTIES,
  ],
  // ...
};
```

```typescript
// In taskFactory.ts
import { createPythagorasQuest } from './GEOMETRIE_QUESTS_CODE';

generateTasks(unitId: string, count: number): Task[] {
  // ...
  if (unitId === 'u6') {
    pool.push(...Array.from({length: 2}, (_, i) =>
      createPythagorasQuest(i, Date.now())
    ));
  }
  // ...
}
```

#### Unit u3 (Flächen & Terme) erweitern
```typescript
// In bountyCatalog.ts
import { VIELEcke_BOUNTIES } from './GEOMETRIE_BOUNTIES_CODE';

const BASE_BOUNTIES: Record<UnitId, Task[]> = {
  u3: [
    ...existing_u3_bounties,
    ...VIELEcke_BOUNTIES,
  ],
  // ...
};
```

```typescript
// In taskFactory.ts
import { createVieleckQuest } from './GEOMETRIE_QUESTS_CODE';

generateTasks(unitId: string, count: number): Task[] {
  // ...
  if (unitId === 'u3') {
    pool.push(...Array.from({length: 2}, (_, i) =>
      createVieleckQuest(i, Date.now())
    ));
  }
  // ...
}
```

---

### Option 2: Neue Units erstellen

#### Unit u7: Trigonometrie
```typescript
// In types.ts - UnitId erweitern
type UnitId = 'u1' | 'u2' | 'u3' | 'u4' | 'u5' | 'u6' | 'u7' | 'u8';

// In bountyCatalog.ts
import { TRIGONOMETRIE_BOUNTIES } from './GEOMETRIE_BOUNTIES_CODE';

const BASE_BOUNTIES: Record<UnitId, Task[]> = {
  // ... bestehende Units
  u7: TRIGONOMETRIE_BOUNTIES,
};

// In taskFactory.ts
import { createTrigonometrieQuest } from './GEOMETRIE_QUESTS_CODE';

getTaskPool(unitId: string): Task[] {
  // ... bestehende Pools
  if (unitId === 'u7') {
    return Array.from({length: 10}, (_, i) =>
      createTrigonometrieQuest(i, Date.now())
    );
  }
  // ...
}
```

#### Unit u8: 3D-Geometrie
```typescript
// In bountyCatalog.ts
import { DREID_BOUNTIES } from './GEOMETRIE_BOUNTIES_CODE';

const BASE_BOUNTIES: Record<UnitId, Task[]> = {
  // ... bestehende Units
  u8: DREID_BOUNTIES,
};

// In taskFactory.ts
import { createDreidQuest } from './GEOMETRIE_QUESTS_CODE';

getTaskPool(unitId: string): Task[] {
  // ... bestehende Pools
  if (unitId === 'u8') {
    return Array.from({length: 5}, (_, i) =>
      createDreidQuest(i, Date.now())
    );
  }
  // ...
}
```

---

## Konfiguration der neuen Units

### Unit u7: Trigonometrie
```typescript
// In constants.ts oder segments.ts
export const UNIT_CONFIG = {
  // ... bestehende Units
  u7: {
    id: 'u7',
    title: 'Trigonometrie',
    description: 'Sinus, Cosinus, Tangens am rechtwinkligen Dreieck und Einheitskreis',
    questReward: 120, // Coins
    bountyReward: 400, // Coins
    bountyEntryFee: 60, // 15% von 400, max 60
    difficulty: 'Mittel-Schwer',
  },
  u8: {
    id: 'u8',
    title: '3D-Geometrie',
    description: 'Koordinaten im Raum, Schnitte, erweiterte Körper',
    questReward: 100, // Coins
    bountyReward: 350, // Coins
    bountyEntryFee: 53, // 15% von 350
    difficulty: 'Mittel-Schwer',
  },
};
```

---

## Validator-Anpassungen

Die neuen Aufgaben verwenden bestehende Validator-Typen:
- `numeric`: Genaue Zahlenwerte
- `numericTolerance`: Zahlen mit Toleranz
- `keywords`: Textantworten mit Schlüsselwörtern

**Keine neuen Validator-Typen erforderlich!**

---

## Testing

### Unit-Tests für neue Aufgaben
```typescript
// In tests/geometrie-mundo.test.ts
import { TRIGONOMETRIE_BOUNTIES, PYTHAGORAS_BOUNTIES } from '../services/GEOMETRIE_BOUNTIES_CODE';
import { createTrigonometrieQuest, createPythagorasQuest } from '../services/GEOMETRIE_QUESTS_CODE';

describe('MUNDO Geometrie Aufgaben', () => {
  test('Trigonometrie Bounties haben korrekte Struktur', () => {
    TRIGONOMETRIE_BOUNTIES.forEach(bounty => {
      expect(bounty.id).toBeDefined();
      expect(bounty.type).toBe('input');
      expect(bounty.question).toBeDefined();
      expect(bounty.correctAnswer).toBeDefined();
      expect(bounty.explanation).toBeDefined();
    });
  });

  test('Trigonometrie Quest-Generator funktioniert', () => {
    const quest = createTrigonometrieQuest(0, 12345);
    expect(quest.id).toContain('u7-quest');
    expect(quest.type).toBeDefined();
    expect(quest.question).toBeDefined();
  });

  // Weitere Tests...
});
```

---

## Schritt-für-Schritt Integration

### Schritt 1: Dateien kopieren
1. `GEOMETRIE_BOUNTIES_CODE.ts` → `services/GEOMETRIE_BOUNTIES_CODE.ts`
2. `GEOMETRIE_QUESTS_CODE.ts` → `services/GEOMETRIE_QUESTS_CODE.ts`

### Schritt 2: Bounty-Aufgaben integrieren
1. Öffne `services/bountyCatalog.ts`
2. Importiere die neuen Bounty-Aufgaben:
   ```typescript
   import {
     TRIGONOMETRIE_BOUNTIES,
     PYTHAGORAS_BOUNTIES,
     KOERPER_BOUNTIES,
     STRAHLENSATZ_BOUNTIES,
     KONGRUENZ_BOUNTIES,
     VIELEcke_BOUNTIES,
     DREID_BOUNTIES,
   } from './GEOMETRIE_BOUNTIES_CODE';
   ```
3. Erweitere `BASE_BOUNTIES`:
   ```typescript
   const BASE_BOUNTIES: Record<UnitId, Task[]> = {
     // ... bestehende Units
     u2: [...existing_u2_bounties, ...KONGRUENZ_BOUNTIES],
     u3: [...existing_u3_bounties, ...VIELEcke_BOUNTIES],
     u4: [...existing_u4_bounties, ...KOERPER_BOUNTIES],
     u5: [...existing_u5_bounties, ...STRAHLENSATZ_BOUNTIES],
     u6: [...existing_u6_bounties, ...PYTHAGORAS_BOUNTIES],
     u7: TRIGONOMETRIE_BOUNTIES, // Neue Unit
     u8: DREID_BOUNTIES, // Neue Unit
   };
   ```

### Schritt 3: Quest-Aufgaben integrieren
1. Öffne `services/taskFactory.ts`
2. Importiere die Quest-Generatoren:
   ```typescript
   import {
     createTrigonometrieQuest,
     createPythagorasQuest,
     createKoerperQuest,
     createStrahlensatzQuest,
     createKongruenzQuest,
     createVieleckQuest,
     createDreidQuest,
   } from './GEOMETRIE_QUESTS_CODE';
   ```
3. Erweitere `getTaskPool()` oder `generateTasks()`:
   ```typescript
   getTaskPool(unitId: string): Task[] {
     const pool: Task[] = [];

     // ... bestehende Logik

     // Neue Quest-Aufgaben hinzufügen
     if (unitId === 'u2') {
       pool.push(...Array.from({length: 2}, (_, i) =>
         createKongruenzQuest(i, Date.now())
       ));
     }
     if (unitId === 'u3') {
       pool.push(...Array.from({length: 2}, (_, i) =>
         createVieleckQuest(i, Date.now())
       ));
     }
     if (unitId === 'u4') {
       pool.push(...Array.from({length: 3}, (_, i) =>
         createKoerperQuest(i, Date.now())
       ));
     }
     if (unitId === 'u5') {
       pool.push(...Array.from({length: 2}, (_, i) =>
         createStrahlensatzQuest(i, Date.now())
       ));
     }
     if (unitId === 'u6') {
       pool.push(...Array.from({length: 2}, (_, i) =>
         createPythagorasQuest(i, Date.now())
       ));
     }
     if (unitId === 'u7') {
       pool.push(...Array.from({length: 5}, (_, i) =>
         createTrigonometrieQuest(i, Date.now())
       ));
     }
     if (unitId === 'u8') {
       pool.push(...Array.from({length: 3}, (_, i) =>
         createDreidQuest(i, Date.now())
       ));
     }

     return pool;
   }
   ```

### Schritt 4: Unit-Konfiguration erweitern
1. Finde die Unit-Konfiguration (z.B. in `constants.ts` oder `segments.ts`)
2. Füge Konfiguration für u7 und u8 hinzu (siehe oben)

### Schritt 5: UI-Anpassungen (falls nötig)
1. Prüfe, ob neue Unit-IDs in der UI unterstützt werden müssen
2. Aktualisiere Unit-Listen/Dropdowns falls vorhanden

### Schritt 6: Testing
1. Führe `npm test` aus
2. Teste manuell im Browser:
   - Quest-Aufgaben werden korrekt angezeigt
   - Bounty-Aufgaben funktionieren
   - Validatoren akzeptieren richtige Antworten
   - Coin-Rewards werden korrekt vergeben

---

## Bekannte Einschränkungen

1. **Trigonometrie-Quest-Generator**: Die Sinus/Cosinus-Berechnung verwendet einfache Rundung. Für genauere Werte sollte `Math.round()` durch präzisere Rundung ersetzt werden.

2. **3D-Koordinaten**: Die Abstandsberechnung verwendet den euklidischen Abstand. Für komplexere 3D-Geometrie könnten zusätzliche Funktionen benötigt werden.

3. **Kegelstumpf-Berechnung**: Die Mantelflächenberechnung ist vereinfacht. Für exakte Werte sollte die vollständige Formel verwendet werden.

---

## Nächste Schritte

1. ✅ Code-Dateien erstellt
2. ⏳ Integration in bestehende Struktur
3. ⏳ Testing
4. ⏳ UI-Anpassungen (falls nötig)
5. ⏳ Dokumentation aktualisieren

---

## Support

Bei Fragen zur Integration:
1. Prüfe die bestehende Struktur in `bountyCatalog.ts` und `taskFactory.ts`
2. Vergleiche mit ähnlichen Aufgaben in den bestehenden Units
3. Teste Schritt für Schritt

---

**Viel Erfolg bei der Integration! 🚀**

