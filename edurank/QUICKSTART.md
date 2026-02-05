# 🚀 EduRank Quick Start Guide

## Schritt 1: Anwendung öffnen

**Option A: Direkt im Browser**
1. Navigiere zum Ordner `edurank`
2. Doppelklick auf `index.html`
3. Die App öffnet sich im Standard-Browser

**Option B: Mit lokalem Server (empfohlen)**
```bash
# Im edurank-Ordner:
python -m http.server 8000
# Dann öffne: http://localhost:8000
```

## Schritt 2: Login

1. Öffne `index.html`
2. Gib beliebige E-Mail und Passwort ein (Mock-Auth)
   - Beispiel: `demo@edurank.com` / `password`
3. Klicke "Anmelden"

## Schritt 3: Erste Aufgabe erstellen

1. Klicke "Neue Aufgabe hochladen" im Dashboard
2. Fülle das Formular aus:
   - **Fach:** z.B. Mathematik
   - **Thema:** z.B. "Algebra"
   - **Aufgabenstellung:** "Löse die Gleichung: 2x + 5 = 15"
   - **Lösung:** "x = 5"
   - **Schwierigkeit:** Wähle 3 (oder beliebig)
3. Klicke "Aufgabe erstellen"

## Schritt 4: Aufgabe lösen

1. Gehe zu "Aufgaben" im Menü
2. Klicke auf deine erstellte Aufgabe
3. Gib die Antwort ein: "x = 5"
4. Klicke "Antwort einreichen"
5. 🎉 Erhalte XP, Coins und Streak-Bonus!

## Schritt 5: Dashboard erkunden

Zurück zum Dashboard siehst du nun:
- ✅ Level-Fortschritt
- 🔥 Aktuelle Streak
- 🪙 Gesammelte Coins
- 📚 Fächer-Meisterschaft

## Weitere Features testen

### Mehrere Aufgaben
- Erstelle Aufgaben in verschiedenen Fächern
- Teste verschiedene Schwierigkeitsgrade
- Verwende **Fett** und *Kursiv* Formatierung

### Filter nutzen
- Gehe zu "Aufgaben"
- Filtere nach Fach, Status oder Schwierigkeit
- Nutze die Suchfunktion

### Profil ansehen
- Klicke auf "Profil" im Menü
- Sieh deine detaillierten Stats
- Prüfe deine Fächer-Meisterschaft

### Mobile ansehen
- Öffne Browser DevTools (F12)
- Wechsle zu Mobile-Ansicht
- Teste Bottom Navigation

## Tipps & Tricks

### XP maximieren
- Löse täglich Aufgaben für Streak-Bonus (bis 2x)
- Höhere Schwierigkeit = mehr XP
- Formel: `XP = difficulty × 10 × (1 + streak × 0.1)`

### Markdown-Formatierung
```
**Fettgedruckter Text**
*Kursiver Text*
```

### Browser Console
Öffne Browser Console (F12) für Debugging:
```javascript
getUserData()        // Deine User-Daten
getAllTasks()        // Alle Aufgaben
addXP(100)          // Test: 100 XP hinzufügen
clearAllData()      // Alle Daten zurücksetzen
```

### Daten zurücksetzen
- Gehe zu "Profil"
- Klicke "Daten zurücksetzen"
- Bestätige die Aktion
- Oder lösche LocalStorage im Browser

## Häufige Probleme

### Seite lädt nicht
- Prüfe, ob alle Dateien im `edurank`-Ordner sind
- Versuche lokalen Server (siehe Option B oben)
- Prüfe Browser Console auf Fehler

### Daten gehen verloren
- EduRank nutzt LocalStorage
- Daten bleiben nur im gleichen Browser
- Lösche nicht Browser-Daten/Cookies

### Navigation funktioniert nicht
- Prüfe, ob JavaScript aktiviert ist
- Aktualisiere die Seite (Ctrl+R / Cmd+R)

## Next Steps

Nach dem Testen von Phase 1:
1. ✅ Feedback geben
2. 🎨 UI/UX Verbesserungen vorschlagen
3. 🚀 Phase 2 Features aktivieren
4. 🔧 Backend-Migration planen

## Support

Bei Fragen oder Problemen:
- Prüfe `README.md` für Details
- Öffne Browser Console für Debugging
- Prüfe LocalStorage im Browser DevTools

---

**Viel Spaß beim Lernen und Leveln! 🎓**
