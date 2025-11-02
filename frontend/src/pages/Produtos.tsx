import { useState, useEffect } from 'react';
import { FiEdit, FiTrash2, FiPlus, FiSearch } from 'react-icons/fi';
import { ProductFormModal } from '../components/ProductFormModal';
import { productService } from '../services/productService';
import type { ProductDTO } from '../services/productService';

export default function Produtos() {
  const [products, setProducts] = useState<ProductDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<ProductDTO | null>(null);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const pageSize = 10;

  const loadProducts = async (pageNum: number = 0, search: string = '') => {
    try {
      setLoading(true);
      let data;
      
      if (search) {
        const results = await productService.search(search);
        setProducts(Array.isArray(results) ? results : []);
        setTotalPages(1);
      } else {
        data = await productService.getAll(pageNum, pageSize);
        setProducts(data.content);
        setTotalPages(data.totalPages);
      }
      
      setPage(pageNum);
    } catch (error) {
      console.error('Erro ao carregar produtos:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadProducts(0, searchTerm);
  };

  const handleCreate = async (productData: Omit<ProductDTO, 'id'>) => {
    try {
      await productService.create(productData);
      loadProducts(page, searchTerm);
    } catch (error) {
      console.error('Erro ao criar produto:', error);
      throw error;
    }
  };

  const handleUpdate = async (productData: Omit<ProductDTO, 'id'>) => {
    if (!currentProduct?.id) return;
    
    try {
      await productService.update(currentProduct.id, productData);
      loadProducts(page, searchTerm);
    } catch (error) {
      console.error('Erro ao atualizar produto:', error);
      throw error;
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Tem certeza que deseja excluir este produto?')) {
      try {
        await productService.delete(id);
        loadProducts(page, searchTerm);
      } catch (error) {
        console.error('Erro ao excluir produto:', error);
      }
    }
  };

  const openEditModal = (product: ProductDTO) => {
    setCurrentProduct(product);
    setIsModalOpen(true);
  };

  const handleSubmit = async (productData: Omit<ProductDTO, 'id'>) => {
    if (currentProduct) {
      await handleUpdate(productData);
    } else {
      await handleCreate(productData);
    }
    setIsModalOpen(false);
    setCurrentProduct(null);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Produtos</h1>
        <button
          onClick={() => {
            setCurrentProduct(null);
            setIsModalOpen(true);
          }}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          <FiPlus className="mr-2" />
          Novo Produto
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
              placeholder="Buscar por nome ou SKU..."
              className="pl-10 w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Buscar
          </button>
          {searchTerm && (
            <button
              type="button"
              onClick={() => {
                setSearchTerm('');
                loadProducts(0, '');
              }}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Limpar
            </button>
          )}
        </form>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Nenhum produto encontrado.</p>
            {searchTerm && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  loadProducts(0, '');
                }}
                className="mt-2 text-blue-600 hover:underline"
              >
                Limpar busca
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    SKU
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nome
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Preço
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estoque
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
                {products.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {product.sku}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {product.name}
                      </div>
                      <div className="text-sm text-gray-500 truncate max-w-xs">
                        {product.description}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {product.defaultPrice?.toLocaleString('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                      })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {product.volume} {product.unit}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          product.active
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {product.active ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => openEditModal(product)}
                        className="text-blue-600 hover:text-blue-900 mr-4"
                        title="Editar"
                      >
                        <FiEdit size={18} />
                      </button>
                      <button
                        onClick={() => product.id && handleDelete(product.id)}
                        className="text-red-600 hover:text-red-900"
                        title="Excluir"
                      >
                        <FiTrash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!searchTerm && totalPages > 1 && (
          <div className="flex justify-between items-center mt-4">
            <button
              onClick={() => loadProducts(page - 1, '')}
              disabled={page === 0}
              className={`px-4 py-2 border rounded-md ${
                page === 0
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              Anterior
            </button>
            <span className="text-sm text-gray-700">
              Página {page + 1} de {totalPages}
            </span>
            <button
              onClick={() => loadProducts(page + 1, '')}
              disabled={page >= totalPages - 1}
              className={`px-4 py-2 border rounded-md ${
                page >= totalPages - 1
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              Próxima
            </button>
          </div>
        )}
      </div>

      <ProductFormModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setCurrentProduct(null);
        }}
        onSubmit={handleSubmit}
        initialData={currentProduct}
      />
    </div>
  );
}