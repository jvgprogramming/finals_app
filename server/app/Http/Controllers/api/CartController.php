<?php

namespace App\Http\Controllers\api;

use App\Http\Controllers\Controller;
use App\Http\Resources\CartItemResource;
use App\Models\CartItem;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class CartController extends Controller
{
    /**
     * Get all cart items for the authenticated user.
     */
    public function index(): JsonResponse
    {
        try {
            $user = Auth::user();
            $cartItems = CartItem::where('user_id', $user->id)
                ->with('product')
                ->orderBy('created_at', 'desc')
                ->get();

            return response()->json([
                'success' => true,
                'data' => CartItemResource::collection($cartItems),
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to load cart items.',
            ], 500);
        }
    }

    /**
     * Add an item to the cart.
     * If the same product+size already exists, increment the quantity instead.
     */
    public function add(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'product_id' => ['required', 'exists:products,id'],
                'quantity' => ['required', 'integer', 'min:1'],
                'size' => ['nullable', 'string', 'max:255'],
                'dedication' => ['nullable', 'string', 'max:255'],
                'price' => ['required', 'numeric', 'min:0'],
            ]);

            $user = Auth::user();

            // Check if same product+size already exists
            $existingItem = CartItem::where('user_id', $user->id)
                ->where('product_id', $validated['product_id'])
                ->where('size', $validated['size'] ?? null)
                ->first();

            if ($existingItem) {
                // Increment quantity
                $existingItem->quantity += $validated['quantity'];
                $existingItem->price = $validated['price']; // Update price in case it changed
                if (isset($validated['dedication'])) {
                    $existingItem->dedication = $validated['dedication'];
                }
                $existingItem->save();

                $existingItem->load('product');
                return response()->json([
                    'success' => true,
                    'message' => 'Cart item quantity updated.',
                    'data' => new CartItemResource($existingItem),
                ], 200);
            }

            // Create new cart item
            $cartItem = CartItem::create([
                'user_id' => $user->id,
                'product_id' => $validated['product_id'],
                'quantity' => $validated['quantity'],
                'size' => $validated['size'] ?? null,
                'dedication' => $validated['dedication'] ?? null,
                'price' => $validated['price'],
            ]);

            $cartItem->load('product');

            return response()->json([
                'success' => true,
                'message' => 'Item added to cart.',
                'data' => new CartItemResource($cartItem),
            ], 201);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed.',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to add item to cart.',
            ], 500);
        }
    }

    /**
     * Update cart item quantity.
     */
    public function updateQuantity(Request $request, CartItem $cartItem): JsonResponse
    {
        try {
            $validated = $request->validate([
                'quantity' => ['required', 'integer', 'min:1'],
            ]);

            // Ensure the cart item belongs to the authenticated user
            if ($cartItem->user_id !== Auth::id()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized.',
                ], 403);
            }

            $cartItem->quantity = $validated['quantity'];
            $cartItem->save();

            $cartItem->load('product');

            return response()->json([
                'success' => true,
                'message' => 'Cart item updated.',
                'data' => new CartItemResource($cartItem),
            ], 200);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed.',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update cart item.',
            ], 500);
        }
    }

    /**
     * Remove an item from the cart.
     */
    public function remove(CartItem $cartItem): JsonResponse
    {
        try {
            // Ensure the cart item belongs to the authenticated user
            if ($cartItem->user_id !== Auth::id()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized.',
                ], 403);
            }

            $cartItem->delete();

            return response()->json([
                'success' => true,
                'message' => 'Item removed from cart.',
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to remove item from cart.',
            ], 500);
        }
    }

    /**
     * Clear all items from the user's cart.
     */
    public function clear(): JsonResponse
    {
        try {
            $user = Auth::user();
            CartItem::where('user_id', $user->id)->delete();

            return response()->json([
                'success' => true,
                'message' => 'Cart cleared.',
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to clear cart.',
            ], 500);
        }
    }

    /**
     * Sync/merge guest cart items with the user's server-side cart.
     * Receives an array of items and merges them (incrementing quantities for duplicates).
     */
    public function sync(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'items' => ['required', 'array'],
                'items.*.product_id' => ['required', 'exists:products,id'],
                'items.*.quantity' => ['required', 'integer', 'min:1'],
                'items.*.size' => ['nullable', 'string', 'max:255'],
                'items.*.dedication' => ['nullable', 'string', 'max:255'],
                'items.*.price' => ['required', 'numeric', 'min:0'],
            ]);

            $user = Auth::user();

            foreach ($validated['items'] as $item) {
                $existingItem = CartItem::where('user_id', $user->id)
                    ->where('product_id', $item['product_id'])
                    ->where('size', $item['size'] ?? null)
                    ->first();

                if ($existingItem) {
                    $existingItem->quantity += $item['quantity'];
                    $existingItem->price = $item['price'];
                    if (isset($item['dedication'])) {
                        $existingItem->dedication = $item['dedication'];
                    }
                    $existingItem->save();
                } else {
                    CartItem::create([
                        'user_id' => $user->id,
                        'product_id' => $item['product_id'],
                        'quantity' => $item['quantity'],
                        'size' => $item['size'] ?? null,
                        'dedication' => $item['dedication'] ?? null,
                        'price' => $item['price'],
                    ]);
                }
            }

            // Return the merged cart
            $cartItems = CartItem::where('user_id', $user->id)
                ->with('product')
                ->orderBy('created_at', 'desc')
                ->get();

            return response()->json([
                'success' => true,
                'message' => 'Cart synced successfully.',
                'data' => CartItemResource::collection($cartItems),
            ], 200);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed.',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to sync cart.',
            ], 500);
        }
    }
}
