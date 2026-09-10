function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// 3-stufige Zahlenmauer: 3 Basisfelder, 2 Mittelfelder, 1 Spitze.
function generate(config = {}) {
  const {
    zahlenraum = 20,
    schwierigkeit = 'leicht', // leicht (1 Lücke) | mittel (2) | schwer (3)
    anzahl = 1,
  } = config;

  const hiddenCount = schwierigkeit === 'schwer' ? 3 : schwierigkeit === 'mittel' ? 2 : 1;

  const tasks = [];
  for (let n = 0; n < anzahl; n++) {
    const maxBase = Math.max(2, Math.floor(zahlenraum / 3));
    const base = [randInt(1, maxBase), randInt(1, maxBase), randInt(1, maxBase)];
    const middle = [base[0] + base[1], base[1] + base[2]];
    const top = middle[0] + middle[1];

    const cells = [
      { level: 0, pos: 0, value: base[0] },
      { level: 0, pos: 1, value: base[1] },
      { level: 0, pos: 2, value: base[2] },
      { level: 1, pos: 0, value: middle[0] },
      { level: 1, pos: 1, value: middle[1] },
      { level: 2, pos: 0, value: top },
    ];

    const indices = shuffle([0, 1, 2, 3, 4, 5]);
    const hiddenIdx = new Set(indices.slice(0, hiddenCount));

    const finalCells = cells.map((c, i) => ({ ...c, given: !hiddenIdx.has(i) }));

    tasks.push({
      cells: finalCells,
      answer: finalCells.filter((c) => !c.given).map((c) => c.value),
    });
  }
  return tasks;
}

function validate(tasks, answers = []) {
  return tasks.map((t, i) => {
    const userAnswers = answers[i] || [];
    const correct = t.answer.every((val, idx) => Number(userAnswers[idx]) === val);
    return { index: i, correct };
  });
}

module.exports = {
  generate,
  validate,
  meta: {
    label: 'Zahlenmauer',
    configFields: [
      { key: 'zahlenraum', label: 'Zahlenraum (ca. Spitzenwert)', type: 'number', default: 20 },
      { key: 'schwierigkeit', label: 'Schwierigkeit', type: 'select', options: ['leicht', 'mittel', 'schwer'], default: 'leicht' },
      { key: 'anzahl', label: 'Anzahl Mauern', type: 'number', default: 1 },
    ],
  },
};
