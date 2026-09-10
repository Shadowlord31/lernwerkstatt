function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function generate(config = {}) {
  const {
    operation = 'mult', // 'mult' | 'div'
    reihe = 4,
    anzahl = 5,
    bereichMin = 1,
    bereichMax = 10,
  } = config;

  const range = [];
  for (let i = bereichMin; i <= bereichMax; i++) range.push(i);
  shuffle(range);
  const factors = range.slice(0, Math.min(anzahl, range.length));

  return factors.map((factor) => {
    if (operation === 'div') {
      const dividend = reihe * factor;
      return { display: `${dividend} : ${reihe}`, answer: factor };
    }
    return { display: `${reihe} · ${factor}`, answer: reihe * factor };
  });
}

function validate(tasks, answers = []) {
  return tasks.map((t, i) => ({
    index: i,
    correct: Number(answers[i]) === t.answer,
  }));
}

module.exports = {
  generate,
  validate,
  meta: {
    label: 'Reihen-Drill (× oder ÷)',
    configFields: [
      { key: 'operation', label: 'Rechenart', type: 'select', options: ['mult', 'div'], default: 'mult' },
      { key: 'reihe', label: 'Reihen-Zahl', type: 'number', default: 4 },
      { key: 'anzahl', label: 'Anzahl Aufgaben', type: 'number', default: 5 },
      { key: 'bereichMin', label: 'Zweiter Faktor von', type: 'number', default: 1 },
      { key: 'bereichMax', label: 'Zweiter Faktor bis', type: 'number', default: 10 },
    ],
  },
};
