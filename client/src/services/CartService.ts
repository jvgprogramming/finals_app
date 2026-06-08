import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
const CART_STORAGE_KEY = 'np_cart';

export interface CartItem {
  /** Server-side cart row ID when authenticated */
  id?: number;
  /** Guest cart line ID */
  cartItemId?: string;
  product_id: number;
  name: string;
  price: number;
  quantity: number;
  size: string;
  dedication?: string;
  image: string;
}

/** Stable React key and update/remove target for guest or server cart lines */
export function getCartLineId(item: CartItem): string | number {
  if (item.id != null) return item.id;
  if (item.cartItemId) return item.cartItemId;
  return `line-${item.product_id}-${item.size}`;
}

interface AddToCartPayload {
  product_id: number;
  name: string;
  image: string;
  quantity: number;
  size: string;
  dedication?: string;
  price: number;
}

/** Shape returned by the server's CartItemResource */
interface ServerCartItem {
  id: number;
  product_id: number;
  name: string;
  price: number;
  quantity: number;
  size: string;
  dedication: string | null;
  image: string;
}

class CartService {
  private apiClient = axios.create({
    baseURL: API_URL,
  });

  private getAuthToken(): string | null {
    return localStorage.getItem('auth_token');
  }

  private isAuthenticated(): boolean {
    return !!this.getAuthToken();
  }

  private authHeaders() {
    return {
      Authorization: `Bearer ${this.getAuthToken()}`,
    };
  }

  /** Normalize legacy guest cart rows (missing ids / product_id) */
  private normalizeCartItem(item: CartItem): CartItem {
    const productId = Number(item.product_id ?? (item as { id?: number }).id);
    const cartItemId =
      item.cartItemId ??
      (item.id != null ? `server_${item.id}` : this.generateCartItemId());

    return {
      ...item,
      product_id: productId,
      cartItemId: item.id == null ? cartItemId : item.cartItemId,
      quantity: Math.max(1, Number(item.quantity) || 1),
      size: item.size || 'Default',
      image: item.image || '/images/placeholder.png',
    };
  }

  private normalizeCart(items: CartItem[]): CartItem[] {
    return items.map((item) => this.normalizeCartItem(item));
  }

  /** Read guest cart from localStorage */
  private getLocalCart(): CartItem[] {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      const parsed: CartItem[] = saved ? JSON.parse(saved) : [];
      const normalized = this.normalizeCart(parsed);
      if (JSON.stringify(parsed) !== JSON.stringify(normalized)) {
        this.setLocalCart(normalized);
      }
      return normalized;
    } catch {
      return [];
    }
  }

  /** Save guest cart to localStorage */
  private setLocalCart(items: CartItem[]): void {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  }

  /** Map server cart item to frontend CartItem format */
  private mapServerItem(item: ServerCartItem): CartItem {
    return {
      id: item.id,
      product_id: item.product_id,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      size: item.size || 'Default',
      dedication: item.dedication || undefined,
      image: item.image || '/images/placeholder.png',
    };
  }

  /**
   * Generate a unique client-side cart item ID (used for guest cart).
   */
  private generateCartItemId(): string {
    return `guest_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }

  // ==========================================================================
  // Public API
  // ==========================================================================

  /**
   * Get the current cart.
   * - Authenticated: fetches from server
   * - Guest: reads from localStorage
   */
  async getCart(): Promise<CartItem[]> {
    if (!this.isAuthenticated()) {
      return this.getLocalCart();
    }

    try {
      const response = await this.apiClient.get<{ success: boolean; data: ServerCartItem[] }>('/cart', {
        headers: this.authHeaders(),
      });
      return response.data.data.map((row) => this.mapServerItem(row));
    } catch (error) {
      console.error('Error fetching cart:', error);
      return [];
    }
  }

  /**
   * Add an item to the cart.
   * - Authenticated: POST to server (handles merge server-side)
   * - Guest: merge into localStorage manually
   */
  async addItem(item: AddToCartPayload): Promise<CartItem[]> {
    if (this.isAuthenticated()) {
      try {
        await this.apiClient.post('/cart/add', item, {
          headers: this.authHeaders(),
        });
        // Return refreshed cart
        return this.getCart();
      } catch (error) {
        console.error('Error adding item to cart:', error);
        return this.getLocalCart();
      }
    }

    // Guest: handle in localStorage
    const cart = this.getLocalCart();

    // Check if same product+size exists, merge by incrementing quantity
    const existingIndex = cart.findIndex(
      (ci) => ci.product_id === item.product_id && ci.size === item.size,
    );

    if (existingIndex >= 0) {
      cart[existingIndex].quantity += item.quantity;
      cart[existingIndex].price = item.price;
      if (item.dedication) {
        cart[existingIndex].dedication = item.dedication;
      }
    } else {
      cart.push({
        cartItemId: this.generateCartItemId(),
        product_id: item.product_id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        size: item.size,
        dedication: item.dedication,
        image: item.image,
      });
    }

    this.setLocalCart(cart);
    return cart;
  }

  /**
   * Update item quantity.
   * If quantity <= 0, the item is removed.
   */
  async updateQuantity(itemId: number | string, newQty: number): Promise<CartItem[]> {
    if (!this.isAuthenticated()) {
      // Guest: localStorage
      let cart = this.getLocalCart();
      if (newQty <= 0) {
        cart = cart.filter((item) => item.cartItemId !== itemId && item.id !== itemId);
      } else {
        cart = cart.map((item) =>
          (item.cartItemId === itemId || item.id === itemId) ? { ...item, quantity: newQty } : item,
        );
      }
      this.setLocalCart(cart);
      return cart;
    }

    // Authenticated: server API
    try {
      if (newQty <= 0) {
        await this.apiClient.delete(`/cart/remove/${itemId}`, {
          headers: this.authHeaders(),
        });
      } else {
        await this.apiClient.post(
          `/cart/update/${itemId}`,
          { quantity: newQty },
          { headers: this.authHeaders() },
        );
      }
      return this.getCart();
    } catch (error) {
      console.error('Error updating cart item:', error);
      return this.getCart();
    }
  }

  /**
   * Remove an item from the cart.
   */
  async removeItem(itemId: number | string): Promise<CartItem[]> {
    if (!this.isAuthenticated()) {
      let cart = this.getLocalCart();
      cart = cart.filter((item) => item.cartItemId !== itemId && item.id !== itemId);
      this.setLocalCart(cart);
      return cart;
    }

    try {
      await this.apiClient.delete(`/cart/remove/${itemId}`, {
        headers: this.authHeaders(),
      });
      return this.getCart();
    } catch (error) {
      console.error('Error removing cart item:', error);
      return this.getCart();
    }
  }

  /**
   * Clear the entire cart.
   */
  async clearCart(): Promise<void> {
    if (!this.isAuthenticated()) {
      localStorage.removeItem(CART_STORAGE_KEY);
      return;
    }

    try {
      await this.apiClient.delete('/cart/clear', {
        headers: this.authHeaders(),
      });
    } catch (error) {
      console.error('Error clearing cart:', error);
    }
  }

  /**
   * Sync/merge the guest cart into the user's server-side cart.
   * Called after successful login.
   * Returns the merged server cart.
   */
  async syncGuestCart(): Promise<CartItem[]> {
    const guestCart = this.getLocalCart();
    if (guestCart.length === 0) {
      // No guest items to sync, just fetch server cart
      return this.getCart();
    }

    const items = guestCart.map((item) => ({
      product_id: item.product_id,
      quantity: item.quantity,
      size: item.size,
      dedication: item.dedication || null,
      price: item.price,
    }));

    try {
      const response = await this.apiClient.post<{ success: boolean; data: ServerCartItem[] }>(
        '/cart/sync',
        { items },
        { headers: this.authHeaders() },
      );

      // Clear guest cart from localStorage after successful sync
      localStorage.removeItem(CART_STORAGE_KEY);

      return response.data.data.map(this.mapServerItem);
    } catch (error) {
      console.error('Error syncing cart:', error);
      // If sync fails, keep guest cart in localStorage and return it
      return guestCart;
    }
  }
}

export default new CartService();
