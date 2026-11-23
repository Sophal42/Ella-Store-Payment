const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
const money = value => '$' + Number(value).toFixed(2);

function toast(message, ms = 2800) {
  const el = $('#toast');
  if (!el) return;
  el.textContent = message;
  el.classList.add('show');
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => el.classList.remove('show'), ms);
}

async function api(path, body) {
  try {
    const res = await fetch(path, {
      method: body ? 'POST' : 'GET',
      headers: body ? { 'Content-Type': 'application/json' } : {},
      body: body ? JSON.stringify(body) : undefined,
    });
    const data = await res.json().catch(() => ({}));
    return res.ok ? data : { ok: false, error: data.error || 'Request failed' };
  } catch {
    return { ok: false, error: 'Network error, please try again' };
  }
}

/* ---------- newsletter ---------- */
$$('form[data-subscribe]').forEach(form => {
  form.addEventListener('submit', async event => {
    event.preventDefault();
    const email = form.querySelector('input[name="email"]').value.trim();
    const res = await api('/api/subscribe', { email });
    if (res.ok) {
      toast('Subscribed. Thank you!');
      form.reset();
    } else {
      toast(res.error);
    }
  });
});

/* ---------- top-up page ---------- */
function initTopup(root) {
  if (!root) return;

  const gameId = root.dataset.gameId;
  const serverType = root.dataset.serverType;

  const uid = $('#uid', root);
  const sid = $('#sid', root);
  const srv = $('#srv', root);
  const status = $('[data-player-status]', root);
  const couponInput = $('#coupon', root);
  const couponMsg = $('[data-coupon-msg]', root);
  const payButton = $('[data-pay]', root);

  let verified = false;
  let discount = 0;
  let coupon = '';

  const selectedProduct = () => $('input[name="product"]:checked', root);

  const server = () => {
    if (serverType === 'text') return sid ? sid.value.trim() : '';
    if (serverType === 'select') return srv ? srv.value : '';
    return '';
  };

  const subtotal = () => {
    const product = selectedProduct();
    return product ? Number(product.dataset.price) : 0;
  };

  function setStatus(text, state = '') {
    status.textContent = text;
    status.dataset.state = state;
  }

  function renderTotals() {
    const base = subtotal();
    const off = base * discount;
    $('[data-subtotal]', root).textContent = money(base);
    $('[data-discount]', root).textContent = '-' + money(off);
    $('[data-total]', root).textContent = money(base - off);
  }

  function invalidatePlayer() {
    verified = false;
    setStatus('Not checked yet.');
  }

  [uid, sid].filter(Boolean).forEach(input => {
    input.addEventListener('input', () => {
      input.value = input.value.replace(/\D/g, '');
      invalidatePlayer();
    });
  });

  if (srv) srv.addEventListener('change', invalidatePlayer);

  $$('input[name="product"]', root).forEach(input => input.addEventListener('change', renderTotals));

  $('[data-check]', root).addEventListener('click', async () => {
    if (!uid.value.trim()) {
      toast('Enter your Game ID first');
      uid.focus();
      return;
    }
    setStatus('Checking...', 'loading');
    const res = await api('/api/player/check', {
      game_id: gameId,
      uid: uid.value.trim(),
      server: server(),
    });
    if (res.ok) {
      verified = true;
      setStatus('Player: ' + res.name, 'ok');
    } else {
      verified = false;
      setStatus(res.error, 'error');
    }
  });

  $('[data-apply]', root).addEventListener('click', async () => {
    const code = couponInput.value.trim();
    if (!code) {
      toast('Enter a coupon code');
      return;
    }
    const res = await api('/api/coupon', { code });
    if (res.ok) {
      coupon = res.code;
      discount = res.discount;
      couponMsg.textContent = `Coupon ${res.code}: ${Math.round(res.discount * 100)}% off`;
      couponMsg.dataset.state = 'ok';
    } else {
      coupon = '';
      discount = 0;
      couponMsg.textContent = res.error;
      couponMsg.dataset.state = 'error';
    }
    renderTotals();
  });

  payButton.addEventListener('click', async () => {
    const product = selectedProduct();

    if (!uid.value.trim()) {
      toast('Enter your Game ID first');
      uid.focus();
      return;
    }
    if (!verified) {
      toast('Check your player ID first');
      return;
    }
    if (!product) {
      toast('Choose a product');
      return;
    }

    payButton.disabled = true;
    const res = await api('/api/orders', {
      game_id: gameId,
      uid: uid.value.trim(),
      server: server(),
      item: Number(product.value),
      pay: ($('input[name="pay"]:checked', root) || {}).value || 'khqr',
      coupon: coupon || null,
    });
    payButton.disabled = false;

    if (res.ok) {
      toast(`Order #${res.order.id} created - ${res.order.item}, ${money(res.order.total)}. Payment gateway is not connected yet.`, 5000);
    } else {
      toast(res.error);
    }
  });

  renderTotals();
}

initTopup($('[data-topup]'));