// 💰 BANK PROFIT MANAGER DASHBOARD - CHRONOS INFINITY
// Panel completo de gestión bancaria y de ganancias para casa de cambio

'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Building,
  CreditCard,
  ArrowUpRight,
  ArrowDownRight,
  Eye,
  EyeOff,
  RefreshCw,
  Download,
  Filter,
  Search,
  Calendar,
  BarChart3,
  PieChart,
  Activity,
  Globe,
  Clock,
  AlertTriangle,
  CheckCircle,
  Settings,
  Plus,
  MoreVertical
} from 'lucide-react';
import { Card } from '@/app/_components/ui/card';
import { Button } from '@/app/_components/ui/button';
import { Badge } from '@/app/_components/ui/badge';
import { Progress } from '@/app/_components/ui/progress';
import { Input } from '@/app/_components/ui/input';
import { Select } from '@/app/_components/ui/select';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { permissionEngine } from '@/app/_lib/permissions/QuantumPermissionEngine';

interface ProfitData {
  currency: string;
  buyRate: number;
  sellRate: number;
  spread: number;
  volume24h: number;
  profit24h: number;
  trend: 'up' | 'down' | 'stable';
}

interface BankAccount {
  id: string;
  name: string;
  currency: string;
  balance: number;
  available: number;
  pending: number;
  status: 'active' | 'pending' | 'blocked';
  lastUpdate: Date;
}

interface Transaction {
  id: string;
  type: 'buy' | 'sell' | 'transfer';
  currencyFrom: string;
  currencyTo: string;
  amount: number;
  rate: number;
  profit: number;
  timestamp: Date;
  client: string;
  status: 'completed' | 'pending' | 'cancelled';
}

interface ExchangeRate {
  currency: string;
  buyRate: number;
  sellRate: number;
  midRate: number;
  spread: number;
  lastUpdate: Date;
}

const BankProfitManagerDashboard: React.FC = () => {
  const [selectedCurrency, setSelectedCurrency] = useState('USD');
  const [timeRange, setTimeRange] = useState('24h');
  const [showBalances, setShowBalances] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [profitData, setProfitData] = useState<ProfitData[]>([]);
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [exchangeRates, setExchangeRates] = useState<ExchangeRate[]>([]);

  // Datos de ejemplo
  const mockProfitData: ProfitData[] = [
    { currency: 'USD', buyRate: 17.85, sellRate: 18.15, spread: 1.68, volume24h: 125000, profit24h: 2100, trend: 'up' },
    { currency: 'EUR', buyRate: 19.45, sellRate: 19.85, spread: 2.02, volume24h: 85000, profit24h: 1717, trend: 'up' },
    { currency: 'GBP', buyRate: 22.30, sellRate: 22.80, spread: 2.19, volume24h: 45000, profit24h: 985, trend: 'down' },
    { currency: 'CAD', buyRate: 13.20, sellRate: 13.50, spread: 2.22, volume24h: 32000, profit24h: 710, trend: 'stable' }
  ];

  const mockBankAccounts: BankAccount[] = [
    { id: 'acc_001', name: 'Cuenta Principal USD', currency: 'USD', balance: 500000, available: 485000, pending: 15000, status: 'active', lastUpdate: new Date() },
    { id: 'acc_002', name: 'Cuenta EUR', currency: 'EUR', balance: 350000, available: 340000, pending: 10000, status: 'active', lastUpdate: new Date() },
    { id: 'acc_003', name: 'Cuenta GBP', currency: 'GBP', balance: 200000, available: 195000, pending: 5000, status: 'active', lastUpdate: new Date() },
    { id: 'acc_004', name: 'Cuenta Reserva MXN', currency: 'MXN', balance: 2500000, available: 2400000, pending: 100000, status: 'active', lastUpdate: new Date() }
  ];

  const mockTransactions: Transaction[] = [
    { id: 'tx_001', type: 'sell', currencyFrom: 'USD', currencyTo: 'MXN', amount: 10000, rate: 18.05, profit: 168, timestamp: new Date(Date.now() - 1000 * 60 * 15), client: 'Juan Pérez', status: 'completed' },
    { id: 'tx_002', type: 'buy', currencyFrom: 'MXN', currencyTo: 'EUR', amount: 8500, rate: 19.65, profit: 145, timestamp: new Date(Date.now() - 1000 * 60 * 30), client: 'María García', status: 'completed' },
    { id: 'tx_003', type: 'sell', currencyFrom: 'GBP', currencyTo: 'MXN', amount: 5000, rate: 22.55, profit: 98, timestamp: new Date(Date.now() - 1000 * 60 * 45), client: 'Carlos Rodríguez', status: 'pending' },
    { id: 'tx_004', type: 'buy', currencyFrom: 'MXN', currencyTo: 'CAD', amount: 12000, rate: 13.35, profit: 112, timestamp: new Date(Date.now() - 1000 * 60 * 60), client: 'Ana Martínez', status: 'completed' }
  ];

  const mockExchangeRates: ExchangeRate[] = [
    { currency: 'USD', buyRate: 17.85, sellRate: 18.15, midRate: 18.00, spread: 1.68, lastUpdate: new Date() },
    { currency: 'EUR', buyRate: 19.45, sellRate: 19.85, midRate: 19.65, spread: 2.02, lastUpdate: new Date() },
    { currency: 'GBP', buyRate: 22.30, sellRate: 22.80, midRate: 22.55, spread: 2.19, lastUpdate: new Date() },
    { currency: 'CAD', buyRate: 13.20, sellRate: 13.50, midRate: 13.35, spread: 2.22, lastUpdate: new Date() }
  ];

  useEffect(() => {
    setProfitData(mockProfitData);
    setBankAccounts(mockBankAccounts);
    setRecentTransactions(mockTransactions);
    setExchangeRates(mockExchangeRates);
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    // Simular actualización
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  };

  const totalProfit24h = profitData.reduce((sum, item) => sum + item.profit24h, 0);
  const totalVolume24h = profitData.reduce((sum, item) => sum + item.volume24h, 0);
  const activeCurrencies = profitData.length;

  // Datos para gráficos
  const profitTrendData = [
    { time: '00:00', profit: 1800, volume: 95000 },
    { time: '04:00', profit: 1200, volume: 65000 },
    { time: '08:00', profit: 2100, volume: 125000 },
    { time: '12:00', profit: 2800, volume: 165000 },
    { time: '16:00', profit: 2400, volume: 140000 },
    { time: '20:00', profit: 2200, volume: 120000 }
  ];

  const currencyDistribution = [
    { name: 'USD', value: 45, color: '#3B82F6' },
    { name: 'EUR', value: 25, color: '#10B981' },
    { name: 'GBP', value: 15, color: '#F59E0B' },
    { name: 'CAD', value: 10, color: '#EF4444' },
    { name: 'Otras', value: 5, color: '#8B5CF6' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">
              💰 Bank Profit Manager
            </h1>
            <p className="text-blue-200">
              Gestión integral de operaciones bancarias y ganancias
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <Button
              onClick={handleRefresh}
              disabled={refreshing}
              variant="outline"
              className="border-blue-500 text-blue-200"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Actualizar
            </Button>
            <Button variant="outline" className="border-blue-500 text-blue-200">
              <Download className="w-4 h-4 mr-2" />
              Exportar
            </Button>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Nueva Operación
            </Button>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="p-6 bg-slate-800 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-200 text-sm">Ganancia 24h</p>
                <p className="text-3xl font-bold text-white">${totalProfit24h.toLocaleString()}</p>
                <p className="text-green-400 text-sm flex items-center">
                  <TrendingUp className="w-4 h-4 mr-1" />
                  +12.5% vs ayer
                </p>
              </div>
              <DollarSign className="w-12 h-12 text-green-400" />
            </div>
          </Card>

          <Card className="p-6 bg-slate-800 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-200 text-sm">Volumen 24h</p>
                <p className="text-3xl font-bold text-white">${totalVolume24h.toLocaleString()}</p>
                <p className="text-blue-400 text-sm flex items-center">
                  <Activity className="w-4 h-4 mr-1" />
                  {activeCurrencies} monedas activas
                </p>
              </div>
              <BarChart3 className="w-12 h-12 text-blue-400" />
            </div>
          </Card>

          <Card className="p-6 bg-slate-800 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-200 text-sm">Spread Promedio</p>
                <p className="text-3xl font-bold text-white">1.95%</p>
                <p className="text-yellow-400 text-sm flex items-center">
                  <AlertTriangle className="w-4 h-4 mr-1" />
                  Objetivo: 2.10%
                </p>
              </div>
              <PieChart className="w-12 h-12 text-yellow-400" />
            </div>
          </Card>

          <Card className="p-6 bg-slate-800 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-200 text-sm">Cuentas Activas</p>
                <p className="text-3xl font-bold text-white">{bankAccounts.length}</p>
                <p className="text-green-400 text-sm flex items-center">
                  <CheckCircle className="w-4 h-4 mr-1" />
                  Todas operativas
                </p>
              </div>
              <Building className="w-12 h-12 text-green-400" />
            </div>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Exchange Rates Panel */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-6 bg-slate-800 border-blue-500">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-white">Tasas de Cambio Actuales</h3>
                <div className="flex items-center space-x-2">
                  <Button size="sm" variant="outline" className="border-blue-500 text-blue-200">
                    <Filter className="w-4 h-4" />
                  </Button>
                  <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="w-4 h-4 mr-1" />
                    Actualizar
                  </Button>
                </div>
              </div>
              <div className="space-y-3">
                {exchangeRates.map((rate) => (
                  <div key={rate.currency} className="p-4 bg-slate-700 rounded-lg border border-slate-600">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                          <span className="text-white text-sm font-bold">{rate.currency[0]}</span>
                        </div>
                        <div>
                          <p className="text-white font-medium">{rate.currency}</p>
                          <p className="text-blue-200 text-sm">Spread: {rate.spread.toFixed(2)}%</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center space-x-2 text-sm">
                          <span className="text-green-400">Compra: {rate.buyRate.toFixed(2)}</span>
                          <span className="text-red-400">Venta: {rate.sellRate.toFixed(2)}</span>
                        </div>
                        <p className="text-blue-200 text-xs">Mid: {rate.midRate.toFixed(2)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Profit Trend Chart */}
            <Card className="p-6 bg-slate-800 border-blue-500">
              <h3 className="text-xl font-semibold text-white mb-4">Tendencia de Ganancias</h3>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={profitTrendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="time" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #3B82F6', borderRadius: '8px' }}
                    labelStyle={{ color: '#E5E7EB' }}
                  />
                  <Area type="monotone" dataKey="profit" stackId="1" stroke="#10B981" fill="#10B981" fillOpacity={0.6} />
                  <Area type="monotone" dataKey="volume" stackId="2" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.4} />
                </AreaChart>
              </ResponsiveContainer>
            </Card>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* Currency Distribution */}
            <Card className="p-6 bg-slate-800 border-blue-500">
              <h3 className="text-xl font-semibold text-white mb-4">Distribución por Moneda</h3>
              <ResponsiveContainer width="100%" height={200}>
                <RechartsPieChart>
                  <Pie
                    data={currencyDistribution}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}%`}
                  >
                    {currencyDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </RechartsPieChart>
              </ResponsiveContainer>
            </Card>

            {/* Bank Accounts */}
            <Card className="p-6 bg-slate-800 border-blue-500">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-white">Cuentas Bancarias</h3>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowBalances(!showBalances)}
                  className="border-blue-500 text-blue-200"
                >
                  {showBalances ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
              </div>
              <div className="space-y-3">
                {bankAccounts.map((account) => (
                  <div key={account.id} className="p-3 bg-slate-700 rounded-lg border border-slate-600">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-white font-medium text-sm">{account.name}</p>
                      <Badge className={account.status === 'active' ? 'bg-green-600' : 'bg-yellow-600'}>
                        {account.status}
                      </Badge>
                    </div>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-blue-200">Saldo:</span>
                        <span className="text-white">
                          {showBalances ? `$${account.balance.toLocaleString()}` : '•••••'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-blue-200">Disponible:</span>
                        <span className="text-green-400">
                          {showBalances ? `$${account.available.toLocaleString()}` : '•••••'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Recent Transactions */}
            <Card className="p-6 bg-slate-800 border-blue-500">
              <h3 className="text-xl font-semibold text-white mb-4">Transacciones Recientes</h3>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {recentTransactions.map((transaction) => (
                  <div key={transaction.id} className="p-3 bg-slate-700 rounded-lg border border-slate-600">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center space-x-2">
                        {transaction.type === 'buy' ? (
                          <ArrowDownRight className="w-4 h-4 text-green-400" />
                        ) : (
                          <ArrowUpRight className="w-4 h-4 text-red-400" />
                        )}
                        <span className="text-white text-sm font-medium">
                          {transaction.currencyFrom} → {transaction.currencyTo}
                        </span>
                      </div>
                      <Badge className={transaction.status === 'completed' ? 'bg-green-600' : 'bg-yellow-600'}>
                        {transaction.status}
                      </Badge>
                    </div>
                    <div className="text-xs space-y-1">
                      <div className="flex justify-between">
                        <span className="text-blue-200">Monto:</span>
                        <span className="text-white">${transaction.amount.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-blue-200">Ganancia:</span>
                        <span className="text-green-400">${transaction.profit}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-blue-200">Cliente:</span>
                        <span className="text-white">{transaction.client}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BankProfitManagerDashboard;