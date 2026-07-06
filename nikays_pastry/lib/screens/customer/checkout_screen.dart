import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';
import '../../providers/cart_provider.dart';
import '../../providers/auth_provider.dart';
import '../../providers/order_provider.dart';
import '../../utils/currency.dart';
import '../../utils/phone_format.dart';

class CheckoutScreen extends StatefulWidget {
  const CheckoutScreen({super.key});

  @override
  State<CheckoutScreen> createState() => _CheckoutScreenState();
}

class _CheckoutScreenState extends State<CheckoutScreen> {
  final _nameController = TextEditingController();
  final _phoneController = TextEditingController(text: '+63 ');
  final _addressController = TextEditingController();
  String _fulfillmentType = 'pickup';
  DateTime _selectedDate = DateTime.now().add(const Duration(days: 1));
  String _selectedTime = '12:00 PM - 2:00 PM';
  bool _isSubmitting = false;
  String? _formError;

  final List<String> _timeSlots = [
    '9:00 AM - 11:00 AM',
    '12:00 PM - 2:00 PM',
    '3:00 PM - 5:00 PM',
    '6:00 PM - 8:00 PM',
  ];

  @override
  void initState() {
    super.initState();
    final user = context.read<AuthProvider>().user;
    if (user != null && user.fullName.trim().isNotEmpty) {
      _nameController.text = user.fullName;
    }
  }

  @override
  void dispose() {
    _nameController.dispose();
    _phoneController.dispose();
    _addressController.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (_nameController.text.trim().isEmpty) {
      setState(() => _formError = 'Please enter your name.');
      return;
    }
    if (!isValidPhilippinePhone(_phoneController.text.trim())) {
      setState(() => _formError = 'Please enter a valid Philippine mobile number.');
      return;
    }
    if (_fulfillmentType == 'delivery' && _addressController.text.trim().isEmpty) {
      setState(() => _formError = 'Please enter a delivery address.');
      return;
    }

    setState(() {
      _isSubmitting = true;
      _formError = null;
    });

    try {
      final cart = context.read<CartProvider>();
      final deliveryFee = _fulfillmentType == 'delivery' ? 50.0 : 0.0;
      final dateStr = DateFormat('yyyy-MM-dd').format(_selectedDate);
      final timeStr = _selectedTime.split(' - ').first.trim();
      final deliveryDate = '$dateStr ${_parseTimeSlot(timeStr)}';

      final orderData = {
        'items': cart.items.map((item) => {
          'product_id': item.productId,
          'quantity': item.quantity,
          'customization': {
            if (item.dedication != null && item.dedication!.isNotEmpty)
              'dedication_message': item.dedication,
            'size': item.size,
          },
        }).toList(),
        'notes': 'Payment: Cash on Delivery',
        'delivery_date': deliveryDate,
        'customer_name': _nameController.text.trim(),
        'customer_phone': normalizePhone(_phoneController.text.trim()),
        'fulfillment_type': _fulfillmentType,
        'delivery_address': _fulfillmentType == 'delivery' ? _addressController.text.trim() : null,
        'delivery_fee': deliveryFee,
      };

      final orderProvider = context.read<OrderProvider>();
      await orderProvider.createOrder(orderData);
      await cart.clearCart();

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Order placed successfully!')),
        );
        Navigator.of(context).popUntil((route) => route.isFirst);
      }
    } catch (e) {
      setState(() => _formError = e.toString().replaceAll('ApiException: ', ''));
    } finally {
      if (mounted) setState(() => _isSubmitting = false);
    }
  }

  String _parseTimeSlot(String slot) {
    final match = RegExp(r'^(\d{1,2}):(\d{2})\s*(AM|PM)$', caseSensitive: false).firstMatch(slot);
    if (match == null) return '12:00:00';
    int hour = int.parse(match.group(1)!);
    final minute = match.group(2)!;
    final ampm = match.group(3)!.toUpperCase();
    if (ampm == 'PM' && hour != 12) hour += 12;
    if (ampm == 'AM' && hour == 12) hour = 0;
    return '${hour.toString().padLeft(2, '0')}:$minute:00';
  }

  @override
  Widget build(BuildContext context) {
    final cart = context.watch<CartProvider>();
    final deliveryFee = _fulfillmentType == 'delivery' ? 50.0 : 0.0;
    final total = cart.subtotal + deliveryFee;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Checkout', style: TextStyle(fontFamily: 'PlayfairDisplay', fontSize: 20)),
        leading: IconButton(icon: const Icon(Icons.close), onPressed: () => Navigator.of(context).pop()),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            if (_formError != null)
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(12),
                margin: const EdgeInsets.only(bottom: 16),
                decoration: BoxDecoration(
                  color: const Color(0xFFFFF7F7),
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(color: const Color(0xFFB85C5C).withValues(alpha: 0.15)),
                ),
                child: Text(_formError!, style: const TextStyle(fontSize: 13, color: Color(0xFFB85C5C))),
              ),

            // Recipient Info
            const Text('RECIPIENT INFORMATION', style: TextStyle(
              fontSize: 14, fontWeight: FontWeight.w700, letterSpacing: 0.5, color: Color(0xFF6E5A56))),
            const SizedBox(height: 12),
            TextField(
              controller: _nameController,
              decoration: const InputDecoration(labelText: 'Full Name *'),
            ),
            const SizedBox(height: 12),
            TextField(
              controller: _phoneController,
              decoration: const InputDecoration(labelText: 'Contact Number *'),
              keyboardType: TextInputType.phone,
              onChanged: (v) {
                final formatted = formatPhoneInput(v);
                if (formatted != v) {
                  _phoneController.value = TextEditingValue(
                    text: formatted,
                    selection: TextSelection.collapsed(offset: formatted.length),
                  );
                }
              },
            ),

            const SizedBox(height: 24),
            const Text('FULFILLMENT LOGISTICS', style: TextStyle(
              fontSize: 14, fontWeight: FontWeight.w700, letterSpacing: 0.5, color: Color(0xFF6E5A56))),
            const SizedBox(height: 12),
            // Pickup/Delivery toggle
            Container(
              decoration: BoxDecoration(
                color: const Color(0xFFFAF6F2),
                borderRadius: BorderRadius.circular(24),
                border: Border.all(color: const Color(0xFFF4EAE1)),
              ),
              child: Row(
                children: [
                  Expanded(
                    child: GestureDetector(
                      onTap: () => setState(() => _fulfillmentType = 'pickup'),
                      child: Container(
                        padding: const EdgeInsets.symmetric(vertical: 12),
                        decoration: BoxDecoration(
                          color: _fulfillmentType == 'pickup'
                              ? const Color(0xFFD47C6A) : Colors.transparent,
                          borderRadius: BorderRadius.circular(20),
                        ),
                        child: Text('Store Pickup (₱0)', textAlign: TextAlign.center, style: TextStyle(
                          fontWeight: FontWeight.w600,
                          fontSize: 14,
                          color: _fulfillmentType == 'pickup' ? Colors.white : const Color(0xFF6E5A56),
                        )),
                      ),
                    ),
                  ),
                  Expanded(
                    child: GestureDetector(
                      onTap: () => setState(() => _fulfillmentType = 'delivery'),
                      child: Container(
                        padding: const EdgeInsets.symmetric(vertical: 12),
                        decoration: BoxDecoration(
                          color: _fulfillmentType == 'delivery'
                              ? const Color(0xFFD47C6A) : Colors.transparent,
                          borderRadius: BorderRadius.circular(20),
                        ),
                        child: Text('Home Delivery (₱50)', textAlign: TextAlign.center, style: TextStyle(
                          fontWeight: FontWeight.w600,
                          fontSize: 14,
                          color: _fulfillmentType == 'delivery' ? Colors.white : const Color(0xFF6E5A56),
                        )),
                      ),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 12),

            if (_fulfillmentType == 'pickup')
              Container(
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(
                  color: const Color(0xFFF7E6E2),
                  borderRadius: BorderRadius.circular(10),
                  border: Border.all(color: const Color(0xFFF4EAE1)),
                ),
                child: const Row(
                  children: [
                    Icon(Icons.location_on_outlined, size: 16),
                    SizedBox(width: 8),
                    Expanded(child: Text("Nikay's Pastry\nPlaridel St., Roxas City, Capiz",
                      style: TextStyle(fontSize: 13))),
                  ],
                ),
              ),

            if (_fulfillmentType == 'delivery') ...[
              TextField(
                controller: _addressController,
                decoration: const InputDecoration(labelText: 'Delivery Address *'),
              ),
              const SizedBox(height: 12),
            ],

            // Date & Time
            Row(
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text('SCHEDULED DATE', style: TextStyle(
                        fontSize: 11, fontWeight: FontWeight.w700, letterSpacing: 0.5, color: Color(0xFF6E5A56))),
                      const SizedBox(height: 8),
                      InkWell(
                        onTap: () async {
                          final date = await showDatePicker(
                            context: context,
                            initialDate: _selectedDate,
                            firstDate: DateTime.now(),
                            lastDate: DateTime.now().add(const Duration(days: 60)),
                          );
                          if (date != null) setState(() => _selectedDate = date);
                        },
                        child: Container(
                          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                          decoration: BoxDecoration(
                            border: Border.all(color: const Color(0xFFF4EAE1)),
                            borderRadius: BorderRadius.circular(10),
                            color: Colors.white,
                          ),
                          child: Row(
                            children: [
                              const Icon(Icons.calendar_today, size: 16, color: Color(0xFF6E5A56)),
                              const SizedBox(width: 8),
                              Text(DateFormat('MMM dd, yyyy').format(_selectedDate),
                                style: const TextStyle(fontSize: 14)),
                            ],
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text('TIME SLOT', style: TextStyle(
                        fontSize: 11, fontWeight: FontWeight.w700, letterSpacing: 0.5, color: Color(0xFF6E5A56))),
                      const SizedBox(height: 8),
                      DropdownButtonFormField<String>(
                        initialValue: _selectedTime,
                        isExpanded: true,
                        items: _timeSlots.map((s) => DropdownMenuItem(value: s, child: Text(s, style: const TextStyle(fontSize: 12)))).toList(),
                        onChanged: (v) => setState(() => _selectedTime = v ?? _selectedTime),
                        decoration: InputDecoration(
                          isDense: true,
                          contentPadding: const EdgeInsets.symmetric(horizontal: 10, vertical: 10),
                          filled: true, fillColor: Colors.white,
                          border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(10),
                            borderSide: const BorderSide(color: Color(0xFFF4EAE1)),
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),

            const SizedBox(height: 24),
            const Text('PAYMENT METHOD', style: TextStyle(
              fontSize: 14, fontWeight: FontWeight.w700, letterSpacing: 0.5, color: Color(0xFF6E5A56))),
            const SizedBox(height: 8),
            Container(
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                color: const Color(0xFFFAF6F2),
                borderRadius: BorderRadius.circular(10),
                border: Border.all(color: const Color(0xFFF4EAE1)),
              ),
              child: const Text('Cash on Delivery', style: TextStyle(fontWeight: FontWeight.w600)),
            ),

            const SizedBox(height: 24),
            // Order Summary
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: const Color(0xFFFAF6F2),
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: const Color(0xFFF4EAE1)),
              ),
              child: Column(
                children: [
                  const Text('BASKET SUMMARY', style: TextStyle(
                    fontSize: 16, fontWeight: FontWeight.w700)),
                  const SizedBox(height: 12),
                  ...cart.items.map((item) => Padding(
                    padding: const EdgeInsets.only(bottom: 8),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(item.name, style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 13)),
                              Text('Qty: ${item.quantity} · Size: ${item.size}',
                                style: const TextStyle(fontSize: 11, color: Color(0xFF6E5A56))),
                            ],
                          ),
                        ),
                        Text(formatPeso(item.lineTotal), style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 13)),
                      ],
                    ),
                  )),
                  const Divider(),
                  _summaryRow('Subtotal', formatPeso(cart.subtotal)),
                  _summaryRow(_fulfillmentType == 'delivery' ? 'Delivery Fee' : 'Store Pickup', formatPeso(deliveryFee)),
                  const Divider(height: 20),
                  _summaryRow('Grand Total', formatPeso(total), isTotal: true),
                  const SizedBox(height: 16),
                  Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: const Color(0xFFF7E6E2),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: const Text('Payment: Cash will be collected upon delivery or pickup.',
                      style: TextStyle(fontSize: 12, color: Color(0xFF2A1D19))),
                  ),
                  const SizedBox(height: 16),
                  SizedBox(
                    width: double.infinity,
                    height: 48,
                    child: ElevatedButton(
                      onPressed: _isSubmitting ? null : _submit,
                      child: _isSubmitting
                          ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                          : const Text('Submit Bakery Order'),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _summaryRow(String label, String value, {bool isTotal = false}) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: TextStyle(
            fontSize: isTotal ? 16 : 13,
            fontWeight: isTotal ? FontWeight.w800 : FontWeight.normal,
            color: isTotal ? const Color(0xFF2A1D19) : const Color(0xFF6E5A56),
          )),
          Text(value, style: TextStyle(
            fontSize: isTotal ? 16 : 13,
            fontWeight: isTotal ? FontWeight.w800 : FontWeight.w600,
            color: isTotal ? const Color(0xFF2A1D19) : const Color(0xFF2A1D19),
          )),
        ],
      ),
    );
  }
}
