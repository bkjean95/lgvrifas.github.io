# Rifa secuencial - Ejemplo

Este proyecto es un ejemplo mínimo de una página para vender boletos de rifa donde:
- Los boletos se asignan en secuencia (1, 2, 3, ...).
- El comprador recibe instrucciones para pagar por PagoMovil o transferencia.
- El comprador registra el número de transacción (tx id) como comprobante.
- Un administrador confirma manualmente los pagos y marca los boletos como vendidos.

Requisitos
- Node.js 16+ recomendado
- npm

Instalación
1. Clona o copia los archivos.
2. Instala dependencias:
   npm install

3. Variables de entorno (opcional). Puedes crear un archivo `.env` en la raíz con:
   PORT=3000
   ADMIN_PASSWORD=tu_contraseña_admin
   PAGOMOVIL_NUMBER=0414XXXXXXXX
   BANK_ACCOUNT="BANCO: Ejemplo, CUENTA: 1234567890"
   DB_FILE=rifas.db

Uso
npm start

Visita:
- Página pública: http://localhost:3000/
- Panel administrador: http://localhost:3000/admin

Flujo de compra
1. El usuario completa nombre, email y cantidad de boletos.
2. Se crea una orden y se asignan los siguientes números de boletos disponibles (reserved).
3. Se muestra una referencia de pago y datos (PagoMovil / transferencia).
4. El usuario realiza el pago y registra su tx id en la sección "Ya pagué".
5. El administrador, desde /admin (con la contraseña), revisa las órdenes y confirma los pagos. Al confirmar, la orden pasa a `paid` y los boletos a `sold`.

Notas y mejoras posibles
- Añadir subida de comprobantes (archivos) con almacenamiento seguro.
- Integrar pasarela de pagos (si se desea pago automático).
- Enviar correos de notificación (orden creada / pago confirmado).
- Añadir límites por usuario, bloqueo de IP, tasa de compra, y protección contra bots.
- Añadir pruebas automáticas y validaciones más estrictas.
