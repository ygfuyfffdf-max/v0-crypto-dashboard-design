CREATE TABLE `almacen` (
	`id` text PRIMARY KEY NOT NULL,
	`nombre` text NOT NULL,
	`descripcion` text,
	`cantidad` integer DEFAULT 0 NOT NULL,
	`precio_compra` real NOT NULL,
	`precio_venta` real NOT NULL,
	`minimo` integer DEFAULT 0,
	`ubicacion` text,
	`created_at` integer DEFAULT (unixepoch()),
	`updated_at` integer DEFAULT (unixepoch())
);
--> statement-breakpoint
CREATE INDEX `almacen_nombre_idx` ON `almacen` (`nombre`);--> statement-breakpoint
CREATE TABLE `bancos` (
	`id` text PRIMARY KEY NOT NULL,
	`nombre` text NOT NULL,
	`tipo` text NOT NULL,
	`capital_actual` real DEFAULT 0 NOT NULL,
	`historico_ingresos` real DEFAULT 0 NOT NULL,
	`historico_gastos` real DEFAULT 0 NOT NULL,
	`color` text NOT NULL,
	`icono` text,
	`orden` integer DEFAULT 0,
	`activo` integer DEFAULT true,
	`updated_at` integer DEFAULT (unixepoch())
);
--> statement-breakpoint
CREATE INDEX `banco_tipo_idx` ON `bancos` (`tipo`);--> statement-breakpoint
CREATE TABLE `clientes` (
	`id` text PRIMARY KEY NOT NULL,
	`nombre` text NOT NULL,
	`email` text,
	`telefono` text,
	`direccion` text,
	`rfc` text,
	`limite_credito` real DEFAULT 0,
	`saldo_pendiente` real DEFAULT 0,
	`estado` text DEFAULT 'activo',
	`created_at` integer DEFAULT (unixepoch()),
	`updated_at` integer DEFAULT (unixepoch())
);
--> statement-breakpoint
CREATE INDEX `cliente_nombre_idx` ON `clientes` (`nombre`);--> statement-breakpoint
CREATE INDEX `cliente_estado_idx` ON `clientes` (`estado`);--> statement-breakpoint
CREATE TABLE `distribuidores` (
	`id` text PRIMARY KEY NOT NULL,
	`nombre` text NOT NULL,
	`empresa` text,
	`telefono` text,
	`email` text,
	`tipo_productos` text,
	`saldo_pendiente` real DEFAULT 0,
	`estado` text DEFAULT 'activo',
	`created_at` integer DEFAULT (unixepoch()),
	`updated_at` integer DEFAULT (unixepoch())
);
--> statement-breakpoint
CREATE INDEX `distribuidor_nombre_idx` ON `distribuidores` (`nombre`);--> statement-breakpoint
CREATE TABLE `movimientos` (
	`id` text PRIMARY KEY NOT NULL,
	`banco_id` text NOT NULL,
	`tipo` text NOT NULL,
	`monto` real NOT NULL,
	`fecha` integer NOT NULL,
	`concepto` text NOT NULL,
	`referencia` text,
	`banco_origen_id` text,
	`banco_destino_id` text,
	`cliente_id` text,
	`distribuidor_id` text,
	`venta_id` text,
	`orden_compra_id` text,
	`observaciones` text,
	`created_by` text,
	`created_at` integer DEFAULT (unixepoch()),
	FOREIGN KEY (`banco_id`) REFERENCES `bancos`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`banco_origen_id`) REFERENCES `bancos`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`banco_destino_id`) REFERENCES `bancos`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`cliente_id`) REFERENCES `clientes`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`distribuidor_id`) REFERENCES `distribuidores`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`venta_id`) REFERENCES `ventas`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`orden_compra_id`) REFERENCES `ordenes_compra`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`created_by`) REFERENCES `usuarios`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `mov_banco_idx` ON `movimientos` (`banco_id`);--> statement-breakpoint
CREATE INDEX `mov_tipo_idx` ON `movimientos` (`tipo`);--> statement-breakpoint
CREATE INDEX `mov_fecha_idx` ON `movimientos` (`fecha`);--> statement-breakpoint
CREATE INDEX `mov_referencia_idx` ON `movimientos` (`referencia`);--> statement-breakpoint
CREATE TABLE `ordenes_compra` (
	`id` text PRIMARY KEY NOT NULL,
	`distribuidor_id` text NOT NULL,
	`fecha` integer NOT NULL,
	`numero_orden` text,
	`cantidad` integer NOT NULL,
	`precio_unitario` real NOT NULL,
	`subtotal` real NOT NULL,
	`iva` real DEFAULT 0,
	`total` real NOT NULL,
	`monto_pagado` real DEFAULT 0,
	`monto_restante` real NOT NULL,
	`estado` text DEFAULT 'pendiente',
	`banco_origen_id` text,
	`observaciones` text,
	`created_by` text,
	`created_at` integer DEFAULT (unixepoch()),
	`updated_at` integer DEFAULT (unixepoch()),
	FOREIGN KEY (`distribuidor_id`) REFERENCES `distribuidores`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`banco_origen_id`) REFERENCES `bancos`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`created_by`) REFERENCES `usuarios`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `ordenes_compra_numero_orden_unique` ON `ordenes_compra` (`numero_orden`);--> statement-breakpoint
CREATE INDEX `oc_distribuidor_idx` ON `ordenes_compra` (`distribuidor_id`);--> statement-breakpoint
CREATE INDEX `oc_fecha_idx` ON `ordenes_compra` (`fecha`);--> statement-breakpoint
CREATE INDEX `oc_estado_idx` ON `ordenes_compra` (`estado`);--> statement-breakpoint
CREATE TABLE `usuarios` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`password` text NOT NULL,
	`nombre` text NOT NULL,
	`role` text DEFAULT 'viewer',
	`created_at` integer DEFAULT (unixepoch()),
	`updated_at` integer DEFAULT (unixepoch())
);
--> statement-breakpoint
CREATE UNIQUE INDEX `usuarios_email_unique` ON `usuarios` (`email`);--> statement-breakpoint
CREATE INDEX `email_idx` ON `usuarios` (`email`);--> statement-breakpoint
CREATE TABLE `ventas` (
	`id` text PRIMARY KEY NOT NULL,
	`cliente_id` text NOT NULL,
	`fecha` integer NOT NULL,
	`cantidad` integer NOT NULL,
	`precio_venta_unidad` real NOT NULL,
	`precio_compra_unidad` real NOT NULL,
	`precio_flete` real DEFAULT 0,
	`precio_total_venta` real NOT NULL,
	`monto_pagado` real DEFAULT 0,
	`monto_restante` real NOT NULL,
	`monto_boveda_monte` real DEFAULT 0,
	`monto_fletes` real DEFAULT 0,
	`monto_utilidades` real DEFAULT 0,
	`estado_pago` text DEFAULT 'pendiente',
	`observaciones` text,
	`created_by` text,
	`created_at` integer DEFAULT (unixepoch()),
	`updated_at` integer DEFAULT (unixepoch()),
	FOREIGN KEY (`cliente_id`) REFERENCES `clientes`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`created_by`) REFERENCES `usuarios`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `venta_cliente_idx` ON `ventas` (`cliente_id`);--> statement-breakpoint
CREATE INDEX `venta_fecha_idx` ON `ventas` (`fecha`);--> statement-breakpoint
CREATE INDEX `venta_estado_idx` ON `ventas` (`estado_pago`);