const loginView = document.querySelector('#login-view');
const profileView = document.querySelector('#profile-view');
const startPanel = document.querySelector('#game-start');
const hud = document.querySelector('#game-hud');
const message = document.querySelector('#message');
const patients = [
  { id: 1, nombre: 'Luna', condicion: 'fiebre · infección', anomaly: false, image: 'assets/luna-normal.jpg' },
  { id: 2, nombre: 'Coco', condicion: 'patrón biológico imposible', anomaly: true, image: 'assets/coco-anomalia.jpg' },
  { id: 3, nombre: 'Max', condicion: 'dolor · inflamación', anomaly: false, image: 'assets/max-normal.jpg' },
  { id: 4, nombre: 'Milo', condicion: 'señales anómalas detectadas', anomaly: true, image: 'assets/milo-anomalia.jpg' },
  { id: 5, nombre: 'Kira', condicion: 'deshidratación · debilidad', anomaly: false, image: 'assets/kira-normal.jpg' }
];
let index = 0;
let current = null;
let scanned = false;
let treatmentMode = false;
let coins = 0;
let sanity = 100;
let correct = 0;
let errors = 0;

function showMessage(text, success = false) {
  message.textContent = text;
  message.className = success ? 'success' : '';
}
function imageFor(patient) { return patient.image; }
function showProfile() {
  loginView.hidden = true;
  loginView.style.display = 'none';
  profileView.hidden = false;
  profileView.style.display = 'flex';
  document.querySelector('#welcome-message').textContent = 'Keyla Lopez · Demo';
}
function patientMarkup(patient) {
  if (!patient) return '<p class="muted">Todos los pacientes fueron atendidos.</p>';
  return `<article class="patient-card ${scanned && patient.anomaly ? 'distorted' : ''}">
    <div class="animal-avatar"><img src="${imageFor(patient)}" alt="${patient.nombre}" /></div>
    <strong>${patient.nombre}</strong>
    <span class="symptoms">${scanned ? `Síntomas observados: ${patient.condicion}` : 'Paciente esperando revisión'}</span>
    <span class="state">${scanned ? 'escaneado' : 'en espera'}</span>
    <small>${scanned ? (patient.anomaly ? '⚠ Anomalía revelada: rechazar' : '✓ Paciente real: delegar a tratamiento') : 'Usa la cámara para inspeccionar'}</small>
  </article>`;
}
function updateHud() {
  document.querySelector('#turn-number').textContent = Math.min(index + 1, patients.length);
  document.querySelector('#coins').textContent = coins;
  document.querySelector('#sanity').textContent = `${sanity}/100`;
  document.querySelector('#level').textContent = 'Demo';
  document.querySelector('#game-status').textContent = current ? 'Atendiendo' : 'Finalizado';
  document.querySelector('#general-timer').textContent = '--:--';
  document.querySelector('#progress-count').textContent = `${index} atendidos`;
  document.querySelector('#progress-label').textContent = `${index} / ${patients.length}`;
  document.querySelector('#patients').innerHTML = patientMarkup(current);
  document.querySelector('#scan-patient').disabled = !current || scanned;
  document.querySelector('#confirm-patient').disabled = !current || !scanned || current.anomaly;
  document.querySelector('#reject-patient').disabled = !current || !scanned;
  document.querySelector('#events').innerHTML = `<div class="event-row"><span>SIMULACIÓN LOCAL</span><small>${correct} aciertos · ${errors} errores</small></div>`;
}
function startGame() {
  index = 0; coins = 0; sanity = 100; correct = 0; errors = 0; scanned = false; treatmentMode = false;
  current = patients[index];
  startPanel.hidden = true;
  hud.hidden = false;
  document.querySelector('#reception-scene').hidden = false;
  document.querySelector('#treatment-scene').hidden = true;
  document.querySelector('#treatment-panel').hidden = true;
  document.querySelector('#final-report').hidden = true;
  updateHud();
  showMessage('Partida de demostración iniciada.', true);
}
function nextPatient(wasCorrect, text) {
  if (wasCorrect) { correct += 1; coins += 10; }
  else { errors += 1; sanity = Math.max(0, sanity - 20); }
  index += 1; current = patients[index] || null; scanned = false; treatmentMode = false;
  document.querySelector('#reception-scene').hidden = false;
  document.querySelector('#treatment-scene').hidden = true;
  document.querySelector('#treatment-panel').hidden = true;
  updateHud();
  showMessage(text, wasCorrect);
  if (!current || sanity === 0) finishGame();
}
function finishGame() {
  current = null; hud.hidden = true; startPanel.hidden = false;
  document.querySelector('#game-over-screen').hidden = true;
  const report = document.querySelector('#final-report');
  report.hidden = false;
  document.querySelector('#report-content').innerHTML = `<p>Pacientes atendidos: <b>${index}</b></p><p>Aciertos: <b>${correct}</b></p><p>Errores: <b>${errors}</b></p><p>Monedas simuladas: <b>${coins}</b></p><p>Cordura final: <b>${sanity}</b></p><p><strong>Este resultado no fue guardado.</strong></p>`;
  document.querySelector('#start-game-button').textContent = 'Nueva partida';
  showMessage('Demostración finalizada. No se guardaron datos reales.', true);
}

document.querySelector('#start-game-button').addEventListener('click', startGame);
document.querySelector('#scan-patient').addEventListener('click', () => { scanned = true; updateHud(); showMessage('La cámara reveló la condición del paciente.', true); });
document.querySelector('#reject-patient').addEventListener('click', () => nextPatient(current.anomaly, current.anomaly ? 'Anomalía rechazada correctamente.' : 'Era un paciente real. Perdiste cordura.'));
document.querySelector('#confirm-patient').addEventListener('click', () => {
  treatmentMode = true;
  document.querySelector('#reception-scene').hidden = true;
  document.querySelector('#treatment-scene').hidden = false;
  document.querySelector('#treatment-patient').innerHTML = `<div class="animal-avatar"><img src="${imageFor(current)}" alt="${current.nombre}" /></div>`;
  document.querySelector('#treatment-screen-content').innerHTML = `<strong>${current.nombre}</strong><small>Presiona ESCANEAR EL PACIENTE.</small>`;
  showMessage('Paciente delegado a tratamiento.', true);
});
document.querySelector('#treatment-scan').addEventListener('click', () => {
  document.querySelector('#treatment-screen-content').innerHTML = `<strong>OBSERVACIÓN: ${current.nombre}</strong><small>${current.condicion}</small>`;
  document.querySelector('#treatment-panel').hidden = false;
  const medications = [['💊','analgesico'],['🧪','antibiotico'],['🔍','observacion'],['💧','suero'],['🧴','antiparasitario'],['💉','sedante']];
  document.querySelector('#medications').innerHTML = medications.map(([icon,name]) => `<label class="med-card"><input type="checkbox" value="${name}"><span class="med-icon">${icon}</span><span>${name}</span></label>`).join('');
});
document.querySelector('#confirm-treatment').addEventListener('click', () => {
  const selected = [...document.querySelectorAll('#medications input:checked')].map(x => x.value);
  const expected = current.condicion.includes('fiebre') ? 'antibiotico' : current.condicion.includes('dolor') ? 'analgesico' : 'suero';
  nextPatient(selected.includes(expected), selected.includes(expected) ? 'Tratamiento correcto.' : 'Tratamiento incorrecto. Perdiste cordura.');
});
document.querySelector('#back-reception').addEventListener('click', () => { treatmentMode = false; document.querySelector('#treatment-scene').hidden = true; document.querySelector('#reception-scene').hidden = false; });
document.querySelector('#finish-game').addEventListener('click', finishGame);
document.querySelector('#open-lobby').addEventListener('click', () => { hud.hidden = true; startPanel.hidden = false; showMessage('Lobby abierto.', true); });
document.querySelector('#refresh-game').addEventListener('click', updateHud);
document.querySelector('#logout-button').addEventListener('click', () => { window.location.href = '/'; });
document.querySelector('#anomalies').addEventListener('click', () => {});

showProfile();
startPanel.hidden = false;
hud.hidden = true;
showMessage('Demostración lista. No requiere cuenta ni conexión a la base de datos.', true);

