// Zentrale Registry aller Aufgaben-Modul-Typen.
// Neues Modul hinzufügen = Datei anlegen (siehe reihen-drill.js als Vorlage) + hier registrieren.

const reihenDrill = require('./reihen-drill');
const zahlenmauer = require('./zahlenmauer');
const kreiseEinUndRechne = require('./kreise-ein-und-rechne');

module.exports = {
  'reihen-drill': reihenDrill,
  'zahlenmauer': zahlenmauer,
  'kreise-ein-und-rechne': kreiseEinUndRechne,
};
