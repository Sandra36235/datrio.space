(function () {
  const STORE_KEY = 'datrio_async_final_demo_v2';
  const originalFetch = window.fetch.bind(window);
  const seed = () => ({
    users: [],
    sectors: [
      { id: 1, nombre: 'Archivo Boreal', nivel_contencion: 'Bajo', descripcion: 'Deposito de documentos recuperados.' },
      { id: 2, nombre: 'Corredor Delta', nivel_contencion: 'Alto', descripcion: 'Zona de transito con actividad anomala.' },
      { id: 3, nombre: 'Camara Umbral', nivel_contencion: 'Extremo', descripcion: 'Area restringida para personal especializado.' }
    ],
    investigators: [
      { id: 1, nombre: 'Elena Varga', codigo_empleado: 'ASY-104', especialidad: 'Exploracion' },
      { id: 2, nombre: 'Marco Vidal', codigo_empleado: 'ASY-217', especialidad: 'Contencion' },
      { id: 3, nombre: 'Lia Ferrer', codigo_empleado: 'ASY-309', especialidad: 'Analisis de campo' }
    ],
    equipment: [
      { id: 1, nombre: 'Radio de onda corta', descripcion: 'Comunicacion segura para zonas sin cobertura.', stock_disponible: 8, disponible_ahora: 8 },
      { id: 2, nombre: 'Traje de contencion', descripcion: 'Proteccion integral ante material desconocido.', stock_disponible: 5, disponible_ahora: 5 },
      { id: 3, nombre: 'Camara espectral', descripcion: 'Registro visual en multiples bandas.', stock_disponible: 4, disponible_ahora: 4 },
      { id: 4, nombre: 'Kit de muestras', descripcion: 'Instrumental sellado para recoleccion de campo.', stock_disponible: 10, disponible_ahora: 10 }
    ],
    tariffs: [
      { id: 1, nivel_riesgo: 'Bajo', compensacion_economica: 350, descripcion: 'Exposicion controlada y supervisada.' },
      { id: 2, nivel_riesgo: 'Moderado', compensacion_economica: 850, descripcion: 'Condiciones variables con protocolo reforzado.' },
      { id: 3, nivel_riesgo: 'Alto', compensacion_economica: 1800, descripcion: 'Operacion con peligro significativo.' },
      { id: 4, nivel_riesgo: 'Extremo', compensacion_economica: 3200, descripcion: 'Ingreso excepcional a zona critica.' }
    ],
    expeditions: [], nextId: 1
  });

  function read() {
    try { const saved = JSON.parse(localStorage.getItem(STORE_KEY)); return saved && saved.sectors ? saved : seed(); }
    catch (_) { return seed(); }
  }
  function save(data) { localStorage.setItem(STORE_KEY, JSON.stringify(data)); }
  function json(body, status = 200) {
    return Promise.resolve(new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } }));
  }
  function fail(message, status = 400) { return json({ error: message }, status); }
  function requestBody(options) {
    try { return options && options.body ? JSON.parse(options.body) : {}; }
    catch (_) { return {}; }
  }
  function currentUser(options, data) {
    const headers = options && options.headers;
    const value = headers && (headers.Authorization || headers.authorization);
    const token = String(value || '').replace(/^Bearer\s+/i, '');
    if (!token.startsWith('demo:')) return null;
    const email = decodeURIComponent(token.slice(5));
    return data.users.find((user) => user.email === email) || null;
  }
  function makeTicket(expedition) {
    return {
      codigo: expedition.codigo, estado: expedition.estado,
      sector: expedition.sector.nombre, nivel_contencion: expedition.sector.nivel_contencion,
      investigador: expedition.investigator.nombre,
      nivel_riesgo: expedition.tariff ? expedition.tariff.nivel_riesgo : null,
      compensacion_economica: expedition.tariff ? expedition.tariff.compensacion_economica : null,
      equipamiento: expedition.reservations.map((item) => `${item.nombre} x ${item.quantity}`).join(', ')
    };
  }

  window.fetch = function (input, options = {}) {
    let url;
    try { url = new URL(typeof input === 'string' ? input : input.url, window.location.href); }
    catch (_) { return originalFetch(input, options); }
    if (url.hostname !== 'localhost' || url.port !== '3307' || !url.pathname.startsWith('/api/')) return originalFetch(input, options);
    const path = url.pathname.slice(4) || '/';
    const body = requestBody(options);
    const data = read();

    if (path === '/auth/register') {
      const email = String(body.email || '').trim().toLowerCase();
      const password = String(body.password || '');
      if (!/^\S+@\S+\.\S+$/.test(email)) return fail('Escribe un correo valido.');
      if (password.length < 8) return fail('La contrasena debe tener al menos 8 caracteres.');
      if (data.users.some((user) => user.email === email)) return fail('Este correo ya esta registrado.');
      data.users.push({ email, password }); save(data);
      return json({ user: { email } }, 201);
    }
    if (path === '/auth/login') {
      const email = String(body.email || '').trim().toLowerCase();
      const user = data.users.find((item) => item.email === email && item.password === String(body.password || ''));
      if (!user) return fail('Correo o contrasena incorrectos.', 401);
      return json({ token: `demo:${encodeURIComponent(email)}` });
    }

    const user = currentUser(options, data);
    if (!user) return fail('Inicia sesion para continuar.', 401);
    if (path === '/auth/me') return json({ user: { email: user.email } });
    if (path === '/expeditions/bootstrap') {
      return json({ sectors: data.sectors, investigators: data.investigators, equipment: data.equipment, tariffs: data.tariffs });
    }
    if (path === '/expeditions' && String(options.method || 'GET').toUpperCase() === 'POST') {
      let sector = data.sectors.find((item) => item.id === Number(body.sectorId));
      if (body.newSector) {
        if (!String(body.newSector.nombre || '').trim()) return fail('Escribe el nombre del sector.');
        sector = { ...body.newSector, id: Date.now() }; data.sectors.push(sector);
      }
      const investigator = data.investigators.find((item) => item.id === Number(body.investigatorId));
      if (!sector || !investigator) return fail('Selecciona un sector y un investigador.');
      const expedition = {
        id: data.nextId++, codigo: `ASY-${new Date().getFullYear()}-${String(Date.now()).slice(-5)}`,
        sector, investigator, reservations: [], tariff: null, estado: 'Planificada'
      };
      data.expeditions.push(expedition); save(data);
      return json({ expedition }, 201);
    }

    const match = path.match(/^\/expeditions\/(\d+)\/(equipment|tariff|confirm|ticket)$/);
    if (!match) return fail('Ruta no disponible en esta demostracion.', 404);
    const expedition = data.expeditions.find((item) => item.id === Number(match[1]));
    if (!expedition) return fail('Planifica una expedicion primero.', 404);
    const action = match[2];
    if (action === 'ticket') return json({ ticket: makeTicket(expedition) });
    if (action === 'equipment') {
      const equipment = data.equipment.find((item) => item.id === Number(body.equipmentId));
      const quantity = Number(body.quantity);
      if (!equipment || !Number.isInteger(quantity) || quantity < 1 || quantity > equipment.disponible_ahora) return fail('La cantidad solicitada no esta disponible.');
      equipment.disponible_ahora -= quantity;
      const existing = expedition.reservations.find((item) => item.id === equipment.id);
      if (existing) existing.quantity += quantity;
      else expedition.reservations.push({ id: equipment.id, nombre: equipment.nombre, quantity });
      save(data); return json({ disponible_ahora: equipment.disponible_ahora });
    }
    if (action === 'tariff') {
      if (!expedition.reservations.length) return fail('Reserva al menos un equipo antes de continuar.');
      const tariff = data.tariffs.find((item) => item.id === Number(body.tariffId));
      if (!tariff) return fail('Selecciona un nivel de riesgo valido.');
      expedition.tariff = tariff; save(data); return json({ tariff });
    }
    if (!expedition.reservations.length || !expedition.tariff) return fail('Completa equipamiento y riesgo antes de confirmar.');
    expedition.estado = 'Confirmada'; save(data);
    return json({ expedition, ticket: makeTicket(expedition) });
  };
})();
