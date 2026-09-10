const PDFDocument = require('pdfkit');

function renderWorksheetPdf(worksheet) {
  const doc = new PDFDocument({ margin: 50 });

  doc.fontSize(20).text(worksheet.title, { align: 'left' });
  doc.moveDown(0.3);
  doc.fontSize(11).fillColor('#555').text(`Fach: ${worksheet.subject}`);
  doc.fillColor('#000');
  doc.moveDown();

  worksheet.modules.forEach((mod, modIdx) => {
    doc.moveDown(0.5);
    doc.fontSize(14).text(`${modIdx + 1}. ${moduleTitle(mod.type)}`, { underline: true });
    doc.moveDown(0.3);
    doc.fontSize(12);

    if (mod.type === 'reihen-drill') {
      mod.tasks.forEach((t) => {
        doc.text(`${t.display} = __________`);
        doc.moveDown(0.2);
      });
    } else if (mod.type === 'zahlenmauer') {
      mod.tasks.forEach((t, i) => {
        doc.text(`Mauer ${i + 1}:`);
        const base = t.cells.filter((c) => c.level === 0).map(cellText);
        const middle = t.cells.filter((c) => c.level === 1).map(cellText);
        const top = t.cells.filter((c) => c.level === 2).map(cellText);
        doc.text(`        ${top.join('')}`);
        doc.text(`     ${middle.join('   ')}`);
        doc.text(`  ${base.join('   ')}`);
        doc.moveDown(0.5);
      });
    } else if (mod.type === 'kreise-ein-und-rechne') {
      mod.tasks.forEach((t, i) => {
        doc.text(`Aufgabe ${i + 1}: ${t.gesamt} Plättchen in Gruppen zu ${t.gruppengroesse}`);
        doc.text(`  ${t.gesamt} : ${t.gruppengroesse} = __________`);
        doc.text(`  __________ · ${t.gruppengroesse} = __________  (Umkehraufgabe)`);
        doc.moveDown(0.4);
      });
    } else {
      doc.text(JSON.stringify(mod.tasks));
    }
  });

  doc.end();
  return doc;
}

function cellText(c) {
  return c.given ? String(c.value).padStart(3, ' ') : ' __';
}

function moduleTitle(type) {
  const titles = {
    'reihen-drill': 'Reihen-Drill',
    zahlenmauer: 'Zahlenmauer',
    'kreise-ein-und-rechne': 'Kreise ein und rechne',
  };
  return titles[type] || type;
}

module.exports = { renderWorksheetPdf };
