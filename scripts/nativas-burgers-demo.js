const state = {
  products: [
    { id: 1, nombre: 'Hamburguesa Nativa', categoria: 'Hamburguesas', precio: 32, stock: 18 },
    { id: 2, nombre: 'Doble Andina', categoria: 'Hamburguesas', precio: 42, stock: 12 },
    { id: 3, nombre: 'Papas rústicas', categoria: 'Acompañamientos', precio: 16, stock: 25 },
    { id: 4, nombre: 'Limonada de la casa', categoria: 'Bebidas', precio: 12, stock: 30 },
    { id: 5, nombre: 'Brownie con helado', categoria: 'Postres', precio: 18, stock: 10 }
  ],
  cart: [],
  tickets: []
};

const $ = selector => document.querySelector(selector);
const money = value => `Bs ${Number(value).toFixed(2)}`;

function message(element, text = '', success = false) {
  element.textContent = text;
  element.style.color = success ? '#387047' : '#b42518';
}

function showView(name) {
  document.querySelectorAll('.view').forEach(element => {
    element.hidden = element.id !== `${name}-view`;
  });
  document.querySelectorAll('.nav').forEach(button => {
    button.classList.toggle('active', button.dataset.view === name);
  });
  $('#title').textContent = {
    sale: 'Nueva venta',
    products: 'Productos',
    tickets: 'Tickets registrados'
  }[name];
  if (name === 'tickets') renderTickets();
}

function renderProducts() {
  const query = $('#search').value.toLocaleLowerCase('es');
  const products = state.products.filter(product =>
    `${product.nombre} ${product.categoria}`.toLocaleLowerCase('es').includes(query)
  );
  $('#products').innerHTML = products.map(product => `
    <article class="product">
      <p>${product.categoria}</p>
      <h3>${product.nombre}</h3>
      <small>Stock: ${product.stock}</small>
      <footer>
        <strong class="price">${money(product.precio)}</strong>
        <button class="add" data-id="${product.id}" ${product.stock < 1 ? 'disabled' : ''} aria-label="Agregar ${product.nombre}">+</button>
      </footer>
    </article>`).join('');
  $('#catalog-empty').hidden = Boolean(products.length);
  document.querySelectorAll('.add').forEach(button => {
    button.onclick = () => addProduct(Number(button.dataset.id));
  });
}

function renderTable() {
  $('#products-table').innerHTML = `
    <table>
      <thead><tr><th>Producto</th><th>Categoría</th><th>Precio</th><th>Stock</th></tr></thead>
      <tbody>${state.products.map(product => `
        <tr><td>${product.nombre}</td><td>${product.categoria}</td><td>${money(product.precio)}</td><td>${product.stock}</td></tr>`).join('')}</tbody>
    </table>`;
}

function addProduct(id) {
  const product = state.products.find(item => item.id === id);
  const item = state.cart.find(entry => entry.id === id);
  const quantity = item ? item.quantity : 0;
  if (!product || quantity >= product.stock) {
    message($('#sale-message'), 'No queda más stock disponible para este producto.');
    return;
  }
  if (item) item.quantity += 1;
  else state.cart.push({ ...product, quantity: 1 });
  message($('#sale-message'));
  renderCart();
}

function changeQuantity(id, delta) {
  const item = state.cart.find(entry => entry.id === id);
  const product = state.products.find(entry => entry.id === id);
  if (!item || !product) return;
  item.quantity = Math.min(product.stock, item.quantity + delta);
  if (item.quantity < 1) state.cart = state.cart.filter(entry => entry.id !== id);
  renderCart();
}

function renderCart() {
  $('#cart-items').innerHTML = state.cart.map(item => `
    <div class="cart-item">
      <div><b>${item.nombre}</b><br><small>${money(item.precio)} c/u</small></div>
      <div><b>${money(item.precio * item.quantity)}</b><div class="qty">
        <button data-id="${item.id}" data-delta="-1">−</button><span>${item.quantity}</span><button data-id="${item.id}" data-delta="1">+</button>
      </div></div>
    </div>`).join('');
  const total = state.cart.reduce((sum, item) => sum + item.precio * item.quantity, 0);
  $('#cart-empty').hidden = Boolean(state.cart.length);
  $('#total').textContent = money(total);
  $('#checkout').disabled = !state.cart.length;
  document.querySelectorAll('.qty button').forEach(button => {
    button.onclick = () => changeQuantity(Number(button.dataset.id), Number(button.dataset.delta));
  });
}

function renderTickets() {
  $('#tickets-list').innerHTML = state.tickets.length
    ? state.tickets.map(ticket => `
      <article class="ticket">
        <b>${ticket.number}</b><br>
        <small>${ticket.date} · ${ticket.payment} · ${ticket.items} producto(s)</small>
        <strong class="price">${money(ticket.total)}</strong>
      </article>`).join('')
    : '<div class="empty"><h2>Sin tickets registrados</h2><p>Registra una venta de demostración para crear el primer ticket.</p></div>';
}

document.querySelectorAll('.nav').forEach(button => {
  button.onclick = () => showView(button.dataset.view);
});

$('#search').oninput = renderProducts;
$('#reload').textContent = 'Restablecer';
$('#reload').onclick = () => {
  location.reload();
};
$('#clear-cart').onclick = () => {
  state.cart = [];
  renderCart();
};

$('#product-form').onsubmit = event => {
  event.preventDefault();
  state.products.push({
    id: Date.now(),
    nombre: $('#product-name').value.trim(),
    categoria: $('#product-category').value.trim(),
    precio: Number($('#product-price').value),
    stock: Number($('#product-stock').value)
  });
  event.target.reset();
  renderProducts();
  renderTable();
  message($('#product-message'), 'Producto agregado a esta demostración.', true);
};

$('#checkout').onclick = () => {
  const total = state.cart.reduce((sum, item) => sum + item.precio * item.quantity, 0);
  state.cart.forEach(item => {
    const product = state.products.find(entry => entry.id === item.id);
    if (product) product.stock -= item.quantity;
  });
  const number = `NB-${String(state.tickets.length + 1).padStart(4, '0')}`;
  state.tickets.unshift({
    number,
    date: new Date().toLocaleString('es-BO'),
    payment: $('#payment').value,
    items: state.cart.reduce((sum, item) => sum + item.quantity, 0),
    total
  });
  state.cart = [];
  renderCart();
  renderProducts();
  renderTable();
  message($('#sale-message'), `Venta registrada. Ticket: ${number} · Total: ${money(total)}`, true);
};

$('#logout').textContent = 'Volver a Datrio';
$('#logout').onclick = () => { location.href = '/'; };
$('#user-email').textContent = 'Nataly Ovando · Demo';
$('#date').textContent = new Intl.DateTimeFormat('es-BO', { dateStyle: 'full' }).format(new Date());
$('#login-view').hidden = true;
$('#app-view').hidden = false;
renderProducts();
renderTable();
renderCart();
renderTickets();

