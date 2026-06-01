import OrderService from './OrderService';
import type { Order } from './OrderService';

export interface DashboardStats {
  pendingCount: number;
  acceptedCount: number;
  declinedCount: number;
  totalRevenue: number;
  recentOrders: Order[];
}

class DashboardService {
  /**
   * Get dashboard statistics
   */
  async getDashboardStats(): Promise<DashboardStats> {
    try {
      const orders = await OrderService.getOrders();

      const pendingCount = orders.filter(o => o.status === 'pending').length;
      const acceptedCount = orders.filter(o => ['accepted', 'preparing', 'ready'].includes(o.status)).length;
      const declinedCount = orders.filter(o => o.status === 'declined').length;

      const totalRevenue = orders
        .filter(o => o.status === 'completed')
        .reduce((sum, o) => sum + o.total_amount, 0);

      // Get recent orders (last 3)
      const recentOrders = orders
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 3);

      return {
        pendingCount,
        acceptedCount,
        declinedCount,
        totalRevenue,
        recentOrders,
      };
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      throw error;
    }
  }
}

export default new DashboardService();
