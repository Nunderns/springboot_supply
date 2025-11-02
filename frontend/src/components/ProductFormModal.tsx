import { useState, useEffect } from 'react';
import type { ProductDTO } from '../services/productService';

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (product: Omit<ProductDTO, 'id'>) => Promise<void>;
  initialData?: ProductDTO | null;
}

export function ProductFormModal({ isOpen, onClose, onSubmit, initialData }: ProductFormModalProps) {
  const [formData, setFormData] = useState<Omit<ProductDTO, 'id'>>({
    sku: '',
    name: '',
    description: '',
    width: 0,
    height: 0,
    length: 0,
    weight: 0,
    volume: 0,
    unit: 'un',
    defaultPrice: 0,
    active: true
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        sku: initialData.sku || '',
        name: initialData.name || '',
        description: initialData.description || '',
        width: initialData.width || 0,
        height: initialData.height || 0,
        length: initialData.length || 0,
        weight: initialData.weight || 0,
        volume: initialData.volume || 0,
        unit: initialData.unit || 'un',
        defaultPrice: initialData.defaultPrice || 0,
        active: initialData.active ?? true
      });
    } else {
      setFormData({
        sku: '',
        name: '',
        description: '',
        width: 0,
        height: 0,
        length: 0,
        weight: 0,
        volume: 0,
        unit: 'un',
        defaultPrice: 0,
        active: true
      });
    }
  }, [initialData, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : value
    }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: checked
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await onSubmit(formData);
      onClose();
    } catch (error) {
      console.error('Erro ao salvar produto:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">
            {initialData ? 'Editar Produto' : 'Adicionar Produto'}
          </h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Código SKU *
              </label>
              <input
                type="text"
                name="sku"
                value={formData.sku}
                onChange={handleChange}
                className="w-full p-2 border rounded"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Nome *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full p-2 border rounded"
                required
              />
            </div>

            <div className="md:col-span-2 space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Descrição
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                className="w-full p-2 border rounded"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Largura (cm)
              </label>
              <input
                type="number"
                name="width"
                value={formData.width}
                onChange={handleChange}
                min="0"
                step="0.01"
                className="w-full p-2 border rounded"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Altura (cm)
              </label>
              <input
                type="number"
                name="height"
                value={formData.height}
                onChange={handleChange}
                min="0"
                step="0.01"
                className="w-full p-2 border rounded"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Comprimento (cm)
              </label>
              <input
                type="number"
                name="length"
                value={formData.length}
                onChange={handleChange}
                min="0"
                step="0.01"
                className="w-full p-2 border rounded"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Peso (kg)
              </label>
              <input
                type="number"
                name="weight"
                value={formData.weight}
                onChange={handleChange}
                min="0"
                step="0.001"
                className="w-full p-2 border rounded"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Volume (m³)
              </label>
              <input
                type="number"
                name="volume"
                value={formData.volume}
                onChange={handleChange}
                min="0"
                step="0.0001"
                className="w-full p-2 border rounded"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Unidade
              </label>
              <select
                name="unit"
                value={formData.unit}
                onChange={handleChange}
                className="w-full p-2 border rounded"
              >
                <option value="un">Unidade</option>
                <option value="kg">Quilograma</option>
                <option value="g">Grama</option>
                <option value="l">Litro</option>
                <option value="ml">Mililitro</option>
                <option value="m">Metro</option>
                <option value="cm">Centímetro</option>
                <option value="m²">Metro quadrado</option>
                <option value="m³">Metro cúbico</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Preço Padrão (R$)
              </label>
              <input
                type="number"
                name="defaultPrice"
                value={formData.defaultPrice}
                onChange={handleChange}
                min="0"
                step="0.01"
                className="w-full p-2 border rounded"
              />
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="active"
                name="active"
                checked={formData.active}
                onChange={handleCheckboxChange}
                className="h-4 w-4 text-blue-600 rounded"
              />
              <label htmlFor="active" className="text-sm text-gray-700">
                Ativo
              </label>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
            >
              {initialData ? 'Atualizar' : 'Salvar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
