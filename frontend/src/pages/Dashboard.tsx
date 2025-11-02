export default function Dashboard() {
  // Dados de exemplo - substitua por dados reais da sua API
  const metrics = {
    fornecedores: 12,
    produtos: 245,
    comprasPendentes: 8,
    estoqueTotal: 1_284,
    valorEstoque: 125_689.50,
    valorEntregasFuturas: 45_230.00
  };

  // Formata valores monetários
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-2">Dashboard</h1>
      <p className="text-sm text-gray-600 mb-4">Visão geral do sistema</p>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
          <h3 className="text-gray-500 text-xs font-medium uppercase tracking-wider">Fornecedores</h3>
          <p className="text-2xl font-bold mt-1">{metrics.fornecedores}</p>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
          <h3 className="text-gray-500 text-xs font-medium uppercase tracking-wider">Produtos</h3>
          <p className="text-2xl font-bold mt-1">{metrics.produtos.toLocaleString('pt-BR')}</p>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
          <h3 className="text-gray-500 text-xs font-medium uppercase tracking-wider">Compras Pendentes</h3>
          <p className="text-2xl font-bold mt-1">{metrics.comprasPendentes}</p>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
          <h3 className="text-gray-500 text-xs font-medium uppercase tracking-wider">Itens em Estoque</h3>
          <p className="text-2xl font-bold mt-1">{metrics.estoqueTotal.toLocaleString('pt-BR')}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mt-4">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-gray-500 text-xs font-medium uppercase tracking-wider">Valor Total em Estoque</h3>
              <p className="text-2xl font-bold mt-1">{formatCurrency(metrics.valorEstoque)}</p>
            </div>
            <div className="p-2 bg-blue-50 rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-gray-500 text-xs font-medium uppercase tracking-wider">Valor em Entregas Futuras</h3>
              <p className="text-2xl font-bold mt-1">{formatCurrency(metrics.valorEntregasFuturas)}</p>
            </div>
            <div className="p-2 bg-green-50 rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
