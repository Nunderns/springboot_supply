import { useState, useEffect } from 'react';
import { FiPlus, FiSearch, FiEdit, FiTrash2 } from 'react-icons/fi';
import PurchaseFormModal from '../components/PurchaseFormModal';
import { purchaseService } from '../services/purchaseService';
import type { PurchaseDTO } from '../services/purchaseService';

export default function Compras() {
  const [purchases, setPurchases] = useState<PurchaseDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPurchase, setCurrentPurchase] = useState<PurchaseDTO | null>(null);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const pageSize = 10;

  const fetchPurchases = async (search: string = '', pageNum: number = page) => {
    try {
      setLoading(true);
      let data;
      
      if (search.trim()) {
        data = await purchaseService.search(search);
        setPurchases(Array.isArray(data) ? data : []);
        setTotalPages(1);
      } else {
        data = await purchaseService.getAll(pageNum, pageSize);
        setPurchases(data.content || []);
        setTotalPages(data.totalPages || 1);
      }
    } catch (error) {
      console.error('Error fetching purchases:', error);
      setPurchases([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPurchases();
  }, [page]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(0);
    fetchPurchases(searchTerm, 0);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Tem certeza que deseja excluir esta compra?')) {
      try {
        await purchaseService.delete(id);
        fetchPurchases(searchTerm, page);
      } catch (error) {
        console.error('Error deleting purchase:', error);
        alert('Erro ao excluir compra. Por favor, tente novamente.');
      }
    }
  };

  const handleStatusChange = async (id: number, status: PurchaseDTO['status']) => {
    try {
      await purchaseService.updateStatus(id, status);
      fetchPurchases(searchTerm, page);
    } catch (error) {
      console.error('Error updating purchase status:', error);
      alert('Erro ao atualizar status da compra. Por favor, tente novamente.');
    }
  };

  const handleSubmit = async (purchase: Omit<PurchaseDTO, 'id'>): Promise<void> => {
    try {
      if (currentPurchase && currentPurchase.id) {
        await purchaseService.update(currentPurchase.id, purchase);
      } else {
        await purchaseService.create(purchase);
      }
      fetchPurchases(searchTerm, page);
    } catch (error) {
      console.error('Error saving purchase:', error);
      throw error;
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { text: string; className: string }> = {
      PENDING: { text: 'Pendente', className: 'bg-yellow-100 text-yellow-800' },
      DELIVERED: { text: 'Entregue', className: 'bg-green-100 text-green-800' },
      CANCELED: { text: 'Cancelada', className: 'bg-red-100 text-red-800' }
    };
    
    const statusInfo = statusMap[status] || { text: status, className: 'bg-gray-100 text-gray-800' };
    
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusInfo.className}`}>
        {statusInfo.text}
      </span>
    );
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Compras</h1>
        <button
          onClick={() => {
            setCurrentPurchase(null);
            setIsModalOpen(true);
          }}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          <FiPlus className="mr-2" />
          Nova Compra
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <form onSubmit={handleSearch} className="flex gap-2 mb-6">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por código, fornecedor ou status..."
              className="pl-10 w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Buscar
          </button>
        </form>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : purchases.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            Nenhuma compra encontrada.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Código
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fornecedor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Data
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Itens
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {purchases.map((purchase) => (
                  <tr key={purchase.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium">#{purchase.id?.toString().padStart(6, '0')}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {typeof purchase.supplier === 'object' 
                          ? purchase.supplier.name 
                          : purchase.supplier || 'Fornecedor não encontrado'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {formatDate(purchase.purchaseDate)}
                      </div>
                      {purchase.expectedDeliveryDate && (
                        <div className="text-xs text-gray-500">
                          Prevista: {formatDate(purchase.expectedDeliveryDate)}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {purchase.items ? `${purchase.items.length} ite${purchase.items.length !== 1 ? 'ns' : 'm'}` : '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {new Intl.NumberFormat('pt-BR', {
                        style: 'currency',
                        currency: 'BRL'
                      }).format(purchase.total || 0)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(purchase.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => {
                            setCurrentPurchase(purchase);
                            setIsModalOpen(true);
                          }}
                          className="text-blue-600 hover:text-blue-900"
                          title="Editar"
                        >
                          <FiEdit className="inline-block" />
                        </button>
                        <button
                          onClick={() => purchase.id && handleDelete(purchase.id)}
                          className="text-red-600 hover:text-red-900 ml-2"
                          title="Excluir"
                        >
                          <FiTrash2 className="inline-block" />
                        </button>
                      </div>
                      {purchase.status === 'PENDING' && (
                        <div className="mt-2 flex justify-end space-x-2">
                          <button
                            onClick={() => purchase.id && handleStatusChange(purchase.id, 'DELIVERED')}
                            className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded hover:bg-green-200"
                          >
                            Marcar como Entregue
                          </button>
                          <button
                            onClick={() => purchase.id && handleStatusChange(purchase.id, 'CANCELED')}
                            className="text-xs px-2 py-1 bg-red-100 text-red-800 rounded hover:bg-red-200"
                          >
                            Cancelar
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex justify-between items-center mt-4">
            <button
              onClick={() => setPage(p => Math.max(0, p - 1))}
              disabled={page === 0}
              className="px-4 py-2 border rounded-md disabled:opacity-50"
            >
              Anterior
            </button>
            <span>Página {page + 1} de {totalPages}</span>
            <button
              onClick={() => setPage(p => p + 1)}
              disabled={page >= totalPages - 1}
              className="px-4 py-2 border rounded-md disabled:opacity-50"
            >
              Próxima
            </button>
          </div>
        )}
      </div>

      <PurchaseFormModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setCurrentPurchase(null);
        }}
        onSubmit={handleSubmit}
        initialData={currentPurchase}
      />
    </div>
  );
}