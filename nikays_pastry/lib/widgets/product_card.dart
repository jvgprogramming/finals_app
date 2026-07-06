import 'package:flutter/material.dart';
import 'package:cached_network_image/cached_network_image.dart';
import '../models/product.dart';
import '../utils/currency.dart';

class ProductCard extends StatelessWidget {
  final Product product;
  final VoidCallback onOrder;

  const ProductCard({super.key, required this.product, required this.onOrder});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: product.available ? onOrder : null,
      child: Container(
        decoration: BoxDecoration(
          color: const Color(0xFFFFFDFB),
          borderRadius: BorderRadius.circular(20),
          border: Border.all(color: const Color(0xFFF4EAE1)),
          boxShadow: [
            BoxShadow(
              color: const Color(0xFF2A1D19).withValues(alpha: 0.03),
              blurRadius: 8,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        clipBehavior: Clip.antiAlias,
        child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Image
          AspectRatio(
            aspectRatio: 1.3,
            child: Stack(
              children: [
                CachedNetworkImage(
                  imageUrl: product.resolvedImageUrl,
                  width: double.infinity,
                  height: double.infinity,
                  fit: BoxFit.cover,
                  placeholder: (_, _) =>
                      Container(color: const Color(0xFFEFE5DD)),
                  errorWidget: (_, _, _) => Container(
                    color: const Color(0xFFEFE5DD),
                    child: const Icon(Icons.image,
                        color: Color(0xFF6E5A56)),
                  ),
                ),
                // Category badge
                Positioned(
                  top: 12, left: 12,
                  child: Container(
                    padding: const EdgeInsets.symmetric(
                        horizontal: 10, vertical: 4),
                    decoration: BoxDecoration(
                      color: const Color(0xFFDCAE6C),
                      borderRadius: BorderRadius.circular(12),
                      boxShadow: [
                        BoxShadow(
                            color: Colors.black.withValues(alpha: 0.1),
                            blurRadius: 6)
                      ],
                    ),
                    child: Text(
                      product.categoryLabel ?? 'Pastry',
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 11,
                        fontWeight: FontWeight.w700,
                        letterSpacing: 1,
                      ),
                    ),
                  ),
                ),
                // Sold out overlay
                if (!product.available)
                  Positioned.fill(
                    child: Container(
                      color: const Color(0xFF2A1D19).withValues(alpha: 0.45),
                      child: Center(
                        child: Container(
                          padding: const EdgeInsets.symmetric(
                              horizontal: 24, vertical: 10),
                          color: const Color(0xFF2A1D19),
                          child: const Text(
                            'NOT AVAILABLE',
                            style: TextStyle(
                              color: Colors.white,
                              fontSize: 13,
                              fontWeight: FontWeight.w700,
                              letterSpacing: 2,
                            ),
                          ),
                        ),
                      ),
                    ),
                  ),
              ],
            ),
          ),
          // Body
          Padding(
            padding: const EdgeInsets.all(12),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Name
                Text(
                  product.name,
                  style: const TextStyle(
                    fontFamily: 'PlayfairDisplay',
                    fontSize: 15,
                    fontWeight: FontWeight.w600,
                    color: Color(0xFF2A1D19),
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
                const SizedBox(height: 8),
                // Price + Order button row
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  crossAxisAlignment: CrossAxisAlignment.end,
                  children: [
                    // Price
                    Flexible(
                      flex: 3,
                      child: Column(
                        mainAxisSize: MainAxisSize.min,
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          FittedBox(
                            fit: BoxFit.scaleDown,
                            child: Text(
                              formatPeso(product.price),
                              style: const TextStyle(
                                fontFamily: 'Outfit',
                                fontSize: 16,
                                fontWeight: FontWeight.w700,
                                color: Color(0xFF2A1D19),
                              ),
                            ),
                          ),
                          Text(
                            'from 6" size',
                            style: TextStyle(
                              fontFamily: 'Outfit',
                              fontSize: 10,
                              color: const Color(0xFF6E5A56)
                                  .withValues(alpha: 0.8),
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(width: 8),
                    // Order button
                    Flexible(
                      flex: 2,
                      child: FittedBox(
                        fit: BoxFit.scaleDown,
                        child: GestureDetector(
                          onTap: product.available ? onOrder : null,
                          child: Container(
                            padding: const EdgeInsets.symmetric(
                                horizontal: 12, vertical: 8),
                            decoration: BoxDecoration(
                              color: product.available
                                  ? const Color(0xFFF7E6E2)
                                  : Colors.grey.shade200,
                              borderRadius: BorderRadius.circular(20),
                            ),
                            child: Text(
                              product.available
                                  ? 'Order Now'
                                  : 'Unavailable',
                              style: TextStyle(
                                fontFamily: 'Outfit',
                                fontSize: 12,
                                fontWeight: FontWeight.w600,
                                color: product.available
                                    ? const Color(0xFFD47C6A)
                                    : Colors.grey,
                              ),
                            ),
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
      ),
    );
  }
}
