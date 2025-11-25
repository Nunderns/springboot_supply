import { useState, useEffect } from 'react';
import { authService } from '../services/authService';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';

interface DashboardMetrics {
  fornecedores: number;
  produtos: number;
  comprasPendentes: number;
  estoqueTotal: number;
  valorEstoque: number;
  valorEntregasFuturas: number;
}

export default function Dashboard() {
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    fornecedores: 0,
    produtos: 0,
    comprasPendentes: 0,
    estoqueTotal: 0,
    valorEstoque: 0,
    valorEntregasFuturas: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = authService.getToken();
      if (!token) {
        throw new Error('Usuário não autenticado');
      }

      const response = await fetch('http://localhost:8080/api/dashboard', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        cache: 'no-store'
      });

      if (!response.ok) {
        throw new Error('Erro ao buscar dados do dashboard');
      }

      const data = await response.json();
      setMetrics(data);
      setLastUpdated(new Date());
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido ao carregar dados';
      setError(errorMessage);
      console.error('Erro ao buscar dados do dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Formata valores monetários
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value || 0);
  };

  // Formata a data de atualização
  const formatLastUpdated = (date: Date | null) => {
    if (!date) return '';
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  // Dados para gráfico de barras (volume de itens)
  const volumeData = [
    { name: 'Fornecedores', value: metrics.fornecedores },
    { name: 'Produtos', value: metrics.produtos },
    { name: 'Compras Pendentes', value: metrics.comprasPendentes },
    { name: 'Itens em Estoque', value: metrics.estoqueTotal }
  ];

  // Dados para gráfico de pizza (valores financeiros)
  const financeData = [
    { name: 'Valor em Estoque', value: metrics.valorEstoque },
    { name: 'Entregas Futuras', value: metrics.valorEntregasFuturas }
  ];

  const pieColors = ['#2563eb', '#16a34a']; // azul e verde

  return (
    <div className="p-4 space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
          <p className="text-sm text-gray-600">Visão geral do sistema</p>
        </div>
        <div className="flex items-center mt-2 sm:mt-0">
          {lastUpdated && (
            <span className="text-xs text-gray-500 mr-3">
              Atualizado em: {formatLastUpdated(lastUpdated)}
            </span>
          )}
          <button
            onClick={fetchDashboardData}
            disabled={loading}
            className="flex items-center text-sm text-blue-600 hover:text-blue-800 disabled:opacity-50"
          >
            <svg
              className={`w-4 h-4 mr-1 ${loading ? 'animate-spin' : ''}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            Atualizar
          </button>
        </div>
      </div>

      {loading && !lastUpdated ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          <p>Erro: {error}</p>
          <button
            onClick={fetchDashboardData}
            className="mt-2 px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 text-sm"
          >
            Tentar novamente
          </button>
        </div>
      ) : (
        <>
          {/* Cards de métricas principais */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <MetricCard
              title="Fornecedores"
              value={metrics.fornecedores.toLocaleString('pt-BR')}
              icon={
                <svg className="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              }
            />

            <MetricCard
              title="Produtos"
              value={metrics.produtos.toLocaleString('pt-BR')}
              icon={
                <svg className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              }
            />

            <MetricCard
              title="Compras Pendentes"
              value={metrics.comprasPendentes.toLocaleString('pt-BR')}
              icon={
                <svg className="h-6 w-6 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              }
            />

            <MetricCard
              title="Itens em Estoque"
              value={metrics.estoqueTotal.toLocaleString('pt-BR')}
              icon={
                <svg className="h-6 w-6 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                </svg>
              }
            />
          </div>

          {/* Cards financeiros */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mt-4">
            <MetricCard
              title="Valor Total em Estoque"
              value={formatCurrency(metrics.valorEstoque)}
              isMonetary
              icon={
                <svg className="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
            />

            <MetricCard
              title="Valor em Entregas Futuras"
              value={formatCurrency(metrics.valorEntregasFuturas)}
              isMonetary
              icon={
                <svg className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              }
            />
          </div>

          {/* Gráficos */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-6">
            {/* Gráfico de barras */}
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
              <h2 className="text-sm font-semibold text-gray-700 mb-3">
                Visão Geral de Quantidades
              </h2>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={volumeData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                    <XAxis dataKey="name" angle={-15} textAnchor="end" height={50} />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Gráfico de pizza */}
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
              <h2 className="text-sm font-semibold text-gray-700 mb-3">
                Distribuição Financeira
              </h2>
              <div className="h-64 flex justify-center items-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={financeData}
                      dataKey="value"
                      nameKey="name"
                      outerRadius={80}
                      label={({ name, value }) => `${name}: ${formatCurrency(value)}`}
                    >
                      {financeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                      ))}
                    </Pie>
                    <Legend />
                    <Tooltip
                      formatter={(value: number) => formatCurrency(value)}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// Componente auxiliar para exibir métricas
interface MetricCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  isMonetary?: boolean;
}

function MetricCard({ title, value, icon, isMonetary = false }: MetricCardProps) {
  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-gray-500 text-xs font-medium uppercase tracking-wider">{title}</h3>
          <p className={`text-2xl font-bold mt-1 ${isMonetary ? 'text-blue-600' : 'text-gray-900'}`}>
            {value}
          </p>
        </div>
        <div className="p-2 bg-blue-50 rounded-lg">
          {icon}
        </div>
      </div>
    </div>
  );
}
