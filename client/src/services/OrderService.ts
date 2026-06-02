import axios from 'axios';

export type OrderStatus = 'pending' | 'accepted' | 'preparing' | 'ready' | 'completed' | 'declined';

export interface CakeCustomization {
  id?: number;
  dedication_message?: string;
  size?: string;
  flavor?: string;
  color_theme?: string;
  custom_notes?: string;
}

export interface OrderItem {
  id?: number;
  product_id: number;
  product_name_snapshot?: string;
  product_price_snapshot?: number;
  quantity: number;
  customization?: CakeCustomization;
}

export interface Order {
  id: number;
  order_number: string;
  total_amount: number;
  delivery_fee?: number;
  status: OrderStatus;
  notes: string | null;
  customer_name?: string | null;
  customer_phone?: string | null;
  fulfillment_type?: 'pickup' | 'delivery';
  delivery_address?: string | null;
  delivery_date: string | null;
  payment_method?: string;
  items: OrderItem[];
  user: {
    id: number;
    first_name: string;
    last_name: string;
  };
  created_at: string;
  updated_at: string;
}

export interface CreateOrderRequest {
  items: OrderItem[];
  notes?: string;
  delivery_date?: string | null;
  customer_name: string;
  customer_phone: string;
  fulfillment_type: 'pickup' | 'delivery';
  delivery_address?: string | null;
  delivery_fee?: number;
}

class OrderService {
  private apiClient = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
  });

  /**
   * Get user's orders (or all orders if admin)
   */
  async getOrders(): Promise<Order[]> {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await this.apiClient.get<{ success: boolean; data: Order[] }>('/orders', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      return response.data.data;
    } catch (error) {
      console.error('Error fetching orders:', error);
      throw error;
    }
  }

  /**
   * Get a single order by ID
   */
  async getOrderById(id: number): Promise<Order> {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await this.apiClient.get<{ success: boolean; data: Order }>(`/orders/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      return response.data.data;
    } catch (error) {
      console.error('Error fetching order:', error);
      throw error;
    }
  }

  /**
   * Create a new order
   */
  async createOrder(orderData: CreateOrderRequest): Promise<Order> {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await this.apiClient.post<{ success: boolean; data: Order }>('/orders', orderData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      return response.data.data;
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  }

  /**
   * Accept an order (admin only)
   */
  async acceptOrder(id: number): Promise<Order> {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await this.apiClient.patch<{ success: boolean; data: Order }>(
        `/orders/${id}/accept`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );
      return response.data.data;
    } catch (error) {
      console.error('Error accepting order:', error);
      throw error;
    }
  }

  /**
   * Decline an order (admin only)
   */
  async declineOrder(id: number, reason: string): Promise<Order> {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await this.apiClient.patch<{ success: boolean; data: Order }>(
        `/orders/${id}/decline`,
        { reason },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );
      return response.data.data;
    } catch (error) {
      console.error('Error declining order:', error);
      throw error;
    }
  }

  /**
   * Mark order as preparing (admin only)
   */
  async markPreparing(id: number): Promise<Order> {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await this.apiClient.patch<{ success: boolean; data: Order }>(
        `/orders/${id}/mark-preparing`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );
      return response.data.data;
    } catch (error) {
      console.error('Error marking order as preparing:', error);
      throw error;
    }
  }

  /**
   * Mark order as ready (admin only)
   */
  async markReady(id: number): Promise<Order> {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await this.apiClient.patch<{ success: boolean; data: Order }>(
        `/orders/${id}/mark-ready`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );
      return response.data.data;
    } catch (error) {
      console.error('Error marking order as ready:', error);
      throw error;
    }
  }

  /**
   * Complete an order (admin only)
   */
  async completeOrder(id: number): Promise<Order> {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await this.apiClient.patch<{ success: boolean; data: Order }>(
        `/orders/${id}/complete`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );
      return response.data.data;
    } catch (error) {
      console.error('Error completing order:', error);
      throw error;
    }
  }
}

export default new OrderService();
