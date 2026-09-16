(() => {
  const prefix = '/__saltenas_demo__';
  const productsKey = 'intina_products_v3';
  const salesKey = 'intina_sales_v3';
  const realFetch = window.fetch.bind(window);
  const seedProducts = [
    [1, 'Salteña de pollo/dulce', 'Salteña', 7, 30], [2, 'Salteña de carne', 'Salteña', 7, 28],
    [3, 'Salteña mixta', 'Salteña', 8, 20], [4, 'Salteña picante', 'Salteña', 7, 25],
    [5, 'Empanada de queso', 'Empanada', 6, 18], [6, 'Empanada de pollo', 'Empanada', 6, 19],
    [7, 'Pan', 'Pan', 1, 41], [8, 'Coca-Cola Personal 300 ml', 'Gaseosa', 4, 18],
    [9, 'Coca-Cola Familiar 2 L', 'Gaseosa', 12, 9], [10, 'Fanta Personal 300 ml', 'Gaseosa', 4, 20],
    [11, 'Fanta Familiar 2 L', 'Gaseosa', 12, 10], [12, 'Mocochinchi', 'Jugo', 5, 13],
    [13, 'Canela', 'Jugo', 5, 14], [14, 'Cebada', 'Jugo', 5, 13],
    [15, 'Salteña de fricase', 'Salteña', 8, 19], [16, 'Salteña extra-picante', 'Salteña', 8, 20]
  ].map(([Producto_ID, Nombre, Categoria, Precio_Venta, Stock]) => ({ Producto_ID, Nombre, Categoria, Precio_Venta, Stock, Activo: 1 }));

  const read = (key, fallback) => {
    try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; }
  };
  const write = (key, value) => localStorage.setItem(key, JSON.stringify(value));
  const products = () => read(productsKey, seedProducts.map(item => ({ ...item })));
  const sales = () => read(salesKey, []);
  const json = (body, status = 200) => Promise.resolve(new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' }
  }));
  const bodyOf = options => {
    try { return JSON.parse(options?.body || '{}'); } catch { return {}; }
  };
  const emailOf = options => {
    const auth = new Headers(options?.headers || {}).get('Authorization') || '';
    return auth.startsWith('Bearer intina:') ? decodeURIComponent(auth.slice(14)) : '';
  };
  const localDate = date => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };
  const localTime = date => `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}:${String(date.getSeconds()).padStart(2, '0')}`;
  const saleSummary = sale => ({
    Venta_ID: sale.Venta_ID, Fecha: sale.Fecha, Hora: sale.Hora, Total: sale.Total,
    Metodo_Pago: sale.Metodo_Pago, NIT: sale.NIT, Razon_Social: sale.Razon_Social,
    Lineas: sale.items.length
  });
  const filterSales = (list, url) => {
    const payment = url.searchParams.get('metodo_pago');
    const query = (url.searchParams.get('q') || '').toLowerCase();
    const type = url.searchParams.get('type') || '';
    const mode = url.searchParams.get('mode') || '';
    const today = new Date();
    return list.filter(sale => {
      if (payment && payment !== 'todos' && sale.Metodo_Pago !== payment) return false;
      if (query && !`${sale.Venta_ID} ${sale.NIT} ${sale.Razon_Social}`.toLowerCase().includes(query)) return false;
      const date = sale.Fecha;
      if (type === 'rango') {
        const from = url.searchParams.get('from'); const to = url.searchParams.get('to');
        if (from && date < from) return false; if (to && date > to) return false;
      }
      if (type === 'dia') {
        if (mode === 'hoy' && date !== localDate(today)) return false;
        if (mode === 'ayer') { const yesterday = new Date(today); yesterday.setDate(today.getDate() - 1); if (date !== localDate(yesterday)) return false; }
        if (mode === 'custom' && url.searchParams.get('date') && date !== url.searchParams.get('date')) return false;
      }
      if (type === 'mes') {
        const month = url.searchParams.get('month') || localDate(today).slice(0, 7);
        if (!date.startsWith(month)) return false;
      }
      if (type === 'ano') {
        const year = url.searchParams.get('year') || String(today.getFullYear());
        if (!date.startsWith(year)) return false;
      }
      return true;
    });
  };
  const dashboard = list => {
    const today = localDate(new Date());
    const todays = list.filter(sale => sale.Fecha === today);
    const payments = Object.fromEntries(['Efectivo', 'QR', 'Tarjeta'].map(method => [method, { total: 0, cantidadPagos: 0 }]));
    const counts = new Map();
    todays.forEach(sale => {
      payments[sale.Metodo_Pago].total += Number(sale.Total);
      payments[sale.Metodo_Pago].cantidadPagos += 1;
      sale.items.forEach(item => counts.set(item.Nombre, (counts.get(item.Nombre) || 0) + Number(item.Cantidad)));
    });
    const ranked = [...counts.entries()].sort((a, b) => b[1] - a[1]);
    const days = Array.from({ length: 7 }, (_, index) => {
      const date = new Date(); date.setDate(date.getDate() - (6 - index)); const iso = localDate(date);
      const daySales = list.filter(sale => sale.Fecha === iso);
      return { fecha: iso, total: daySales.reduce((sum, sale) => sum + Number(sale.Total), 0), cantidadPedidos: daySales.length };
    });
    return {
      ventasHoy: { total: todays.reduce((sum, sale) => sum + Number(sale.Total), 0), cantidadPedidos: todays.length },
      pagosPorMetodo: payments,
      productoMasVendido: ranked[0] ? { nombre: ranked[0][0], unidades: ranked[0][1] } : null,
      ventasUltimosDias: days,
      productosMasVendidos: ranked.slice(0, 5).map(([nombre, unidades]) => ({ nombre, unidades })),
      ventanaProductosDias: 30
    };
  };

  window.fetch = async (input, options = {}) => {
    const rawUrl = typeof input === 'string' ? input : input.url;
    const url = new URL(rawUrl, location.href);
    if (url.pathname !== prefix && !url.pathname.startsWith(`${prefix}/`)) return realFetch(input, options);
    const path = url.pathname.slice(prefix.length) || '/';
    const method = String(options.method || 'GET').toUpperCase();
    const body = bodyOf(options);

    if (path === '/auth/login' && method === 'POST') {
      const email = String(body.email || '').trim().toLowerCase();
      if (!email.includes('@') || String(body.password || '').length < 6) return json({ message: 'Correo o contraseña incorrectos.' }, 401);
      return json({ token: `intina:${encodeURIComponent(email)}` });
    }
    const email = emailOf(options);
    if (!email) return json({ message: 'Sesión no válida.' }, 401);
    if (path === '/auth/me') return json({ user: { id: 1, email, created_at: new Date().toISOString() } });
    if (path === '/productos' && method === 'GET') return json({ productos: products().filter(item => item.Activo) });

    if (path === '/ventas' && method === 'POST') {
      if (!Array.isArray(body.items) || !body.items.length) return json({ message: 'Agrega productos al pedido.' }, 400);
      const catalog = products();
      const detail = [];
      let total = 0;
      for (const requested of body.items) {
        const product = catalog.find(item => Number(item.Producto_ID) === Number(requested.id));
        const quantity = Number(requested.quantity);
        if (!product || !Number.isInteger(quantity) || quantity < 1) return json({ message: 'Producto o cantidad inválida.' }, 400);
        if (Number(product.Stock) < quantity) return json({ message: `No hay suficiente stock de ${product.Nombre}. Stock disponible: ${product.Stock}.` }, 400);
        product.Stock -= quantity; product.Activo = product.Stock > 0 ? 1 : 0;
        const subtotal = Number(product.Precio_Venta) * quantity; total += subtotal;
        detail.push({ Producto_ID: product.Producto_ID, Nombre: product.Nombre, Cantidad: quantity, Precio_Unitario: Number(product.Precio_Venta), Subtotal: subtotal });
      }
      const history = sales(); const now = new Date();
      const sale = { Venta_ID: Math.max(0, ...history.map(item => Number(item.Venta_ID))) + 1, Fecha: localDate(now), Hora: localTime(now), Total: total, Metodo_Pago: body.metodo_pago, NIT: String(body.nit || '').trim() || '0', Razon_Social: String(body.razon_social || '').trim() || 'Sin Nombre', items: detail };
      history.unshift(sale); write(productsKey, catalog); write(salesKey, history);
      return json({ message: 'Venta registrada correctamente.', venta: saleSummary(sale), items: detail.map(item => ({ nombre: item.Nombre, cantidad: item.Cantidad, precio_unitario: item.Precio_Unitario, subtotal: item.Subtotal })) }, 201);
    }
    if (path === '/ventas' && method === 'GET') return json({ ventas: filterSales(sales(), url).map(saleSummary) });
    const saleMatch = path.match(/^\/ventas\/(\d+)$/);
    if (saleMatch && method === 'GET') {
      const sale = sales().find(item => Number(item.Venta_ID) === Number(saleMatch[1]));
      if (!sale) return json({ message: 'Venta no encontrada.' }, 404);
      return json({ venta: saleSummary(sale), items: sale.items });
    }
    if (path === '/dashboard' && method === 'GET') return json(dashboard(sales()));
    return json({ message: 'Ruta no encontrada.' }, 404);
  };
})();
