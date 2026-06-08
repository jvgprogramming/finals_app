<?php

namespace App\Http\Controllers\api;

use App\Http\Controllers\Controller;
use App\Http\Requests\DeclineOrderRequest;
use App\Http\Requests\StoreOrderRequest;
use App\Http\Resources\OrderResource;
use App\Models\Notification;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\User;
use App\Support\CakePricing;
use App\Support\PhoneHelper;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class OrderController extends Controller
{
    use AuthorizesRequests;

    /**
     * Get user's orders (or all orders if admin).
     */
    public function index(): JsonResponse
    {
        try {
            /** @var User $user */
            $user = Auth::user();

            if ($user->role === 'admin') {
                $orders = Order::with('user', 'orderItems.customization')->orderBy('created_at', 'desc')->get();
            } else {
                $orders = $user->orders()->with('orderItems.customization')->orderBy('created_at', 'desc')->get();
            }

            return response()->json([
                'success' => true,
                'data' => OrderResource::collection($orders),
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to load orders.',
            ], 500);
        }
    }

    /**
     * Get a single order.
     */
    public function show(Order $order): JsonResponse
    {
        try {
            $this->authorize('view', $order);

            $order->load('user', 'orderItems.customization');

            return response()->json([
                'success' => true,
                'data' => new OrderResource($order),
            ]);
        } catch (AuthorizationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'You are not authorized to view this order.',
            ], 403);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to load order.',
            ], 500);
        }
    }

    /**
     * Create a new order from cart data.
     */
    public function store(StoreOrderRequest $request): JsonResponse
    {
        try {
            $user = Auth::user();
            $data = $request->validated();
            $customerName = trim((string) ($data['customer_name'] ?? ''));

            if ($customerName === '') {
                $customerName = trim(
                    implode(' ', array_filter([
                        (string) ($user->first_name ?? ''),
                        (string) ($user->last_name ?? ''),
                    ]))
                );

                if ($customerName === '') {
                    $customerName = (string) ($user->username ?? 'Guest');
                }
            }

            $customerPhone = trim((string) ($data['customer_phone'] ?? ''));
            // Normalize to E.164 format with +63 prefix
            $customerPhone = $customerPhone !== '' ? PhoneHelper::normalize($customerPhone) : '';
            $fulfillmentType = $data['fulfillment_type'] ?? 'pickup';
            $deliveryAddress = $data['delivery_address'] ?? null;

            $deliveryFee = $fulfillmentType === 'delivery'
                ? (float) ($data['delivery_fee'] ?? 50)
                : 0;

            // Create order within a DB transaction to prevent orphan orders
            $order = DB::transaction(function () use ($user, $data, $customerName, $customerPhone, $fulfillmentType, $deliveryAddress, $deliveryFee) {
                $order = Order::create([
                    'user_id' => $user->id,
                    'customer_name' => $customerName,
                    'customer_phone' => $customerPhone !== '' ? $customerPhone : null,
                    'fulfillment_type' => $fulfillmentType,
                    'delivery_address' => $deliveryAddress,
                    'order_number' => 'ORD-'.strtoupper(Str::random(8)),
                    'status' => 'pending',
                    'notes' => $data['notes'] ?? null,
                    'delivery_date' => $data['delivery_date'] ?? null,
                    'delivery_fee' => $deliveryFee,
                    'payment_method' => 'Cash on Delivery',
                ]);

                // Create order items from cart
                $itemsTotal = 0;
                foreach ($data['items'] as $item) {
                    $product = Product::findOrFail($item['product_id']);

                    $size = $item['customization']['size'] ?? null;
                    $unitPrice = CakePricing::priceForSize((float) $product->price, $size);

                    $orderItem = OrderItem::create([
                        'order_id' => $order->id,
                        'product_id' => $product->id,
                        'product_name_snapshot' => $product->name,
                        'product_price_snapshot' => $unitPrice,
                        'quantity' => $item['quantity'],
                    ]);

                    $itemsTotal += $unitPrice * $item['quantity'];

                    $customization = isset($item['customization'])
                        ? array_filter($item['customization'], fn ($v) => $v !== null && $v !== '')
                        : [];

                    if ($customization !== []) {
                        $orderItem->customization()->create($customization);
                    }
                }

                $order->total_amount = $itemsTotal + $deliveryFee;
                $order->save();

                return $order;
            });

            // Notify admins
            $adminUsers = User::where('role', 'admin')->get();
            foreach ($adminUsers as $admin) {
                Notification::create([
                    'user_id' => $admin->id,
                    'order_id' => $order->id,
                    'title' => 'New Order',
                    'message' => "New order {$order->order_number} from {$customerName}",
                ]);
            }

            // Notify customer
            Notification::create([
                'user_id' => $user->id,
                'order_id' => $order->id,
                'title' => 'Order Received',
                'message' => "Your order {$order->order_number} was submitted and is pending approval.",
            ]);

            $order->load('user', 'orderItems.customization');

            return response()->json([
                'success' => true,
                'message' => 'Order created successfully.',
                'data' => new OrderResource($order),
            ], 201);
        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Order validation failed.',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create order.',
            ], 500);
        }
    }

    /**
     * Accept an order (admin only).
     */
    public function accept(Order $order): JsonResponse
    {
        try {
            $this->authorize('accept', $order);

            $order->status = 'accepted';
            $order->save();

            // Notify customer
            Notification::create([
                'user_id' => $order->user_id,
                'order_id' => $order->id,
                'title' => 'Order Accepted',
                'message' => "Your order {$order->order_number} has been accepted and is being prepared.",
            ]);

            $order->load('user', 'orderItems.customization');

            return response()->json([
                'success' => true,
                'message' => 'Order accepted.',
                'data' => new OrderResource($order),
            ]);
        } catch (AuthorizationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'You are not authorized to accept orders.',
            ], 403);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to accept order.',
            ], 500);
        }
    }

    /**
     * Decline an order (admin only).
     */
    public function decline(Order $order, DeclineOrderRequest $request): JsonResponse
    {
        try {
            $this->authorize('decline', $order);

            $reason = $request->validated()['reason'];

            $order->status = 'declined';
            $order->notes = ($order->notes ? $order->notes."\n" : '')."Declined: {$reason}";
            $order->save();

            // Notify customer
            Notification::create([
                'user_id' => $order->user_id,
                'order_id' => $order->id,
                'title' => 'Order Declined',
                'message' => "Your order {$order->order_number} has been declined. Reason: {$reason}",
            ]);

            $order->load('user', 'orderItems.customization');

            return response()->json([
                'success' => true,
                'message' => 'Order declined.',
                'data' => new OrderResource($order),
            ]);
        } catch (AuthorizationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'You are not authorized to decline orders.',
            ], 403);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to decline order.',
            ], 500);
        }
    }

    /**
     * Mark order as preparing (admin only).
     */
    public function markPreparing(Order $order): JsonResponse
    {
        try {
            $this->authorize('accept', $order);

            $order->status = 'preparing';
            $order->save();

            // Notify customer
            Notification::create([
                'user_id' => $order->user_id,
                'order_id' => $order->id,
                'title' => 'Order Preparing',
                'message' => "Your order {$order->order_number} is now being prepared.",
            ]);

            $order->load('user', 'orderItems.customization');

            return response()->json([
                'success' => true,
                'message' => 'Order marked as preparing.',
                'data' => new OrderResource($order),
            ]);
        } catch (AuthorizationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'You are not authorized to update this order.',
            ], 403);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update order status.',
            ], 500);
        }
    }

    /**
     * Mark order as ready (admin only).
     */
    public function markReady(Order $order): JsonResponse
    {
        try {
            $this->authorize('accept', $order);

            $order->status = 'ready';
            $order->save();

            // Notify customer
            Notification::create([
                'user_id' => $order->user_id,
                'order_id' => $order->id,
                'title' => 'Order Ready',
                'message' => "Your order {$order->order_number} is ready for pickup/delivery.",
            ]);

            $order->load('user', 'orderItems.customization');

            return response()->json([
                'success' => true,
                'message' => 'Order marked as ready.',
                'data' => new OrderResource($order),
            ]);
        } catch (AuthorizationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'You are not authorized to update this order.',
            ], 403);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update order status.',
            ], 500);
        }
    }

    /**
     * Complete an order (admin only).
     */
    public function complete(Order $order): JsonResponse
    {
        try {
            $this->authorize('accept', $order);

            $order->status = 'completed';
            $order->save();

            // Notify customer
            Notification::create([
                'user_id' => $order->user_id,
                'order_id' => $order->id,
                'title' => 'Order Completed',
                'message' => "Your order {$order->order_number} has been completed. Thank you!",
            ]);

            $order->load('user', 'orderItems.customization');

            return response()->json([
                'success' => true,
                'message' => 'Order completed.',
                'data' => new OrderResource($order),
            ]);
        } catch (AuthorizationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'You are not authorized to complete orders.',
            ], 403);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to complete order.',
            ], 500);
        }
    }
}
