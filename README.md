🔑 Pick That Lock (Minigame)
Ein interaktives Schlossknacken-Minispiel für Foundry VTT, optimiert für Dungeons & Dragons 5e.
Dieses Modul ersetzt den einfachen Fertigkeitswurf durch eine fesselnde, zeitbasierte Herausforderung.
Die Schwierigkeit und die erlaubten Fehler werden dynamisch aus den Fähigkeiten des Charakters berechnet.

✨ Kern-Funktionen
Interaktives Minigame: Ein zeitbasiertes Spiel, bei dem Pfeiltasten in einer bestimmten Sequenz gedrückt werden müssen.
D&D 5e Integration: Berechnet den Schwierigkeitsgrad (DC) und den Zeitbonus basierend auf den Charakterfähigkeiten (DEX, Diebeswerkzeug: ungeübt/Übung/Expertise).
Voraussetzungsprüfung: Der Start-Button wird nur angezeigt, wenn der Charakter Diebeswerkzeug besitzt.
Verlässliches Talent (Reliable Talent): Unterstützt diese Schurken-Funktion, indem es zusätzliche Fehlversuche gewährt.
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


3. Die automatische Bonus-Berechnung
Das Modul bestimmt den endgültigen Bonus und die Zeit für das Minigame automatisch anhand der folgenden Logik,
die auch im Minigame-Fenster angezeigt wird:

Diebeswerkzeug-ungeübt = +dex mod
Diebeswerkzeug-geübt = +dex mod +Übungsbonus
Diebeswerkzeug-Expertise = +dex mod +Übungsbonus*2

Die länge der Gesamtsequenz ergibt sich aus dem DC des Schloßes.
Die Gesamtzeit ergibt aus dem Gesamtbonus für den Spieler.
Bei Nachteil (Diebeswerkzeug-ungeübt) wird die Gesamtzeit um 40% verringert.

.Basis (Ungeübt)Der Bonus ist DEX-Modifikator + 0. Der Zeitbonus ist minimal.GeübtDer Bonus ist DEX-Modifikator + Übungsbonus.ExpertiseDer Bonus ist DEX-Modifikator + (Übungsbonus * 2).Verlässliches Talent (RT)Der Spieler erhält zusätzliche erlaubte Fehlversuche.3. Minigame spielenNachdem der GM den DC im Konfigurationsfenster festgelegt hat, startet das Spiel.Der Spieler muss nacheinander die angezeigten Pfeiltasten (↑, ↓, ←, →) drücken.Der Zeitbalken zeigt die verbleibende Zeit an; die Dauer wird durch den Charakterbonus verlängert.Bei einem Fehler wird ein Fehlversuch aufgebraucht. Die Anzahl der erlaubten Fehlversuche wird durch den Reliable Talent-Bonus des Charakters bestimmt. Sind alle erlaubten Fehler aufgebraucht, bricht das Minigame ab.📸 ScreenshotsElementBeschreibungPlatzhalterHaupt-UIDas interaktive Fenster, das DC, Bonus und den Zeitfortschritt anzeigt.[Füge hier ein Bild des Minigames ein, z.B. image_231c32.jpg]Charakterbogen-TriggerDer goldene Schloss-Button, der neben dem Diebeswerkzeug erscheint (z.B. im Tidy5e Sheet).[Füge hier ein Bild des goldenen Buttons ein, z.B. image_ed1642.png]Bonus-SchildDetailansicht des Messingschilds mit der Bonus-Zusammensetzung.[Füge hier einen Screenshot des Bonus-Schilds ein]🤝 Credits & LizenzierungDieses Modul wurde konzipiert und finalisiert von blubbedi.Die Entwicklung der Modulstruktur, Logik (JavaScript), Custom-Designs (CSS) und Lokalisierung erfolgte mit umfassender Unterstützung des KI-Modells Google Gemini.Autor/Maintainer: blubbediAI Assistance: Google Gemini (Code Structuring, Logic, Styling & Debugging)Lizenz: MIT (Der vollständige Text befindet sich in der Datei LICENSE.)
