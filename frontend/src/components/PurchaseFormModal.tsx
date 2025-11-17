import React, { useState, useEffect, useRef } from 'react';
import { FiX, FiSearch, FiPlus, FiMinus } from 'react-icons/fi';
import type { PurchaseDTO, PurchaseItemDTO } from '../services/purchaseService';
import type { ProductDTO } from '../services/productService';
import type { SupplierDTO } from '../services/supplierService';
import { supplierService } from '../services/supplierService';
import { productService } from '../services/productService';

interface PurchaseFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (purchase: Omit<PurchaseDTO, 'id'>) => Promise<void>;
  initialData?: PurchaseDTO | null;
}

const PurchaseFormModal = ({ isOpen, onClose, onSubmit, initialData }: PurchaseFormModalProps) => {
  // Helper function to ensure product is always a number or ProductDTO
  const normalizePurchaseItem = (item: any): PurchaseItemDTO => {
    return {
      ...item,
      product: item.product || 0, // Default to 0 if undefined
      id: item.id || 0
    };
  };

  const [formData, setFormData] = useState<Omit<PurchaseDTO, 'id'>>({
    supplier: 0,
    purchaseDate: new Date().toISOString().split('T')[0],
    status: 'PENDING',
    items: [],
    total: 0,
    notes: ''
  });
  
  const [products, setProducts] = useState<ProductDTO[]>([]);
  const [suppliers, setSuppliers] = useState<SupplierDTO[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<ProductDTO | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [unitPrice, setUnitPrice] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState({
    products: false,
    suppliers: false
  });
  const [showProductDropdown, setShowProductDropdown] = useState(false);
  const productInputRef = useRef<HTMLInputElement>(null);

  // State for supplier search and selection
  const [supplierSearch, setSupplierSearch] = useState('');
  const [showSupplierDropdown, setShowSupplierDropdown] = useState(false);
  const [filteredSuppliers, setFilteredSuppliers] = useState<SupplierDTO[]>([]);
  const supplierInputRef = useRef<HTMLInputElement>(null);

  // Fetch suppliers with search functionality
  const fetchSuppliers = async (search: string = '') => {
    try {
      setLoading(prev => ({ ...prev, suppliers: true }));
      let suppliersData;
      if (search && search.trim().length > 2) {
        suppliersData = await supplierService.search(search);
        const suppliersList = Array.isArray(suppliersData) ? suppliersData : [];
        setSuppliers(suppliersList);
        setFilteredSuppliers(suppliersList);
      } else {
        suppliersData = await supplierService.getAll(0, 1000);
        // A API retorna um array diretamente, não um objeto com content
        const suppliersList = Array.isArray(suppliersData) ? suppliersData : [];
        setSuppliers(suppliersList);
        setFilteredSuppliers(suppliersList);
      }
    } catch (error) {
      console.error('Error fetching suppliers:', error);
      setError('Erro ao carregar fornecedores. Por favor, recarregue a página.');
      setSuppliers([]);
      setFilteredSuppliers([]);
    } finally {
      setLoading(prev => ({ ...prev, suppliers: false }));
    }
  };

  // Filter suppliers based on search input
  useEffect(() => {
    if (supplierSearch.trim() === '') {
      setFilteredSuppliers(suppliers);
    } else {
      const searchLower = supplierSearch.toLowerCase();
      const filtered = suppliers.filter(supplier =>
        supplier.name?.toLowerCase().includes(searchLower) ||
        (supplier.cnpj && supplier.cnpj.toLowerCase().includes(searchLower)) ||
        (supplier.email && supplier.email.toLowerCase().includes(searchLower))
      );
      setFilteredSuppliers(filtered);
    }
  }, [supplierSearch, suppliers]);

  // Auto-search suppliers when typing (debounced)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (supplierSearch.trim().length > 2 && showSupplierDropdown) {
        fetchSuppliers(supplierSearch);
      } else if (supplierSearch.trim() === '' && suppliers.length === 0 && isOpen) {
        fetchSuppliers();
      }
    }, 300); // Debounce de 300ms

    return () => clearTimeout(timer);
  }, [supplierSearch, showSupplierDropdown, isOpen]);

  // Update supplier search when suppliers are loaded and initialData exists
  useEffect(() => {
    if (isOpen && initialData && suppliers.length > 0) {
      const supplierId = typeof initialData.supplier === 'object' 
        ? initialData.supplier.id 
        : initialData.supplier;
      
      if (supplierId) {
        const supplier = suppliers.find(s => s.id === supplierId);
        if (supplier && !supplierSearch) {
          setSupplierSearch(supplier.name || '');
        }
      }
    }
  }, [suppliers, isOpen, initialData]);

  // Handle click outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      
      // Verificar se o clique foi fora do container do fornecedor
      if (supplierInputRef.current && !supplierInputRef.current.contains(target)) {
        // Verificar se não foi um clique no dropdown dentro do container
        const dropdown = supplierInputRef.current.querySelector('.absolute.z-20');
        if (!dropdown || !dropdown.contains(target)) {
          setShowSupplierDropdown(false);
        }
      }
      
      // Verificar se o clique foi fora do container do produto
      if (productInputRef.current && !productInputRef.current.contains(target)) {
        const dropdown = productInputRef.current.querySelector('.absolute.z-20');
        if (!dropdown || !dropdown.contains(target)) {
          setShowProductDropdown(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Handle supplier selection
  const handleSupplierSelect = (supplier: SupplierDTO) => {
    setFormData(prev => ({
      ...prev,
      supplier: supplier.id || 0
    }));
    setSupplierSearch(supplier.name || '');
    setShowSupplierDropdown(false);
  };

  // Load initial data
  useEffect(() => {
    if (isOpen) {
      if (suppliers.length === 0) {
        fetchSuppliers();
      }
      
      if (initialData) {
        const supplierId = typeof initialData.supplier === 'object' 
          ? initialData.supplier.id 
          : initialData.supplier;
        
        setFormData({
          ...initialData,
          supplier: supplierId as number,
          items: (initialData.items || []).map(normalizePurchaseItem)
        });

        // Set supplier search text if supplier is an object
        if (typeof initialData.supplier === 'object' && initialData.supplier) {
          setSupplierSearch(initialData.supplier.name || '');
        } else if (supplierId) {
          // Find supplier name from suppliers list
          const supplier = suppliers.find(s => s.id === supplierId);
          if (supplier) {
            setSupplierSearch(supplier.name || '');
          }
        } else {
          setSupplierSearch('');
        }
      } else {
        setFormData({
          supplier: 0 as number,
          purchaseDate: new Date().toISOString().split('T')[0],
          status: 'PENDING',
          items: [],
          total: 0,
          notes: ''
        });
        setSupplierSearch('');
      }
      // Reset form states
      setSelectedProduct(null);
      setQuantity(1);
      setUnitPrice(0);
      setSearchTerm('');
      setError(null);
    }
  }, [isOpen, initialData]);

  const handleSearchProducts = async (query: string) => {
    try {
      setLoading(prev => ({ ...prev, products: true }));
      if (query.trim().length > 1) {
        const data = await productService.search(query);
        const productList = Array.isArray(data) ? data : [];
        setProducts(productList);
      } else {
        // Load all products when search is short
        const data = await productService.getAll(0, 100);
        const productList = Array.isArray(data.content) ? data.content : [];
        setProducts(productList);
      }
    } catch (error) {
      console.error('Error searching products:', error);
      setProducts([]);
    } finally {
      setLoading(prev => ({ ...prev, products: false }));
    }
  };

  // Debounced product search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm.length > 1) {
        handleSearchProducts(searchTerm);
      } else if (searchTerm.length === 0 && products.length === 0 && isOpen) {
        // Load initial products when modal opens
        handleSearchProducts('');
      }
    }, 300); // Debounce de 300ms

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, isOpen]);

  // Load initial products
  useEffect(() => {
    const loadInitialProducts = async () => {
      try {
        setLoading(prev => ({ ...prev, products: true }));
        const data = await productService.getAll(0, 100);
        const productList = Array.isArray(data.content) ? data.content : [];
        setProducts(productList);
      } catch (error) {
        console.error('Error loading products:', error);
      } finally {
        setLoading(prev => ({ ...prev, products: false }));
      }
    };

    if (isOpen) {
      loadInitialProducts();
    }
  }, [isOpen]);

  const handleAddItem = () => {
    if (!selectedProduct || quantity <= 0 || unitPrice < 0) return;

    const newItem: PurchaseItemDTO = {
      product: selectedProduct.id || 0,
      quantity,
      unitPrice,
      total: quantity * unitPrice,
      id: Date.now(),
      _productData: selectedProduct
    };

    setFormData(prev => ({
      ...prev,
      items: [...(prev.items || []), newItem],
      total: prev.total + newItem.total
    }));

    // Reset form
    setSelectedProduct(null);
    setQuantity(1);
    setUnitPrice(0);
    setSearchTerm('');
  };

  const handleRemoveItem = (index: number) => {
    const itemToRemove = formData.items?.[index];
    setFormData(prev => ({
      ...prev,
      items: (prev.items || []).filter((_, i) => i !== index),
      total: prev.total - (itemToRemove?.total || 0)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // Validate form data
      if (!formData.supplier) {
        throw new Error('Por favor, selecione um fornecedor');
      }

      if ((formData.items || []).length === 0) {
        throw new Error('Adicione pelo menos um item à compra');
      }

      // Prepare the data for submission
      const submissionData = {
        ...formData,
        supplier: formData.supplier as number, // Ensure supplier is a number
        items: (formData.items || []).map(item => ({
          product: item.product,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          total: item.total
        }))
      };

      await onSubmit(submissionData);
      onClose();
    } catch (error) {
      console.error('Error submitting purchase:', error);
      setError(error instanceof Error ? error.message : 'Ocorreu um erro ao salvar a compra');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Close dropdown when clicking outside is already handled above

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        <div className="p-6 flex-1 overflow-y-auto">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Nova Compra</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <FiX size={24} />
            </button>
          </div>
          
          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2 relative" ref={supplierInputRef}>
                <label className="block text-sm font-medium text-gray-700">Fornecedor *</label>
                {loading.suppliers && !showSupplierDropdown ? (
                  <div className="animate-pulse h-10 bg-gray-200 rounded-md"></div>
                ) : (
                  <div className="relative">
                    <input
                      type="text"
                      value={supplierSearch}
                      onChange={(e) => {
                        const searchValue = e.target.value;
                        setSupplierSearch(searchValue);
                        setShowSupplierDropdown(true);
                        if (searchValue.trim() === '') {
                          setFormData(prev => ({ ...prev, supplier: 0 }));
                        }
                      }}
                      onFocus={() => {
                        setShowSupplierDropdown(true);
                        if (suppliers.length === 0) {
                          fetchSuppliers();
                        } else if (filteredSuppliers.length === 0 && suppliers.length > 0) {
                          setFilteredSuppliers(suppliers);
                        }
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowSupplierDropdown(true);
                        if (suppliers.length === 0) {
                          fetchSuppliers();
                        } else if (filteredSuppliers.length === 0 && suppliers.length > 0) {
                          setFilteredSuppliers(suppliers);
                        }
                      }}
                      onBlur={(e) => {
                        // Só fechar se não estiver clicando dentro do dropdown
                        const relatedTarget = e.relatedTarget as Node;
                        if (supplierInputRef.current && !supplierInputRef.current.contains(relatedTarget)) {
                          setTimeout(() => {
                            setShowSupplierDropdown(false);
                          }, 200);
                        }
                      }}
                      className="mt-1 block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                      placeholder="Digite o nome ou CNPJ do fornecedor"
                      required
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <FiSearch className="h-5 w-5 text-gray-400" />
                    </div>
                    
                    {/* Hidden select for form submission */}
                    <select
                      name="supplier"
                      value={formData.supplier as number || ''}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        supplier: Number(e.target.value)
                      }))}
                      className="hidden"
                      required
                    >
                      <option value="">Selecione um fornecedor</option>
                      {suppliers.map(supplier => (
                        <option key={supplier.id} value={supplier.id}>
                          {supplier.name}
                        </option>
                      ))}
                    </select>
                    
                    {/* Dropdown with search results */}
                    {showSupplierDropdown && (
                      <>
                        {loading.suppliers ? (
                          <div className="absolute z-20 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg p-4 text-sm text-gray-500">
                            Carregando fornecedores...
                          </div>
                        ) : filteredSuppliers.length > 0 ? (
                          <div className="absolute z-20 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                            {filteredSuppliers.map(supplier => (
                              <div
                                key={supplier.id}
                                className="px-4 py-3 text-sm hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                                onMouseDown={(e) => {
                                  // Use onMouseDown to prevent blur from closing before click
                                  e.preventDefault();
                                  handleSupplierSelect(supplier);
                                }}
                              >
                                <div className="font-medium text-gray-900">{supplier.name}</div>
                                {supplier.cnpj && (
                                  <div className="text-xs text-gray-500">CNPJ: {supplier.cnpj}</div>
                                )}
                                {supplier.email && (
                                  <div className="text-xs text-gray-500">{supplier.email}</div>
                                )}
                              </div>
                            ))}
                          </div>
                        ) : supplierSearch.trim() !== '' ? (
                          <div className="absolute z-20 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg p-4 text-sm text-gray-500">
                            Nenhum fornecedor encontrado
                          </div>
                        ) : suppliers.length > 0 ? (
                          <div className="absolute z-20 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                            {suppliers.map(supplier => (
                              <div
                                key={supplier.id}
                                className="px-4 py-3 text-sm hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                                onMouseDown={(e) => {
                                  e.preventDefault();
                                  handleSupplierSelect(supplier);
                                }}
                              >
                                <div className="font-medium text-gray-900">{supplier.name}</div>
                                {supplier.cnpj && (
                                  <div className="text-xs text-gray-500">CNPJ: {supplier.cnpj}</div>
                                )}
                                {supplier.email && (
                                  <div className="text-xs text-gray-500">{supplier.email}</div>
                                )}
                              </div>
                            ))}
                          </div>
                        ) : null}
                      </>
                    )}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Data da Compra *</label>
                <input
                  type="date"
                  value={formData.purchaseDate}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    purchaseDate: e.target.value
                  }))}
                  className="w-full p-2 border rounded-md"
                  required
                  disabled={isSubmitting}
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    status: e.target.value as PurchaseDTO['status']
                  }))}
                  className="w-full p-2 border rounded-md"
                  disabled={isSubmitting}
                >
                  <option value="PENDING">Pendente</option>
                  <option value="DELIVERED">Entregue</option>
                  <option value="CANCELED">Cancelada</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Data Prevista de Entrega
                </label>
                <input
                  type="date"
                  value={formData.expectedDeliveryDate || ''}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    expectedDeliveryDate: e.target.value || undefined
                  }))}
                  className="w-full p-2 border rounded-md"
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <div className="mt-6">
              <h3 className="text-lg font-medium mb-4">Itens da Compra</h3>
              
              <div className="bg-gray-50 p-4 rounded-md mb-4">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-4">
                  <div className="md:col-span-5 relative" ref={productInputRef}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Produto
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
                        <FiSearch className="text-gray-400" />
                      </div>
                      <input
                        type="text"
                        value={selectedProduct ? selectedProduct.name : searchTerm}
                        onChange={(e) => {
                          const value = e.target.value;
                          setSearchTerm(value);
                          setSelectedProduct(null);
                          setShowProductDropdown(true);
                          if (value.length === 0) {
                            // Load initial products when clearing search
                            productService.getAll(0, 100).then(data => {
                              const productList = Array.isArray(data.content) ? data.content : [];
                              setProducts(productList);
                            });
                          }
                        }}
                        onFocus={() => {
                          setShowProductDropdown(true);
                          // Load initial products when focusing if not searching
                          if (products.length === 0 && searchTerm.length <= 1) {
                            productService.getAll(0, 100).then(data => {
                              const productList = Array.isArray(data.content) ? data.content : [];
                              setProducts(productList);
                            });
                          }
                        }}
                        onBlur={() => {
                          // Delay hiding dropdown to allow click events
                          setTimeout(() => setShowProductDropdown(false), 200);
                        }}
                        placeholder="Buscar produto..."
                        className="pl-10 w-full p-2 border rounded-md"
                        disabled={isSubmitting || loading.products}
                      />
                    </div>
                    {showProductDropdown && products.length > 0 && (
                      <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
                        {products.map(product => (
                          <div
                            key={product.id}
                            className="p-2 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                            onClick={() => {
                              setSelectedProduct(product);
                              setSearchTerm(product.name);
                              setShowProductDropdown(false);
                              setUnitPrice(product.defaultPrice || 0);
                            }}
                          >
                            <div className="font-medium text-gray-900">{product.name}</div>
                            {product.sku && (
                              <div className="text-xs text-gray-500">SKU: {product.sku}</div>
                            )}
                            {product.defaultPrice && (
                              <div className="text-xs text-gray-600">
                                Preço: {new Intl.NumberFormat('pt-BR', {
                                  style: 'currency',
                                  currency: 'BRL'
                                }).format(product.defaultPrice)}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                    {selectedProduct && (
                      <div className="mt-2 p-2 bg-blue-50 rounded-md border border-blue-200">
                        <div className="text-sm font-medium text-blue-900">
                          Produto selecionado: {selectedProduct.name}
                        </div>
                        {selectedProduct.sku && (
                          <div className="text-xs text-blue-700">SKU: {selectedProduct.sku}</div>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Quantidade
                    </label>
                    <div className="flex">
                      <button
                        type="button"
                        onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                        className="p-2 border rounded-l-md bg-gray-100"
                        disabled={isSubmitting}
                      >
                        <FiMinus size={16} />
                      </button>
                      <input
                        type="number"
                        min="1"
                        value={quantity}
                        onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                        className="w-full p-2 border-t border-b text-center"
                        disabled={isSubmitting}
                      />
                      <button
                        type="button"
                        onClick={() => setQuantity(prev => prev + 1)}
                        className="p-2 border rounded-r-md bg-gray-100"
                        disabled={isSubmitting}
                      >
                        <FiPlus size={16} />
                      </button>
                    </div>
                  </div>

                  <div className="md:col-span-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Preço Unitário
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={unitPrice}
                      onChange={(e) => setUnitPrice(parseFloat(e.target.value) || 0)}
                      className="w-full p-2 border rounded-md"
                      disabled={isSubmitting}
                    />
                  </div>

                  <div className="md:col-span-2 flex items-end">
                    <button
                      type="button"
                      onClick={handleAddItem}
                      className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
                      disabled={!selectedProduct || quantity <= 0 || unitPrice < 0 || isSubmitting}
                    >
                      Adicionar
                    </button>
                  </div>
                </div>
              </div>

              {(formData.items || []).length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                            Produto
                          </th>
                          <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">
                            Qtd.
                          </th>
                          <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">
                            Preço Unit.
                          </th>
                          <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">
                            Total
                          </th>
                          <th className="px-4 py-2"></th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {(formData.items || []).map((item, index) => (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="px-4 py-2 whitespace-nowrap">
                              {(() => {
                                const productData = typeof item.product === 'object' 
                                  ? item.product 
                                  : (item as any)._productData;
                                
                                if (!productData) {
                                  return <div className="text-gray-400">Produto não encontrado</div>;
                                }
                                
                                return (
                                  <>
                                    <div className="font-medium">
                                      {typeof productData === 'object' ? productData.name : `Produto #${productData}`}
                                    </div>
                                    {productData.sku && (
                                      <div className="text-xs text-gray-500">{productData.sku}</div>
                                    )}
                                  </>
                                );
                              })()}
                            </td>
                            <td className="px-4 py-2 text-right">{item.quantity}</td>
                            <td className="px-4 py-2 text-right">
                              {new Intl.NumberFormat('pt-BR', {
                                style: 'currency',
                                currency: 'BRL'
                              }).format(item.unitPrice)}
                            </td>
                            <td className="px-4 py-2 text-right font-medium">
                              {new Intl.NumberFormat('pt-BR', {
                                style: 'currency',
                                currency: 'BRL'
                              }).format(item.total)}
                            </td>
                            <td className="px-4 py-2 text-right">
                              <button
                                type="button"
                                onClick={() => handleRemoveItem(index)}
                                className="text-red-600 hover:text-red-800"
                                disabled={isSubmitting}
                              >
                                <FiX size={18} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr className="border-t border-gray-200">
                          <td colSpan={3} className="px-4 py-2 text-right font-medium">
                            Total:
                          </td>
                          <td className="px-4 py-2 text-right font-bold">
                            {new Intl.NumberFormat('pt-BR', {
                              style: 'currency',
                              currency: 'BRL'
                            }).format(formData.total)}
                          </td>
                          <td></td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-4 text-gray-500">
                    Nenhum item adicionado à compra.
                  </div>
                )}
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Observações
                </label>
                <textarea
                  value={formData.notes || ''}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    notes: e.target.value
                  }))}
                  rows={3}
                  className="w-full p-2 border rounded-md"
                  disabled={isSubmitting}
                />
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                  disabled={isSubmitting}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                  disabled={isSubmitting || (formData.items || []).length === 0}
                >
                  {isSubmitting ? 'Salvando...' : 'Salvar Compra'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
  );
};

export default PurchaseFormModal;
