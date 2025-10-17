document.getElementById('buyForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const fd = new FormData(e.currentTarget);
  const body = {
    buyer_name: fd.get('buyer_name'),
    email: fd.get('email'),
    quantity: Number(fd.get('quantity')),
    payment_method: fd.get('payment_method')
  };
  const res = await fetch('/api/buy', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify(body)
  });
  const json = await res.json();
  const result = document.getElementById('result');
  result.classList.remove('hidden');
  if (!res.ok) {
    result.innerText = 'Error: ' + (json.error || JSON.stringify(json));
    return;
  }
  result.innerHTML = `
    <h3>Reserva creada</h3>
    <p>Orden ID: <strong>${json.order.id}</strong></p>
    <p>Boletos asignados: <strong>${json.order.tickets.join(', ')}</strong></p>
    <h4>Instrucciones de pago</h4>
    <p>Método: ${json.paymentInstructions.payment_method}</p>
    <p>PagoMovil: ${json.paymentInstructions.pagomovil_number}</p>
    <p>Transferencia: ${json.paymentInstructions.bank_account}</p>
    <p>Referencia a incluir en la transferencia / nota: <strong>${json.paymentInstructions.reference}</strong></p>
    <p>Después de pagar, vuelve y registra tu número de transacción en la sección "Ya pagué".</p>
  `;
});

document.getElementById('confirmForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const fd = new FormData(e.currentTarget);
  const body = {
    order_id: Number(fd.get('order_id')),
    tx_id: fd.get('tx_id')
  };
  const res = await fetch('/api/confirm', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify(body)
  });
  const json = await res.json();
  const out = document.getElementById('confirmResult');
  out.classList.remove('hidden');
  if (!res.ok) {
    out.innerText = 'Error: ' + (json.error || JSON.stringify(json));
  } else {
    out.innerText = json.message || 'Comprobante enviado';
  }
});