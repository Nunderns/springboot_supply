import { useState, useEffect } from 'react';
import { FiEdit, FiTrash2, FiPlus, FiSearch } from 'react-icons/fi';
import { SupplierFormModal } from '../components/SupplierFormModal';
import { supplierService } from '../services/supplierService';
import { api } from '../services/api';
import type { SupplierDTO } from '../services/supplierService';

export default function Fornecedores() {
  const [suppliers, setSuppliers] = useState<SupplierDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentSupplier, setCurrentSupplier] = useState<SupplierDTO | null>(null);

  const fetchSuppliers = async (search: string = '') => {
    try {
      setLoading(true);
      if (search.trim()) {
        const data = await supplierService.search(search);
        setSuppliers(Array.isArray(data) ? data : []);
      } else {
        // Fetch all suppliers without pagination
        const response = await api.get('/suppliers');
        setSuppliers(Array.isArray(response.data) ? response.data : []);
      }
    } catch (error) {
      console.error('Error fetching suppliers:', error);
      setSuppliers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuppliers(); // Fetch suppliers when the component mounts
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchSuppliers(searchTerm);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Tem certeza que deseja excluir este fornecedor?')) {
      try {
        await supplierService.delete(id);
        fetchSuppliers(searchTerm);
      } catch (error) {
        console.error('Error deleting supplier:', error);
        alert('Erro ao excluir fornecedor. Por favor, tente novamente.');
      }
    }
  };

  const handleSubmit = async (supplier: Omit<SupplierDTO, 'id'>): Promise<void> => {
    try {
      if (currentSupplier && currentSupplier.id) {
        await supplierService.update(currentSupplier.id, supplier);
      } else {
        await supplierService.create(supplier);
      }
      fetchSuppliers(); // Refresh the supplier list after creating or updating
      handleCloseModal(); // Close the modal after submission
    } catch (error) {
      console.error('Error saving supplier:', error);
      throw error;
    }
  };

  const handleEdit = (supplier: SupplierDTO) => {
    setCurrentSupplier(supplier);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentSupplier(null);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Fornecedores</h1>
        <button
          onClick={() => {
            setCurrentSupplier(null);
            setIsModalOpen(true);
          }}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          <FiPlus className="mr-2" />
          Novo Fornecedor
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
              placeholder="Buscar por nome ou CNPJ..."
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
        ) : suppliers.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            Nenhum fornecedor encontrado.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nome / Razão Social
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    CNPJ
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contato
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Endereço
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {suppliers.map((supplier) => (
                  <tr key={supplier.id} className="hover:bg-gray-50 border-b border-gray-200">
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="font-medium text-gray-900">{supplier.name}</div>
                      <div className="text-sm text-gray-500">
                        {supplier.email && (
                          <div className="flex items-center mt-1">
                            <svg className="h-4 w-4 text-gray-400 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                            {supplier.email}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 font-mono">
                      {supplier.cnpj || 'Não informado'}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                      {supplier.phone && (
                        <div className="flex items-center">
                          <svg className="h-4 w-4 text-gray-400 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                          </svg>
                          {supplier.phone}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {supplier.address && (
                        <div className="flex items-start">
                          <svg className="h-4 w-4 text-gray-400 mr-1 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          <div>
                            <div>{supplier.address}</div>
                            <div className="text-xs text-gray-500">
                              {[supplier.city, supplier.state].filter(Boolean).join(' - ')}
                              {supplier.zipCode && ` • ${supplier.zipCode}`}
                            </div>
                          </div>
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        supplier.active !== false ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {supplier.active !== false ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => handleEdit(supplier)}
                          className="text-blue-600 hover:text-blue-900 p-1 rounded-full hover:bg-blue-50"
                          title="Editar"
                        >
                          <FiEdit className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => supplier.id && handleDelete(supplier.id)}
                          className="text-red-600 hover:text-red-900 p-1 rounded-full hover:bg-red-50"
                          title="Excluir"
                        >
                          <FiTrash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {suppliers.length > 0 && (
          <div className="mt-4 text-sm text-gray-600">
            Exibindo {suppliers.length} {suppliers.length === 1 ? 'fornecedor' : 'fornecedores'}
          </div>
        )}
      </div>

      <SupplierFormModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
        initialData={currentSupplier}
      />
    </div>
  );
}