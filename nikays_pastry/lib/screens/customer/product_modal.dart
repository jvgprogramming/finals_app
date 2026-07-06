import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:cached_network_image/cached_network_image.dart';
import '../../providers/cart_provider.dart';
import '../../models/product.dart';
import '../../utils/currency.dart';
import '../../utils/product_pricing.dart';

class ProductModal extends StatefulWidget {
  final Product product;
  const ProductModal({super.key, required this.product});

  @override
  State<ProductModal> createState() => _ProductModalState();
}

class _ProductModalState extends State<ProductModal> {
  String _selectedSize = '6" Personal';
  String _dedication = '';
  int _quantity = 1;
  final _dedicationController = TextEditingController();

  @override
  void initState() {
    super.initState();
    final catName = widget.product.categoryLabel ?? '';
    final options = getSizeOptionsForCategory(catName);
    _selectedSize = options.first.label;
  }

  @override
  void dispose() {
    _dedicationController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final catName = widget.product.categoryLabel ?? '';
    final sizeOptions = getSizeOptionsForCategory(catName);
    final sizeLabel = getSizeOptionLabel(catName);
    final unitPrice = getPriceForSize(widget.product.price, _selectedSize, catName);
    final lineTotal = unitPrice * _quantity;
    final isCake = catName.toLowerCase().contains('cakes');

    return Container(
      height: MediaQuery.of(context).size.height * 0.85,
      decoration: const BoxDecoration(
        color: Color(0xFFFFFDFB),
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      child: Column(
        children: [
          // Handle
          Container(
            margin: const EdgeInsets.symmetric(vertical: 8),
            width: 40, height: 4,
            decoration: BoxDecoration(
              color: const Color(0xFFF4EAE1),
              borderRadius: BorderRadius.circular(2),
            ),
          ),
          Expanded(
            child: SingleChildScrollView(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Image
                  ClipRRect(
                    borderRadius: BorderRadius.circular(16),
                    child: CachedNetworkImage(
                      imageUrl: widget.product.resolvedImageUrl,
                      height: 260,
                      width: double.infinity,
                      fit: BoxFit.cover,
                      placeholder: (_, __) => Container(color: const Color(0xFFEFE5DD)),
                    ),
                  ),
                  Padding(
                    padding: const EdgeInsets.all(20),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        // Price
                        Center(
                          child: Text(formatPeso(unitPrice), style: const TextStyle(
                            fontFamily: 'Outfit',
                            fontSize: 22,
                            fontWeight: FontWeight.w700,
                            color: Color(0xFF2A1D19),
                          )),
                        ),
                        const SizedBox(height: 16),
                        Text(widget.product.name, style: const TextStyle(
                          fontFamily: 'PlayfairDisplay',
                          fontSize: 24,
                          fontWeight: FontWeight.w600,
                        )),
                        const SizedBox(height: 8),
                        Text(widget.product.description, style: const TextStyle(
                          fontSize: 14, color: Color(0xFF6E5A56),
                        )),
                        const SizedBox(height: 24),

                        // Size options
                        Text(sizeLabel.toUpperCase(), style: const TextStyle(
                          fontSize: 12, fontWeight: FontWeight.w700, letterSpacing: 1,
                          color: Color(0xFF6E5A56),
                        )),
                        const SizedBox(height: 8),
                        Wrap(
                          spacing: 8,
                          runSpacing: 8,
                          children: sizeOptions.map((opt) {
                            final isSelected = _selectedSize == opt.label;
                            return GestureDetector(
                              onTap: () => setState(() => _selectedSize = opt.label),
                              child: Container(
                                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                                decoration: BoxDecoration(
                                  color: isSelected
                                      ? const Color(0xFFF7E6E2)
                                      : const Color(0xFFFFFDFB),
                                  borderRadius: BorderRadius.circular(12),
                                  border: Border.all(
                                    color: isSelected
                                        ? const Color(0xFFD47C6A)
                                        : const Color(0xFFF4EAE1),
                                  ),
                                ),
                                child: Column(
                                  children: [
                                    Text(opt.label, style: TextStyle(
                                      fontSize: 13, fontWeight: FontWeight.w500,
                                      color: isSelected
                                          ? const Color(0xFFD47C6A)
                                          : const Color(0xFF6E5A56),
                                    )),
                                    Text(formatPeso(getPriceForSize(
                                      widget.product.price, opt.label, catName)),
                                      style: TextStyle(fontSize: 11, color: isSelected
                                          ? const Color(0xFFD47C6A)
                                          : const Color(0xFF6E5A56)),
                                    ),
                                  ],
                                ),
                              ),
                            );
                          }).toList(),
                        ),
                        const SizedBox(height: 24),

                        // Dedication for cakes
                        if (isCake) ...[
                          Text('DEDICATION MESSAGE (OPTIONAL)', style: const TextStyle(
                            fontSize: 12, fontWeight: FontWeight.w700, letterSpacing: 1,
                            color: Color(0xFF6E5A56),
                          )),
                          const SizedBox(height: 8),
                          TextField(
                            controller: _dedicationController,
                            maxLength: 40,
                            maxLines: 2,
                            decoration: InputDecoration(
                              hintText: 'e.g. Happy 21st Birthday Sarah!',
                              filled: true,
                              fillColor: const Color(0xFFFAF6F2),
                              border: OutlineInputBorder(
                                borderRadius: BorderRadius.circular(12),
                                borderSide: const BorderSide(color: Color(0xFFF4EAE1)),
                              ),
                              counterStyle: const TextStyle(fontSize: 11, color: Color(0xFF6E5A56)),
                            ),
                            onChanged: (v) => setState(() => _dedication = v),
                          ),
                          const SizedBox(height: 16),
                        ],

                        // Quantity and Add to Cart
                        Row(
                          children: [
                            Container(
                              decoration: BoxDecoration(
                                border: Border.all(color: const Color(0xFFF4EAE1)),
                                borderRadius: BorderRadius.circular(20),
                              ),
                              child: Row(
                                children: [
                                  _qtyBtn(Icons.remove, () => setState(() => _quantity = (_quantity - 1).clamp(1, 99))),
                                  Padding(
                                    padding: const EdgeInsets.symmetric(horizontal: 12),
                                    child: Text('$_quantity', style: const TextStyle(
                                      fontSize: 16, fontWeight: FontWeight.w700)),
                                  ),
                                  _qtyBtn(Icons.add, () => setState(() => _quantity = (_quantity + 1).clamp(1, 99))),
                                ],
                              ),
                            ),
                            const SizedBox(width: 16),
                            Expanded(
                              child: ElevatedButton(
                                onPressed: () {
                                  context.read<CartProvider>().addItem({
                                    'product_id': widget.product.id,
                                    'name': widget.product.name,
                                    'image': widget.product.resolvedImageUrl,
                                    'quantity': _quantity,
                                    'size': _selectedSize,
                                    'dedication': isCake ? _dedication : null,
                                    'price': unitPrice,
                                  });
                                  Navigator.of(context).pop();
                                },
                                style: ElevatedButton.styleFrom(
                                  padding: const EdgeInsets.symmetric(vertical: 14),
                                ),
                                child: Text('Add to Cart · ${formatPeso(lineTotal)}'),
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
          ),
        ],
      ),
    );
  }

  Widget _qtyBtn(IconData icon, VoidCallback onTap) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.all(10),
        child: Icon(icon, size: 18),
      ),
    );
  }
}
