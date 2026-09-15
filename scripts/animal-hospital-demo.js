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
  document.querySelector('#welcome-message').textContent = localStorage.getItem('animal_hospital_operator') || 'Operador';
}
function showLogin() {
  profileView.hidden = true;
  profileView.style.display = 'none';
  loginView.hidden = false;
  loginView.style.display = 'grid';
  showMessage('');
}
function setupRegistration() {
  const form = document.querySelector('#login-form');
  if (!form || document.querySelector('#register-toggle')) return;
  form.insertAdjacentHTML('afterbegin', '<button id="register-toggle" class="register-toggle" type="button">Crear cuenta</button><div id="register-panel" class="register-panel" hidden><label for="register-email">Correo nuevo</label><input id="register-email" type="email" placeholder="correo@hospital.com" autocomplete="email"><label for="register-password">Contraseña</label><input id="register-password" type="password" minlength="8" placeholder="Mínimo 8 caracteres" autocomplete="new-password"><label for="register-password-confirm">Repetir contraseña</label><input id="register-password-confirm" type="password" minlength="8" placeholder="Repite la contraseña" autocomplete="new-password"><button id="register-submit" class="primary-button" type="button">Crear cuenta <span>→</span></button><p id="register-message" class="register-message" role="alert"></p></div>');
  const panel = document.querySelector('#register-panel');
  const note = document.querySelector('#register-message');
  document.querySelector('#register-toggle').addEventListener('click', () => {
    panel.hidden = !panel.hidden;
    note.textContent = '';
  });
  document.querySelector('#register-submit').addEventListener('click', () => {
    const email = document.querySelector('#register-email').value.trim();
    const password = document.querySelector('#register-password').value;
    const confirmation = document.querySelector('#register-password-confirm').value;
    if (!email || password.length < 8) { note.textContent = 'Completa un correo válido y una contraseña de mínimo 8 caracteres.'; return; }
    if (password !== confirmation) { note.textContent = 'Las contraseñas no coinciden.'; return; }
    document.querySelector('#email').value = email;
    document.querySelector('#password').value = '';
    note.className = 'register-message created';
    note.textContent = 'Cuenta creada correctamente. Ya puedes iniciar sesión.';
    setTimeout(() => { panel.hidden = true; note.textContent = ''; }, 1200);
  });
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
  document.querySelector('#level').textContent = '1';
  document.querySelector('#game-status').textContent = current ? 'Atendiendo' : 'Finalizado';
  document.querySelector('#general-timer').textContent = '--:--';
  document.querySelector('#progress-count').textContent = `${index} atendidos`;
  document.querySelector('#progress-label').textContent = `${index} / ${patients.length}`;
  document.querySelector('#patients').innerHTML = patientMarkup(current);
  document.querySelector('#scan-patient').disabled = !current || scanned;
  document.querySelector('#confirm-patient').disabled = !current || !scanned || current.anomaly;
  document.querySelector('#reject-patient').disabled = !current || !scanned;
  document.querySelector('#events').innerHTML = `<div class="event-row"><span>REGISTRO DE TURNO</span><small>${correct} aciertos · ${errors} errores</small></div>`;
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
  showMessage('Partida iniciada.', true);
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
  document.querySelector('#report-content').innerHTML = `<p>Pacientes atendidos: <b>${index}</b></p><p>Aciertos: <b>${correct}</b></p><p>Errores: <b>${errors}</b></p><p>Monedas: <b>${coins}</b></p><p>Cordura final: <b>${sanity}</b></p>`;
  const history = JSON.parse(localStorage.getItem('animal_hospital_history') || '[]');
  history.unshift({ fecha: new Date().toISOString(), pacientes: index, aciertos: correct, errores, monedas: coins, cordura: sanity });
  localStorage.setItem('animal_hospital_history', JSON.stringify(history.slice(0, 10)));
  document.querySelector('#start-game-button').textContent = 'Nueva partida';
  showMessage('Partida finalizada. Reporte actualizado.', true);
}

document.querySelector('#login-form').addEventListener('submit', (event) => {
  event.preventDefault();
  const form = new FormData(event.currentTarget);
  const email = String(form.get('email') || '').trim();
  const password = String(form.get('password') || '');
  if (!email || password.length < 8) { showMessage('Revisa el correo y el código de acceso.'); return; }
  localStorage.setItem('animal_hospital_operator', email);
  showProfile();
  startPanel.hidden = false;
  hud.hidden = true;
  showMessage('Acceso autorizado.', true);
});

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
document.querySelector('#logout-button').addEventListener('click', () => {
  localStorage.removeItem('animal_hospital_operator');
  showLogin();
  document.querySelector('#login-form').reset();
});
document.querySelector('#anomalies').addEventListener('click', () => {});

setupRegistration();
showLogin();

