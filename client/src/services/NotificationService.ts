import axios from 'axios';

export interface Notification {
  id: number;
  title: string;
  message: string;
  is_read: boolean;
  order_id: number | null;
  created_at: string;
}

class NotificationService {
  private apiClient = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
  });

  /**
   * Get user's notifications (paginated)
   */
  async getNotifications(page: number = 1): Promise<{
    data: Notification[];
    pagination: {
      total: number;
      per_page: number;
      current_page: number;
      last_page: number;
    };
  }> {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await this.apiClient.get<{
        success: boolean;
        data: Notification[];
        pagination: {
          total: number;
          per_page: number;
          current_page: number;
          last_page: number;
        };
      }>('/notifications', {
        params: { page },
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      return {
        data: response.data.data,
        pagination: response.data.pagination,
      };
    } catch (error) {
      console.error('Error fetching notifications:', error);
      throw error;
    }
  }

  /**
   * Mark a notification as read
   */
  async markNotificationRead(id: number): Promise<Notification> {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await this.apiClient.patch<{ success: boolean; data: Notification }>(
        `/notifications/${id}/read`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );
      return response.data.data;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  }

  /**
   * Mark all notifications as read
   */
  async markAllNotificationsRead(): Promise<void> {
    try {
      const token = localStorage.getItem('auth_token');
      await this.apiClient.patch(
        '/notifications/mark-all-read',
        {},
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw error;
    }
  }
}

export default new NotificationService();
