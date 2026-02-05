# 🔐 Auth System Update - LocalStorage-basiert

## Was wurde geändert?

Das alte Backend-basierte Auth-System wurde durch ein **einfaches LocalStorage-basiertes System** ersetzt.

### Vorher (Backend-Auth):
- ❌ Benötigte Server/Backend
- ❌ Login-Seite mit Passwort
- ❌ AWS Cognito Integration
- ❌ Komplexe Session-Verwaltung
- ❌ Redirect zu login.html

### Jetzt (LocalStorage-Auth):
- ✅ Kein Server nötig
- ✅ Auto-Login beim ersten Besuch
- ✅ Einfache User-Verwaltung
- ✅ Name direkt im Profil änderbar
- ✅ Direkt einsatzbereit

## 🚀 Wie funktioniert es?

### Auto-Login
Beim ersten Öffnen von `index.html`:
1. Ein Standard-User wird automatisch erstellt
2. Name: "Lernender"
3. Nach 1 Sekunde: Welcome-Dialog erscheint
4. User kann seinen Namen eingeben
5. Fertig! 🎉

### User-Daten speichern
Alles wird in **LocalStorage** gespeichert:
- `cogyn_user` - Auth-Daten (Name, Email, ID)
- `edurank_user` - Gamification-Daten (Level, XP, Coins, etc.)

### Name ändern
Zwei Möglichkeiten:
1. **Im Profil:** Gehe zu "Profil" → Ändere den Namen → Wird automatisch gespeichert
2. **Via Console:**
   ```javascript
   authService.updateUserName("Dein Name")
   ```

## 📁 Neue Dateien

### `auth-simple.js`
Enthält die `AuthService` Klasse:
- `getCurrentUser()` - Holt aktuellen User
- `updateUserName(name)` - Ändert User-Namen
- `updateUserEmail(email)` - Ändert User-Email
- `showWelcomeDialog()` - Zeigt Welcome-Dialog
- `logout(clearAllData)` - Logout (optional: alle Daten löschen)
- `resetUser()` - User zurücksetzen (behält Gamification)

### Geänderte Dateien
- `index.html` - Auth-Check vereinfacht, kein Redirect mehr
- `js/storage.js` - Synchronisiert User-Namen mit Auth-System

### Entfernte Dateien
- ~~`auth/auth-service.js`~~ (Backend-Auth)
- ~~`auth/auth-mock.js`~~ (Mock-Auth)
- ~~`config/aws-config.js`~~ (AWS Config)
- ~~`data/db-service.js`~~ (Database Service)
- ~~`data/dynamodb-adapter.js`~~ (DynamoDB)

## 🎮 User Experience

### Erster Besuch

```
1. User öffnet index.html
2. Auto-Login erfolgt automatisch
3. App wird geladen mit Default-Namen "Lernender"
4. Nach 1 Sekunde: Welcome-Dialog

   ┌─────────────────────────────────────┐
   │ 👋 Willkommen bei Cogyn!           │
   │                                     │
   │ Wie möchtest du genannt werden?    │
   │                                     │
   │ [Lernender____________]             │
   │                                     │
   │        [OK]    [Abbrechen]         │
   └─────────────────────────────────────┘

5. User gibt Namen ein (oder überspringt)
6. App ist bereit! 🎉
```

### Nächster Besuch

```
1. User öffnet index.html
2. Auto-Login mit gespeichertem Namen
3. KEIN Welcome-Dialog (nur beim ersten Mal)
4. App lädt direkt
5. Gamification-Daten sind gespeichert
```

## 🔧 Entwickler-Funktionen

### Console Commands

```javascript
// Auth Service prüfen
window.authService

// Aktuellen User anzeigen
authService.getCurrentUser()

// User-Daten
{
  "id": "user_1738159200000_abc123",
  "name": "Max Mustermann",
  "email": "",
  "createdAt": "2026-01-29T10:00:00.000Z",
  "lastLogin": "2026-01-29T11:30:00.000Z",
  "isAuthenticated": true
}

// Namen ändern
authService.updateUserName("Neuer Name")

// Email hinzufügen
authService.updateUserEmail("test@example.com")

// User zurücksetzen (behält Gamification)
authService.resetUser()

// Komplett ausloggen (löscht ALLES)
authService.logout(true)

// Welcome-Dialog nochmal zeigen
localStorage.removeItem('cogyn_welcome_seen')
authService.showWelcomeDialog()
```

### LocalStorage prüfen

```javascript
// Auth-Daten
localStorage.getItem('cogyn_user')

// Gamification-Daten
localStorage.getItem('edurank_user')

// Welcome-Status
localStorage.getItem('cogyn_welcome_seen')

// Alles löschen (Neustart)
localStorage.clear()
```

## 🎯 Integration mit Gamification

Das Auth-System ist **vollständig integriert** mit dem Gamification-System:

### Name-Synchronisation

**Auth → Gamification:**
```javascript
// Wenn User seinen Namen im Profil ändert:
authService.updateUserName("Max")
  ↓
// Wird auch in Gamification aktualisiert:
gamificationUser.name = "Max"
  ↓
// Sidebar zeigt neuen Namen
// Profile zeigt neuen Namen
// Level Badge Initialen werden aktualisiert
```

**Gamification → Auth:**
```javascript
// Beim Initialisieren von Gamification-Daten:
initializeUserData()
  ↓
// Holt Namen vom Auth-System:
const userName = window.currentUser.name || "Lernender"
  ↓
// Gamification User wird mit Auth-Namen erstellt
```

## 📱 User Interface

### Sidebar (oben rechts)
```
┌─────────────────┐
│ [MX] Max        │  ← Initialen + Name
│      Level 5    │  ← Aus Gamification
└─────────────────┘
```

### Profil-Seite
```
┌────────────────────────────────────┐
│ [  5  ]  Max Mustermann            │  ← Level + Name
│          ⭐ Level 5 • 🪙 125 Coins │
└────────────────────────────────────┘

Grundinformationen
Name:    [Max Mustermann_____]  ← Editierbar!
E-Mail:  [max@example.com____]  ← Editierbar!
```

## 🚨 Wichtige Hinweise

### Logout-Warnung
```javascript
// Logout löscht ALLES (Auth + Gamification)!
authService.logout(true)

// User wird gewarnt:
⚠️ Möchtest du dich abmelden?

Dies wird ALLE deine Daten löschen
(inkl. Gamification-Fortschritt)!

[Abbrechen]  [OK]
```

### Daten-Export (empfohlen)
Nutze die Test-Seite für Backup:
```
test-gamification.html
  → "Export Data" Button
  → Speichert cogyn-gamification-backup.json
```

## 🔄 Migration von altem System

Falls du vorher das Backend-System genutzt hast:

### 1. Alte Daten löschen
```javascript
// Console:
localStorage.removeItem('cogyn_session')
localStorage.removeItem('cogyn_token')
localStorage.clear()
```

### 2. Seite neu laden
```javascript
location.reload()
```

### 3. Neuer Auto-Login
- Welcome-Dialog erscheint
- Neuer User wird erstellt
- Gamification startet bei Level 1

## 🎨 Anpassungen möglich

### Welcome-Dialog deaktivieren
```javascript
// In auth-simple.js, Zeile ~120, auskommentieren:
// authService.showWelcomeDialog();
```

### Standard-Namen ändern
```javascript
// In auth-simple.js, Zeile ~18:
name: 'Dein Wunschname',  // statt 'Lernender'
```

### Auto-Email setzen
```javascript
// In auth-simple.js, Zeile ~19:
email: 'default@example.com',  // statt ''
```

## ✅ Vorteile

1. **Sofort einsatzbereit** - Kein Setup nötig
2. **Offline-fähig** - Funktioniert ohne Internet (außer AI-Calls)
3. **Keine Anmeldung** - Direkt loslegen
4. **Datenschutz** - Alle Daten bleiben lokal
5. **Einfach** - Keine komplexe Auth-Logik
6. **Flexibel** - Name/Email jederzeit änderbar

## ❌ Limitierungen

1. **Keine Sync** - Daten bleiben auf diesem Gerät
2. **Keine Multi-User** - Ein User pro Browser
3. **Keine Passwörter** - Jeder mit Zugriff auf Browser kann Daten sehen
4. **LocalStorage Limit** - Max ~5-10 MB Speicher

## 🚀 Next Steps

Falls du später ein Backend willst:
1. `auth-simple.js` durch Backend-Auth ersetzen
2. `js/storage.js` auf API-Calls umstellen
3. User-Sync implementieren
4. Multi-Device Support

Aber für den Anfang: **LocalStorage ist perfekt!** 🎉

## 🆘 Troubleshooting

### "Welcome-Dialog erscheint immer wieder"
```javascript
// Setze Flag manuell:
localStorage.setItem('cogyn_welcome_seen', 'true')
```

### "Name ändert sich nicht im Profil"
```javascript
// Hard refresh:
Ctrl + Shift + R  (Windows/Linux)
Cmd + Shift + R   (Mac)
```

### "Alle Daten weg nach Logout"
Das ist beabsichtigt! Logout löscht alles.

**Lösung:** Nutze Export-Funktion vorher!

### "LocalStorage voll"
```javascript
// Alte Tasks löschen:
localStorage.removeItem('edurank_tasks')
```

---

**Status:** ✅ Auth System Updated & Ready
**Version:** 2.0.0 (Simple Auth)
**Date:** 2026-01-29
