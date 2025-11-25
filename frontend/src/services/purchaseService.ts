import { api } from './api';
import type { SupplierDTO } from './supplierService';
import type { ProductDTO } from './productService';

export interface PurchaseItemDTO {
  id?: number;
  product: ProductDTO | number;
  quantity: number;
  unitPrice: number;
  total: number;
  [key: string]: any; // Add index signature to allow additional properties
}

export interface PurchaseDTO {
  id?: number;
  supplier: SupplierDTO | number;
  purchaseDate: string;
  expectedDeliveryDate?: string;
  deliveryDate?: string;
  status: 'PENDING' | 'DELIVERED' | 'CANCELED';
  items?: PurchaseItemDTO[];
  total: number;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export const purchaseService = {
  async getAll(page: number = 0, size: number = 10) {
    const response = await api.get(`/purchases?page=${page}&size=${size}`);
    return response.data;
  },

  async getById(id: number) {
    const response = await api.get(`/purchases/${id}`);
    return response.data;
  },

  async create(purchase: Omit<PurchaseDTO, 'id'>) {
    const response = await api.post('/purchases', purchase);
    return response.data;
  },

  async update(id: number, purchase: Partial<PurchaseDTO>) {
    const response = await api.put(`/purchases/${id}`, purchase);
    return response.data;
  },

  async delete(id: number) {
    await api.delete(`/purchases/${id}`);
  },

  async search(query: string) {
    const response = await api.get(`/purchases/search?query=${encodeURIComponent(query)}`);
    return response.data;
  },

async updateStatus(id: number, status: PurchaseDTO['status']) {
  const response = await api.patch(`/purchases/${id}/status`, { status }, {
    headers: {
      'Content-Type': 'application/json'
    }
  });
  return response.data;
},

  async getBySupplier(supplierId: number) {
    const response = await api.get(`/purchases/supplier/${supplierId}`);
    return response.data;
  },

  async getByDateRange(startDate: string, endDate: string) {
    const response = await api.get(
      `/purchases/date-range?startDate=${encodeURIComponent(startDate)}&endDate=${encodeURIComponent(endDate)}`
    );
    return response.data;
  }
};
