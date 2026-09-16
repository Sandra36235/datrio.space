(() => {
  const API_PREFIX = '/__animal_hospital_demo__';
  const accountKey = 'animal_hospital_accounts_v2';
  const gameKey = 'animal_hospital_game_v2';
  const historyKey = 'animal_hospital_history_v2';
  const realFetch = window.fetch.bind(window);
  const templates = [
    ['Luna', 'dolor e inflamación', 'analgesico', false],
    ['Max', 'fiebre y secreción nasal', 'antibiotico', false],
    ['Nala', 'distorsión visual y comportamiento extraño', 'observacion', true],
    ['Coco', 'deshidratación y debilidad', 'suero', false],
    ['Milo', 'picazón intensa y parásitos', 'antiparasitario', false],
    ['Kira', 'ansiedad y agitación', 'sedante', false]
  ];

  const read = (key, fallback) => {
    try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; }
  };
  const write = (key, value) => localStorage.setItem(key, JSON.stringify(value));
  const json = (body, status = 200) => Promise.resolve(new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' }
  }));
  const bodyOf = options => {
    try { return JSON.parse(options?.body || '{}'); } catch { return {}; }
  };
  const emailFrom = options => {
    const authorization = new Headers(options?.headers || {}).get('Authorization') || '';
    return authorization.startsWith('Bearer demo:') ? decodeURIComponent(authorization.slice(12)) : '';
  };
  async function passwordHash(value) {
    const data = new TextEncoder().encode(String(value));
    const digest = await crypto.subtle.digest('SHA-256', data);
    return [...new Uint8Array(digest)].map(byte => byte.toString(16).padStart(2, '0')).join('');
  }
  function inspection(patient) {
    const id = Number(patient.id);
    const floor = (id % 3) + 1;
    const apartment = 100 + (id % 12);
    const requestedFloor = patient.es_anomalia ? (floor === 3 ? 1 : floor + 1) : floor;
    const roster = {
      1: { nombre: 'Max', piso: 1, apartamento: 101, especie: 'Paciente animal registrado' },
      2: { nombre: 'Coco', piso: 2, apartamento: 102, especie: 'Paciente animal registrado' },
      3: { nombre: 'Kira', piso: 3, apartamento: 103, especie: 'Paciente animal registrado' }
    };
    if (!patient.es_anomalia) roster[floor] = { nombre: patient.nombre, piso: floor, apartamento: apartment, especie: 'Paciente animal registrado' };
    return {
      archivo: roster[floor],
      archivos_por_piso: roster,
      identificacion: { codigo: `AH-${String(id).padStart(4, '0')}`, nombre: patient.nombre, piso: floor, apartamento: patient.es_anomalia ? apartment + 1 : apartment, vencimiento: '24/09/2026' },
      solicitud: { codigo: `AH-${String(id).padStart(4, '0')}`, nombre: patient.nombre, piso: requestedFloor, apartamento: apartment, motivo: 'revisión veterinaria' },
      lista_del_dia: ['Luna', 'Max', 'Nala', 'Coco', 'Milo', 'Kira']
    };
  }
  function newPatient(turn) {
    const [baseName, baseCondition, treatment, baseAnomaly] = templates[(turn - 1) % templates.length];
    const advancedAnomaly = turn >= 4 && turn % 2 === 0;
    const anomaly = Boolean(baseAnomaly || advancedAnomaly);
    return {
      id: turn,
      nombre: turn === 1 ? baseName : `${baseName} #${turn}`,
      condicion: anomaly && advancedAnomaly ? 'síntomas ambiguos y comportamiento extraño' : baseCondition,
      tratamiento_requerido: treatment,
      tratamiento_sugerido: null,
      es_anomalia: anomaly,
      detectado: 0,
      estado: 'esperando',
      orden: turn,
      salud: 100
    };
  }
  function newGame(email) {
    return { email, id: Date.now(), active: true, turn: 1, coins: 0, sanity: 100, level: 1, exp: 0, cured: 0, rejected: 0, errors: 0, earned: 0, started: new Date().toISOString(), patient: newPatient(1) };
  }
  function saveGame(game) { write(gameKey, game); }
  function currentGame() { return read(gameKey, null); }
  function advance(game) { game.turn += 1; game.patient = newPatient(game.turn); saveGame(game); }
  function report(game) {
    return { turno_alcanzado: game.turn, pacientes_curados: game.cured, anomalias_rechazadas: game.rejected, errores_cometidos: game.errors, monedas_ganadas: game.earned, cordura_final: game.sanity, iniciada_en: game.started, finalizada_en: new Date().toISOString() };
  }
  function finish(game) {
    game.active = false;
    const result = report(game);
    const history = read(historyKey, []);
    history.unshift(result);
    write(historyKey, history.slice(0, 20));
    saveGame(game);
    return result;
  }
  function stateResponse(game) {
    const visible = game.patient ? {
      ...game.patient,
      condicion: game.patient.detectado ? game.patient.condicion : 'Paciente esperando revisión',
      es_anomalia: game.patient.detectado ? game.patient.es_anomalia : null,
      tratamiento_sugerido: game.patient.detectado ? game.patient.tratamiento_requerido : null,
      inspection: inspection(game.patient)
    } : null;
    return {
      partida: { id: game.id, turno_actual: game.turn, estado: game.active ? 'en_curso' : 'terminada', dificultad: 'normal', monedas: game.coins, nivel: game.level, exp: game.exp, cordura: game.sanity, pacientes_curados: game.cured, anomalias_rechazadas: game.rejected, errores_cometidos: game.errors, monedas_ganadas: game.earned },
      paciente_actual: visible,
      pacientes: visible ? [visible] : [],
      anomalias: visible?.es_anomalia ? [{ id: visible.id, tipo: 'Distorsión animal', turno_en_que_aparecio: game.turn, estado: 'activa', paciente_asociado_id: visible.id }] : []
    };
  }

  window.fetch = async (input, options = {}) => {
    const url = typeof input === 'string' ? input : input.url;
    if (!url.startsWith(API_PREFIX)) return realFetch(input, options);
    const path = url.slice(API_PREFIX.length).split('?')[0];
    const method = String(options.method || 'GET').toUpperCase();
    const body = bodyOf(options);
    const email = emailFrom(options);

    if (path === '/auth/register' && method === 'POST') {
      const normalized = String(body.email || '').trim().toLowerCase();
      if (!normalized.includes('@')) return json({ error: 'Ingrese un correo electrónico válido.' }, 400);
      if (String(body.password || '').length < 8) return json({ error: 'La contraseña debe tener al menos 8 caracteres.' }, 400);
      const accounts = read(accountKey, {});
      if (accounts[normalized]) return json({ error: 'El correo ya está registrado.' }, 409);
      accounts[normalized] = await passwordHash(body.password);
      write(accountKey, accounts);
      return json({ user: { id: Object.keys(accounts).length, email: normalized, created_at: new Date().toISOString() } }, 201);
    }
    if (path === '/auth/login' && method === 'POST') {
      const normalized = String(body.email || '').trim().toLowerCase();
      const accounts = read(accountKey, {});
      if (!accounts[normalized] || accounts[normalized] !== await passwordHash(body.password)) return json({ error: 'Correo o contraseña incorrectos.' }, 401);
      return json({ token: `demo:${encodeURIComponent(normalized)}` });
    }
    if (path === '/auth/me') {
      if (!email) return json({ error: 'Sesión no válida.' }, 401);
      return json({ user: { id: 1, email, created_at: new Date().toISOString() } });
    }
    if (!email) return json({ error: 'Sesión no válida.' }, 401);
    if (path === '/partida/abandonar' && method === 'POST') {
      const game = currentGame(); if (game) { game.active = false; saveGame(game); }
      return json({ cerrado: true });
    }
    if (path === '/partida/iniciar' && method === 'POST') {
      const game = newGame(email); saveGame(game); return json({ partida_id: game.id, mensaje: 'Partida iniciada.' }, 201);
    }
    const game = currentGame();
    if (!game || !game.active) return json({ error: 'No tienes una partida en curso.' }, 404);
    if (path === '/partida/estado') return json(stateResponse(game));
    if (path === '/partida/eventos') return json({ eventos: [] });
    if (path === '/partida/historial') return json({ historial: read(historyKey, []) });
    if (path === '/partida/accion/escanear-paciente' && method === 'POST') {
      if (Number(body.pacienteId) !== game.patient.id) return json({ error: 'Paciente no encontrado.' }, 404);
      game.patient.detectado = 1; saveGame(game);
      return json({ paciente: { ...game.patient, inspection: inspection(game.patient) } });
    }
    if (path === '/partida/accion/admitir-paciente' && method === 'POST') {
      const correct = !game.patient.es_anomalia;
      if (correct) game.patient.estado = 'en_atencion';
      else { game.sanity = Math.max(0, game.sanity - 40); game.errors += 1; game.coins = Math.max(0, game.coins - 3); advance(game); }
      saveGame(game);
      return json({ paciente_id: body.pacienteId, correcto: correct, cordura: game.sanity, game_over: game.sanity <= 0, reporte: game.sanity <= 0 ? finish(game) : null });
    }
    if (path === '/partida/accion/rechazar-paciente' && method === 'POST') {
      const correct = Boolean(game.patient.es_anomalia);
      if (correct) { game.rejected += 1; game.coins += 1; game.earned += 1; }
      else { game.errors += 1; game.sanity = Math.max(0, game.sanity - 20); game.coins = Math.max(0, game.coins - 1); }
      advance(game);
      return json({ correcto: correct, monedas_delta: correct ? 1 : -1, cordura: game.sanity, game_over: game.sanity <= 0, reporte: game.sanity <= 0 ? finish(game) : null });
    }
    if ((path === '/partida/accion/aplicar-tratamiento' || path === '/partida/accion/confirmar-tratamiento') && method === 'POST') {
      const selected = Array.isArray(body.medicamentosSeleccionados) ? body.medicamentosSeleccionados.map(item => String(item).toLowerCase()) : [];
      const correct = selected.length === 1 && selected[0] === game.patient.tratamiento_requerido;
      if (correct) { game.cured += 1; game.coins += 1; game.earned += 1; game.patient.salud = 100; advance(game); }
      else { game.errors += 1; game.sanity = Math.max(0, game.sanity - 8); game.coins = Math.max(0, game.coins - 1); game.patient.salud = Math.max(0, game.patient.salud - 25); saveGame(game); }
      const over = game.sanity <= 0 || (!correct && game.patient.salud <= 0);
      return json({ paciente_id: body.pacienteId, correcto: correct, estado: correct ? 'curado' : 'en_atencion', salud_paciente: correct ? 100 : game.patient.salud, monedas_delta: correct ? 1 : -1, cordura: game.sanity, game_over: over, reporte: over ? finish(game) : null });
    }
    if (path === '/partida/finalizar' && method === 'POST') return json({ reporte: finish(game) }, 201);
    if (path === '/partida/accion/usar-taser' && method === 'POST') return json({ anomalia_id: body.anomaliaId, estado: 'neutralizada' });
    if (path === '/partida/accion/comprar-clase' && method === 'POST') return json({ clase: { id: body.claseId, nombre: 'Especialista' }, monedas_actuales: game.coins });
    return json({ error: 'Ruta no encontrada.' }, 404);
  };
})();
