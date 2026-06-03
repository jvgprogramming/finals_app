import axios from 'axios';

export interface Category {
  id: number;
  name: string;
  description: string | null;
}

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  is_available: boolean;
  image_url: string | null;
  category: Category;
  category_id: number;
}

export interface ProductFilters {
  category_id?: number;
  search?: string;
  sort?: string;
  direction?: 'asc' | 'desc';
}

class ProductService {
  private apiClient = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
  });

  /**
   * Get all categories
   */
  async getCategories(): Promise<Category[]> {
    try {
      const response = await this.apiClient.get<{ success: boolean; data: Category[] }>('/categories');
      return response.data.data;
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
  }

  /**
   * Get all products with optional filters
   */
  async getProducts(filters?: ProductFilters): Promise<Product[]> {
    try {
      const response = await this.apiClient.get<{ success: boolean; data: Product[] }>('/products', {
        params: filters,
      });
      return response.data.data;
    } catch (error) {
      console.error('Error fetching products:', error);
      throw error;
    }
  }

  /**
   * Get a single product by ID
   */
  async getProductById(id: number): Promise<Product> {
    try {
      const response = await this.apiClient.get<{ success: boolean; data: Product }>(`/products/${id}`);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching product:', error);
      throw error;
    }
  }

  /**
   * Create a new product (admin only)
   */
  async createProduct(formData: FormData): Promise<Product> {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await this.apiClient.post<{ success: boolean; data: Product }>('/products', formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      return response.data.data;
    } catch (error) {
      console.error('Error creating product:', error);
      throw error;
    }
  }

  /**
   * Update a product (admin only)
   */
  async updateProduct(id: number, formData: FormData): Promise<Product> {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await this.apiClient.post<{ success: boolean; data: Product }>(
        `/products/${id}`,
        formData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );
      return response.data.data;
    } catch (error) {
      console.error('Error updating product:', error);
      throw error;
    }
  }

  /**
   * Delete a product (admin only)
   */
  async deleteProduct(id: number): Promise<void> {
    try {
      const token = localStorage.getItem('auth_token');
      await this.apiClient.delete(`/products/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
    } catch (error) {
      console.error('Error deleting product:', error);
      throw error;
    }
  }
}

export default new ProductService();
