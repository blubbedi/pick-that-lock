# 🔑 Pick That Lock (Minigame)

An interactive lockpicking minigame for Foundry VTT, optimized for Dungeons & Dragons 5e.
This module replaces the simple skill check with an engaging, time-based challenge.
The difficulty and the allowed mistakes are dynamically calculated based on the character's abilities.

[Insert Image: `image_231c32.jpg` or similar full UI shot]

### ✨ Core Features

* **Interactive Minigame:** A time-based game where the player must press arrow keys in a specific sequence.
* **D&D 5e Integration:** Calculates the Difficulty Class (DC) and the time bonus based on the character's abilities (DEX, Thieves' Tools: unproficient/proficient/Expertise).
* **Prerequisite Check:** The Start button is only displayed if the character possesses Thieves' Tools.
* **Reliable Talent:** This Rogue feature is represented by granting a specific number of allowed mistakes.
* **Custom UI / Aesthetics:** An immersive, medieval design combined with a modern quick-time event.
* **GM/Spectator Mode:** The Game Master and other players can track the progress in real-time in their own window.

---

## ⬇️ Installation

### Module ID: `pick-that-lock`

To install the module, paste the Manifest URL into the Foundry VTT setup wizard.

1.  Open the Foundry VTT Setup screen.
2.  Go to **Install Module** (or Modules in the menu).
3.  Paste the Manifest URL into the field:

    `https://raw.githubusercontent.com/blubbedi/pick-that-lock/main/module.json`

4.  Click **Install**.
5.  Activate the module in your World Settings.

---

## 🕹️ Usage Guide

### 1. Starting the Game

The availability of the minigame is directly dependent on the character possessing Thieves' Tools.

1.  The player opens their character sheet.
2.  The module searches the inventory for an item named "Thieves' Tools" or "Diebeswerkzeug."
3.  If the tool is present, the **golden lock icon** appears next to the tool entry.
4.  When the player clicks the button, a request is sent to the Game Master.

[Insert Image: `start-button` / `image_ed1642.png`]

### 2. Config Window (GM)

After the player clicks, a configuration window automatically opens for the GM to set the difficulty.

[Insert Image: Config window screenshot]

After confirmation, the minigame window opens for the requesting player. The GM and other present players receive a Spectator window to watch the progress live.

### 3. Automatic Bonus Calculation

The module dynamically determines the final bonus and the time limit for the minigame based on the following logic, which is also displayed in the minigame window:

* **Thieves' Tools (Unproficient):** **+DEX Modifier**
* **Thieves' Tools (Proficient):** **+DEX Modifier + Proficiency Bonus**
* **Thieves' Tools (Expertise):** **+DEX Modifier + (Proficiency Bonus × 2)**

The total sequence length is determined by the DC of the lock. The total time granted is determined by the character's total bonus.
* If the character has **Disadvantage** (e.g., due to missing the proper tool), the total time is reduced by 40%.

[Insert Image: Minigame UI screenshot, e.g., `image_231c32.jpg`]

* **Mistakes Allowed:** If an error is made, one allowed mistake is consumed. The number of allowed mistakes is determined by the **Reliable Talent** feature:
    * Mistakes allowed are calculated as **half of the effective training bonus**. This includes the doubling of the bonus if Expertise is present.
    * If all allowed mistakes are consumed, the minigame aborts.

Chat messages are sent out upon the start and end of the minigame.

[Insert Image: Chat message example]

---

## 🤝 Credits & Licensing

This module was conceived and finalized by **blubbedi**.

The development of the module structure, logic (JavaScript), custom designs (CSS), and localization was executed with comprehensive assistance from the Google Gemini AI model.

* **Author/Maintainer:** blubbedi
* **AI Assistance:** Google Gemini (Code Structuring, Logic, Styling & Debugging)
* **License:** **MIT** (The full text is available in the `LICENSE` file.)



🔑 Pick That Lock (Minigame)

<img width="422" height="857" alt="image" src="https://github.com/user-attachments/assets/e9b67866-00e9-43fb-93fc-5e5922bbb49d" />

Ein interaktives Schlossknacken-Minispiel für Foundry VTT, optimiert für Dungeons & Dragons 5e.
Dieses Modul ersetzt den einfachen Fertigkeitswurf durch eine fesselnde, zeitbasierte Herausforderung.
Die Schwierigkeit und die erlaubten Fehler werden dynamisch aus den Fähigkeiten des Charakters berechnet.

✨ Kern-Funktionen

Interaktives Minigame: Ein zeitbasiertes Spiel, bei dem Pfeiltasten in einer bestimmten Sequenz gedrückt werden müssen.
D&D 5e Integration: Berechnet den Schwierigkeitsgrad (DC) und den Zeitbonus basierend auf den Charakterfähigkeiten (DEX, Diebeswerkzeug: ungeübt/Übung/Expertise).
Voraussetzungsprüfung: Der Start-Button wird nur angezeigt, wenn der Charakter Diebeswerkzeug besitzt.
Verlässliches Talent (Reliable Talent): Dieses Schurken-Merkmal wird durch das Erlauben von Fehlern abgebildet.
Custom UI / Ästhetik: Ein immersives, mittelalterliches Design in Verbindung mit modernem quick-time-event.
GM/Spectator Mode: Der Spielleiter und andere Spieler können den Fortschritt in Echtzeit im eigenen Fenster verfolgen.

⬇️ InstallationModul-ID: pick-that-lock

Um das Modul zu installieren, füge die Manifest-URL in den Foundry VTT Setup-Assistenten ein.
Öffne den Foundry VTT Setup-Bildschirm.
Gehe zu Module installieren (Install Module).
Füge die Manifest-URL in das Feld ein:https://raw.githubusercontent.com/blubbedi/pick-that-lock/main/module.json
Klicke auf Installieren.
Aktiviere das Modul in deinen Welt-Einstellungen.

🕹️ Anleitung zur Benutzung.

1. Spiel starten

Die Verfügbarkeit des Minigames hängt direkt vom Besitz des Diebeswerkzeugs ab.
Der Spieler öffnet seinen Charakterbogen.
Das Modul sucht das Inventar nach einem Gegenstand namens "Thieves' Tools" oder "Diebeswerkzeug" ab.
Wenn das Werkzeug vorhanden ist, erscheint das goldene Schloss-Icon neben dem Tool-Eintrag.
Klickt der Spieler auf den Button, wird eine Anfrage an den Spielleiter gesendet.

![start-button](https://github.com/user-attachments/assets/934336f4-b257-4486-8e1e-c0af7b29c427)

2. Config-fenster (GM)
Nach dem Klick des Spielers öffnet sich beim Spielleiter automatisch ein Config-Fenster um den Schwierigkeitsgrad festzulegen.

<img width="426" height="151" alt="image" src="https://github.com/user-attachments/assets/1b88a6db-a6cd-45f0-b6a1-4cde62312c5b" />

Nach dem Bestätigen öffnet sich das Minigame-Fenster bei dem anfragendem Spieler.
Spielleiter und andere anwesende Spieler erhalten ein Spectator-Fenster um den Fortschritt live mitzuerleben.

3. Die automatische Bonus-Berechnung
                                                                          
Das Modul bestimmt den endgültigen Bonus und die Zeit für das Minigame automatisch anhand der folgenden Logik,
die auch im Minigame-Fenster angezeigt wird:

Diebeswerkzeug-ungeübt = +dex mod

Diebeswerkzeug-geübt = +dex mod +Übungsbonus

Diebeswerkzeug-Expertise = +dex mod +Übungsbonus*2

Die länge der Gesamtsequenz ergibt sich aus dem DC des Schloßes.
Die Gesamtzeit ergibt aus dem Gesamtbonus für den Spieler.
Bei Nachteil (Diebeswerkzeug-ungeübt) wird die Gesamtzeit um 40% verringert.

<img width="332" height="227" alt="image" src="https://github.com/user-attachments/assets/92075f14-93c2-40a1-9145-8ce52af225a8" />

Bei einem Fehler wird ein Fehlversuch aufgebraucht. Die Anzahl der erlaubten Fehlversuche wird durch den Reliable Talent-Bonus des Charakters bestimmt.
Reliable Talent: Fehlversuche bei Übung auf Diebeswerkzeug=Übungsbonus/2 (Fehrversuche bei Expertise auf Diebeswerkzeug=Übungsbonus)
Sind alle erlaubten Fehler aufgebraucht, bricht das Minigame ab.
Im Chat werden Meldungen zu Start und Ende des Minigame ausgegeben.

<img width="297" height="193" alt="image" src="https://github.com/user-attachments/assets/64828180-477e-4b4b-ba1e-1a99ff567894" />

Credits & LizenzierungDieses Modul wurde konzipiert und finalisiert von blubbedi.Die Entwicklung der Modulstruktur, Logik (JavaScript), Custom-Designs (CSS) und Lokalisierung erfolgte mit umfassender Unterstützung des KI-Modells Google Gemini.Autor/Maintainer: blubbediAI Assistance: Google Gemini (Code Structuring, Logic, Styling & Debugging)Lizenz: MIT (Der vollständige Text befindet sich in der Datei LICENSE.)
