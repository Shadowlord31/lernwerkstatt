const express = require('express');
const path = require('path');
const db = require('./src/db/db');
const modules = require('./src/modules');
const { renderWorksheetPdf } = require('./src/pdf');

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ---- Kinder ----
app.get('/api/children', (req, res) => {
  try {
    res.json(db.prepare('SELECT * FROM children ORDER BY name').all());
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/children', (req, res) => {
  try {
    const { name } = req.body;
    if (!name || !name.trim()) return res.status(400).json({ error: 'Name fehlt' });
    const info = db.prepare('INSERT INTO children (name) VALUES (?)').run(name.trim());
    res.json({ id: info.lastInsertRowid, name: name.trim() });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// ---- Modul-Typen (für Admin-UI) ----
app.get('/api/module-types', (req, res) => {
  const types = Object.entries(modules).map(([key, mod]) => ({ key, ...mod.meta }));
  res.json(types);
});

// ---- Aufgabenblätter ----
app.get('/api/worksheets', (req, res) => {
  try {
    const { child_id } = req.query;
    const rows = child_id
      ? db
          .prepare(
            `SELECT w.*, c.name as child_name FROM worksheets w
             LEFT JOIN children c ON c.id = w.child_id
             WHERE w.child_id = ?
             ORDER BY w.created_at DESC`
          )
          .all(child_id)
      : db
          .prepare(
            `SELECT w.*, c.name as child_name FROM worksheets w
             LEFT JOIN children c ON c.id = w.child_id
             ORDER BY w.created_at DESC`
          )
          .all();
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/worksheets', (req, res) => {
  try {
    const { title, subject = 'mathe', child_id, modules: moduleConfigs } = req.body;
    if (!title || !title.trim()) return res.status(400).json({ error: 'Titel fehlt' });
    if (!Array.isArray(moduleConfigs) || moduleConfigs.length === 0) {
      return res.status(400).json({ error: 'Mindestens ein Modul erforderlich' });
    }

    const insertWorksheet = db.prepare(
      'INSERT INTO worksheets (title, subject, child_id) VALUES (?, ?, ?)'
    );
    const insertModule = db.prepare(
      'INSERT INTO worksheet_modules (worksheet_id, module_type, order_index, config_json, tasks_json) VALUES (?, ?, ?, ?, ?)'
    );

    const worksheetId = db.transaction(() => {
      const wsInfo = insertWorksheet.run(title.trim(), subject, child_id || null);
      const id = wsInfo.lastInsertRowid;
      moduleConfigs.forEach((m, idx) => {
        const modDef = modules[m.type];
        if (!modDef) throw new Error(`Unbekannter Modul-Typ: ${m.type}`);
        const tasks = modDef.generate(m.config || {});
        insertModule.run(id, m.type, idx, JSON.stringify(m.config || {}), JSON.stringify(tasks));
      });
      return id;
    })();

    res.json({ id: worksheetId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Für die Kind-Ansicht: Aufgaben ohne Lösungen
app.get('/api/worksheets/:id', (req, res) => {
  try {
    const worksheet = db.prepare('SELECT * FROM worksheets WHERE id = ?').get(req.params.id);
    if (!worksheet) return res.status(404).json({ error: 'Nicht gefunden' });

    const mods = db
      .prepare('SELECT * FROM worksheet_modules WHERE worksheet_id = ? ORDER BY order_index')
      .all(req.params.id);

    worksheet.modules = mods.map((m) => ({
      id: m.id,
      type: m.module_type,
      tasks: stripAnswers(m.module_type, JSON.parse(m.tasks_json)),
    }));

    res.json(worksheet);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

function stripAnswers(type, tasks) {
  return tasks.map((t) => {
    const clone = { ...t };
    delete clone.answer;
    delete clone.umkehrAnswer;
    if (clone.cells) {
      clone.cells = clone.cells.map((c) => (c.given ? c : { ...c, value: null }));
    }
    return clone;
  });
}

// Antworten prüfen
app.post('/api/worksheet-modules/:id/check', (req, res) => {
  try {
    const mod = db.prepare('SELECT * FROM worksheet_modules WHERE id = ?').get(req.params.id);
    if (!mod) return res.status(404).json({ error: 'Nicht gefunden' });

    const modDef = modules[mod.module_type];
    const tasks = JSON.parse(mod.tasks_json);
    const { answers = [] } = req.body;
    const results = modDef.validate(tasks, answers);

    const insertAttempt = db.prepare(
      'INSERT INTO attempts (worksheet_module_id, task_index, answer, correct) VALUES (?, ?, ?, ?)'
    );
    db.transaction(() => {
      results.forEach((r, i) => {
        insertAttempt.run(mod.id, i, JSON.stringify(answers[i] ?? null), r.correct ? 1 : 0);
      });
    })();

    res.json({ results });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// PDF-Export (druckbare Version ohne Lösungen)
app.get('/api/worksheets/:id/pdf', (req, res) => {
  try {
    const worksheet = db.prepare('SELECT * FROM worksheets WHERE id = ?').get(req.params.id);
    if (!worksheet) return res.status(404).send('Nicht gefunden');

    const mods = db
      .prepare('SELECT * FROM worksheet_modules WHERE worksheet_id = ? ORDER BY order_index')
      .all(req.params.id);
    worksheet.modules = mods.map((m) => ({
      type: m.module_type,
      tasks: stripAnswers(m.module_type, JSON.parse(m.tasks_json)),
    }));

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `inline; filename="${worksheet.title.replace(/[^a-z0-9]/gi, '_')}.pdf"`
    );
    renderWorksheetPdf(worksheet).pipe(res);
  } catch (err) {
    console.error(err);
    res.status(500).send('Fehler beim PDF-Export');
  }
});

const PORT = process.env.PORT || 3010;
app.listen(PORT, () => console.log(`Lernwerkstatt läuft auf Port ${PORT}`));
