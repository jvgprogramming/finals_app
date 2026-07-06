import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:cached_network_image/cached_network_image.dart';
import '../../providers/product_provider.dart';
import '../../models/product.dart';
import '../../utils/currency.dart';
import '../../widgets/loading_spinner.dart';
import '../../widgets/empty_state.dart';

class ProductManagementScreen extends StatefulWidget {
  const ProductManagementScreen({super.key});

  @override
  State<ProductManagementScreen> createState() => _ProductManagementScreenState();
}

class _ProductManagementScreenState extends State<ProductManagementScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<ProductProvider>().loadProducts();
    });
  }

  void _showProductEditor({Product? product}) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) => _ProductEditorSheet(product: product),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Consumer<ProductProvider>(
      builder: (context, productsProv, _) {
        return Scaffold(
          body: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Padding(
                padding: const EdgeInsets.fromLTRB(16, 16, 16, 8),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text('Product Inventory', style: TextStyle(
                      fontFamily: 'PlayfairDisplay',
                      fontSize: 24,
                      fontWeight: FontWeight.w600,
                    )),
                    ElevatedButton.icon(
                      onPressed: () => _showProductEditor(),
                      icon: const Icon(Icons.add, size: 18),
                      label: const Text('Add New'),
                      style: ElevatedButton.styleFrom(padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10)),
                    ),
                  ],
                ),
              ),
              Expanded(
                child: productsProv.isLoadingProducts
                    ? const LoadingSpinner(label: 'Loading products...')
                    : productsProv.products.isEmpty
                        ? const EmptyState(
                            icon: Icons.inventory_2_outlined,
                            title: 'No products yet',
                            description: 'Add your first bakery item to the catalog.',
                          )
                        : ListView.builder(
                            padding: const EdgeInsets.all(16),
                            itemCount: productsProv.products.length,
                            itemBuilder: (context, index) {
                              final product = productsProv.products[index];
                              return Container(
                                padding: const EdgeInsets.all(16),
                                margin: const EdgeInsets.only(bottom: 12),
                                decoration: BoxDecoration(
                                  color: const Color(0xFFFFFDFB),
                                  borderRadius: BorderRadius.circular(16),
                                  border: Border.all(color: const Color(0xFFF4EAE1)),
                                ),
                                child: Row(
                                  children: [
                                    ClipRRect(
                                      borderRadius: BorderRadius.circular(8),
                                      child: CachedNetworkImage(
                                        imageUrl: product.resolvedImageUrl,
                                        width: 50, height: 50, fit: BoxFit.cover,
                                      ),
                                    ),
                                    const SizedBox(width: 12),
                                    Expanded(
                                      child: Column(
                                        crossAxisAlignment: CrossAxisAlignment.start,
                                        children: [
                                          Text(product.name, style: const TextStyle(
                                            fontWeight: FontWeight.w600, fontSize: 14)),
                                          Text('${formatPeso(product.price)} · ${product.categoryLabel}',
                                            style: const TextStyle(fontSize: 12, color: Color(0xFF6E5A56))),
                                        ],
                                      ),
                                    ),
                                    GestureDetector(
                                      onTap: () => _showProductEditor(product: product),
                                      child: Container(
                                        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                                        decoration: BoxDecoration(
                                          color: const Color(0xFFF7E6E2),
                                          borderRadius: BorderRadius.circular(20),
                                        ),
                                        child: const Text('Edit', style: TextStyle(
                                          fontSize: 12, fontWeight: FontWeight.w600, color: Color(0xFFD47C6A))),
                                      ),
                                    ),
                                    const SizedBox(width: 8),
                                    Switch(
                                      value: product.isAvailable,
                                      onChanged: (_) => productsProv.toggleAvailability(product.id),
                                      activeThumbColor: const Color(0xFF749A7A),
                                    ),
                                  ],
                                ),
                              );
                            },
                          ),
              ),
            ],
          ),
        );
      },
    );
  }
}

// Product Editor Bottom Sheet
class _ProductEditorSheet extends StatefulWidget {
  final Product? product;
  const _ProductEditorSheet({this.product});

  @override
  State<_ProductEditorSheet> createState() => _ProductEditorSheetState();
}

class _ProductEditorSheetState extends State<_ProductEditorSheet> {
  late TextEditingController _nameController;
  late TextEditingController _priceController;
  late TextEditingController _descController;
  String? _selectedCategoryId;
  bool _isAvailable = true;
  bool _isSubmitting = false;

  @override
  void initState() {
    super.initState();
    _nameController = TextEditingController(text: widget.product?.name ?? '');
    _priceController = TextEditingController(text: widget.product?.price.toString() ?? '');
    _descController = TextEditingController(text: widget.product?.description ?? '');
    _isAvailable = widget.product?.isAvailable ?? true;
    _selectedCategoryId = widget.product?.categoryId?.toString();
  }

  @override
  void dispose() {
    _nameController.dispose();
    _priceController.dispose();
    _descController.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (_nameController.text.trim().isEmpty || _priceController.text.trim().isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please fill in name and price.')));
      return;
    }
    if (_selectedCategoryId == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please select a category.')));
      return;
    }

    setState(() => _isSubmitting = true);
    try {
      final formData = <String, dynamic>{
        'name': _nameController.text.trim(),
        'price': double.parse(_priceController.text.trim()).toString(),
        'description': _descController.text.trim(),
        'category_id': _selectedCategoryId!,
        'is_available': _isAvailable ? '1' : '0',
      };

      if (widget.product != null) {
        await context.read<ProductProvider>().updateProduct(widget.product!.id, formData);
      } else {
        await context.read<ProductProvider>().createProduct(formData);
      }
      if (mounted) Navigator.of(context).pop();
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Error: $e')));
      }
    } finally {
      if (mounted) setState(() => _isSubmitting = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final categories = context.watch<ProductProvider>().categories;
    final isEditing = widget.product != null;

    return Container(
      height: MediaQuery.of(context).size.height * 0.75,
      decoration: const BoxDecoration(
        color: Color(0xFFFFFDFB),
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      child: SingleChildScrollView(
        padding: const EdgeInsets.all(24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Center(child: Container(
              width: 40, height: 4,
              decoration: BoxDecoration(
                color: const Color(0xFFF4EAE1),
                borderRadius: BorderRadius.circular(2),
              ),
            )),
            const SizedBox(height: 16),
            Text(isEditing ? 'Edit Creation' : 'Add New Bakery Creation', style: const TextStyle(
              fontFamily: 'PlayfairDisplay', fontSize: 22, fontWeight: FontWeight.w600)),
            const SizedBox(height: 24),
            TextField(
              controller: _nameController,
              decoration: const InputDecoration(labelText: 'Delicacy Name *'),
            ),
            const SizedBox(height: 16),
            Row(
              children: [
                Expanded(
                  child: TextField(
                    controller: _priceController,
                    decoration: const InputDecoration(labelText: 'Base Price (₱) *'),
                    keyboardType: TextInputType.number,
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child:                    DropdownButtonFormField<String>(
                    initialValue: _selectedCategoryId,
                    items: categories.map((c) => DropdownMenuItem(
                      value: c.id.toString(),
                      child: Text(c.name, style: const TextStyle(fontSize: 14)),
                    )).toList(),
                    onChanged: (v) => setState(() => _selectedCategoryId = v),
                    decoration: const InputDecoration(labelText: 'Category *'),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),
            TextField(
              controller: _descController,
              maxLines: 3,
              decoration: const InputDecoration(labelText: 'Description'),
            ),
            const SizedBox(height: 16),                      SwitchListTile(
                      title: const Text('Available for Order'),
                      value: _isAvailable,
                      onChanged: (v) => setState(() => _isAvailable = v),
                      activeThumbColor: const Color(0xFF749A7A),
              contentPadding: EdgeInsets.zero,
            ),
            const SizedBox(height: 24),
            Row(
              children: [
                Expanded(
                  child: OutlinedButton(
                    onPressed: () => Navigator.of(context).pop(),
                    child: const Text('Cancel'),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: ElevatedButton(
                    onPressed: _isSubmitting ? null : _submit,
                    child: _isSubmitting
                        ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2))
                        : Text(isEditing ? 'Save Changes' : 'Publish Delicacy'),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
