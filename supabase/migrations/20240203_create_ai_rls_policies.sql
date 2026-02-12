-- 🔐 AI AUTOMATION RLS POLICIES - CHRONOS INFINITY
-- Políticas de seguridad para el sistema de automatización inteligente

-- Enable RLS on all AI tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE form_fields ENABLE ROW LEVEL SECURITY;
ALTER TABLE records ENABLE ROW LEVEL SECURITY;
ALTER TABLE record_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_automation_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE form_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_training_data ENABLE ROW LEVEL SECURITY;

-- Users table policies
CREATE POLICY "Users can view their own profile" ON users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON users
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can view all users" ON users
    FOR SELECT USING (auth.jwt() ->> 'role' = 'admin');

-- Forms table policies
CREATE POLICY "Users can view their own forms" ON forms
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own forms" ON forms
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own forms" ON forms
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own forms" ON forms
    FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all forms" ON forms
    FOR SELECT USING (auth.jwt() ->> 'role' = 'admin');

-- Form fields policies (heredan seguridad del formulario padre)
CREATE POLICY "Users can view fields of their forms" ON form_fields
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM forms 
            WHERE forms.id = form_fields.form_id 
            AND forms.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can manage fields of their forms" ON form_fields
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM forms 
            WHERE forms.id = form_fields.form_id 
            AND forms.user_id = auth.uid()
        )
    );

-- Records table policies
CREATE POLICY "Users can view their own records" ON records
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create records" ON records
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own records" ON records
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own records" ON records
    FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all records" ON records
    FOR SELECT USING (auth.jwt() ->> 'role' = 'admin');

-- Record data policies (heredan seguridad del record padre)
CREATE POLICY "Users can view data of their records" ON record_data
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM records 
            WHERE records.id = record_data.record_id 
            AND records.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can manage data of their records" ON record_data
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM records 
            WHERE records.id = record_data.record_id 
            AND records.user_id = auth.uid()
        )
    );

-- AI Conversations policies
CREATE POLICY "Users can view their own conversations" ON ai_conversations
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create conversations" ON ai_conversations
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own conversations" ON ai_conversations
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all conversations" ON ai_conversations
    FOR SELECT USING (auth.jwt() ->> 'role' = 'admin');

-- AI Messages policies (heredan seguridad de la conversación)
CREATE POLICY "Users can view messages of their conversations" ON ai_messages
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM ai_conversations 
            WHERE ai_conversations.id = ai_messages.conversation_id 
            AND ai_conversations.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can add messages to their conversations" ON ai_messages
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM ai_conversations 
            WHERE ai_conversations.id = ai_messages.conversation_id 
            AND ai_conversations.user_id = auth.uid()
        )
    );

-- AI Automation Logs policies
CREATE POLICY "Users can view their own automation logs" ON ai_automation_logs
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create automation logs" ON ai_automation_logs
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all automation logs" ON ai_automation_logs
    FOR SELECT USING (auth.jwt() ->> 'role' = 'admin');

-- Form Templates policies (lectura pública para todos, modificación solo admin)
CREATE POLICY "Anyone can view active form templates" ON form_templates
    FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage form templates" ON form_templates
    FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- AI Training Data policies (solo administradores pueden modificar)
CREATE POLICY "Anyone can view active training data" ON ai_training_data
    FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage training data" ON ai_training_data
    FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- Grant permissions to roles
-- Basic read access for anonymous users (solo templates y datos de entrenamiento públicos)
GRANT SELECT ON form_templates TO anon;
GRANT SELECT ON ai_training_data TO anon;

-- Full access for authenticated users
GRANT ALL PRIVILEGES ON users TO authenticated;
GRANT ALL PRIVILEGES ON forms TO authenticated;
GRANT ALL PRIVILEGES ON form_fields TO authenticated;
GRANT ALL PRIVILEGES ON records TO authenticated;
GRANT ALL PRIVILEGES ON record_data TO authenticated;
GRANT ALL PRIVILEGES ON ai_conversations TO authenticated;
GRANT ALL PRIVILEGES ON ai_messages TO authenticated;
GRANT ALL PRIVILEGES ON ai_automation_logs TO authenticated;
GRANT SELECT ON form_templates TO authenticated;
GRANT SELECT ON ai_training_data TO authenticated;

-- Functions for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_forms_updated_at BEFORE UPDATE ON forms
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_records_updated_at BEFORE UPDATE ON records
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_record_data_updated_at BEFORE UPDATE ON record_data
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ai_conversations_updated_at BEFORE UPDATE ON ai_conversations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_form_templates_updated_at BEFORE UPDATE ON form_templates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ai_training_data_updated_at BEFORE UPDATE ON ai_training_data
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Functions for AI automation
CREATE OR REPLACE FUNCTION increment_form_template_usage(template_id UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE form_templates 
    SET usage_count = usage_count + 1 
    WHERE id = template_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION increment_ai_training_usage(training_id UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE ai_training_data 
    SET usage_count = usage_count + 1 
    WHERE id = training_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION log_ai_automation(
    p_user_id UUID,
    p_conversation_id UUID,
    p_action_type VARCHAR(50),
    p_action_data JSONB,
    p_result_status VARCHAR(20),
    p_result_data JSONB DEFAULT '{}',
    p_error_message TEXT DEFAULT NULL,
    p_execution_time_ms INTEGER DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    log_id UUID;
BEGIN
    INSERT INTO ai_automation_logs (
        user_id,
        conversation_id,
        action_type,
        action_data,
        result_status,
        result_data,
        error_message,
        execution_time_ms
    ) VALUES (
        p_user_id,
        p_conversation_id,
        p_action_type,
        p_action_data,
        p_result_status,
        p_result_data,
        p_error_message,
        p_execution_time_ms
    ) RETURNING id INTO log_id;
    
    RETURN log_id;
END;
$$ LANGUAGE plpgsql;

-- Function to get AI suggestions based on context
CREATE OR REPLACE FUNCTION get_ai_suggestions(
    p_context_type VARCHAR(50),
    p_context_data JSONB,
    p_limit INTEGER DEFAULT 5
)
RETURNS TABLE (
    suggestion TEXT,
    confidence DECIMAL(3,2),
    action_type VARCHAR(50)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        atd.response_template,
        atd.accuracy_score,
        atd.intent as action_type
    FROM ai_training_data atd
    WHERE atd.is_active = true
        AND atd.intent LIKE '%' || p_context_type || '%'
    ORDER BY atd.accuracy_score DESC, atd.usage_count DESC
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate AI automation statistics
CREATE OR REPLACE FUNCTION get_ai_automation_stats(
    p_user_id UUID DEFAULT NULL,
    p_date_from DATE DEFAULT NULL,
    p_date_to DATE DEFAULT NULL
)
RETURNS TABLE (
    total_conversations BIGINT,
    total_automated_actions BIGINT,
    success_rate DECIMAL(5,2),
    avg_response_time_ms BIGINT,
    top_intents JSONB
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(DISTINCT c.id) as total_conversations,
        COUNT(DISTINCT l.id) as total_automated_actions,
        CASE 
            WHEN COUNT(l.id) > 0 
            THEN ROUND(COUNT(CASE WHEN l.result_status = 'success' THEN 1 END) * 100.0 / COUNT(l.id), 2)
            ELSE 0.0
        END as success_rate,
        ROUND(AVG(m.processing_time_ms), 2) as avg_response_time_ms,
        (
            SELECT jsonb_agg(jsonb_build_object('intent', intent, 'count', count))
            FROM (
                SELECT intent, COUNT(*) as count
                FROM ai_messages
                WHERE (p_user_id IS NULL OR conversation_id IN (
                    SELECT id FROM ai_conversations 
                    WHERE user_id = p_user_id
                ))
                AND (p_date_from IS NULL OR DATE(created_at) >= p_date_from)
                AND (p_date_to IS NULL OR DATE(created_at) <= p_date_to)
                GROUP BY intent
                ORDER BY count DESC
                LIMIT 5
            ) AS top_intents_sub
        ) as top_intents
    FROM ai_conversations c
    LEFT JOIN ai_automation_logs l ON c.user_id = l.user_id
    LEFT JOIN ai_messages m ON c.id = m.conversation_id
    WHERE (p_user_id IS NULL OR c.user_id = p_user_id)
        AND (p_date_from IS NULL OR DATE(c.created_at) >= p_date_from)
        AND (p_date_to IS NULL OR DATE(c.created_at) <= p_date_to);
END;
$$ LANGUAGE plpgsql;