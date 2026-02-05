# EduRank - Gamified Learning Platform

Eine innovative Gamification-Plattform für Bildungsinhalte mit XP-System, Levels, Streaks und Brain Coins.

## 🚀 Quick Start

1. **Öffne die Anwendung:**
   - Öffne `index.html` in einem modernen Webbrowser
   - Oder starte einen lokalen Server:
     ```bash
     # Python 3
     python -m http.server 8000

     # Node.js (mit npx)
     npx serve
     ```

2. **Login:**
   - Beliebige E-Mail und Passwort eingeben (Mock-Auth)
   - Empfohlen: `demo@edurank.com` / `demo123`

3. **Erste Schritte:**
   - Dashboard ansehen
   - Erste Aufgabe hochladen
   - Aufgabe lösen und XP sammeln!

## 📁 Projektstruktur

```
edurank/
├── index.html              # Landing/Login-Seite
├── dashboard.html          # Haupt-Dashboard
├── tasks.html              # Aufgabenliste
├── task-upload.html        # Aufgabe hochladen
├── task-solve.html         # Aufgabe lösen
├── profile.html            # Benutzerprofil
├── leaderboard.html        # Rangliste (Preview)
├── css/
│   ├── main.css           # Haupt-Styles (Dark Theme)
│   └── components.css     # Wiederverwendbare Komponenten
├── js/
│   ├── config.js          # Konfiguration (XP-Kurven, Fächer)
│   ├── storage.js         # LocalStorage Helper
│   ├── auth.js            # Mock Authentication
│   ├── gamification.js    # XP, Level, Coins Logik
│   ├── tasks.js           # Task Management
│   └── app.js             # Haupt-App-Logik
└── assets/
    ├── images/
    └── sounds/
```

## ✨ Features (Phase 1)

### Gamification-System
- **XP & Levels:** Sammle Erfahrungspunkte und steige auf (bis Level 100)
- **Brain Coins:** Verdiene Coins für gelöste Aufgaben
- **Streak-System:** Halte deine tägliche Lernstreak am Leben (bis 2x Bonus)
- **Subject Mastery:** Spezialisiere dich in einzelnen Fächern

### Aufgaben-System
- **Task Upload:** Erstelle eigene Aufgaben mit Markdown-Formatierung
- **Difficulty-System:** 1-10 Sterne (automatische Schätzung oder manuell)
- **8 Fächer:** Mathematik, Deutsch, Englisch, Biologie, Chemie, Physik, Geschichte, Informatik
- **Answer Validation:** Automatische Überprüfung der Antworten
- **Filter & Suche:** Finde Aufgaben nach Fach, Status, Schwierigkeit

### UI/UX
- **Dark Theme:** Modernes, augenfreundliches Design
- **Responsive:** Mobile-First Design mit Bottom Navigation
- **Animations:** Level-Up Overlays, Reward Notifications
- **Toast Messages:** Feedback für Benutzeraktionen

## 🎮 Gamification-Details

### XP-Berechnung
```javascript
baseXP = difficulty × 10
streakBonus = min(streak × 0.1, 2.0)  // Max 2x Multiplier
finalXP = baseXP × (1 + streakBonus)
```

### Coins-Berechnung
```javascript
coins = 5 + (difficulty × 2)
```

### Level-Kurve
- Level 1 → 2: 100 XP
- Level 2 → 3: 250 XP
- Level 3 → 4: 500 XP
- Level 4 → 5: 1000 XP
- Exponentielle Steigerung bis Level 100

### Subject Mastery
- Separate Level für jedes Fach
- Level-Up alle 500 XP
- Tracked: Level, XP, gelöste Aufgaben

## 🛠️ Tech Stack

- **Frontend:** Pure HTML5, CSS3, Vanilla JavaScript
- **Styling:** Tailwind CSS (via CDN)
- **Icons:** Font Awesome 6.4.0 (via CDN)
- **Storage:** LocalStorage für alle Daten
- **Architecture:** Multi-Page Application

## 📊 LocalStorage Schema

### User Data
```javascript
{
  id: 1,
  name: "Demo User",
  email: "demo@edurank.com",
  level: 1,
  xp: 0,
  coins: 0,
  eloRating: 1000,
  currentStreak: 0,
  longestStreak: 0,
  lastActivityDate: null,
  subjectMastery: {
    math: { level: 1, xp: 0, tasksCompleted: 0 }
  }
}
```

### Task Data
```javascript
{
  id: "task-1738144800-abc123",
  userId: 1,
  subjectId: 1,
  rawContent: "Aufgabentext",
  formattedContent: "<strong>Formatiert</strong>",
  solution: "Korrekte Antwort",
  topic: "Thema",
  difficulty: 5,
  status: "ready",
  xpReward: 50,
  attempts: 0,
  createdAt: "2026-01-29T10:00:00Z"
}
```

## 🎨 Farbschema (Dark Theme)

```css
--bg: #1e1e2e
--bg-secondary: #181825
--bg-tertiary: #11111b
--text: #cdd6f4
--text-secondary: #a6adc8
--primary: #6366f1 (Indigo)
--accent: #f59e0b (Amber)
--success: #22c55e (Green)
--error: #ef4444 (Red)
```

## 🔧 Konfiguration

Alle Game-Balance-Einstellungen in `js/config.js`:

```javascript
const CONFIG = {
  baseXPPerDifficulty: 10,
  baseCoinsPerTask: 5,
  coinsPerDifficulty: 2,
  maxStreakMultiplier: 2.0,
  streakBonusPerDay: 0.1,
  xpCurve: { /* ... */ },
  subjects: [ /* ... */ ]
}
```

## 🚧 Coming Soon (Phase 2+)

- [ ] Mock AI-Integration für Difficulty-Schätzung
- [ ] Leaderboard mit Mock-Users
- [ ] Time Attack Mode
- [ ] Ranked Duel (PvP)
- [ ] Achievement-System
- [ ] Theme-Toggle (Light/Dark)
- [ ] Sound-Effekte
- [ ] Partikel-Animationen
- [ ] Backend-Migration (Laravel/Node.js)
- [ ] Echte AI-Integration (OpenAI/Anthropic)

## 📝 Beispiel-Workflow

1. **Login** auf `index.html`
2. **Dashboard** ansehen - Deine Stats
3. **Upload** auf `task-upload.html`:
   - Fach: Mathematik
   - Aufgabe: "Löse die Gleichung: 2x + 5 = 15"
   - Lösung: "x = 5"
   - Schwierigkeit: 3
4. **Tasks** auf `tasks.html` - Aufgabe in Liste sehen
5. **Solve** auf `task-solve.html?id=...`:
   - Antwort eingeben: "x = 5"
   - Submit
   - Rewards erhalten: +30 XP, +11 Coins, Streak +1
6. **Profile** auf `profile.html` - Stats & Subject Mastery ansehen

## 🐛 Debugging

### Browser Console
```javascript
// User Data ansehen
getUserData()

// Alle Tasks ansehen
getAllTasks()

// XP hinzufügen (Test)
addXP(100)

// Coins hinzufügen (Test)
addCoins(50)

// Alle Daten zurücksetzen
clearAllData()
```

### LocalStorage Keys
- `edurank_user` - User-Daten
- `edurank_tasks` - Alle Tasks
- Session: `edurank_logged_in` - Login-Status

## 💡 Tipps

- **Markdown-Formatierung:** Verwende `**Fett**` und `*Kursiv*` in Aufgaben
- **Streak-Bonus:** Löse täglich Aufgaben für bis zu 2x XP
- **Subject Focus:** Spezialisiere dich auf 2-3 Fächer für schnellen Progress
- **Difficulty:** Höhere Schwierigkeit = mehr XP & Coins

## 📱 Browser-Kompatibilität

- Chrome/Edge: ✅ Vollständig unterstützt
- Firefox: ✅ Vollständig unterstützt
- Safari: ✅ Vollständig unterstützt
- Mobile Browsers: ✅ Responsive Design

## 🔒 Datenschutz

Alle Daten werden lokal im Browser gespeichert (LocalStorage). Keine Server-Kommunikation in Phase 1.

## 📄 Lizenz

Projekt für Bildungszwecke - Informatik Gamification Projekt

---

**Version:** 1.0.0 (Phase 1)
**Status:** ✅ Production Ready (Prototype)
**Last Updated:** 2026-01-29
