import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/product_provider.dart';
import '../../providers/auth_provider.dart';
import '../../models/product.dart';
import '../../widgets/product_card.dart';
import '../../widgets/loading_spinner.dart';
import '../../widgets/empty_state.dart';
import 'product_modal.dart';

class CatalogScreen extends StatefulWidget {
  final VoidCallback? onNavigateOrders;
  const CatalogScreen({super.key, this.onNavigateOrders});

  @override
  State<CatalogScreen> createState() => _CatalogScreenState();
}

class _CatalogScreenState extends State<CatalogScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<ProductProvider>().loadProducts();
    });
  }

  void _showProductModal(Product product) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) => ProductModal(product: product),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Consumer2<ProductProvider, AuthProvider>(
      builder: (context, productsProv, auth, _) {
        return SafeArea(
          top: false,
          child: RefreshIndicator(
            onRefresh: () => productsProv.silentRefresh(),
            child: CustomScrollView(
              slivers: [
                // Hero section
                SliverToBoxAdapter(
                  child: Container(
                    padding: const EdgeInsets.fromLTRB(16, 24, 16, 32),
                    decoration: const BoxDecoration(
                      gradient: RadialGradient(
                        center: Alignment.topCenter,
                        colors: [Color(0xFFF7E6E2), Color(0xFFFAF6F2)],
                        radius: 1.0,
                      ),
                    ),
                    child: Column(
                      children: [
                        // Search bar
                        Container(
                          decoration: BoxDecoration(
                            color: const Color(0xFFFFFDFB),
                            borderRadius: BorderRadius.circular(30),
                            border: Border.all(color: const Color(0xFFF4EAE1)),
                          ),
                          child: TextField(
                            onChanged: (v) => productsProv.setSearchQuery(v),
                            style: const TextStyle(
                              fontFamily: 'Outfit',
                              fontSize: 14,
                            ),
                            decoration: InputDecoration(
                              hintText: 'Search cakes, pastries...',
                              hintStyle: const TextStyle(
                                color: Color(0xFFA4918E),
                              ),
                              prefixIcon: const Icon(
                                Icons.search,
                                size: 20,
                                color: Color(0xFF6E5A56),
                              ),
                              border: InputBorder.none,
                              enabledBorder: InputBorder.none,
                              focusedBorder: InputBorder.none,
                              filled: false,
                              contentPadding: const EdgeInsets.symmetric(
                                horizontal: 16,
                                vertical: 16,
                              ),
                            ),
                          ),
                        ),
                        const SizedBox(height: 16),
                        // Categories
                        SizedBox(
                          height: 40,
                          child: ListView(
                            scrollDirection: Axis.horizontal,
                            children: productsProv.availableCategories.map((
                              cat,
                            ) {
                              final isActive =
                                  productsProv.activeCategory == cat;
                              return Padding(
                                padding: const EdgeInsets.only(right: 8),
                                child: GestureDetector(
                                  onTap: () =>
                                      productsProv.setActiveCategory(cat),
                                  child: Container(
                                    padding: const EdgeInsets.symmetric(
                                      horizontal: 20,
                                      vertical: 10,
                                    ),
                                    decoration: BoxDecoration(
                                      color: isActive
                                          ? const Color(0xFFD47C6A)
                                          : const Color(0xFFFFFDFB),
                                      borderRadius: BorderRadius.circular(30),
                                      border: isActive
                                          ? null
                                          : Border.all(
                                              color: const Color(0xFFF4EAE1),
                                            ),
                                    ),
                                    child: Text(
                                      cat,
                                      style: TextStyle(
                                        fontFamily: 'Outfit',
                                        fontSize: 13,
                                        fontWeight: FontWeight.w500,
                                        color: isActive
                                            ? Colors.white
                                            : const Color(0xFF6E5A56),
                                      ),
                                    ),
                                  ),
                                ),
                              );
                            }).toList(),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
                // Section header
                SliverToBoxAdapter(
                  child: Padding(
                    padding: const EdgeInsets.fromLTRB(16, 24, 16, 16),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          '${productsProv.activeCategory} Selection',
                          style: const TextStyle(
                            fontFamily: 'PlayfairDisplay',
                            fontSize: 22,
                            fontWeight: FontWeight.w600,
                            color: Color(0xFF2A1D19),
                          ),
                        ),
                        PopupMenuButton<String>(
                          onSelected: (v) => productsProv.setSortBy(v),
                          itemBuilder: (_) => [
                            const PopupMenuItem(
                              value: 'popular',
                              child: Text('Popularity'),
                            ),
                            const PopupMenuItem(
                              value: 'price-asc',
                              child: Text('Price: Low to High'),
                            ),
                            const PopupMenuItem(
                              value: 'price-desc',
                              child: Text('Price: High to Low'),
                            ),
                          ],
                          child: Container(
                            padding: const EdgeInsets.symmetric(
                              horizontal: 12,
                              vertical: 6,
                            ),
                            decoration: BoxDecoration(
                              color: const Color(0xFFFFFDFB),
                              borderRadius: BorderRadius.circular(20),
                              border: Border.all(
                                color: const Color(0xFFF4EAE1),
                              ),
                            ),
                            child: const Row(
                              children: [
                                Icon(
                                  Icons.sort,
                                  size: 16,
                                  color: Color(0xFF6E5A56),
                                ),
                                SizedBox(width: 4),
                                Text(
                                  'Sort',
                                  style: TextStyle(
                                    fontSize: 13,
                                    color: Color(0xFF6E5A56),
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
                // Products grid
                if (productsProv.isLoadingProducts)
                  const SliverFillRemaining(
                    hasScrollBody: true,
                    child: LoadingSpinner(label: 'Loading menu…'),
                  )
                else if (productsProv.filteredProducts.isEmpty)
                  const SliverFillRemaining(
                    hasScrollBody: true,
                    child: EmptyState(
                      icon: Icons.search_off,
                      title: 'No delicacies found',
                      description: 'Try a different category or search term.',
                    ),
                  )
                else
                  SliverPadding(
                    padding: const EdgeInsets.fromLTRB(16, 0, 16, 24),
                    sliver: SliverGrid(
                      gridDelegate:
                          const SliverGridDelegateWithFixedCrossAxisCount(
                            crossAxisCount: 2,
                            childAspectRatio: 0.68,
                            crossAxisSpacing: 12,
                            mainAxisSpacing: 12,
                          ),
                      delegate: SliverChildBuilderDelegate((context, index) {
                        final product = productsProv.filteredProducts[index];
                        return ProductCard(
                          product: product,
                          onOrder: () => _showProductModal(product),
                        );
                      }, childCount: productsProv.filteredProducts.length),
                    ),
                  ),
              ],
            ),
          ),
        );
      },
    );
  }
}
