# ✅ Auth-System Test Checkliste

## Vor dem Test

1. **Browser Cache leeren** (empfohlen für sauberen Test)
   - Chrome: Ctrl+Shift+Delete → "Cached images and files" → Clear
   - Oder: Inkognito-Fenster öffnen

2. **LocalStorage leeren** (falls vorhanden)
   ```javascript
   localStorage.clear()
   ```

## Test 1: Erster Besuch ⭐

### Schritte:
1. Öffne `index.html` im Browser
2. Warte 1-2 Sekunden

### Erwartetes Verhalten:
- ✅ App lädt ohne Redirect zu login.html
- ✅ Sidebar zeigt Level Badge (Level 1)
- ✅ Nach ~1 Sekunde: Welcome-Dialog erscheint
  ```
  👋 Willkommen bei Cogyn!
  Wie möchtest du genannt werden?
  [Lernender_______]
  ```
- ✅ Standard-Name "Lernender" ist vorausgefüllt

### Test-Varianten:
**A) Name eingeben:**
1. Gib deinen Namen ein (z.B. "Max")
2. Klicke OK
3. Prüfe: Sidebar zeigt "Max"
4. Prüfe: Initialen zeigen "M"

**B) Abbrechen:**
1. Klicke Abbrechen
2. Prüfe: Name bleibt "Lernender"
3. Sidebar zeigt "L" als Initialen

### Console Check:
```javascript
// User sollte existieren
authService.getCurrentUser()
// Output:
{
  id: "user_...",
  name: "Max" (oder "Lernender"),
  email: "",
  isAuthenticated: true
}
```

## Test 2: Zweiter Besuch 🔄

### Schritte:
1. Schließe Browser-Tab
2. Öffne `index.html` erneut

### Erwartetes Verhalten:
- ✅ App lädt direkt
- ✅ KEIN Welcome-Dialog (nur beim ersten Mal)
- ✅ Gespeicherter Name wird angezeigt
- ✅ Gamification-Daten erhalten (Level, XP, Coins)

### Console Check:
```javascript
// Gleicher User wie vorher
authService.getCurrentUser()

// Welcome wurde gesehen
localStorage.getItem('cogyn_welcome_seen')  // "true"
```

## Test 3: Profil-Update 👤

### Schritte:
1. Klicke auf "Profil" in Navigation
2. Finde "Grundinformationen"
3. Ändere Namen (z.B. "Max Mustermann")
4. Klicke außerhalb des Feldes (blur)

### Erwartetes Verhalten:
- ✅ Name wird gespeichert
- ✅ Sidebar zeigt neuen Namen
- ✅ Profile Header zeigt neuen Namen
- ✅ Initialen werden aktualisiert ("MM")

### Console Check:
```javascript
authService.getCurrentUser().name
// "Max Mustermann"

// Gamification User auch aktualisiert
getUserData().name
// "Max Mustermann"
```

### Email Test:
1. Füge Email hinzu (z.B. "max@example.com")
2. Klicke außerhalb
3. Prüfe Console:
   ```javascript
   authService.getCurrentUser().email
   // "max@example.com"
   ```

## Test 4: Gamification Integration 🎮

### Schritte:
1. Complete eine Task (z.B. "Aufgabe Erklären")
2. Gib eine Frage ein
3. Warte auf Antwort

### Erwartetes Verhalten:
- ✅ Reward Notification erscheint
- ✅ XP wird addiert
- ✅ Sidebar zeigt neue Stats
- ✅ User-Name bleibt konsistent

### Console Check:
```javascript
// Auth User
authService.getCurrentUser().name

// Gamification User
getUserData().name

// Sollten identisch sein!
```

## Test 5: Data Persistence 💾

### Schritte:
1. Complete mehrere Tasks (sammle XP/Coins)
2. Ändere deinen Namen im Profil
3. **Browser komplett schließen** (alle Tabs)
4. Browser neu starten
5. Öffne `index.html`

### Erwartetes Verhalten:
- ✅ Kein Welcome-Dialog
- ✅ Gespeicherter Name angezeigt
- ✅ Alle Gamification-Daten erhalten
- ✅ Level, XP, Coins wie vorher
- ✅ Streak Counter korrekt

### Console Check:
```javascript
// Alle Daten sollten da sein
localStorage.getItem('cogyn_user')
localStorage.getItem('edurank_user')
localStorage.getItem('cogyn_welcome_seen')
```

## Test 6: Logout 🚪

### Schritte:
1. Finde Logout-Button (falls vorhanden)
2. Klicke Logout
3. Bestätige Warnung

### Erwartetes Verhalten:
- ✅ Warnung erscheint:
  ```
  ⚠️ Möchtest du dich abmelden?
  Dies wird ALLE deine Daten löschen!
  ```
- ✅ Nach Bestätigung: Page reload
- ✅ Welcome-Dialog erscheint wieder
- ✅ Gamification reset (Level 1)
- ✅ Neuer User erstellt

### Console Check:
```javascript
// Neue User ID
authService.getCurrentUser().id  // Anders als vorher

// Gamification reset
getUserData().level  // 1
getUserData().xp     // 0
```

## Test 7: Welcome-Dialog Wiederholen 🔁

### Schritte:
1. Console öffnen
2. Führe aus:
   ```javascript
   localStorage.removeItem('cogyn_welcome_seen')
   location.reload()
   ```

### Erwartetes Verhalten:
- ✅ Page lädt neu
- ✅ Welcome-Dialog erscheint wieder
- ✅ Aktueller Name ist vorausgefüllt
- ✅ Nach OK: Name bleibt unverändert

## Test 8: Test-Seite 🧪

### Schritte:
1. Öffne `test-gamification.html`
2. Prüfe "Aktuelle Stats"

### Erwartetes Verhalten:
- ✅ Stats werden angezeigt
- ✅ Level, XP, Coins, Streak
- ✅ Gleiche Werte wie in `index.html`
- ✅ Refresh Button funktioniert

### Test verschiedene Funktionen:
- ✅ "Theory Analysis" → Rewards
- ✅ "+500 XP" → Level Progress
- ✅ "Show LocalStorage" → Daten anzeigen
- ✅ "Export Data" → JSON Download

## Test 9: Mobile Ansicht 📱

### Schritte:
1. Chrome DevTools (F12)
2. Toggle Device Toolbar (Ctrl+Shift+M)
3. Wähle iPhone/iPad

### Erwartetes Verhalten:
- ✅ Sidebar klappt aus (Hamburger Menu)
- ✅ Welcome-Dialog responsive
- ✅ Gamification Widgets sichtbar
- ✅ Profile editierbar

## Test 10: Console Commands 💻

### Test alle Befehle:
```javascript
// 1. User anzeigen
authService.getCurrentUser()
✅ Gibt User-Object zurück

// 2. Namen ändern
authService.updateUserName("Test User")
✅ Name aktualisiert

// 3. Email ändern
authService.updateUserEmail("test@test.com")
✅ Email aktualisiert

// 4. User reset (behält Gamification)
authService.resetUser()
✅ Auth-User neu, Gamification bleibt

// 5. Gamification-Daten
getUserData()
✅ Gibt Gamification-Object zurück

// 6. UI aktualisieren
updateGamificationUI()
✅ Sidebar/Dashboard/Profile refresh
```

## Fehlersuche 🔍

### Problem: Welcome-Dialog erscheint nicht
**Lösung:**
```javascript
// Check Flag
localStorage.getItem('cogyn_welcome_seen')
// Falls "true" → Remove:
localStorage.removeItem('cogyn_welcome_seen')
location.reload()
```

### Problem: Name ändert sich nicht
**Lösung:**
```javascript
// Hard Refresh
Ctrl + Shift + R

// Oder manuel update:
authService.updateUserName("Dein Name")
updateGamificationUI()
```

### Problem: "AuthService not defined"
**Lösung:**
1. Prüfe ob `auth-simple.js` geladen wurde
2. Check Console für Errors
3. Hard Refresh (Ctrl+Shift+R)

### Problem: LocalStorage voll
**Lösung:**
```javascript
// Alte Tasks löschen
localStorage.removeItem('edurank_tasks')

// Oder alles neu:
localStorage.clear()
location.reload()
```

## Success Criteria ✅

Alle Tests bestanden wenn:
- [x] Erster Besuch: Welcome-Dialog erscheint
- [x] Zweiter Besuch: Kein Welcome-Dialog
- [x] Name ändern: Funktioniert im Profil
- [x] Gamification: Name synchronisiert
- [x] Persistence: Daten bleiben erhalten
- [x] Logout: Warnung + kompletter Reset
- [x] Test-Seite: Alle Funktionen OK
- [x] Mobile: Responsive
- [x] Console: Alle Commands funktionieren

## 🎉 Fertig!

Wenn alle Tests ✅ sind:
- **Auth-System funktioniert perfekt!**
- **Keine Login-Seite mehr nötig!**
- **Einfach und benutzerfreundlich!**

---

**Test durchgeführt am:** _________
**Browser:** _________
**Ergebnis:** ☐ Bestanden  ☐ Fehler gefunden
**Notizen:**
