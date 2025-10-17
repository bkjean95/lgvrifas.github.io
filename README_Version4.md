# Rifa secuencial (PagoMovil / Transferencia)

Este repositorio contiene una implementación mínima de una página web para vender boletos de rifa donde:
- Los boletos se asignan en secuencia (1, 2, 3, ...).
- El comprador reserva boletos y recibe una referencia de pago.
- El pago se realiza por PagoMovil o transferencia bancaria.
- El comprador registra su número de transacción (tx id) como comprobante.
- Un administrador verifica y confirma manualmente los pagos para marcar los boletos como vendidos.

Stack y archivos
- Node.js + Express
- SQLite (better-sqlite3) para almacenamiento simple (archivo rifas.db)
- public/ — frontend estático (index.html, admin.html, app.js, style.css)
- server.js — servidor y API
- package.json — dependencias y scripts
- .env.example — variables de entorno de ejemplo
- Dockerfile + docker-compose.yml (opcional para desplegar en contenedores)

Instalación local rápida
1. Clona el repositorio:
   git clone https://github.com/<tu-usuario>/<tu-repo>.git
   cd <tu-repo>

2. Instala dependencias:
   npm install

3. Copia el archivo .env.example a .env y modifica los valores:
   cp .env.example .env

4. Ejecuta:
   npm start

5. Visita:
   - Página pública: http://localhost:3000/
   - Panel administrador: http://localhost:3000/admin

API principal
- POST /api/buy
  - Body: { buyer_name, email, quantity, payment_method }
  - Respuesta: orden con tickets asignados y paymentInstructions

- POST /api/confirm
  - Body: { order_id, tx_id }
  - Marca la orden como 'awaiting_confirmation'

- GET /api/admin/orders
  - Header: x-admin-password: <ADMIN_PASSWORD>

- POST /api/admin/confirm
  - Header: x-admin-password: <ADMIN_PASSWORD>
  - Body: { order_id }

Notas de seguridad y producción
- Cambia ADMIN_PASSWORD y usa autenticación real para producción.
- Usa HTTPS, backups y una base de datos más robusta si esperas concurrencia alta.
- Considera: expiración de reservas, límites por usuario, subida de comprobantes, notificaciones por email.

Si quieres, puedo:
- Crear el repositorio en tu cuenta y subir estos archivos (dame permiso o el nombre del repo).
- Añadir subida de comprobantes (archivo) y almacenamiento en S3.
- Preparar CI (GitHub Actions) y un Docker Compose más completo.
