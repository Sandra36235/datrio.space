const catalog = {
  branches: [
    { id: 1, nombre: 'Karum de Ur', ruta_comercio: 'Ur · Dilmun' },
    { id: 2, nombre: 'Karum de Nippur', ruta_comercio: 'Nippur · Assur' },
    { id: 3, nombre: 'Karum de Babilonia', ruta_comercio: 'Babilonia · Mari' }
  ],
  products: [
    { id: 1, categoria: 'Textiles', nombre: 'Lana teñida' },
    { id: 2, categoria: 'Granos', nombre: 'Cebada' },
    { id: 3, categoria: 'Metales', nombre: 'Cobre de Dilmun' },
    { id: 4, categoria: 'Aceites', nombre: 'Aceite de sésamo' },
    { id: 5, categoria: 'Cerámica', nombre: 'Vasijas selladas' }
  ]
};

const customers = [
  { id: 1, nombre: 'Nabû-iddin', sello_personal: 'Sello de lapislázuli', direccion: 'Barrio del mercado, Ur' },
  { id: 2, nombre: 'Amat-Marduk', sello_personal: 'Sello de león alado', direccion: 'Puerta de Ishtar, Babilonia' }
];
const items = [];
const orders = [
  { id: 1, numero_tablilla: 'TBL-0001', fecha: new Date().toISOString().slice(0, 10), cliente: 'Amat-Marduk', sucursal: 'Karum de Babilonia', tipo_entrega: 'ALMACEN', direccion: 'Puerta de Ishtar, Babilonia', estado: 'REGISTRADO' }
];

const $ = selector => document.querySelector(selector);
const notice = (text = '') => { $('#app-message').textContent = text; };

function fill(select, rows, label) {
  select.innerHTML = '<option value="">Seleccione una opción</option>';
  rows.forEach(row => {
    const option = document.createElement('option');
    option.value = row.id;
    option.textContent = label(row);
    select.append(option);
  });
}

function renderCustomers() {
  fill($('#customer-select'), customers, customer => `${customer.nombre} · ${customer.sello_personal}`);
}

function renderCatalog() {
  fill($('#branch-select'), catalog.branches, branch => `${branch.nombre} · ${branch.ruta_comercio}`);
  fill($('#product-select'), catalog.products, product => `${product.categoria}: ${product.nombre}`);
  renderCustomers();
}

function renderItems() {
  $('#order-items').innerHTML = items.length
    ? items.map((item, index) => `<li><span>${item.nombre}</span><strong>${item.cantidad} unidades</strong><button type="button" data-remove="${index}">Quitar</button></li>`).join('')
    : '<li class="empty">Todavía no se agregaron productos.</li>';
}

function renderOrders() {
  $('#orders-body').innerHTML = orders.length
    ? orders.map(order => `<tr>
        <td>${order.numero_tablilla}</td><td>${order.fecha}</td><td>${order.cliente}</td><td>${order.sucursal}</td>
        <td>${order.tipo_entrega}</td><td><span class="status ${order.estado}">${order.estado}</span></td>
        <td>${order.estado === 'REGISTRADO' ? `<button data-order="${order.id}" data-action="ship">Enviar</button>` : order.estado === 'ENVIADO' ? `<button data-order="${order.id}" data-action="deliver">Entregar</button>` : 'Entregado'}</td>
      </tr>`).join('')
    : '<tr><td colspan="7">No hay tablillas registradas.</td></tr>';
}

function showPage(name) {
  document.querySelectorAll('.page').forEach(section => {
    section.hidden = section.id !== `page-${name}`;
    section.classList.toggle('active', !section.hidden);
  });
  document.querySelectorAll('.nav-button').forEach(button => {
    button.classList.toggle('active', button.dataset.page === name);
  });
  notice();
  if (name === 'deliveries') renderOrders();
}

document.querySelectorAll('.nav-button').forEach(button => {
  button.onclick = () => showPage(button.dataset.page);
});

$('#customer-form').onsubmit = event => {
  event.preventDefault();
  const data = Object.fromEntries(new FormData(event.currentTarget));
  customers.push({ id: Date.now(), nombre: data.nombre, sello_personal: data.selloPersonal, direccion: data.direccion });
  event.currentTarget.reset();
  renderCustomers();
  showPage('orders');
  notice('Cliente registrado y disponible para la nueva tablilla.');
};

$('#customer-select').onchange = event => {
  const customer = customers.find(row => Number(row.id) === Number(event.target.value));
  if (customer) $('#delivery-address').value = customer.direccion;
};

$('#add-item').onclick = () => {
  const productId = Number($('#product-select').value);
  const quantity = Number($('#quantity-input').value);
  const product = catalog.products.find(row => row.id === productId);
  if (!product || !Number.isInteger(quantity) || quantity < 1) {
    notice('Seleccione un producto y una cantidad válida.');
    return;
  }
  const existing = items.find(item => item.productoId === productId);
  if (existing) existing.cantidad += quantity;
  else items.push({ productoId: productId, cantidad: quantity, nombre: product.nombre });
  notice();
  renderItems();
};

$('#order-items').onclick = event => {
  if (event.target.dataset.remove !== undefined) {
    items.splice(Number(event.target.dataset.remove), 1);
    renderItems();
  }
};

$('#order-form').onsubmit = event => {
  event.preventDefault();
  if (!items.length) {
    notice('Agregue uno o más productos a la tablilla.');
    return;
  }
  const data = Object.fromEntries(new FormData(event.currentTarget));
  const customer = customers.find(row => Number(row.id) === Number(data.clienteId));
  const branch = catalog.branches.find(row => Number(row.id) === Number(data.sucursalId));
  if (!customer || !branch) {
    notice('Seleccione una sucursal y un cliente.');
    return;
  }
  const tablet = `TBL-${String(orders.length + 1).padStart(4, '0')}`;
  orders.unshift({
    id: Date.now(), numero_tablilla: tablet, fecha: data.fecha, cliente: customer.nombre,
    sucursal: branch.nombre, tipo_entrega: data.tipoEntrega, direccion: data.direccionEntrega, estado: 'REGISTRADO'
  });
  event.currentTarget.reset();
  $('#order-date').value = new Date().toISOString().slice(0, 10);
  items.length = 0;
  renderItems();
  showPage('deliveries');
  notice(`Tablilla ${tablet} registrada.`);
};

$('#orders-body').onclick = event => {
  const id = Number(event.target.dataset.order);
  const order = orders.find(row => row.id === id);
  if (!order) return;
  order.estado = event.target.dataset.action === 'ship' ? 'ENVIADO' : 'ENTREGADO';
  renderOrders();
};

$('#refresh-orders').textContent = 'Restablecer';
$('#refresh-orders').onclick = () => location.reload();
$('#logout-button').textContent = 'Volver a Datrio';
$('#logout-button').onclick = () => { location.href = '/'; };
$('#welcome-text').textContent = 'Escriba: Ernesto Ballon · Demo';
$('#order-date').value = new Date().toISOString().slice(0, 10);
$('#login-view').hidden = true;
$('#app-view').hidden = false;
renderCatalog();
renderItems();
renderOrders();
showPage('clients');

