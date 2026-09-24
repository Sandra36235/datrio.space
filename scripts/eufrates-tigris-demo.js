(function () {
  const STORE_KEY = 'datrio_eufrates_final_v3';
  const DEMO_EMAIL = 'demo.karum.e7786c75@ejemplo.com';
  const DEMO_PASSWORD = 'KarumDemo2026!';
  const originalFetch = window.fetch.bind(window);
  const today = () => new Date().toISOString().slice(0, 10);

  const seed = () => ({
    users: [{ id: 1, email: DEMO_EMAIL, password: DEMO_PASSWORD }],
    branches: [
      { id: 1, nombre: 'Karum de Ur', ruta_comercio: 'Ur - Dilmun', direccion: 'Distrito del puerto, Ur' },
      { id: 2, nombre: 'Karum de Nippur', ruta_comercio: 'Nippur - Assur', direccion: 'Camino de los templos, Nippur' },
      { id: 3, nombre: 'Karum de Babilonia', ruta_comercio: 'Babilonia - Mari', direccion: 'Puerta de Ishtar, Babilonia' }
    ],
    categories: [
      { id: 1, nombre: 'Textiles' }, { id: 2, nombre: 'Granos' },
      { id: 3, nombre: 'Metales' }, { id: 4, nombre: 'Aceites' }, { id: 5, nombre: 'Ceramica' }
    ],
    products: [
      { id: 1, categoria: 'Textiles', nombre: 'Lana tenida', sku: 'TEX-001', precio: 45 },
      { id: 2, categoria: 'Granos', nombre: 'Cebada de Ur', sku: 'GRA-001', precio: 18 },
      { id: 3, categoria: 'Metales', nombre: 'Cobre de Dilmun', sku: 'MET-001', precio: 120 },
      { id: 4, categoria: 'Aceites', nombre: 'Aceite de sesamo', sku: 'ACE-001', precio: 32 },
      { id: 5, categoria: 'Ceramica', nombre: 'Vasija sellada', sku: 'CER-001', precio: 26 }
    ],
    customers: [
      { id: 1, nombre: 'Nabu-iddin', sello_personal: 'Sello de lapislazuli', direccion: 'Barrio del mercado, Ur' },
      { id: 2, nombre: 'Amat-Marduk', sello_personal: 'Sello de leon alado', direccion: 'Puerta de Ishtar, Babilonia' }
    ],
    orders: [
      { id: 1, numero_tablilla: 'TAB-000001', fecha: today(), cliente: 'Amat-Marduk', sucursal: 'Karum de Babilonia', tipo_entrega: 'ALMACEN', direccion_entrega: 'Puerta de Ishtar, Babilonia', estado: 'REGISTRADO' }
    ],
    nextUserId: 2, nextCustomerId: 3, nextOrderId: 2
  });

  function read() {
    try {
      const data = JSON.parse(localStorage.getItem(STORE_KEY));
      return data && data.branches ? data : seed();
    } catch (_) { return seed(); }
  }
  function save(data) { localStorage.setItem(STORE_KEY, JSON.stringify(data)); }
  function response(body, status = 200) {
    return Promise.resolve(new Response(JSON.stringify(body), {
      status, headers: { 'Content-Type': 'application/json' }
    }));
  }
  function fail(error, status = 400) { return response({ error }, status); }
  function bodyOf(options) {
    try { return options && options.body ? JSON.parse(options.body) : {}; }
    catch (_) { return {}; }
  }
  function authUser(options, data) {
    const headers = options && options.headers;
    const value = headers && (headers.authorization || headers.Authorization);
    const token = String(value || '').replace(/^Bearer\s+/i, '');
    if (!token.startsWith('karum-demo:')) return null;
    const email = decodeURIComponent(token.slice(11));
    return data.users.find((user) => user.email === email) || null;
  }

  window.fetch = function (input, options = {}) {
    let url;
    try { url = new URL(typeof input === 'string' ? input : input.url, window.location.href); }
    catch (_) { return originalFetch(input, options); }
    if (url.hostname !== 'localhost' || url.port !== '3000' || !url.pathname.startsWith('/api/')) {
      return originalFetch(input, options);
    }

    const path = url.pathname.slice(4) || '/';
    const method = String(options.method || 'GET').toUpperCase();
    const body = bodyOf(options);
    const data = read();

    if (path === '/auth/register' && method === 'POST') {
      const email = String(body.email || '').trim().toLowerCase();
      const password = String(body.password || '');
      if (!/^\S+@\S+\.\S+$/.test(email)) return fail('El email no tiene un formato valido.');
      if (password.length < 8) return fail('La contrasena debe tener al menos 8 caracteres.');
      if (data.users.some((user) => user.email === email)) return fail('Ya existe una cuenta con ese email.', 409);
      data.users.push({ id: data.nextUserId++, email, password });
      save(data);
      return response({ user: { id: data.nextUserId - 1, email } }, 201);
    }
    if (path === '/auth/login' && method === 'POST') {
      const email = String(body.email || '').trim().toLowerCase();
      const user = data.users.find((item) => item.email === email && item.password === String(body.password || ''));
      if (!user) return fail('Email o contrasena incorrectos.', 401);
      return response({ token: 'karum-demo:' + encodeURIComponent(email), tokenType: 'Bearer', expiresIn: 'demo' });
    }

    const user = authUser(options, data);
    if (!user) return fail('Sesion no valida. Ingrese nuevamente.', 401);
    if (path === '/auth/me') return response({ user: { id: user.id, email: user.email, created_at: today() } });
    if (path === '/catalog' && method === 'GET') {
      return response({ branches: data.branches, categories: data.categories, products: data.products });
    }
    if (path === '/catalog/customers' && method === 'GET') return response({ customers: data.customers });
    if (path === '/catalog/customers' && method === 'POST') {
      const nombre = String(body.nombre || '').trim();
      const sello = String(body.selloPersonal || '').trim();
      const direccion = String(body.direccion || '').trim();
      if (!nombre || !sello || !direccion) return fail('Nombre, sello personal y direccion son obligatorios.');
      const customer = { id: data.nextCustomerId++, nombre, sello_personal: sello, direccion };
      data.customers.push(customer);
      save(data);
      return response({ customer }, 201);
    }
    if (path === '/orders' && method === 'GET') return response({ orders: data.orders });
    if (path === '/orders' && method === 'POST') {
      const branch = data.branches.find((item) => item.id === Number(body.sucursalId));
      const customer = data.customers.find((item) => item.id === Number(body.clienteId));
      if (!branch || !customer || !body.fecha || !body.direccionEntrega ||
          !['ALMACEN', 'DOMICILIO'].includes(body.tipoEntrega) || !Array.isArray(body.items) || !body.items.length) {
        return fail('Complete la tablilla, el destino y las mercancias.');
      }
      const id = data.nextOrderId++;
      const order = {
        id, numero_tablilla: 'TAB-' + String(id).padStart(6, '0'), fecha: body.fecha,
        cliente: customer.nombre, sucursal: branch.nombre, tipo_entrega: body.tipoEntrega,
        direccion_entrega: body.direccionEntrega, estado: 'REGISTRADO', items: body.items
      };
      data.orders.unshift(order);
      save(data);
      return response({ order: { id, numeroTablilla: order.numero_tablilla, estado: order.estado } }, 201);
    }

    const action = path.match(/^\/orders\/(\d+)\/(ship|deliver)$/);
    if (action && method === 'POST') {
      const order = data.orders.find((item) => item.id === Number(action[1]));
      if (!order) return fail('Pedido no encontrado.', 404);
      order.estado = action[2] === 'ship' ? 'ENVIADO' : 'ENTREGADO';
      save(data);
      return response({ status: order.estado });
    }
    return fail('Ruta no disponible en esta demostracion.', 404);
  };
})();
