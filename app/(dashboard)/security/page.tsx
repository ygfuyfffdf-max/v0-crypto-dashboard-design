// 🔐 SECURITY MONITOR DASHBOARD - CHRONOS INFINITY
// Panel de seguridad avanzado para monitoreo forense y auditoría en tiempo real

'use client'

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import AdvancedSecurityDashboard from '@/app/_components/security/AdvancedSecurityDashboard';

const SecurityMonitorDashboard: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <AdvancedSecurityDashboard />
    </div>
  );
};

export default SecurityMonitorDashboard;