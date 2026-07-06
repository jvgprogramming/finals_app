import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:cached_network_image/cached_network_image.dart';
import '../../providers/cart_provider.dart';
import '../../providers/auth_provider.dart';
import '../../utils/currency.dart';
import '../auth/login_screen.dart';
import 'checkout_screen.dart';

class CartDrawer extends StatelessWidget {
  const CartDrawer({super.key});

  @override
  Widget build(BuildContext context) {
    return Consumer<CartProvider>(
      builder: (context, cart, _) {
        return Container(
          height: MediaQuery.of(context).size.height * 0.75,
          decoration: const BoxDecoration(
            color: Color(0xFFFFFDFB),
            borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
          ),
          child: Column(
            children: [
              // Header
              Padding(
                padding: const EdgeInsets.fromLTRB(20, 12, 20, 0),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text('Your Basket', style: TextStyle(
                      fontFamily: 'PlayfairDisplay',
                      fontSize: 24,
                      fontWeight: FontWeight.w600,
                    )),
                    IconButton(
                      icon: const Icon(Icons.close),
                      onPressed: () => Navigator.of(context).pop(),
                    ),
                  ],
                ),
              ),
              const Divider(),
              // Items
              Expanded(
                child: cart.isEmpty
                    ? Center(
                        child: Column(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Icon(Icons.shopping_cart_outlined, size: 48,
                              color: const Color(0xFF6E5A56).withValues(alpha: 0.3)),
                            const SizedBox(height: 16),
                            const Text('Your basket is empty', style: TextStyle(
                              fontFamily: 'PlayfairDisplay', fontSize: 18)),
                            const SizedBox(height: 8),
                            const Text('Browse our catalog to select delicious pastries!',
                              style: TextStyle(fontSize: 13, color: Color(0xFF6E5A56))),
                          ],
                        ),
                      )
                    : ListView.builder(
                        padding: const EdgeInsets.all(16),
                        itemCount: cart.items.length,
                        itemBuilder: (context, index) {
                          final item = cart.items[index];
                          return Padding(
                            padding: const EdgeInsets.only(bottom: 16),
                            child: Row(
                              children: [
                                ClipRRect(
                                  borderRadius: BorderRadius.circular(10),
                                  child: CachedNetworkImage(
                                    imageUrl: item.image,
                                    width: 60, height: 60, fit: BoxFit.cover,
                                  ),
                                ),
                                const SizedBox(width: 12),
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Text(item.name, style: const TextStyle(
                                        fontWeight: FontWeight.w600, fontSize: 14)),
                                      Text('Size: ${item.size}', style: const TextStyle(
                                        fontSize: 11, color: Color(0xFF6E5A56))),
                                      Text(formatPeso(item.price), style: const TextStyle(
                                        fontWeight: FontWeight.w700, fontSize: 13)),
                                    ],
                                  ),
                                ),
                                Column(
                                  children: [
                                    GestureDetector(
                                      onTap: () => cart.removeItem(item.lineId),
                                      child: const Text('Remove', style: TextStyle(
                                        fontSize: 12, color: Color(0xFFB85C5C))),
                                    ),
                                    const SizedBox(height: 4),
                                    Row(
                                      children: [
                                        _miniBtn(Icons.remove, () => cart.updateQuantity(item.lineId, item.quantity - 1)),
                                        Padding(
                                          padding: const EdgeInsets.symmetric(horizontal: 8),
                                          child: Text('${item.quantity}', style: const TextStyle(fontWeight: FontWeight.w700)),
                                        ),
                                        _miniBtn(Icons.add, () => cart.updateQuantity(item.lineId, item.quantity + 1)),
                                      ],
                                    ),
                                  ],
                                ),
                              ],
                            ),
                          );
                        },
                      ),
              ),
              // Footer
              if (!cart.isEmpty) ...[
                Container(
                  padding: const EdgeInsets.all(20),
                  decoration: const BoxDecoration(
                    color: Color(0xFFFAF6F2),
                    border: Border(top: BorderSide(color: Color(0xFFF4EAE1))),
                  ),
                  child: Column(
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          const Text('Subtotal', style: TextStyle(fontSize: 14)),
                          Text(formatPeso(cart.subtotal), style: const TextStyle(fontSize: 14)),
                        ],
                      ),
                      const SizedBox(height: 4),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          const Text('Est. Delivery/Handling', style: TextStyle(fontSize: 13, color: Color(0xFF6E5A56))),
                          const Text('Calculated next', style: TextStyle(fontSize: 12, color: Color(0xFF6E5A56))),
                        ],
                      ),
                      const Divider(height: 24),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          const Text('Estimated Total', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700)),
                          Text(formatPeso(cart.subtotal), style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w700)),
                        ],
                      ),
                      const SizedBox(height: 12),
                      SizedBox(
                        width: double.infinity,
                        height: 48,
                        child: ElevatedButton(
                          onPressed: () {
                            Navigator.of(context).pop();
                            _proceedCheckout(context);
                          },
                          child: const Text('Proceed to Checkout'),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ],
          ),
        );
      },
    );
  }

  void _proceedCheckout(BuildContext context) {
    final auth = context.read<AuthProvider>();
    if (!auth.isAuthenticated) {
      Navigator.of(context).push(
        MaterialPageRoute(builder: (_) => const LoginScreen()),
      );
      return;
    }
    Navigator.of(context).push(
      MaterialPageRoute(builder: (_) => const CheckoutScreen()),
    );
  }

  Widget _miniBtn(IconData icon, VoidCallback onTap) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.all(4),
        child: Icon(icon, size: 16),
      ),
    );
  }
}
