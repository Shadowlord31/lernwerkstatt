# Lernwerkstatt

Modulare Lern-App für Grundschul-Aufgabenblätter. Start mit Mathe-Modulen,
Deutsch-Module folgen als weitere Modul-Typen ohne Architekturänderung.

## Stack
- Node.js / Express
- SQLite (better-sqlite3), keine externe DB nötig
- Vanilla JS Frontend, kein Build-Step
- PDF-Export via pdfkit

## Architektur
- **Modul-Typ** (`src/modules/*.js`): definiert `generate(config)`,
  `validate(tasks, answers)` und `meta` (Konfig-Felder + Label fürs Admin-UI).
  Neues Modul = neue Datei + Eintrag in `src/modules/index.js`.
- **Aufgabenblatt**: besteht aus mehreren Modul-Instanzen. Beim Erstellen
  werden die konkreten Aufgaben pro Modul einmalig generiert und in der DB
  eingefroren (`worksheet_modules.tasks_json`) – digitale Ansicht und
  PDF-Export zeigen dadurch garantiert dieselben Aufgaben.
- **Kinder-Profile**: einfache Zuordnung eines Aufgabenblatts zu einem Kind.

## Module (Stand v1)
1. `reihen-drill` – Malaufgaben/Division mit fester Reihen-Zahl
2. `zahlenmauer` – 3-stufige Zahlenmauer mit konfigurierbarer Lücken-Anzahl
3. `kreise-ein-und-rechne` – Plättchen-Bild + Divisions-/Umkehraufgabe

## Lokal starten
```bash
npm install
npm start
# Admin:      http://localhost:3010/admin.html
# Kind-Ansicht: http://localhost:3010/worksheet.html?id=1
```

## Docker
```bash
docker build -t lernwerkstatt .
docker run -d -p 3010:3010 -v lernwerkstatt-data:/app/data --name lernwerkstatt lernwerkstatt
```

Port 3010 ist ein Platzhalter – gegen die bestehende Port-Belegung auf dem
NAS prüfen, bevor der Container final eingerichtet wird.
