(() => {
  const prefix = '/__cineuphoria_demo__';
  const realFetch = window.fetch.bind(window);
  const usersKey = 'cineuphoria_demo_users_v1';
  const salesKey = 'cineuphoria_demo_sales_v1';
  const soldKey = 'cineuphoria_demo_sold_v1';
  const movieNames = [
    ['Horizonte Final', 148, 'B'], ['La Ultima Risa', 104, 'A'],
    ['Sombras en la Casa', 116, 'B'], ['Ecos del Pasado', 128, 'B'],
    ['Aventura Pixel', 98, 'A'], ['Planeta Aurora', 142, 'A'],
    ['Cartas de Invierno', 119, 'B'], ['El Tesoro Perdido', 125, 'A'],
    ['Amor en Cochabamba', 112, 'B'], ['Ruta de los Exploradores', 121, 'A'],
    ['La Cena Perfecta', 106, 'A'], ['Guardianes del Valle', 134, 'A'],
    ['El Misterio del Lago', 117, 'B'], ['Código Cochabamba', 109, 'B'],
    ['Una Noche de Verano', 101, 'A'], ['Viaje a las Estrellas', 139, 'A'],
    ['El Último Guardián', 132, 'B'], ['Pequeñas Aventuras', 96, 'A'],
    ['Historias de Barrio', 114, 'A'], ['La Casa del Bosque', 123, 'B'],
    ['Destino Infinito', 145, 'B'], ['Amor Bajo la Lluvia', 108, 'A'],
    ['El Gran Escape', 126, 'B']
  ];
  const movies = movieNames.map(([titulo, duracionMinutos, clasificacion], i) => ({ id: i + 1, titulo, duracionMinutos, clasificacion }));
  const products = [
    { id: 1, nombre: 'Canguil grande', precio: 22 },
    { id: 2, nombre: 'Gaseosa', precio: 12 },
    { id: 3, nombre: 'Combo Cineuphoria', precio: 32 },
    { id: 4, nombre: 'Nachos con queso', precio: 20 },
    { id: 5, nombre: 'Chocolate', precio: 10 }
  ];
  const payments = [{ id: 1, nombre: 'Tarjeta' }, { id: 2, nombre: 'QR' }, { id: 3, nombre: 'Efectivo' }];
  const read = (key, fallback) => { try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; } };
  const write = (key, value) => localStorage.setItem(key, JSON.stringify(value));
  const json = (body, status = 200) => Promise.resolve(new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } }));
  const bodyOf = options => { try { return JSON.parse(options?.body || '{}'); } catch { return {}; } };
  const tokenEmail = options => {
    const auth = new Headers(options?.headers || {}).get('Authorization') || '';
    return auth.startsWith('Bearer cineuphoria:') ? decodeURIComponent(auth.slice(19)) : '';
  };
  const showtimes = movieId => {
    const base = new Date();
    base.setHours(17, 30, 0, 0);
    return [0, 1, 2].map((offset, i) => {
      const date = new Date(base);
      date.setDate(date.getDate() + offset);
      date.setHours(17 + i * 2, i === 1 ? 15 : 30);
      return { id: movieId * 10 + i + 1, precio: 35 + (i * 5), fechaHora: date.toISOString(), sala: `Sala ${((movieId + i) % 4) + 1}`, estado: 'Programada' };
    });
  };
  const seatsFor = showtimeId => {
    const sold = new Set(read(soldKey, {})[showtimeId] || []);
    return ['A', 'B', 'C', 'D', 'E', 'F'].flatMap((fila, row) =>
      Array.from({ length: 8 }, (_, col) => {
        const id = showtimeId * 100 + row * 8 + col + 1;
        const preset = (row + col + showtimeId) % 13 === 0;
        return { id, fila, numero: col + 1, estado: sold.has(id) || preset ? 'VENDIDO' : 'DISPONIBLE' };
      })
    );
  };

  window.fetch = (input, options = {}) => {
    const raw = typeof input === 'string' ? input : input.url;
    const url = new URL(raw, location.href);
    if (!url.pathname.startsWith(prefix)) return realFetch(input, options);
    const path = url.pathname.slice(prefix.length) || '/';
    const method = (options.method || 'GET').toUpperCase();

    if (path === '/api/catalog/movies') return json(movies);
    if (path === '/api/catalog/products') return json(products);
    if (path === '/api/catalog/payments') return json(payments);
    if (path === '/api/catalog/showtimes') return json(showtimes(Number(url.searchParams.get('movieId')) || 1));
    const seatMatch = path.match(/^\/api\/catalog\/showtimes\/(\d+)\/seats$/);
    if (seatMatch) return json(seatsFor(Number(seatMatch[1])));

    if (path === '/api/auth/register' && method === 'POST') {
      const { email = '', password = '' } = bodyOf(options);
      if (!email.includes('@') || password.length < 8) return json({ error: 'Usa un correo válido y una contraseña de al menos 8 caracteres.' }, 400);
      const users = read(usersKey, {});
      users[email.toLowerCase()] = password;
      write(usersKey, users);
      return json({ user: { id: Object.keys(users).length, email: email.toLowerCase(), created_at: new Date().toISOString() } }, 201);
    }
    if (path === '/api/auth/login' && method === 'POST') {
      const { email = '', password = '' } = bodyOf(options);
      if (!email.includes('@') || password.length < 8) return json({ error: 'Correo o contraseña inválidos.' }, 401);
      return json({ token: `cineuphoria:${encodeURIComponent(email.toLowerCase())}`, tokenType: 'Bearer', expiresIn: '1h' });
    }
    if (path === '/api/auth/me') {
      const email = tokenEmail(options);
      return email ? json({ user: { id: 1, email, created_at: new Date().toISOString() } }) : json({ error: 'Authentication token is required' }, 401);
    }
    if (path === '/api/sales' && method === 'POST') {
      const email = tokenEmail(options);
      if (!email) return json({ error: 'Authentication token is required' }, 401);
      const order = bodyOf(options);
      const seatIds = [...new Set((order.asientos || []).map(Number))];
      if (!order.funcionId || !seatIds.length || !order.metodoPagoId) return json({ error: 'Selecciona función, asientos y método de pago.' }, 400);
      const soldMap = read(soldKey, {});
      const occupied = new Set(soldMap[order.funcionId] || []);
      if (seatIds.some(id => occupied.has(id))) return json({ error: 'Uno de los asientos acaba de ser vendido. Elige otro.' }, 409);
      seatIds.forEach(id => occupied.add(id));
      soldMap[order.funcionId] = [...occupied];
      write(soldKey, soldMap);
      const price = showtimes(Math.floor(Number(order.funcionId) / 10)).find(s => s.id === Number(order.funcionId))?.precio || 35;
      const extras = (order.productos || []).reduce((sum, item) => sum + (products.find(p => p.id === Number(item.id))?.precio || 0) * Number(item.cantidad || 0), 0);
      const sales = read(salesKey, []);
      const sale = { saleId: sales.length + 1, total: price * seatIds.length + extras, email, ...order, createdAt: new Date().toISOString() };
      sales.push(sale);
      write(salesKey, sales);
      return json({ saleId: sale.saleId, total: sale.total, message: 'Venta registrada correctamente.' }, 201);
    }
    return json({ error: 'Ruta no disponible.' }, 404);
  };
})();
