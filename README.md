# Order System MVP

MVP web para toma y gestión de pedidos de un local/restaurante, construido con Next.js App Router, TypeScript, Prisma y PostgreSQL, pensado para desplegarse en Railway.

## Alcance actual

- Sin autenticación ni login.
- Pedido identificado por `mesa` o `número`.
- Estado de preparación y estado de pago independientes.
- Productos administrables desde una vista simple.
- Pantallas base:
  - `/pedido`
  - `/preparacion`
  - `/pago`
  - `/resumen`
  - `/admin/productos`

## Estructura MVP propuesta

### Dominio inicial

- `Product`: carta configurable.
- `Order`: pedido con referencia, estados y total.
- `OrderItem`: snapshot de productos y cantidades dentro de un pedido.

### Rutas App Router

- `/`
  - Panel general del MVP.
- `/pedido`
  - Toma de pedidos desde catálogo visual.
- `/preparacion`
  - Cola de preparación.
- `/pago`
  - Cola y actualización de pago.
- `/resumen`
  - Resumen diario.
- `/admin/productos`
  - CRUD simple de productos.

### APIs iniciales

- `GET /api/products`
- `POST /api/products`
- `PATCH /api/products/[id]`
- `GET /api/orders`
- `POST /api/orders`
- `PATCH /api/orders/[id]/preparation`
- `PATCH /api/orders/[id]/payment`

### Carpetas

```text
app/
  api/
  admin/productos/
  pago/
  pedido/
  preparacion/
  resumen/
components/
generated/
lib/
prisma/
```

## Orden exacto de desarrollo

1. Configurar Prisma, PostgreSQL, variables de entorno y datos semilla.
2. Implementar admin de productos para cargar la carta.
3. Implementar toma de pedido con resumen visual y guardado.
4. Implementar cola de preparación.
5. Implementar cola de pago y método de pago.
6. Implementar resumen diario.
7. Ajustar validaciones, estilos y despliegue en Railway.

## Configuración local

1. Crea tu archivo `.env` a partir de `.env.example`.
2. Instala dependencias:

```bash
npm install
```

3. Genera Prisma Client:

```bash
npm run prisma:generate
```

4. Crea la primera migración:

```bash
npm run prisma:migrate:dev -- --name init
```

5. Carga productos base:

```bash
npm run prisma:seed
```

6. Levanta la app:

```bash
npm run dev
```

## Railway

- Configura `DATABASE_URL` en Railway.
- Ejecuta migraciones antes de usar la app en producción.
- El proyecto ya está preparado para crecer después con autenticación, cocina/caja separadas y reportes más completos.
