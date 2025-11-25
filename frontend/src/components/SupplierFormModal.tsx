import { useState, useEffect } from 'react';
import type { SupplierDTO } from '../services/supplierService';

interface SupplierFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (supplier: Omit<SupplierDTO, 'id'>) => Promise<void>;
  initialData?: SupplierDTO | null;
}

export function SupplierFormModal({ isOpen, onClose, onSubmit, initialData }: SupplierFormModalProps) {
  const [formData, setFormData] = useState<Omit<SupplierDTO, 'id'>>({
    name: '',
    cnpj: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    active: true
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        cnpj: initialData.cnpj || '',
        email: initialData.email || '',
        phone: initialData.phone || '',
        address: initialData.address || '',
        city: initialData.city || '',
        state: initialData.state || '',
        zipCode: initialData.zipCode || '',
        active: initialData.active !== undefined ? initialData.active : true,
      });
    } else {
      setFormData({
        name: '',
        cnpj: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        state: '',
        zipCode: '',
        active: true
      });
    }
    setError(null);
  }, [initialData, isOpen]);

  useEffect(() => {
    if (isOpen) {
      // Fetch suppliers or any necessary data when the modal opens
      // Ensure that the supplier list is updated correctly
      // You might need to add a fetch function here if not already present
    }
    // Reset error state when modal opens
    setError(null);
  }, [initialData, isOpen]);

  // Função para formatar CNPJ: 00.000.000/0000-00
  const formatCNPJ = (cnpj: string) => {
    if (!cnpj) return '';
    
    // Remove tudo que não for dígito
    const numbers = cnpj.replace(/\D/g, '');
    
    // Limita a 14 dígitos
    const limited = numbers.slice(0, 14);
    
    // Aplica a máscara
    if (limited.length <= 2) return limited;
    if (limited.length <= 5) return `${limited.slice(0, 2)}.${limited.slice(2)}`;
    if (limited.length <= 8) return `${limited.slice(0, 2)}.${limited.slice(2, 5)}.${limited.slice(5)}`;
    if (limited.length <= 12) return `${limited.slice(0, 2)}.${limited.slice(2, 5)}.${limited.slice(5, 8)}/${limited.slice(8)}`;
    return `${limited.slice(0, 2)}.${limited.slice(2, 5)}.${limited.slice(5, 8)}/${limited.slice(8, 12)}-${limited.slice(12, 14)}`;
  };

  type InputEvent = React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>;
  type CustomEvent = { target: { name: string; value: string | boolean } };

  const handleChange = (e: InputEvent | CustomEvent) => {
    const { name, value, type } = e.target as HTMLInputElement;
    const checked = type === 'checkbox' ? (e.target as HTMLInputElement).checked : undefined;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await onSubmit(formData);
      onClose();
    } catch (err) {
      setError('Erro ao salvar fornecedor. Por favor, tente novamente.');
      console.error('Error saving supplier:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl">
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4">
            {initialData ? 'Editar Fornecedor' : 'Adicionar Fornecedor'}
          </h2>
          
          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Nome *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full p-2 border rounded-md"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">CNPJ *</label>
                <input
                  type="text"
                  name="cnpj"
                  value={formatCNPJ(formData.cnpj)}
                  onChange={(e) => {
                    // Remove todos os caracteres não numéricos
                    const rawValue = e.target.value.replace(/\D/g, '');
                    // Atualiza o estado apenas com números
                    handleChange({
                      target: { name: 'cnpj', value: rawValue }
                    });
                  }}
                  maxLength={18}
                  className="w-full p-2 border rounded-md"
                  placeholder="00.000.000/0000-00"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">E-mail</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full p-2 border rounded-md"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Telefone</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full p-2 border rounded-md"
                  placeholder="(00) 00000-0000"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">Endereço</label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className="w-full p-2 border rounded-md"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Cidade</label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  className="w-full p-2 border rounded-md"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Estado</label>
                <input
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  className="w-full p-2 border rounded-md"
                  maxLength={2}
                  placeholder="SP"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">CEP</label>
                <input
                  type="text"
                  name="zipCode"
                  value={formData.zipCode}
                  onChange={handleChange}
                  className="w-full p-2 border rounded-md"
                  placeholder="00000-000"
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="active"
                  name="active"
                  checked={formData.active}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600 rounded"
                />
                <label htmlFor="active" className="text-sm font-medium text-gray-700">
                  Ativo
                </label>
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                disabled={isSubmitting}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Salvando...' : 'Salvar'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
