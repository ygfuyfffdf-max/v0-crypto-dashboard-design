/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 * 🖨️ CHRONOS INFINITY 2026 — SISTEMA DE TICKETS Y COMPROBANTES PDF
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 *
 * Generación de comprobantes profesionales para casa de cambio:
 * - Tickets de operación formato térmico 80mm
 * - Comprobantes fiscales
 * - Reportes de caja
 * - Resúmenes diarios
 * - Exportación a PDF, HTML y texto
 *
 * @version 1.0.0
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 */

import { logger } from '@/app/lib/utils/logger'

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export interface DatosEmpresa {
  nombre: string
  razonSocial: string
  rfc: string
  direccion: string
  telefono: string
  email: string
  sitioWeb?: string
  logoUrl?: string
  eslogan?: string
}

export interface DatosOperacion {
  folio: string
  fecha: string
  hora: string
  tipoOperacion: 'compra' | 'venta'
  
  // Cliente
  clienteNombre: string
  clienteTelefono?: string
  tipoID?: string
  numeroID?: string
  
  // Montos
  divisaEntrega: string
  divisaRecibe: string
  montoEntrega: number
  montoRecibe: number
  tipoCambio: number
  tipoCambioReferencia?: number
  
  // Desglose
  comision: number
  spread?: number
  
  // Cajero
  cajeroNombre: string
  sucursal: string
  cajaNumero?: string
  
  // Denominaciones (opcional)
  denominacionesRecibidas?: { valor: number; cantidad: number }[]
  denominacionesEntregadas?: { valor: number; cantidad: number }[]
  
  // Notas
  notas?: string
}

export interface DatosCorteCaja {
  folio: string
  fecha: string
  horaInicio: string
  horaFin: string
  cajero: string
  sucursal: string
  
  saldos: {
    divisa: string
    saldoInicial: number
    ingresos: number
    egresos: number
    saldoFinal: number
    diferencia: number
  }[]
  
  resumen: {
    totalOperaciones: number
    operacionesCompra: number
    operacionesVenta: number
    gananciaTotal: number
  }
  
  denominaciones?: {
    divisa: string
    valor: number
    cantidad: number
  }[]
  
  observaciones?: string
  firmaDigital?: string
}

export type FormatoTicket = 'termica' | 'a4' | 'carta'
export type FormatoSalida = 'pdf' | 'html' | 'texto' | 'json'

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// CONFIGURACIÓN
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

const EMPRESA_DEFAULT: DatosEmpresa = {
  nombre: 'PROFIT',
  razonSocial: 'Casa de Cambio PROFIT S.A. de C.V.',
  rfc: 'CCP901231XX0',
  direccion: 'Av. Reforma 222, Col. Juárez, CDMX',
  telefono: '+52 55 1234 5678',
  email: 'contacto@casacambioprofit.mx',
  sitioWeb: 'www.cambioprofit.mx',
  eslogan: 'Tu mejor tipo de cambio',
}

const FORMATO_TERMICO = {
  ancho: 42, // caracteres para impresora 80mm
  linea: '='.repeat(42),
  lineaFina: '-'.repeat(42),
  centrar: (texto: string, ancho: number = 42) => {
    const espacios = Math.max(0, ancho - texto.length)
    const izq = Math.floor(espacios / 2)
    return ' '.repeat(izq) + texto
  },
  alinearDerecha: (texto: string, ancho: number = 42) => {
    const espacios = Math.max(0, ancho - texto.length)
    return ' '.repeat(espacios) + texto
  },
  columnas: (izq: string, der: string, ancho: number = 42) => {
    const espacios = Math.max(0, ancho - izq.length - der.length)
    return izq + ' '.repeat(espacios) + der
  },
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// SERVICIO DE TICKETS
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

class TicketsService {
  private static instance: TicketsService
  private empresa: DatosEmpresa

  private constructor() {
    this.empresa = EMPRESA_DEFAULT
  }

  static getInstance(): TicketsService {
    if (!TicketsService.instance) {
      TicketsService.instance = new TicketsService()
    }
    return TicketsService.instance
  }

  // ═══════════════════════════════════════════════════════════════════════════════════════════════
  // TICKET DE OPERACIÓN (FORMATO TÉRMICO 80mm)
  // ═══════════════════════════════════════════════════════════════════════════════════════════════

  generarTicketOperacion(operacion: DatosOperacion, formato: FormatoSalida = 'texto'): string {
    const f = FORMATO_TERMICO

    const lineas: string[] = [
      '',
      f.centrar('╔═══════════════════════════════════════╗'),
      f.centrar(`║  💱 ${this.empresa.nombre} 💱  ║`),
      f.centrar('╚═══════════════════════════════════════╝'),
      '',
      f.centrar(this.empresa.razonSocial),
      f.centrar(`RFC: ${this.empresa.rfc}`),
      f.centrar(this.empresa.direccion),
      f.centrar(this.empresa.telefono),
      '',
      f.linea,
      f.centrar('*** COMPROBANTE DE OPERACIÓN ***'),
      f.linea,
      '',
      f.columnas('Folio:', operacion.folio),
      f.columnas('Fecha:', operacion.fecha),
      f.columnas('Hora:', operacion.hora),
      f.columnas('Sucursal:', operacion.sucursal),
      f.columnas('Cajero:', operacion.cajeroNombre),
      '',
      f.lineaFina,
      f.centrar(`--- ${operacion.tipoOperacion === 'compra' ? 'CLIENTE COMPRA' : 'CLIENTE VENDE'} ---`),
      f.lineaFina,
      '',
      f.columnas('Cliente:', operacion.clienteNombre),
    ]

    // ID si existe
    if (operacion.tipoID && operacion.numeroID) {
      lineas.push(f.columnas(`${operacion.tipoID}:`, operacion.numeroID))
    }

    lineas.push(
      '',
      f.linea,
      '',
      f.columnas('ENTREGA:', `${this.formatearMonto(operacion.montoEntrega)} ${operacion.divisaEntrega}`),
      '',
      f.centrar('▼▼▼'),
      '',
      f.columnas('RECIBE:', `${this.formatearMonto(operacion.montoRecibe)} ${operacion.divisaRecibe}`),
      '',
      f.linea,
      '',
      f.columnas('Tipo de Cambio:', operacion.tipoCambio.toFixed(4)),
    )

    if (operacion.tipoCambioReferencia) {
      lineas.push(f.columnas('T.C. Referencia:', operacion.tipoCambioReferencia.toFixed(4)))
    }

    if (operacion.comision > 0) {
      lineas.push(f.columnas('Comisión:', `$${operacion.comision.toFixed(2)}`))
    }

    // Denominaciones entregadas (lo que da el cajero)
    if (operacion.denominacionesEntregadas && operacion.denominacionesEntregadas.length > 0) {
      lineas.push(
        '',
        f.lineaFina,
        f.centrar('DESGLOSE ENTREGADO'),
        f.lineaFina,
      )
      operacion.denominacionesEntregadas.forEach(d => {
        const subtotal = d.valor * d.cantidad
        lineas.push(f.columnas(`$${d.valor} x ${d.cantidad}`, `$${this.formatearMonto(subtotal)}`))
      })
    }

    // Footer
    lineas.push(
      '',
      f.linea,
      '',
      f.centrar('Este comprobante ampara la operación'),
      f.centrar('de compra-venta de divisas realizada.'),
      '',
      f.centrar('Conserva este ticket como'),
      f.centrar('comprobante de tu operación.'),
      '',
      f.lineaFina,
      f.centrar('¡Gracias por tu preferencia!'),
      f.centrar(this.empresa.eslogan ?? ''),
      f.lineaFina,
      '',
      f.centrar(`${this.empresa.sitioWeb ?? ''}`),
      '',
      f.centrar(this.generarQR(operacion.folio)),
      '',
    )

    if (operacion.notas) {
      lineas.push(
        f.lineaFina,
        'Notas:',
        operacion.notas,
        f.lineaFina,
      )
    }

    const texto = lineas.join('\n')

    switch (formato) {
      case 'html':
        return this.textoAHtml(texto, operacion)
      case 'json':
        return JSON.stringify({ ticket: texto, operacion }, null, 2)
      case 'pdf':
        return this.generarTicketPdfHtml(operacion)
      default:
        return texto
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════════════════════════
  // TICKET PDF HTML (para impresión browser)
  // ═══════════════════════════════════════════════════════════════════════════════════════════════

  generarTicketPdfHtml(operacion: DatosOperacion): string {
    const esCompra = operacion.tipoOperacion === 'compra'
    const colorTipo = esCompra ? '#10b981' : '#3b82f6'

    return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Ticket ${operacion.folio}</title>
  <style>
    @page { size: 80mm auto; margin: 0; }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Courier New', monospace;
      font-size: 12px;
      width: 80mm;
      padding: 5mm;
      background: white;
      color: #1e293b;
    }
    .header {
      text-align: center;
      padding: 3mm 0;
      border-bottom: 2px dashed #334155;
    }
    .logo {
      font-size: 24px;
      font-weight: bold;
      color: ${colorTipo};
      letter-spacing: 2px;
    }
    .empresa {
      font-size: 10px;
      color: #64748b;
      margin-top: 2mm;
    }
    .titulo {
      text-align: center;
      padding: 3mm 0;
      font-weight: bold;
      background: #f1f5f9;
      margin: 3mm 0;
      border-radius: 2mm;
    }
    .tipo-operacion {
      background: ${colorTipo};
      color: white;
      padding: 2mm;
      text-align: center;
      font-weight: bold;
      border-radius: 2mm;
      margin: 3mm 0;
    }
    .row {
      display: flex;
      justify-content: space-between;
      padding: 1mm 0;
      border-bottom: 1px dotted #e2e8f0;
    }
    .row:last-child { border-bottom: none; }
    .label { color: #64748b; }
    .value { font-weight: bold; text-align: right; }
    .section { margin: 3mm 0; }
    .monto-grande {
      text-align: center;
      font-size: 18px;
      font-weight: bold;
      padding: 2mm;
      background: #f8fafc;
      border-radius: 2mm;
      margin: 2mm 0;
    }
    .monto-entrega { color: #ef4444; }
    .monto-recibe { color: ${colorTipo}; }
    .flecha {
      text-align: center;
      font-size: 16px;
      color: ${colorTipo};
    }
    .divider {
      border-top: 2px dashed #334155;
      margin: 3mm 0;
    }
    .footer {
      text-align: center;
      font-size: 10px;
      color: #64748b;
      margin-top: 3mm;
      padding-top: 3mm;
      border-top: 1px solid #e2e8f0;
    }
    .qr {
      text-align: center;
      margin: 3mm 0;
      font-size: 8px;
      color: #94a3b8;
    }
    .denominaciones {
      background: #f1f5f9;
      padding: 2mm;
      border-radius: 2mm;
      margin: 2mm 0;
    }
    .denom-title {
      font-weight: bold;
      text-align: center;
      margin-bottom: 2mm;
      color: #475569;
    }
    @media print {
      body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="logo">💱 ${this.empresa.nombre}</div>
    <div class="empresa">
      ${this.empresa.razonSocial}<br>
      RFC: ${this.empresa.rfc}<br>
      ${this.empresa.direccion}<br>
      ${this.empresa.telefono}
    </div>
  </div>

  <div class="titulo">COMPROBANTE DE OPERACIÓN</div>

  <div class="section">
    <div class="row">
      <span class="label">Folio:</span>
      <span class="value">${operacion.folio}</span>
    </div>
    <div class="row">
      <span class="label">Fecha:</span>
      <span class="value">${operacion.fecha}</span>
    </div>
    <div class="row">
      <span class="label">Hora:</span>
      <span class="value">${operacion.hora}</span>
    </div>
    <div class="row">
      <span class="label">Sucursal:</span>
      <span class="value">${operacion.sucursal}</span>
    </div>
    <div class="row">
      <span class="label">Cajero:</span>
      <span class="value">${operacion.cajeroNombre}</span>
    </div>
  </div>

  <div class="divider"></div>

  <div class="tipo-operacion">
    ${esCompra ? '📈 CLIENTE COMPRA' : '📉 CLIENTE VENDE'} ${operacion.divisaRecibe}
  </div>

  <div class="section">
    <div class="row">
      <span class="label">Cliente:</span>
      <span class="value">${operacion.clienteNombre}</span>
    </div>
    ${operacion.tipoID ? `
    <div class="row">
      <span class="label">${operacion.tipoID}:</span>
      <span class="value">${operacion.numeroID ?? ''}</span>
    </div>
    ` : ''}
  </div>

  <div class="divider"></div>

  <div class="monto-grande monto-entrega">
    ENTREGA: ${this.formatearMonto(operacion.montoEntrega)} ${operacion.divisaEntrega}
  </div>

  <div class="flecha">▼ TIPO CAMBIO: ${operacion.tipoCambio.toFixed(4)} ▼</div>

  <div class="monto-grande monto-recibe">
    RECIBE: ${this.formatearMonto(operacion.montoRecibe)} ${operacion.divisaRecibe}
  </div>

  ${operacion.denominacionesEntregadas && operacion.denominacionesEntregadas.length > 0 ? `
  <div class="denominaciones">
    <div class="denom-title">💵 DESGLOSE ENTREGADO</div>
    ${operacion.denominacionesEntregadas.map(d => `
    <div class="row">
      <span>$${d.valor} × ${d.cantidad}</span>
      <span class="value">$${this.formatearMonto(d.valor * d.cantidad)}</span>
    </div>
    `).join('')}
  </div>
  ` : ''}

  <div class="divider"></div>

  <div class="footer">
    Este comprobante ampara la operación de<br>
    compra-venta de divisas realizada.<br><br>
    <strong>¡Gracias por tu preferencia!</strong><br>
    ${this.empresa.eslogan ?? ''}<br><br>
    ${this.empresa.sitioWeb ?? ''}
  </div>

  <div class="qr">
    ▄▄▄▄▄▄▄ ▄▄▄▄▄ ▄▄▄▄▄▄▄<br>
    █ ▄▄▄ █ ▄█▄ █ █ ▄▄▄ █<br>
    █ ███ █ ███ █ █ ███ █<br>
    ▀▀▀▀▀▀▀ ▀▀▀▀▀ ▀▀▀▀▀▀▀<br>
    ${operacion.folio}
  </div>
</body>
</html>`
  }

  // ═══════════════════════════════════════════════════════════════════════════════════════════════
  // TICKET CORTE DE CAJA
  // ═══════════════════════════════════════════════════════════════════════════════════════════════

  generarTicketCorteCaja(corte: DatosCorteCaja, formato: FormatoSalida = 'texto'): string {
    const f = FORMATO_TERMICO

    const lineas: string[] = [
      '',
      f.centrar('╔═══════════════════════════════════════╗'),
      f.centrar(`║  💰 CORTE DE CAJA 💰  ║`),
      f.centrar('╚═══════════════════════════════════════╝'),
      '',
      f.centrar(this.empresa.razonSocial),
      '',
      f.linea,
      '',
      f.columnas('Folio:', corte.folio),
      f.columnas('Fecha:', corte.fecha),
      f.columnas('Período:', `${corte.horaInicio} - ${corte.horaFin}`),
      f.columnas('Cajero:', corte.cajero),
      f.columnas('Sucursal:', corte.sucursal),
      '',
      f.linea,
      f.centrar('RESUMEN DE OPERACIONES'),
      f.linea,
      '',
      f.columnas('Total Operaciones:', corte.resumen.totalOperaciones.toString()),
      f.columnas('  - Compras:', corte.resumen.operacionesCompra.toString()),
      f.columnas('  - Ventas:', corte.resumen.operacionesVenta.toString()),
      '',
      f.linea,
      f.centrar('SALDOS POR DIVISA'),
      f.linea,
      '',
    ]

    // Saldos por divisa
    corte.saldos.forEach(s => {
      lineas.push(
        f.centrar(`--- ${s.divisa} ---`),
        f.columnas('Saldo Inicial:', `$${this.formatearMonto(s.saldoInicial)}`),
        f.columnas('(+) Ingresos:', `$${this.formatearMonto(s.ingresos)}`),
        f.columnas('(-) Egresos:', `$${this.formatearMonto(s.egresos)}`),
        f.columnas('= Esperado:', `$${this.formatearMonto(s.saldoInicial + s.ingresos - s.egresos)}`),
        f.columnas('Contado:', `$${this.formatearMonto(s.saldoFinal)}`),
      )

      if (s.diferencia !== 0) {
        const signo = s.diferencia > 0 ? '+' : ''
        lineas.push(f.columnas('DIFERENCIA:', `${signo}$${this.formatearMonto(s.diferencia)}`))
      } else {
        lineas.push(f.columnas('DIFERENCIA:', 'CUADRADO ✓'))
      }

      lineas.push('')
    })

    // Desglose de denominaciones si existe
    if (corte.denominaciones && corte.denominaciones.length > 0) {
      lineas.push(
        f.linea,
        f.centrar('ARQUEO DE CAJA'),
        f.linea,
        '',
      )

      let divisaActual = ''
      corte.denominaciones.forEach(d => {
        if (d.divisa !== divisaActual) {
          if (divisaActual) lineas.push('')
          lineas.push(f.centrar(`--- ${d.divisa} ---`))
          divisaActual = d.divisa
        }
        const subtotal = d.valor * d.cantidad
        lineas.push(f.columnas(`$${d.valor} x ${d.cantidad}`, `$${this.formatearMonto(subtotal)}`))
      })
    }

    // Ganancia
    lineas.push(
      '',
      f.linea,
      '',
      f.columnas('GANANCIA TOTAL:', `$${this.formatearMonto(corte.resumen.gananciaTotal)} MXN`),
      '',
      f.linea,
    )

    // Observaciones
    if (corte.observaciones) {
      lineas.push(
        '',
        'OBSERVACIONES:',
        corte.observaciones,
        '',
      )
    }

    // Firmas
    lineas.push(
      '',
      f.lineaFina,
      '',
      f.centrar('_________________________'),
      f.centrar('Firma Cajero'),
      '',
      f.centrar('_________________________'),
      f.centrar('Firma Supervisor'),
      '',
      f.lineaFina,
      f.centrar(`Generado: ${new Date().toLocaleString('es-MX')}`),
      '',
    )

    const texto = lineas.join('\n')

    switch (formato) {
      case 'html':
        return this.corteAHtml(corte)
      case 'json':
        return JSON.stringify({ corte }, null, 2)
      default:
        return texto
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════════════════════════
  // CONVERSIONES
  // ═══════════════════════════════════════════════════════════════════════════════════════════════

  private textoAHtml(texto: string, operacion: DatosOperacion): string {
    const esCompra = operacion.tipoOperacion === 'compra'
    const colorTipo = esCompra ? '#10b981' : '#3b82f6'

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Ticket ${operacion.folio}</title>
  <style>
    body {
      font-family: 'Courier New', monospace;
      font-size: 12px;
      white-space: pre;
      padding: 20px;
      background: #f8fafc;
    }
    .ticket {
      background: white;
      padding: 20px;
      max-width: 320px;
      margin: 0 auto;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
      border: 1px solid #e2e8f0;
    }
  </style>
</head>
<body>
  <div class="ticket">${texto}</div>
</body>
</html>`
  }

  private corteAHtml(corte: DatosCorteCaja): string {
    const saldosHtml = corte.saldos.map(s => `
      <div class="divisa-section">
        <h4>${s.divisa}</h4>
        <div class="row"><span>Inicial:</span><span>$${this.formatearMonto(s.saldoInicial)}</span></div>
        <div class="row"><span>+Ingresos:</span><span>$${this.formatearMonto(s.ingresos)}</span></div>
        <div class="row"><span>-Egresos:</span><span>$${this.formatearMonto(s.egresos)}</span></div>
        <div class="row total"><span>Final:</span><span>$${this.formatearMonto(s.saldoFinal)}</span></div>
        <div class="row ${s.diferencia === 0 ? 'ok' : 'error'}">
          <span>Diferencia:</span>
          <span>${s.diferencia === 0 ? '✓ CUADRADO' : `$${this.formatearMonto(s.diferencia)}`}</span>
        </div>
      </div>
    `).join('')

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Corte de Caja ${corte.folio}</title>
  <style>
    body { font-family: Arial, sans-serif; padding: 20px; background: #f1f5f9; }
    .container { max-width: 800px; margin: 0 auto; background: white; padding: 30px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
    h1 { color: #1e293b; text-align: center; margin-bottom: 20px; }
    .header { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px; }
    .info { background: #f8fafc; padding: 15px; border-radius: 8px; }
    .row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e2e8f0; }
    .divisa-section { background: #f8fafc; padding: 15px; border-radius: 8px; margin-bottom: 15px; }
    .divisa-section h4 { margin: 0 0 10px 0; color: #3b82f6; }
    .total { font-weight: bold; background: #e0f2fe; border-radius: 4px; padding: 8px; }
    .ok { color: #10b981; }
    .error { color: #ef4444; font-weight: bold; }
    .ganancia { text-align: center; font-size: 24px; color: #10b981; margin: 20px 0; padding: 20px; background: #ecfdf5; border-radius: 8px; }
    .firmas { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-top: 40px; text-align: center; }
    .firma-linea { border-top: 1px solid #64748b; padding-top: 10px; margin-top: 60px; }
  </style>
</head>
<body>
  <div class="container">
    <h1>💰 CORTE DE CAJA</h1>
    
    <div class="header">
      <div class="info">
        <div class="row"><span>Folio:</span><span>${corte.folio}</span></div>
        <div class="row"><span>Fecha:</span><span>${corte.fecha}</span></div>
        <div class="row"><span>Período:</span><span>${corte.horaInicio} - ${corte.horaFin}</span></div>
      </div>
      <div class="info">
        <div class="row"><span>Cajero:</span><span>${corte.cajero}</span></div>
        <div class="row"><span>Sucursal:</span><span>${corte.sucursal}</span></div>
        <div class="row"><span>Operaciones:</span><span>${corte.resumen.totalOperaciones}</span></div>
      </div>
    </div>

    <h3>Saldos por Divisa</h3>
    ${saldosHtml}

    <div class="ganancia">
      GANANCIA TOTAL: $${this.formatearMonto(corte.resumen.gananciaTotal)} MXN
    </div>

    ${corte.observaciones ? `<p><strong>Observaciones:</strong> ${corte.observaciones}</p>` : ''}

    <div class="firmas">
      <div>
        <div class="firma-linea">Firma Cajero</div>
      </div>
      <div>
        <div class="firma-linea">Firma Supervisor</div>
      </div>
    </div>
  </div>
</body>
</html>`
  }

  // ═══════════════════════════════════════════════════════════════════════════════════════════════
  // UTILIDADES
  // ═══════════════════════════════════════════════════════════════════════════════════════════════

  private formatearMonto(monto: number): string {
    return new Intl.NumberFormat('es-MX', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(monto)
  }

  private generarQR(_folio: string): string {
    // Representación ASCII de un QR code simulado
    return `
  ▄▄▄▄▄▄▄ ▄▄▄ ▄▄▄▄▄▄▄
  █ ▄▄▄ █ ▀▄▀ █ ▄▄▄ █
  █ ███ █ ▄▀▄ █ ███ █
  █▄▄▄▄▄█ ▄ ▄ █▄▄▄▄▄█
  ▄▄▄▄▄ ▄▄▀▄▀▄▄ ▄ ▄ ▄
  ██▀▀█▄▄▀▄▄▄▀▀▄▀▄▀▄▀
  ▄▄▄▄▄▄▄ █▀▄▀▄██▀▀ ▄
  █ ▄▄▄ █ ▄▄▀▄▀▄▀▄█▀█
  █ ███ █ ███▀▄▀▄▀▀▀▀
  █▄▄▄▄▄█ █▀ ▀▀▄▄▀▀▀▀`
  }

  setEmpresa(empresa: Partial<DatosEmpresa>): void {
    this.empresa = { ...this.empresa, ...empresa }
  }

  getEmpresa(): DatosEmpresa {
    return { ...this.empresa }
  }

  /**
   * Abre ventana de impresión del navegador
   */
  imprimir(contenidoHtml: string): void {
    if (typeof window === 'undefined') {
      logger.warn('imprimir() solo funciona en el navegador')
      return
    }

    const ventana = window.open('', '_blank', 'width=400,height=600')
    if (ventana) {
      ventana.document.write(contenidoHtml)
      ventana.document.close()
      ventana.focus()
      setTimeout(() => {
        ventana.print()
      }, 250)
    }
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export const ticketsService = TicketsService.getInstance()

export default ticketsService
