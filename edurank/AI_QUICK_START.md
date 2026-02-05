# 🚀 EduRank AI-Features - Quick Start Guide

## In 5 Minuten loslegen mit KI-gestütztem Lernen

---

## Schritt 1: API-Key einrichten (einmalig)

### API-Key erstellen

1. Gehe zu **[Anthropic Console](https://console.anthropic.com/settings/keys)**
2. Melde dich an oder erstelle einen Account
3. Klicke auf **"Create Key"**
4. Kopiere den generierten Key (beginnt mit `sk-ant-api03-...`)

### API-Key in EduRank speichern

1. Öffne **EduRank**
2. Navigiere zu **Profil** (Sidebar oder Bottom Nav)
3. Scrolle zu **"API Einstellungen"**
4. Füge den Key in das Eingabefeld ein
5. Klicke **"Speichern"**
6. ✅ Status sollte **"API Key gespeichert"** anzeigen

**Fertig!** Der Key bleibt lokal gespeichert und wird automatisch verwendet.

---

## Schritt 2: Erste Aufgaben hochladen

### Option A: Aus Bild (Arbeitsblatt, Buch, Tafel)

1. **Foto machen** oder Screenshot erstellen
   - Achte auf gute Beleuchtung
   - Halte die Kamera gerade
   - Text sollte scharf lesbar sein

2. Öffne **"Hochladen"** in EduRank

3. **Bild hochladen:**
   - **Drag & Drop:** Ziehe das Bild in die Upload-Area
   - **Oder:** Klicke "Datei auswählen" und wähle Bild aus

4. **Vorschau prüfen:**
   - Bild wird angezeigt
   - Prüfe ob alles lesbar ist

5. **KI analysieren:**
   - Klicke **"Mit KI analysieren"**
   - ⏳ Warte 10-30 Sekunden (je nach Bildgröße)

6. **Review der extrahierten Aufgaben:**
   - KI zeigt alle gefundenen Mathematik-Aufgaben
   - Jede Aufgabe enthält:
     - Aufgabenstellung (mit LaTeX)
     - Generierte Lösung
     - Schwierigkeit (1-10)
     - Thema (z.B. Algebra, Geometrie)
   - Prüfe ob alles korrekt extrahiert wurde

7. **Speichern:**
   - Klicke **"Alle Aufgaben speichern"**
   - Aufgaben erscheinen in der Liste ✅

### Option B: Aus Text (Copy-Paste)

1. Öffne **"Hochladen"**

2. Klicke Tab **"Text eingeben"**

3. **Aufgaben eingeben:**
   ```
   Löse die Gleichung: 2x + 5 = 15

   Berechne die Fläche eines Kreises mit Radius 5cm

   Vereinfache: (x + 3)(x - 2)
   ```

4. **KI analysieren:**
   - Klicke **"Mit KI analysieren"**
   - KI trennt und strukturiert die Aufgaben

5. **Review und Speichern** (wie bei Option A)

---

## Schritt 3: Aufgaben lösen mit KI-Feedback

1. **Aufgabe auswählen:**
   - Gehe zu **"Aufgaben"**
   - Wähle eine Aufgabe aus der Liste

2. **Aufgabe lesen:**
   - Mathematische Formeln werden automatisch schön dargestellt (LaTeX)
   - Beachte Schwierigkeit und XP-Reward

3. **Antwort eingeben:**
   - Gib deine Lösung in das Textfeld ein
   - Verschiedene Formen sind OK:
     - `x = 5` oder `5` oder `x=5`
     - `1/2` oder `0.5` oder `0,5`

4. **Antwort einreichen:**
   - Klicke **"Antwort einreichen"**
   - ⏳ KI prüft deine Antwort (2-5 Sekunden)

5. **Feedback erhalten:**

   **Bei korrekter Antwort:**
   - ✅ Bestätigung
   - 🎉 XP und Coins werden gutgeschrieben
   - 🔥 Streak wird erhöht
   - Weiterleitung zur Aufgabenliste

   **Bei falscher Antwort:**
   - ❌ Konstruktive Erklärung was falsch war
   - 💡 Hilfreicher Tipp für den nächsten Versuch
   - Möglichkeit es nochmal zu versuchen

---

## 📸 Screenshot-Tipps für beste Ergebnisse

### ✅ DO - Gute Bilder

- **Gute Beleuchtung:** Tageslicht oder helle Lampe
- **Scharfer Fokus:** Text muss klar lesbar sein
- **Gerade Ausrichtung:** Kamera parallel zum Papier
- **Ganzes Aufgabenblatt:** Alle relevanten Teile im Bild
- **Hoher Kontrast:** Dunkle Schrift auf hellem Hintergrund
- **Keine Schatten:** Gleichmäßige Ausleuchtung

### ❌ DON'T - Vermeide

- Unscharfe/verwackelte Bilder
- Zu dunkle oder überbelichtete Fotos
- Schräge Winkel oder Verzerrungen
- Reflektionen oder Glanzstellen
- Verschmierte oder unleserliche Handschrift
- Nur Teilausschnitte von Aufgaben

---

## 💡 Tipps & Tricks

### Aufgaben-Upload

1. **Mehrere Aufgaben:** Du kannst ein ganzes Arbeitsblatt mit 10+ Aufgaben auf einmal hochladen
2. **PDF-Support:** PDFs funktionieren auch (max 10MB)
3. **Text als Backup:** Wenn Bilderkennung nicht funktioniert, kopiere den Text
4. **Review:** Prüfe immer die extrahierten Aufgaben bevor du speicherst

### Antworten

1. **Verschiedene Formen OK:** KI erkennt äquivalente Lösungen
   - `√4 = 2` ✅
   - `1/2 = 0.5` ✅
   - `50% = 0.5` ✅

2. **Formatierung egal:** Leerzeichen und Klammern sind flexibel
   - `2 * x` = `2*x` = `2x` ✅

3. **Bei Unsicherheit:** Gib die einfachste Form ein
   - `x = 5` statt "Die Lösung ist x = 5"

4. **Hints nutzen:** Bei wiederholten Fehlern zeigt KI hilfreiche Tipps

### Performance

1. **Erste Analyse:** 10-30 Sekunden (Bild wird hochgeladen + analysiert)
2. **Nachfolgende Aufgaben:** Sofort verfügbar
3. **Antwort-Check:** 2-5 Sekunden pro Versuch
4. **Offline-Modus:** Ohne API-Key nutzt System simple Validierung

---

## 🎯 Häufige Fragen

### Wie viel kostet die API?

Anthropic Claude API ist **pay-as-you-go**:
- Task-Extraktion (mit Bild): ~$0.01-0.05 pro Bild
- Answer-Validation: ~$0.001 pro Check
- Beispiel: 100 Aufgaben lösen ≈ $0.50-1.00

**Tipp:** Neue Accounts erhalten oft Free Credits zum Testen!

### Ist mein API-Key sicher?

✅ **Ja!**
- Key wird **nur lokal** im Browser gespeichert (LocalStorage)
- Wird **nicht** an EduRank-Server gesendet (gibt es nicht)
- Wird **direkt** an Anthropic API gesendet (HTTPS verschlüsselt)
- Du behältst volle Kontrolle

### Was passiert ohne API-Key?

Du kannst weiter Aufgaben lösen, aber:
- ❌ Kein Bild-Upload
- ❌ Keine KI-Lösungsprüfung (nur exakte String-Matches)
- ✅ Manuelle Aufgabenerstellung funktioniert
- ✅ Gamification (XP, Levels, Coins) funktioniert

### Welche Aufgaben werden erkannt?

**Aktuell nur Mathematik:**
- ✅ Algebra (Gleichungen, Terme)
- ✅ Geometrie (Flächen, Volumen)
- ✅ Analysis (Funktionen, Ableitungen)
- ✅ Prozentrechnung
- ✅ Bruchrechnung
- ✅ Textaufgaben (mathematische)

**Später (Phase 2):** Deutsch, Englisch, Biologie, etc.

### Kann ich Aufgaben bearbeiten?

Aktuell nicht direkt, aber:
- KI-extrahierte Aufgaben kannst du vor dem Speichern reviewen
- Nach dem Speichern: Lösche und erstelle neu (oder warte auf Edit-Feature)

### Funktioniert Handschrift?

**Ja, aber:** Gedruckte Aufgaben funktionieren besser
- Saubere Handschrift: ✅ Funktioniert meist
- Unleserliche Handschrift: ❌ KI kann sie nicht dekodieren
- Tipp: Bei Handschrift den Text kopieren und als Text eingeben

---

## 🆘 Problem-Lösungen

### "Keine Aufgaben gefunden"

**Lösung 1:** Besseres Bild
- Mehr Licht
- Schärfer fokussieren
- Näher heranzoomen

**Lösung 2:** Text-Eingabe
- Wechsle zu Tab "Text eingeben"
- Tippe Aufgaben ab

**Lösung 3:** Andere Aufgaben probieren
- Vielleicht sind Aufgaben nicht Mathematik
- Oder zu komplex für automatische Erkennung

### "API Fehler"

**Check 1:** API-Key korrekt?
- Profil → API Einstellungen
- Key sollte mit `sk-ant-` beginnen
- Neu eingeben falls unsicher

**Check 2:** Internet-Verbindung?
- Prüfe ob du online bist
- Lade Seite neu

**Check 3:** API-Guthaben?
- Checke [Anthropic Console](https://console.anthropic.com/settings/billing)
- Ggf. Guthaben aufladen

### Extrahierte Aufgaben sind falsch

**Kein Problem!**
- Review die Aufgaben vor dem Speichern
- Klicke "Neu beginnen" und versuche es erneut
- Oder nutze Text-Eingabe für volle Kontrolle

### LaTeX wird nicht gerendert

**Lösung:**
- Seite neu laden (F5 / Cmd+R)
- Browser-Cache leeren
- Warte 1-2 Sekunden nach Seitenladen

---

## 🎓 Best Practices

### Workflow-Empfehlung

1. **Batch-Upload:** Lade ganze Arbeitsblätter auf einmal hoch
2. **Review:** Prüfe alle extrahierten Aufgaben
3. **Speichern:** Erst wenn alles korrekt ist
4. **Solve:** Löse Aufgaben in deinem Tempo
5. **Streak:** Mache täglich mindestens 1 Aufgabe für Bonus

### Lern-Strategie

1. **Start Easy:** Beginne mit leichteren Aufgaben (1-3 Sterne)
2. **Progress:** Steigere Schwierigkeit graduell
3. **Mistakes:** Nutze AI-Feedback zum Lernen
4. **Repeat:** Wiederhole schwierige Themen
5. **Streak:** Halte deine Streak am Leben für 2x XP Bonus

---

## 📞 Support

Bei Problemen oder Fragen:
1. Prüfe diese Anleitung
2. Checke `AI_INTEGRATION_UPDATE.md` für Details
3. Browser Console (F12) für Error Messages
4. GitHub Issues für Bug-Reports

---

**Viel Erfolg beim KI-gestützten Lernen! 🎓📐**

Version: 2.0 | Last Updated: 2026-01-29
