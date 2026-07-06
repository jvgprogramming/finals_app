import 'package:flutter/material.dart';

class LoadingSpinner extends StatelessWidget {
  final String? label;
  const LoadingSpinner({super.key, this.label});

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const SizedBox(
              width: 40,
              height: 40,
              child: CircularProgressIndicator(
                strokeWidth: 3,
                color: Color(0xFFD47C6A),
              ),
            ),
            if (label != null) ...[
              const SizedBox(height: 16),
              Text(label!, style: const TextStyle(
                fontFamily: 'Outfit',
                fontSize: 14,
                color: Color(0xFF6E5A56),
              )),
            ],
          ],
        ),
      ),
    );
  }
}
