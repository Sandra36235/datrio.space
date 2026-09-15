const operatorKey = 'nativas_burgers_operator';

document.querySelector('#login-form').addEventListener('submit', event => {
  event.preventDefault();
  const email = document.querySelector('#email').value.trim();
  const password = document.querySelector('#password').value;
  const message = document.querySelector('#login-message');
  if (!email || password.length < 6) {
    message.textContent = 'Revisa el correo y la contraseña.';
    return;
  }
  localStorage.setItem(operatorKey, email);
  location.assign('pos.html');
});

if (localStorage.getItem(operatorKey)) {
  location.replace('pos.html');
}
