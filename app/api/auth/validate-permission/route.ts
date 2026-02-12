// 🔐 CHRONOS INFINITY - PERMISSION VALIDATION API
// API route para validar permisos de usuarios con el motor cuántico

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { QuantumPermissionEngine } from '@/app/_lib/permissions/QuantumPermissionEngine';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      action,
      resource,
      panel,
      context = {},
      biometric = {},
      timeRestrictions = {},
      locationRestrictions = {}
    } = body;

    if (!action || !resource || !panel) {
      return NextResponse.json(
        { error: 'Faltan parámetros requeridos' },
        { status: 400 }
      );
    }

    // Obtener información del usuario desde Clerk
    const userInfo = await getUserInfo(userId);

    // Crear el motor de permisos
    const permissionEngine = new QuantumPermissionEngine();

    // Validar el permiso
    const result = await permissionEngine.evaluatePermission({
      userId,
      userRole: userInfo.role,
      userRiskScore: userInfo.riskScore,
      action,
      resource,
      panel,
      context: {
        time: new Date(),
        location: context.location || 'unknown',
        device: context.device || 'web',
        ip: request.headers.get('x-forwarded-for') || 'unknown',
        ...context
      },
      biometric,
      timeRestrictions,
      locationRestrictions
    });

    // Registrar la auditoría
    await logPermissionCheck({
      userId,
      action,
      resource,
      panel,
      result,
      timestamp: new Date(),
      context
    });

    return NextResponse.json({
      success: true,
      allowed: result.allowed,
      riskScore: result.riskScore,
      confidence: result.confidence,
      message: result.message,
      auditId: result.auditId
    });

  } catch (error) {
    console.error('Error en validación de permisos:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// Función auxiliar para obtener información del usuario
async function getUserInfo(userId: string) {
  // En producción, esto vendría de una base de datos
  // Por ahora usamos datos simulados
  const users = {
    'user_1': { role: 'bank_profit_manager', riskScore: 0.15 },
    'user_2': { role: 'user_admin', riskScore: 0.25 },
    'user_3': { role: 'security_monitor', riskScore: 0.35 }
  };

  return users[userId as keyof typeof users] || { role: 'viewer', riskScore: 0.5 };
}

// Función auxiliar para registrar auditoría
async function logPermissionCheck(auditData: any) {
  // En producción, esto se guardaría en una base de datos
  console.log('AUDIT LOG:', JSON.stringify(auditData, null, 2));
}