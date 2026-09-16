(() => {
  const apiPrefix = `${location.origin}/api`;
  const productsKey = 'nativas_burgers_products_v3';
  const ticketsKey = 'nativas_burgers_tickets_v3';
  const realFetch = window.fetch.bind(window);
  const defaults = [
    { id: 1, tipo: 'HAMBURGUESA', nombre: 'Hamburguesa Simple', categoria: 'Hamburguesas', precio: 25, stock: null, imagen: 'assets/menu/HAMBURGUESA SIMPLE.jpg' },
    { id: 2, tipo: 'PRODUCTO', nombre: 'Papas Fritas', categoria: 'Complementos', precio: 15, stock: 30, imagen: 'assets/menu/PAPAS GRITAS.jpg' },
    { id: 3, tipo: 'PRODUCTO', nombre: 'Aros de Cebolla', categoria: 'Complementos', precio: 18, stock: 18, imagen: 'assets/menu/AROS DE CEBOLLA.jpg' },
    { id: 4, tipo: 'PRODUCTO', nombre: 'Coca-Cola 500 ml', categoria: 'Bebidas', precio: 10, stock: 35, imagen: 'assets/menu/COCACOLA 500ML.jpg' },
    { id: 5, tipo: 'PRODUCTO', nombre: 'Coca-Cola 1.5 L', categoria: 'Bebidas', precio: 18, stock: 20, imagen: 'assets/menu/COCACOLA 1.5L.jpg' },
    { id: 6, tipo: 'PRODUCTO', nombre: 'Fanta 500 ml', categoria: 'Bebidas', precio: 10, stock: 24, imagen: 'assets/menu/FANTA 500 ML.jpg' },
    { id: 7, tipo: 'PRODUCTO', nombre: 'Sprite 500 ml', categoria: 'Bebidas', precio: 10, stock: 22, imagen: 'assets/menu/SPRITE 500ML.jpg' },
    { id: 8, tipo: 'PRODUCTO', nombre: 'Agua', categoria: 'Bebidas', precio: 7, stock: 40, imagen: 'assets/menu/AGUA.jpg' },
    { id: 9, tipo: 'PRODUCTO', nombre: 'Queso extra', categoria: 'Ingredientes', precio: 5, stock: 25, imagen: 'assets/menu/QUESO.jpg' },
    { id: 10, tipo: 'PRODUCTO', nombre: 'Tocino extra', categoria: 'Ingredientes', precio: 7, stock: 20, imagen: 'assets/menu/TOCINO.jpg' },
    { id: 11, tipo: 'PRODUCTO', nombre: 'Ketchup', categoria: 'Salsas', precio: 3, stock: 30, imagen: 'assets/menu/KETCHUP.jpg' },
    { id: 12, tipo: 'PRODUCTO', nombre: 'Mayonesa', categoria: 'Salsas', precio: 3, stock: 30, imagen: 'assets/menu/MAYONESA.jpg' }
  ];
  const read = (key, fallback) => {
    try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; }
  };
  const write = (key, value) => localStorage.setItem(key, JSON.stringify(value));
  const json = (body, status = 200) => Promise.resolve(new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' }
  }));
  const requestBody = options => {
    try { return JSON.parse(options?.body || '{}'); } catch { return {}; }
  };
  const tokenEmail = options => {
    const auth = new Headers(options?.headers || {}).get('Authorization') || '';
    return auth.startsWith('Bearer nativas:') ? decodeURIComponent(auth.slice(15)) : '';
  };
  const products = () => read(productsKey, defaults.map(item => ({ ...item })));
  const saveProducts = value => write(productsKey, value);
  const tickets = () => read(ticketsKey, []);
  const ticketNumber = count => `T-${String(count).padStart(6, '0')}`;

  window.fetch = async (input, options = {}) => {
    const url = typeof input === 'string' ? input : input.url;
    if (!url.startsWith(apiPrefix)) return realFetch(input, options);
    const path = url.slice(apiPrefix.length).split('?')[0];
    const method = String(options.method || 'GET').toUpperCase();
    const body = requestBody(options);

    if ((path === '/auth/login' || path === '/login') && method === 'POST') {
      const email = String(body.email || '').trim().toLowerCase();
      if (!email.includes('@') || String(body.password || '').length < 6) {
        return json({ success: false, error: 'Correo o contraseña incorrectos.' }, 401);
      }
      return json({ success: true, token: `nativas:${encodeURIComponent(email)}` });
    }

    const email = tokenEmail(options);
    if (!email) return json({ success: false, error: 'Sesión no válida.' }, 401);
    if (path === '/auth/me') return json({ success: true, user: { id: 1, email, created_at: new Date().toISOString() } });
    if ((path === '/productos' || path === '/products') && method === 'GET') return json(products());

    if (path === '/products' && method === 'POST') {
      const list = products();
      const item = {
        id: Math.max(0, ...list.map(product => Number(product.id))) + 1,
        tipo: 'PRODUCTO',
        nombre: String(body.nombre || '').trim(),
        categoria: String(body.categoria || '').trim(),
        precio: Number(body.precio),
        stock: Number(body.stock),
        imagen: body.imagen || null
      };
      if (!item.nombre || !item.categoria || item.precio <= 0 || item.stock < 0) return json({ error: 'Completa los datos correctamente.' }, 400);
      list.push(item);
      saveProducts(list);
      return json({ success: true, id: item.id, message: 'Producto registrado.' }, 201);
    }

    if ((path === '/ventas' || path === '/sales') && method === 'POST') {
      if (!Array.isArray(body.items) || !body.items.length) return json({ error: 'Agrega al menos un producto a la venta.' }, 400);
      const list = products();
      let total = 0;
      const details = [];
      for (const requested of body.items) {
        const item = list.find(product => Number(product.id) === Number(requested.id) && product.tipo === requested.tipo);
        const quantity = Number(requested.cantidad);
        if (!item || !Number.isInteger(quantity) || quantity < 1) return json({ error: 'Producto o cantidad inválida.' }, 400);
        if (item.stock !== null && Number(item.stock) < quantity) return json({ error: `Stock insuficiente para ${item.nombre}.` }, 409);
        if (item.stock !== null) item.stock -= quantity;
        const subtotal = Number(item.precio) * quantity;
        total += subtotal;
        details.push({ nombre: item.nombre, cantidad: quantity, precio_unitario: Number(item.precio), subtotal });
      }
      const history = tickets();
      const now = new Date();
      const number = ticketNumber(history.length + 1);
      const sale = {
        id: history.length + 1,
        numero_ticket: number,
        fecha: now.toLocaleDateString('es-BO'),
        hora: now.toLocaleTimeString('es-BO'),
        total,
        metodo_pago: body.metodo_pago,
        estado: 'Completada',
        productos: details
      };
      history.unshift(sale);
      saveProducts(list);
      write(ticketsKey, history);
      return json({ success: true, id: sale.id, ticket: number, fecha: now.toISOString(), metodo_pago: sale.metodo_pago, total, productos: details }, 201);
    }
    if (path === '/sales' && method === 'GET') return json(tickets());
    return json({ success: false, error: 'Ruta no encontrada.' }, 404);
  };
})();
