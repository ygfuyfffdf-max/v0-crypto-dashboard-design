/**
 * ╔════════════════════════════════════════════════════════════════════════════╗
 * ║                   CASA DE CAMBIO API SERVICE (Frontend)                    ║
 * ╚════════════════════════════════════════════════════════════════════════════╝
 */

import axios, { AxiosInstance } from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

class CasaCambioAPIService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: `${API_URL}/casa-cambio`,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Interceptor para agregar token
    this.api.interceptors.request.use((config) => {
      const token = this.getToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });
  }

  private getToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('accessToken');
    }
    return null;
  }

  // ========== TIPOS DE CAMBIO ==========

  async getTipoCambioActual() {
    try {
      const response = await this.api.get('/tipo-cambio/actual');
      return response.data;
    } catch (error: any) {
      console.error('Error getting tipo cambio:', error);
      throw error;
    }
  }

  async getHistoricoTipoCambio(fechaDesde?: Date, fechaHasta?: Date, limit: number = 100) {
    try {
      const params: any = { limit };
      if (fechaDesde) params.fechaDesde = fechaDesde.toISOString();
      if (fechaHasta) params.fechaHasta = fechaHasta.toISOString();

      const response = await this.api.get('/tipo-cambio/historico', { params });
      return response.data;
    } catch (error: any) {
      console.error('Error getting histórico tipo cambio:', error);
      throw error;
    }
  }

  async actualizarTipoCambio(usdToMxn: number, comisionCompra: number = 0.02, comisionVenta: number = 0.02) {
    try {
      const response = await this.api.post('/tipo-cambio/actualizar', {
        usdToMxn,
        comisionCompra,
        comisionVenta,
        fuente: 'manual',
      });
      return response.data;
    } catch (error: any) {
      console.error('Error actualizando tipo cambio:', error);
      throw error;
    }
  }

  async actualizarTipoCambioDesdeAPI() {
    try {
      const response = await this.api.post('/tipo-cambio/actualizar-api');
      return response.data;
    } catch (error: any) {
      console.error('Error actualizando tipo cambio desde API:', error);
      throw error;
    }
  }

  // ========== CÁLCULOS Y CONVERSIONES ==========

  async calcularConversionUSDtoMXN(montoUSD: number) {
    try {
      const response = await this.api.post('/calcular/usd-to-mxn', { montoUSD });
      return response.data;
    } catch (error: any) {
      console.error('Error calculando conversión USD->MXN:', error);
      throw error;
    }
  }

  async calcularConversionMXNtoUSD(montoMXN: number) {
    try {
      const response = await this.api.post('/calcular/mxn-to-usd', { montoMXN });
      return response.data;
    } catch (error: any) {
      console.error('Error calculando conversión MXN->USD:', error);
      throw error;
    }
  }

  // ========== OPERACIONES ==========

  async getOperaciones(filters?: {
    tipo?: 'compra_usd' | 'venta_usd';
    clienteId?: string;
    fechaDesde?: Date;
    fechaHasta?: Date;
    limit?: number;
  }) {
    try {
      const params: any = {};
      if (filters?.tipo) params.tipo = filters.tipo;
      if (filters?.clienteId) params.clienteId = filters.clienteId;
      if (filters?.fechaDesde) params.fechaDesde = filters.fechaDesde.toISOString();
      if (filters?.fechaHasta) params.fechaHasta = filters.fechaHasta.toISOString();
      if (filters?.limit) params.limit = filters.limit;

      const response = await this.api.get('/operaciones', { params });
      return response.data;
    } catch (error: any) {
      console.error('Error getting operaciones:', error);
      throw error;
    }
  }

  async registrarOperacion(data: {
    tipo: 'compra_usd' | 'venta_usd';
    montoOriginal: number;
    monedaOriginal: 'USD' | 'MXN';
    clienteId?: string;
    clienteNombre?: string;
    notas?: string;
  }) {
    try {
      const response = await this.api.post('/operaciones', data);
      return response.data;
    } catch (error: any) {
      console.error('Error registrando operación:', error);
      throw error;
    }
  }

  // ========== ESTADÍSTICAS ==========

  async getEstadisticas(fechaDesde?: Date, fechaHasta?: Date) {
    try {
      const params: any = {};
      if (fechaDesde) params.fechaDesde = fechaDesde.toISOString();
      if (fechaHasta) params.fechaHasta = fechaHasta.toISOString();

      const response = await this.api.get('/estadisticas', { params });
      return response.data;
    } catch (error: any) {
      console.error('Error getting estadísticas:', error);
      throw error;
    }
  }
}

// Exportar instancia singleton
export const casaCambioAPI = new CasaCambioAPIService();

// Exportar también la clase para testing
export default CasaCambioAPIService;
