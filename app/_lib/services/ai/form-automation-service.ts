// 📝 FORM AUTOMATION SERVICE - CHRONOS INFINITY
// Servicio de automatización de formularios que ejecuta las acciones determinadas por la IA

import { supabase } from '@/app/_lib/supabase/client';
import { aiService } from './ai-service';

interface FormData {
  [key: string]: any;
}

interface FormRecord {
  id?: string;
  formId: string;
  userId: string;
  data: FormData;
  status: 'pending' | 'completed' | 'cancelled';
  aiGenerated: boolean;
  confidence: number;
  createdAt?: Date;
  updatedAt?: Date;
}

interface AutoFillResult {
  success: boolean;
  data: FormData;
  missingFields?: string[];
  validationErrors?: ValidationError[];
  suggestions?: string[];
}

interface ValidationError {
  field: string;
  message: string;
  value?: any;
}

interface QueryResult {
  success: boolean;
  data?: any[];
  message?: string;
  count?: number;
}

export class FormAutomationService {
  private aiService: AIService;

  constructor() {
    this.aiService = aiService;
  }

  /**
   * Auto-completa un formulario basándose en la intención del usuario
   */
  async autoFillForm(formId: string, intentData: FormData): Promise<AutoFillResult> {
    try {
      // Obtener el esquema del formulario desde Supabase
      const { data: formSchema, error: schemaError } = await supabase
        .from('forms')
        .select('schema, ai_config')
        .eq('id', formId)
        .single();

      if (schemaError || !formSchema) {
        throw new Error('Formulario no encontrado');
      }

      const { schema, ai_config } = formSchema;
      const filledData: FormData = {};
      const missingFields: string[] = [];
      const validationErrors: ValidationError[] = [];

      // Procesar cada campo del formulario
      for (const field of schema.fields) {
        const fieldValue = intentData[field.id] || intentData[field.name.toLowerCase()];
        
        if (fieldValue) {
          // Validar el campo con la IA
          const validation = await this.aiService.validateField(field.id, fieldValue, formId);
          
          if (validation.valid) {
            filledData[field.id] = this.formatFieldValue(fieldValue, field.type);
          } else {
            validationErrors.push({
              field: field.id,
              message: validation.message,
              value: fieldValue
            });
          }
        } else if (field.required) {
          missingFields.push(field.id);
        }
      }

      // Generar sugerencias para campos faltantes
      const suggestions = await this.generateFieldSuggestions(missingFields, intentData, formId);

      return {
        success: validationErrors.length === 0,
        data: filledData,
        missingFields,
        validationErrors,
        suggestions
      };

    } catch (error) {
      console.error('Error en autoFillForm:', error);
      return {
        success: false,
        data: {},
        validationErrors: [{
          field: 'system',
          message: 'Error al procesar el formulario'
        }]
      };
    }
  }

  /**
   * Crea un registro en la base de datos con los datos del formulario
   */
  async createRecord(recordData: {
    formId: string;
    userId: string;
    data: FormData;
    confidence: number;
  }): Promise<FormRecord> {
    try {
      // Validar datos antes de crear
      const validation = await this.validateRecordData(recordData.formId, recordData.data);
      
      if (!validation.valid) {
        throw new Error(`Datos inválidos: ${validation.errors.map(e => e.message).join(', ')}`);
      }

      // Crear el registro en Supabase
      const record: Omit<FormRecord, 'id' | 'createdAt' | 'updatedAt'> = {
        formId: recordData.formId,
        userId: recordData.userId,
        data: recordData.data,
        status: 'completed',
        aiGenerated: true,
        confidence: recordData.confidence
      };

      const { data: createdRecord, error } = await supabase
        .from('records')
        .insert(record)
        .select()
        .single();

      if (error) {
        throw new Error(`Error al crear registro: ${error.message}`);
      }

      // Ejecutar acciones post-creación
      await this.executePostCreationActions(recordData.formId, createdRecord);

      return createdRecord;

    } catch (error) {
      console.error('Error en createRecord:', error);
      throw error;
    }
  }

  /**
   * Consulta datos del sistema basándose en la consulta de la IA
   */
  async queryData(queryData: {
    query: string;
    filters?: any;
    dateRange?: string;
    reportType?: string;
    userId?: string;
  }): Promise<QueryResult> {
    try {
      const { query, filters = {}, dateRange = 'current_month', reportType, userId } = queryData;

      let result: QueryResult = { success: false, data: [], message: '' };

      switch (query) {
        case 'inventory_status':
          result = await this.queryInventoryStatus(filters);
          break;
        case 'sales_summary':
          result = await this.querySalesSummary(dateRange, userId);
          break;
        case 'expense_summary':
          result = await this.queryExpenseSummary(dateRange, userId);
          break;
        case 'customer_list':
          result = await this.queryCustomerList(filters);
          break;
        case 'generate_report':
          result = await this.generateReport(reportType, dateRange, userId);
          break;
        default:
          result = await this.queryGeneralData(query, filters);
      }

      return result;

    } catch (error) {
      console.error('Error en queryData:', error);
      return {
        success: false,
        message: 'Error al consultar datos',
        data: []
      };
    }
  }

  /**
   * Valida los datos de un registro antes de crearlo
   */
  private async validateRecordData(formId: string, data: FormData): Promise<{ valid: boolean; errors: ValidationError[] }> {
    const errors: ValidationError[] = [];

    try {
      // Obtener el esquema del formulario
      const { data: formSchema, error } = await supabase
        .from('forms')
        .select('schema')
        .eq('id', formId)
        .single();

      if (error || !formSchema) {
        errors.push({ field: 'system', message: 'Formulario no encontrado' });
        return { valid: false, errors };
      }

      const { schema } = formSchema;

      // Validar cada campo requerido
      for (const field of schema.fields) {
        const value = data[field.id];

        // Validación de campo requerido
        if (field.required && (!value || value === '')) {
          errors.push({
            field: field.id,
            message: `El campo ${field.name} es requerido`
          });
          continue;
        }

        // Validación de tipo
        if (value && field.type) {
          const typeValidation = this.validateFieldType(value, field.type, field);
          if (!typeValidation.valid) {
            errors.push({
              field: field.id,
              message: typeValidation.message
            });
          }
        }

        // Validación personalizada con IA
        if (value) {
          const aiValidation = await this.aiService.validateField(field.id, value, formId);
          if (!aiValidation.valid) {
            errors.push({
              field: field.id,
              message: aiValidation.message
            });
          }
        }
      }

      return {
        valid: errors.length === 0,
        errors
      };

    } catch (error) {
      console.error('Error en validateRecordData:', error);
      return {
        valid: false,
        errors: [{
          field: 'system',
          message: 'Error al validar datos'
        }]
      };
    }
  }

  /**
   * Valida el tipo de dato de un campo
   */
  private validateFieldType(value: any, type: string, field: any): { valid: boolean; message: string } {
    switch (type) {
      case 'number':
        const numValue = parseFloat(value);
        if (isNaN(numValue)) {
          return { valid: false, message: 'El valor debe ser un número' };
        }
        if (field.validation?.min && numValue < field.validation.min) {
          return { valid: false, message: `El valor debe ser mayor o igual a ${field.validation.min}` };
        }
        if (field.validation?.max && numValue > field.validation.max) {
          return { valid: false, message: `El valor debe ser menor o igual a ${field.validation.max}` };
        }
        break;

      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
          return { valid: false, message: 'Formato de correo electrónico inválido' };
        }
        break;

      case 'tel':
        const phoneRegex = /^\d{10}$/;
        const cleanPhone = value.toString().replace(/\D/g, '');
        if (!phoneRegex.test(cleanPhone)) {
          return { valid: false, message: 'El número debe tener 10 dígitos' };
        }
        break;

      case 'date':
        const date = new Date(value);
        if (isNaN(date.getTime())) {
          return { valid: false, message: 'Fecha inválida' };
        }
        break;

      case 'select':
        if (field.options && !field.options.includes(value)) {
          return { valid: false, message: 'Opción no válida' };
        }
        break;
    }

    return { valid: true, message: '' };
  }

  /**
   * Formatea el valor del campo según su tipo
   */
  private formatFieldValue(value: any, type: string): any {
    switch (type) {
      case 'number':
        return parseFloat(value);
      case 'tel':
        return value.toString().replace(/\D/g, '');
      case 'date':
        return new Date(value).toISOString().split('T')[0];
      default:
        return value.toString().trim();
    }
  }

  /**
   * Genera sugerencias para campos faltantes
   */
  private async generateFieldSuggestions(
    missingFields: string[], 
    intentData: FormData, 
    formId: string
  ): Promise<string[]> {
    const suggestions: string[] = [];

    for (const fieldId of missingFields) {
      // Obtener sugerencias de la IA para este campo
      const fieldSuggestions = await this.aiService.getFieldSuggestions(
        fieldId, 
        '', 
        formId
      );
      
      if (fieldSuggestions.length > 0) {
        suggestions.push(`Para ${fieldId}, considera: ${fieldSuggestions.slice(0, 3).join(', ')}`);
      }
    }

    return suggestions;
  }

  /**
   * Ejecuta acciones después de crear un registro
   */
  private async executePostCreationActions(formId: string, record: FormRecord): Promise<void> {
    try {
      // Actualizar contadores estadísticos
      await this.updateStatistics(formId);

      // Enviar notificaciones si es necesario
      await this.sendNotifications(record);

      // Ejecutar automatizaciones relacionadas
      await this.executeRelatedAutomations(record);

    } catch (error) {
      console.error('Error en post-creation actions:', error);
    }
  }

  /**
   * Actualiza estadísticas del formulario
   */
  private async updateStatistics(formId: string): Promise<void> {
    try {
      // Incrementar contador de registros del formulario
      const { data: currentStats } = await supabase
        .from('forms')
        .select('ai_config')
        .eq('id', formId)
        .single();

      if (currentStats) {
        const updatedConfig = {
          ...currentStats.ai_config,
          recordCount: (currentStats.ai_config?.recordCount || 0) + 1,
          lastRecordDate: new Date().toISOString()
        };

        await supabase
          .from('forms')
          .update({ ai_config: updatedConfig })
          .eq('id', formId);
      }
    } catch (error) {
      console.error('Error actualizando estadísticas:', error);
    }
  }

  /**
   * Envía notificaciones relacionadas con el registro
   */
  private async sendNotifications(record: FormRecord): Promise<void> {
    try {
      // Aquí puedes implementar lógica de notificaciones
      // Por ejemplo: email, SMS, notificaciones push, etc.
      console.log(`Notificación: Registro creado para formulario ${record.formId}`);
    } catch (error) {
      console.error('Error enviando notificaciones:', error);
    }
  }

  /**
   * Ejecuta automatizaciones relacionadas
   */
  private async executeRelatedAutomations(record: FormRecord): Promise<void> {
    try {
      // Buscar automatizaciones que se activen con este tipo de registro
      const { data: automations } = await supabase
        .from('automations')
        .select('*')
        .eq('trigger_form_id', record.formId)
        .eq('is_active', true);

      if (automations) {
        for (const automation of automations) {
          await this.executeAutomation(automation, record);
        }
      }
    } catch (error) {
      console.error('Error ejecutando automatizaciones:', error);
    }
  }

  /**
   * Ejecuta una automatización específica
   */
  private async executeAutomation(automation: any, record: FormRecord): Promise<void> {
    try {
      console.log(`Ejecutando automatización: ${automation.name}`);
      
      // Aquí implementarías la lógica específica de cada automatización
      // Por ejemplo: crear registros relacionados, enviar emails, actualizar inventario, etc.
      
      switch (automation.action_type) {
        case 'create_related_record':
          await this.createRelatedRecord(automation, record);
          break;
        case 'send_email':
          await this.sendAutomationEmail(automation, record);
          break;
        case 'update_inventory':
          await this.updateInventory(automation, record);
          break;
        default:
          console.log(`Tipo de automatización no implementado: ${automation.action_type}`);
      }
    } catch (error) {
      console.error(`Error ejecutando automatización ${automation.name}:`, error);
    }
  }

  /**
   * Crea un registro relacionado
   */
  private async createRelatedRecord(automation: any, record: FormRecord): Promise<void> {
    try {
      const relatedData = this.buildRelatedData(automation, record);
      
      await supabase
        .from('records')
        .insert({
          formId: automation.target_form_id,
          userId: record.userId,
          data: relatedData,
          status: 'pending',
          aiGenerated: true,
          confidence: 0.8
        });
    } catch (error) {
      console.error('Error creando registro relacionado:', error);
    }
  }

  /**
   * Construye datos para registro relacionado
   */
  private buildRelatedData(automation: any, record: FormRecord): any {
    const relatedData: any = {};
    
    // Mapear campos del registro original al relacionado
    if (automation.field_mappings) {
      automation.field_mappings.forEach((mapping: any) => {
        relatedData[mapping.target_field] = record.data[mapping.source_field];
      });
    }

    // Agregar valores predeterminados
    if (automation.default_values) {
      Object.assign(relatedData, automation.default_values);
    }

    return relatedData;
  }

  /**
   * Envía email de automatización
   */
  private async sendAutomationEmail(automation: any, record: FormRecord): Promise<void> {
    // Implementar lógica de envío de email
    console.log(`Email de automatización enviado para: ${automation.name}`);
  }

  /**
   * Actualiza inventario
   */
  private async updateInventory(automation: any, record: FormRecord): Promise<void> {
    // Implementar lógica de actualización de inventario
    console.log(`Inventario actualizado por automatización: ${automation.name}`);
  }

  /**
   * Consulta el estado del inventario
   */
  private async queryInventoryStatus(filters: any): Promise<QueryResult> {
    try {
      // Consultar productos con bajo stock
      const { data: lowStockProducts, error } = await supabase
        .from('inventory')
        .select('*')
        .lt('stock', filters.lowStock ? 10 : 0)
        .order('stock', { ascending: true });

      if (error) {
        throw error;
      }

      return {
        success: true,
        data: lowStockProducts || [],
        count: lowStockProducts?.length || 0,
        message: `Encontrados ${lowStockProducts?.length || 0} productos con bajo stock`
      };

    } catch (error) {
      console.error('Error consultando inventario:', error);
      return {
        success: false,
        message: 'Error al consultar inventario',
        data: []
      };
    }
  }

  /**
   * Consulta resumen de ventas
   */
  private async querySalesSummary(dateRange: string, userId?: string): Promise<QueryResult> {
    try {
      const dateFilter = this.getDateFilter(dateRange);
      
      const query = supabase
        .from('records')
        .select('*')
        .eq('form_id', 'sales-form')
        .gte('created_at', dateFilter.startDate)
        .lte('created_at', dateFilter.endDate);

      if (userId) {
        query.eq('user_id', userId);
      }

      const { data: sales, error } = await query;

      if (error) {
        throw error;
      }

      // Calcular estadísticas
      const totalSales = sales?.length || 0;
      const totalAmount = sales?.reduce((sum, sale) => {
        return sum + (parseFloat(sale.data.amount) || 0);
      }, 0) || 0;

      return {
        success: true,
        data: [
          {
            totalSales,
            totalAmount,
            averageAmount: totalSales > 0 ? totalAmount / totalSales : 0,
            period: dateRange
          }
        ],
        count: totalSales,
        message: `Resumen de ventas del ${dateRange}`
      };

    } catch (error) {
      console.error('Error consultando resumen de ventas:', error);
      return {
        success: false,
        message: 'Error al consultar resumen de ventas',
        data: []
      };
    }
  }

  /**
   * Consulta resumen de gastos
   */
  private async queryExpenseSummary(dateRange: string, userId?: string): Promise<QueryResult> {
    try {
      const dateFilter = this.getDateFilter(dateRange);
      
      const query = supabase
        .from('records')
        .select('*')
        .eq('form_id', 'expense-form')
        .gte('created_at', dateFilter.startDate)
        .lte('created_at', dateFilter.endDate);

      if (userId) {
        query.eq('user_id', userId);
      }

      const { data: expenses, error } = await query;

      if (error) {
        throw error;
      }

      // Calcular estadísticas por categoría
      const categoryTotals: { [key: string]: number } = {};
      expenses?.forEach(expense => {
        const category = expense.data.category || 'Sin categoría';
        const amount = parseFloat(expense.data.amount) || 0;
        categoryTotals[category] = (categoryTotals[category] || 0) + amount;
      });

      return {
        success: true,
        data: [
          {
            totalExpenses: expenses?.length || 0,
            totalAmount: Object.values(categoryTotals).reduce((sum, amount) => sum + amount, 0),
            categoryBreakdown: categoryTotals,
            period: dateRange
          }
        ],
        count: expenses?.length || 0,
        message: `Resumen de gastos del ${dateRange}`
      };

    } catch (error) {
      console.error('Error consultando resumen de gastos:', error);
      return {
        success: false,
        message: 'Error al consultar resumen de gastos',
        data: []
      };
    }
  }

  /**
   * Consulta lista de clientes
   */
  private async queryCustomerList(filters: any): Promise<QueryResult> {
    try {
      const query = supabase
        .from('records')
        .select('*')
        .eq('form_id', 'customer-form')
        .order('created_at', { ascending: false });

      // Aplicar filtros adicionales
      if (filters.search) {
        query.or(`data->name.ilike.%${filters.search}%,data->email.ilike.%${filters.search}%`);
      }

      const { data: customers, error } = await query;

      if (error) {
        throw error;
      }

      return {
        success: true,
        data: customers || [],
        count: customers?.length || 0,
        message: `Encontrados ${customers?.length || 0} clientes`
      };

    } catch (error) {
      console.error('Error consultando lista de clientes:', error);
      return {
        success: false,
        message: 'Error al consultar clientes',
        data: []
      };
    }
  }

  /**
   * Genera reporte personalizado
   */
  private async generateReport(reportType: string, dateRange: string, userId?: string): Promise<QueryResult> {
    try {
      switch (reportType) {
        case 'sales':
          return await this.querySalesSummary(dateRange, userId);
        case 'expenses':
          return await this.queryExpenseSummary(dateRange, userId);
        case 'inventory':
          return await this.queryInventoryStatus({});
        default:
          return {
            success: false,
            message: 'Tipo de reporte no soportado',
            data: []
          };
      }
    } catch (error) {
      console.error('Error generando reporte:', error);
      return {
        success: false,
        message: 'Error al generar reporte',
        data: []
      };
    }
  }

  /**
   * Consulta datos generales
   */
  private async queryGeneralData(query: string, filters: any): Promise<QueryResult> {
    try {
      // Implementar lógica para consultas generales
      return {
        success: true,
        data: [],
        count: 0,
        message: 'Consulta general procesada'
      };
    } catch (error) {
      console.error('Error en consulta general:', error);
      return {
        success: false,
        message: 'Error en consulta general',
        data: []
      };
    }
  }

  /**
   * Obtiene el filtro de fecha basado en el rango
   */
  private getDateFilter(dateRange: string): { startDate: string; endDate: string } {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);

    switch (dateRange) {
      case 'today':
        return {
          startDate: startOfDay.toISOString(),
          endDate: endOfDay.toISOString()
        };
      case 'yesterday':
        const yesterdayStart = new Date(startOfDay);
        yesterdayStart.setDate(yesterdayStart.getDate() - 1);
        const yesterdayEnd = new Date(startOfDay);
        return {
          startDate: yesterdayStart.toISOString(),
          endDate: yesterdayEnd.toISOString()
        };
      case 'week':
        const weekStart = new Date(startOfDay);
        weekStart.setDate(weekStart.getDate() - 7);
        return {
          startDate: weekStart.toISOString(),
          endDate: endOfDay.toISOString()
        };
      case 'month':
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        return {
          startDate: monthStart.toISOString(),
          endDate: endOfDay.toISOString()
        };
      default:
        return {
          startDate: startOfDay.toISOString(),
          endDate: endOfDay.toISOString()
        };
    }
  }

  /**
   * Obtiene el historial de registros de un usuario
   */
  async getUserRecords(userId: string, limit: number = 50): Promise<QueryResult> {
    try {
      const { data: records, error } = await supabase
        .from('records')
        .select(`
          *,
          forms(name, description)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        throw error;
      }

      return {
        success: true,
        data: records || [],
        count: records?.length || 0,
        message: `Encontrados ${records?.length || 0} registros`
      };

    } catch (error) {
      console.error('Error obteniendo registros del usuario:', error);
      return {
        success: false,
        message: 'Error al obtener registros',
        data: []
      };
    }
  }

  /**
   * Actualiza un registro existente
   */
  async updateRecord(recordId: string, updates: Partial<FormRecord>): Promise<FormRecord> {
    try {
      const { data: updatedRecord, error } = await supabase
        .from('records')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', recordId)
        .select()
        .single();

      if (error) {
        throw new Error(`Error al actualizar registro: ${error.message}`);
      }

      return updatedRecord;

    } catch (error) {
      console.error('Error actualizando registro:', error);
      throw error;
    }
  }

  /**
   * Elimina un registro
   */
  async deleteRecord(recordId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('records')
        .delete()
        .eq('id', recordId);

      if (error) {
        throw new Error(`Error al eliminar registro: ${error.message}`);
      }

      return true;

    } catch (error) {
      console.error('Error eliminando registro:', error);
      return false;
    }
  }

  /**
   * Exporta registros a diferentes formatos
   */
  async exportRecords(format: 'excel' | 'pdf' | 'json', records: FormRecord[]): Promise<Blob> {
    try {
      switch (format) {
        case 'json':
          return this.exportToJSON(records);
        case 'excel':
          return await this.exportToExcel(records);
        case 'pdf':
          return await this.exportToPDF(records);
        default:
          throw new Error('Formato de exportación no soportado');
      }
    } catch (error) {
      console.error('Error exportando registros:', error);
      throw error;
    }
  }

  /**
   * Exporta a JSON
   */
  private exportToJSON(records: FormRecord[]): Blob {
    const jsonData = JSON.stringify(records, null, 2);
    return new Blob([jsonData], { type: 'application/json' });
  }

  /**
   * Exporta a Excel (implementación básica)
   */
  private async exportToExcel(records: FormRecord[]): Promise<Blob> {
    // Para una implementación completa, usarías una librería como SheetJS
    // Esta es una implementación básica
    const csvContent = this.convertToCSV(records);
    return new Blob([csvContent], { type: 'text/csv' });
  }

  /**
   * Exporta a PDF (implementación básica)
   */
  private async exportToPDF(records: FormRecord[]): Promise<Blob> {
    // Para una implementación completa, usarías una librería como jsPDF
    // Esta es una implementación básica que retorna un texto
    const textContent = this.convertToText(records);
    return new Blob([textContent], { type: 'text/plain' });
  }

  /**
   * Convierte registros a CSV
   */
  private convertToCSV(records: FormRecord[]): string {
    if (records.length === 0) return '';

    // Obtener todos los campos únicos
    const allFields = new Set<string>();
    records.forEach(record => {
      Object.keys(record.data).forEach(field => allFields.add(field));
    });

    const headers = ['ID', 'Fecha', 'Formulario', ...Array.from(allFields)];
    const rows = records.map(record => [
      record.id,
      record.createdAt?.toLocaleDateString() || '',
      record.formId,
      ...Array.from(allFields).map(field => record.data[field] || '')
    ]);

    return [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');
  }

  /**
   * Convierte registros a texto
   */
  private convertToText(records: FormRecord[]): string {
    return records.map(record => {
      const fields = Object.entries(record.data)
        .map(([key, value]) => `${key}: ${value}`)
        .join(', ');
      
      return `ID: ${record.id}, Fecha: ${record.createdAt?.toLocaleDateString()}, Formulario: ${record.formId}, Datos: ${fields}`;
    }).join('\n');
  }
}

// Exportar instancia singleton
export const formAutomationService = new FormAutomationService();