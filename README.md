# Rifa secuencial (PagoMovil / Transferencia)

Este repositorio contiene una implementación mínima de una página web para vender boletos de rifa donde:
- Los boletos se asignan en secuencia (1, 2, 3, ...).
- El comprador reserva boletos y recibe una referencia de pago.
- El pago se realiza por PagoMovil o transferencia bancaria.
- El comprador registra su número de transacción (tx id) como comprobante.
- Un administrador verifica y confirma manualmente los pagos para marcar los boletos como vendidos.

El proyecto incluye un backend en Node.js + Express con SQLite (better-sqlite3) y una interfaz pública simple en HTML/JS/CSS.

Características
- Reserva de boletos secuencial en transacción atómica.
- Generación de referencia única por orden.
- Registro de comprobante (tx id) por parte del comprador.
- Panel administrador básico (/admin) para revisar y confirmar órdenes.
- Archivos estáticos para frontend en la carpeta `public`.

Estructura principal
- server.js — servidor Express y API.
- public/ — frontend estático (index.html, admin.html, app.js, style.css).
- package.json — dependencias y scripts.
- rifas.db (por defecto) — base de datos SQLite (se crea automáticamente).
- .env — variables opcionales de configuración (no incluido en el repo).

Requisitos
- Node.js 16+ (o LTS recomendado)
- npm o yarn

Instalación rápida (local)
1. Clona el repositorio:
   git clone https://github.com/<tu-usuario>/<tu-repo>.git
   cd <tu-repo>

2. Instala dependencias:
   npm install

3. Crea un archivo `.env` (opcional) en la raíz con valores como:
   PORT=3000
   ADMIN_PASSWORD=tu_contraseña_admin
   PAGOMOVIL_NUMBER=0414XXXXXXXX
   BANK_ACCOUNT="BANCO: MiBanco, CUENTA: 1234567890"
   DB_FILE=rifas.db

   Si no pones `.env`, se usan valores por defecto (no seguros para producción).

4. Ejecuta la aplicación:
   npm start

5. Accede:
   - Página pública: http://localhost:3000/
   - Panel administrador: http://localhost:3000/admin

API (endpoints principales)
- POST /api/buy
  - Crea una orden y reserva los boletos siguientes en secuencia.
  - Body JSON: { buyer_name, email, quantity, payment_method }
  - payment_method: "pagomovil" o "transferencia"
  - Respuesta: datos de la orden (id, tickets asignados) y las instrucciones de pago (número PagoMovil, cuenta bancaria y referencia).

- POST /api/confirm
  - El comprador registra el comprobante (tx id).
  - Body JSON: { order_id, tx_id }
  - Cambia el estado de la orden a `awaiting_confirmation`.

- GET /api/admin/orders
  - Listado de órdenes y boletos (solo admin).
  - Header: x-admin-password: <ADMIN_PASSWORD>

- POST /api/admin/confirm
  - Confirma una orden (marca `paid` y boletos `sold`).
  - Header: x-admin-password: <ADMIN_PASSWORD>
  - Body JSON: { order_id }

Seguridad mínima y notas
- Actualmente el panel admin usa solo un header con contraseña. Para producción usa autenticación robusta (usuarios/roles, OAuth, sesiones seguras).
- La base de datos por defecto es SQLite. Para mayor concurrencia y tolerancia usa PostgreSQL o MySQL.
- Los pagos y comprobantes se gestionan manualmente: para automatizar pagos integra una pasarela o webhook.
- Implementa validaciones adicionales (limitar cantidad máxima por orden, límites por IP/usuario, expiración de reservas).
- Usa HTTPS en producción y variables de entorno seguras (no almacenar contraseñas en el repo).

Mejoras recomendadas
- Añadir vencimiento de reservas (p. ej. si no se paga en X horas liberar boletos).
- Permitir subir comprobantes (archivos) con almacenamiento en S3/Cloud Storage y escaneo/validación.
- Enviar notificaciones por correo (orden creada / pago confirmado).
- Panel admin con filtros, búsqueda y exportación CSV.
- Tests automatizados y CI (GitHub Actions).
- Dockerfile + docker-compose para despliegue reproducible.

Ejemplo .env de referencia
PORT=3000
ADMIN_PASSWORD=mi_super_pass
PAGOMOVIL_NUMBER=04141234567
BANK_ACCOUNT="BANCO: Ejemplo, CUENTA: 0123456789012"
DB_FILE=rifas.db

Despliegue sugerido
- Para un despliegue rápido: usar un VPS con Node.js o servicios como Render, Railway, Heroku (buildpack), DigitalOcean App Platform.
- Para producción a escala: contenedores Docker + orquestador, base de datos gestionada (RDS, Cloud SQL), backups regulares y monitorización.

Licencia
- Añade la licencia que prefieras (MIT recomendada para ejemplo/plantilla).

Contribuciones
- Si deseas que prepare un Dockerfile y docker-compose, añada subida de comprobantes o integre notificaciones por email, puedo crear los archivos y un PR con los cambios. Indícame cuál mejora quieres primero y la implemento.

¿Quieres que genere también:
- un Dockerfile + docker-compose?
- la funcionalidad para subir comprobantes (archivos)?
- o un pipeline de GitHub Actions para CI/CD?
