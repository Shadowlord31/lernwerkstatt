function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generate(config = {}) {
  const {
    anzahl = 1,
    gruppengroesseOptions = [2, 3, 4, 5, 6, 7, 8, 9],
    gesamtMin = 12,
    gesamtMax = 48,
  } = config;

  const tasks = [];
  for (let n = 0; n < anzahl; n++) {
    const gruppengroesse =
      gruppengroesseOptions[Math.floor(Math.random() * gruppengroesseOptions.length)];
    const minGruppen = Math.max(2, Math.ceil(gesamtMin / gruppengroesse));
    const maxGruppen = Math.max(minGruppen, Math.floor(gesamtMax / gruppengroesse));
    const anzahlGruppen = randInt(minGruppen, maxGruppen);
    const gesamt = gruppengroesse * anzahlGruppen;

    tasks.push({
      gesamt,
      gruppengroesse,
      anzahlGruppen,
      answer: anzahlGruppen, // gesamt : gruppengroesse = anzahlGruppen
      umkehrAnswer: gesamt, // anzahlGruppen · gruppengroesse = gesamt
    });
  }
  return tasks;
}

function validate(tasks, answers = []) {
  return tasks.map((t, i) => {
    const a = answers[i] || {};
    const correct =
      Number(a.hauptantwort) === t.answer && Number(a.umkehrantwort) === t.umkehrAnswer;
    return { index: i, correct };
  });
}

module.exports = {
  generate,
  validate,
  meta: {
    label: 'Kreise ein und rechne (Plättchen)',
    configFields: [
      { key: 'anzahl', label: 'Anzahl Aufgaben', type: 'number', default: 1 },
      { key: 'gesamtMin', label: 'Gesamtzahl mindestens', type: 'number', default: 12 },
      { key: 'gesamtMax', label: 'Gesamtzahl höchstens', type: 'number', default: 48 },
    ],
  },
};
