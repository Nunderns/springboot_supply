import { useState, useEffect } from 'react';
import { FiSearch, FiPlus, FiEdit2, FiTrash2, FiFilter, FiRefreshCw } from 'react-icons/fi';
import type { ProductDTO } from '../services/productService';
import { productService } from '../services/productService';

interface InventoryItem extends Omit<ProductDTO, 'id'> {
  id: number;
  quantity: number;
  minQuantity: number;
  lastUpdated: string;
  unit: string;
  category: string;
}

export default function Estoque() {
  const [searchTerm, setSearchTerm] = useState('');
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 10;

  const fetchInventory = async (pageNumber: number = 0) => {
    try {
      setIsLoading(true);
      const response = await productService.getAll(pageNumber, pageSize);
      
      // Mapear os produtos para o formato de inventário
      const inventoryData = response.content.map((product: ProductDTO) => ({
        ...product,
        id: product.id || 0, // Garante que sempre terá um ID
        quantity: product.volume || 0,
        minQuantity: product.volume ? Math.floor(product.volume * 0.3) : 0,
        lastUpdated: new Date().toLocaleDateString('pt-BR'),
        unit: 'un',
        category: 'Geral'
      }));
      
      setInventory(inventoryData);
      setTotalPages(response.totalPages || 1);
    } catch (error) {
      console.error('Erro ao carregar estoque:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory(currentPage);
  }, [currentPage]);

  const handleRefresh = () => {
    fetchInventory(currentPage);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Implementar busca se necessário
  };

  const filteredItems = inventory.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.description?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false)
  );

  const getStatusColor = (quantity: number, minQuantity: number) => {
    if (quantity <= minQuantity * 0.3) return 'bg-red-100 text-red-800';
    if (quantity <= minQuantity) return 'bg-yellow-100 text-yellow-800';
    return 'bg-green-100 text-green-800';
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Controle de Estoque</h1>
          <p className="text-sm text-gray-500">Gerencie os itens do seu estoque</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <button 
            onClick={handleRefresh}
            className="flex items-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            <FiRefreshCw className="mr-2" />
            Atualizar
          </button>
          <button 
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            onClick={() => { /* Implementar adição de item */ }}
          >
            <FiPlus className="mr-2" />
            Adicionar Item
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="relative flex-1">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar itens..."
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="flex items-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
            <FiFilter className="mr-2" />
            Filtros
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Categoria</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantidade</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Última Atualização</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredItems.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-gray-900">{item.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {item.category}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="font-medium">{item.quantity}</span>
                    <span className="text-gray-500 ml-1">{item.unit}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(item.quantity, item.minQuantity)}`}>
                      {item.quantity <= item.minQuantity ? 'Baixo Estoque' : 'Em Estoque'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {item.lastUpdated}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button className="text-blue-600 hover:text-blue-900 mr-4">
                      <FiEdit2 className="inline-block" />
                    </button>
                    <button className="text-red-600 hover:text-red-900">
                      <FiTrash2 className="inline-block" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-center mt-4 text-sm text-gray-500 gap-4">
          <div>Mostrando {filteredItems.length} de {inventory.length} itens</div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
              disabled={currentPage === 0}
              className="px-3 py-1 border rounded-md disabled:opacity-50 hover:bg-gray-50"
            >
              Anterior
            </button>
            <span className="px-3 py-1">
              Página {currentPage + 1} de {Math.max(1, totalPages)}
            </span>
            <button 
              onClick={() => setCurrentPage(prev => Math.min(totalPages - 1, prev + 1))}
              disabled={currentPage >= totalPages - 1}
              className="px-3 py-1 border rounded-md disabled:opacity-50 hover:bg-gray-50"
            >
              Próximo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}