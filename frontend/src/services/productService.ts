import { api } from './api';

export interface ProductDTO {
  id?: number;
  sku: string;
  name: string;
  description?: string;
  width?: number;
  height?: number;
  length?: number;
  weight?: number;
  volume?: number;
  unit?: string;
  defaultPrice?: number;
  preferredSupplierId?: number;
  active?: boolean;
}

export const productService = {
  async getAll(page: number = 0, size: number = 10) {
    const response = await api.get(`/products?page=${page}&size=${size}`);
    return response.data;
  },

  async getById(id: number) {
    const response = await api.get(`/products/${id}`);
    return response.data;
  },

  async create(product: Omit<ProductDTO, 'id'>) {
    const response = await api.post('/products', product);
    return response.data;
  },

  async update(id: number, product: Partial<ProductDTO>) {
    const response = await api.put(`/products/${id}`, product);
    return response.data;
  },

  async delete(id: number) {
    await api.delete(`/products/${id}`);
  },

  async search(query: string) {
    const response = await api.get(`/products/search?query=${encodeURIComponent(query)}`);
    return response.data;
  }
};
