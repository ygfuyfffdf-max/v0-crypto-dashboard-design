-- 🤖 AI AUTOMATION TABLES - CHRONOS INFINITY
-- Tablas para el sistema completo de automatización inteligente

-- Users table (extiende la tabla existente de Supabase Auth)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    preferences JSONB DEFAULT '{}',
    role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('admin', 'user', 'guest')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Forms table - Plantillas de formularios dinámicos
CREATE TABLE IF NOT EXISTS forms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    schema JSONB NOT NULL, -- Estructura del formulario
    is_active BOOLEAN DEFAULT true,
    ai_config JSONB DEFAULT '{}', -- Configuración específica de IA
    category VARCHAR(50) DEFAULT 'general', -- Categoría: sales, expenses, clients, etc.
    tags TEXT[] DEFAULT '{}', -- Etiquetas para búsqueda
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Form fields table - Campos individuales de formularios
CREATE TABLE IF NOT EXISTS form_fields (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    form_id UUID REFERENCES forms(id) ON DELETE CASCADE,
    field_name VARCHAR(100) NOT NULL,
    field_type VARCHAR(50) NOT NULL, -- text, number, date, select, etc.
    label VARCHAR(200) NOT NULL,
    placeholder TEXT,
    validation_rules JSONB DEFAULT '{}', -- Reglas de validación
    ai_mapping JSONB DEFAULT '{}', -- Mapeo para autocompletado IA
    order_index INTEGER DEFAULT 0,
    is_required BOOLEAN DEFAULT false,
    default_value TEXT,
    options JSONB DEFAULT '[]', -- Opciones para selects, radios, etc.
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Records table - Registros generados por usuarios o IA
CREATE TABLE IF NOT EXISTS records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    form_id UUID REFERENCES forms(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'cancelled', 'draft')),
    filled_data JSONB NOT NULL, -- Datos completados del formulario
    ai_generated BOOLEAN DEFAULT false, -- Si fue generado por IA
    ai_confidence DECIMAL(3,2) DEFAULT 0.0, -- Confianza de la IA
    validation_errors JSONB DEFAULT '[]', -- Errores de validación
    submitted_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Record data table - Datos individuales de cada registro
CREATE TABLE IF NOT EXISTS record_data (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    record_id UUID REFERENCES records(id) ON DELETE CASCADE,
    field_name VARCHAR(100) NOT NULL,
    field_value TEXT,
    is_validated BOOLEAN DEFAULT false,
    validation_notes TEXT,
    ai_suggested BOOLEAN DEFAULT false, -- Si fue sugerido por IA
    user_confirmed BOOLEAN DEFAULT true, -- Si el usuario confirmó el dato
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AI conversations table - Historial de conversaciones con IA
CREATE TABLE IF NOT EXISTS ai_conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    context_type VARCHAR(50) NOT NULL, -- Tipo de contexto: form, query, report, etc.
    context_data JSONB DEFAULT '{}', -- Datos del contexto
    intent VARCHAR(100), -- Intención detectada
    confidence DECIMAL(3,2) DEFAULT 0.0, -- Confianza de la intención
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ended_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AI messages table - Mensajes individuales de conversaciones
CREATE TABLE IF NOT EXISTS ai_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID REFERENCES ai_conversations(id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
    content TEXT NOT NULL,
    action_data JSONB DEFAULT '{}', -- Datos de acción si aplica
    intent VARCHAR(100), -- Intención detectada
    confidence DECIMAL(3,2) DEFAULT 0.0,
    processing_time_ms INTEGER, -- Tiempo de procesamiento
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AI automation logs table - Registro de acciones automatizadas
CREATE TABLE IF NOT EXISTS ai_automation_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    conversation_id UUID REFERENCES ai_conversations(id) ON DELETE SET NULL,
    action_type VARCHAR(50) NOT NULL, -- Tipo de acción: create_record, fill_form, etc.
    action_data JSONB NOT NULL, -- Datos de la acción
    result_status VARCHAR(20) DEFAULT 'success' CHECK (result_status IN ('success', 'error', 'warning')),
    result_data JSONB DEFAULT '{}', -- Resultado de la acción
    error_message TEXT,
    execution_time_ms INTEGER, -- Tiempo de ejecución
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Form templates table - Plantillas predefinidas de formularios
CREATE TABLE IF NOT EXISTS form_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    category VARCHAR(50) NOT NULL,
    schema JSONB NOT NULL,
    ai_config JSONB DEFAULT '{}',
    is_system BOOLEAN DEFAULT false, -- Si es plantilla del sistema
    is_active BOOLEAN DEFAULT true,
    usage_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AI training data table - Datos para entrenamiento de IA
CREATE TABLE IF NOT EXISTS ai_training_data (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    intent VARCHAR(100) NOT NULL,
    example_phrase TEXT NOT NULL,
    entities JSONB DEFAULT '{}',
    response_template TEXT,
    is_active BOOLEAN DEFAULT true,
    accuracy_score DECIMAL(3,2) DEFAULT 0.0,
    usage_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_forms_user_id ON forms(user_id);
CREATE INDEX IF NOT EXISTS idx_forms_active ON forms(is_active);
CREATE INDEX IF NOT EXISTS idx_forms_category ON forms(category);
CREATE INDEX IF NOT EXISTS idx_form_fields_form_id ON form_fields(form_id);
CREATE INDEX IF NOT EXISTS idx_records_form_id ON records(form_id);
CREATE INDEX IF NOT EXISTS idx_records_user_id ON records(user_id);
CREATE INDEX IF NOT EXISTS idx_records_status ON records(status);
CREATE INDEX IF NOT EXISTS idx_records_ai_generated ON records(ai_generated);
CREATE INDEX IF NOT EXISTS idx_record_data_record_id ON record_data(record_id);
CREATE INDEX IF NOT EXISTS idx_ai_conv_user_id ON ai_conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_conv_context ON ai_conversations(context_type);
CREATE INDEX IF NOT EXISTS idx_ai_conv_status ON ai_conversations(status);
CREATE INDEX IF NOT EXISTS idx_ai_messages_conversation_id ON ai_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_ai_messages_created_at ON ai_messages(created_at);
CREATE INDEX IF NOT EXISTS idx_ai_logs_user_id ON ai_automation_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_logs_action_type ON ai_automation_logs(action_type);
CREATE INDEX IF NOT EXISTS idx_ai_logs_created_at ON ai_automation_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_form_templates_category ON form_templates(category);
CREATE INDEX IF NOT EXISTS idx_form_templates_active ON form_templates(is_active);
CREATE INDEX IF NOT EXISTS idx_ai_training_intent ON ai_training_data(intent);
CREATE INDEX IF NOT EXISTS idx_ai_training_active ON ai_training_data(is_active);

-- Insertar datos de ejemplo para plantillas de formularios
INSERT INTO form_templates (name, description, category, schema, ai_config) VALUES
('Venta Simple', 'Formulario básico para registrar ventas', 'sales', '{
  "title": "Registro de Venta",
  "fields": [
    {
      "name": "cliente",
      "type": "text",
      "label": "Nombre del Cliente",
      "required": true,
      "ai_mapping": {"entity": "cliente", "type": "name"}
    },
    {
      "name": "monto",
      "type": "number",
      "label": "Monto de la Venta",
      "required": true,
      "ai_mapping": {"entity": "monto", "type": "currency"}
    },
    {
      "name": "metodo_pago",
      "type": "select",
      "label": "Método de Pago",
      "options": ["Efectivo", "Tarjeta", "Transferencia"],
      "required": true
    }
  ]
}', '{"intents": ["register_sale"], "auto_complete": true}'),

('Gasto Operativo', 'Formulario para registrar gastos de operación', 'expenses', '{
  "title": "Registro de Gasto",
  "fields": [
    {
      "name": "descripcion",
      "type": "text",
      "label": "Descripción del Gasto",
      "required": true
    },
    {
      "name": "monto",
      "type": "number",
      "label": "Monto",
      "required": true,
      "ai_mapping": {"entity": "monto", "type": "currency"}
    },
    {
      "name": "categoria",
      "type": "select",
      "label": "Categoría",
      "options": ["Oficina", "Transporte", "Servicios", "Materiales"],
      "required": true
    }
  ]
}', '{"intents": ["manage_expense"], "auto_complete": true}'),

('Cliente Nuevo', 'Formulario para agregar nuevos clientes', 'clients', '{
  "title": "Nuevo Cliente",
  "fields": [
    {
      "name": "nombre",
      "type": "text",
      "label": "Nombre Completo",
      "required": true,
      "ai_mapping": {"entity": "cliente", "type": "name"}
    },
    {
      "name": "email",
      "type": "email",
      "label": "Correo Electrónico",
      "required": true
    },
    {
      "name": "telefono",
      "type": "tel",
      "label": "Teléfono",
      "required": false
    },
    {
      "name": "direccion",
      "type": "text",
      "label": "Dirección",
      "required": false
    }
  ]
}', '{"intents": ["create_client"], "auto_complete": true}');

-- Insertar datos de entrenamiento para IA
INSERT INTO ai_training_data (intent, example_phrase, entities, response_template) VALUES
('register_sale', 'Registrar venta a Juan García por $5,000', '{"cliente": "Juan García", "monto": 5000}', 'Voy a registrar la venta para {cliente} por ${monto}. ¿Qué método de pago utilizó?'),
('register_sale', 'Vendí una laptop Dell por $12,000 a María López', '{"cliente": "María López", "monto": 12000, "producto": "laptop Dell"}', 'Registrando venta de {producto} para {cliente} por ${monto}.'),
('manage_expense', 'Gasto de $1,200 en papelería', '{"monto": 1200, "categoria": "Oficina"}', 'Registrando gasto de ${monto} en {categoria}.'),
('manage_expense', 'Pago $800 de servicio de internet', '{"monto": 800, "descripcion": "servicio de internet"}', 'Registrando pago de ${monto} por {descripcion}.'),
('create_client', 'Agregar nuevo cliente Pedro Martínez', '{"cliente": "Pedro Martínez"}', 'Voy a crear el cliente {cliente}. ¿Podrías proporcionar su correo electrónico?'),
('query_data', 'Ver ventas del mes actual', '{"periodo": "mes actual", "tipo": "ventas"}', 'Consultando {tipo} del {periodo}.'),
('generate_report', 'Generar reporte de ventas semanal', '{"tipo": "ventas", "periodo": "semanal"}', 'Generando reporte de {tipo} {periodo}. ¿Prefieres PDF o Excel?');