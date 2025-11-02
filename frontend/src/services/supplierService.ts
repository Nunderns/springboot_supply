import { api } from './api';

export interface SupplierDTO {
  id?: number;
  name: string;
  cnpj: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  active?: boolean;
}

export const supplierService = {
  async getAll(page: number = 0, size: number = 10) {
    const response = await api.get(`/suppliers?page=${page}&size=${size}`);
    return response.data;
  },

  async getById(id: number) {
    const response = await api.get(`/suppliers/${id}`);
    return response.data;
  },

  async create(supplier: Omit<SupplierDTO, 'id'>) {
    const response = await api.post('/suppliers', supplier);
    return response.data;
  },

  async update(id: number, supplier: Partial<SupplierDTO>) {
    const response = await api.put(`/suppliers/${id}`, supplier);
    return response.data;
  },

  async delete(id: number) {
    await api.delete(`/suppliers/${id}`);
  },

  async search(query: string) {
    const response = await api.get(`/suppliers/search?query=${encodeURIComponent(query)}`);
    return response.data;
  }
};
