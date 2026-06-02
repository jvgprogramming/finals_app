<?php

namespace App\Http\Controllers\api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreOrderRequest;
use App\Http\Requests\DeclineOrderRequest;
use App\Http\Resources\OrderResource;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Notification;
use App\Models\User;
use App\Support\CakePricing;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;

class OrderController extends Controller
{
    use AuthorizesRequests;
    /**
     * Get user's orders (or all orders if admin).
     */
    public function index(): JsonResponse
    {
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
    }

    /**
     * Get a single order.
     */
    public function show(Order $order): JsonResponse
    {
        $this->authorize('view', $order);

        $order->load('user', 'orderItems.customization');

        return response()->json([
            'success' => true,
            'data' => new OrderResource($order),
        ]);
    }

    /**
     * Create a new order from cart data.
     */
    public function store(StoreOrderRequest $request): JsonResponse
    {
        $user = Auth::user();
        $data = $request->validated();

        // Create order
        $order = Order::create([
            'user_id' => $user->id,
            'order_number' => 'ORD-' . strtoupper(Str::random(8)),
            'status' => 'pending',
            'notes' => $data['notes'] ?? null,
            'delivery_date' => $data['delivery_date'] ?? null,
            // Force payment method to Cash on Delivery regardless of client input
            'payment_method' => 'Cash on Delivery',
        ]);

        // Create order items from cart
        $totalAmount = 0;
        foreach ($data['items'] as $item) {
            $product = \App\Models\Product::find($item['product_id']);

            $size = $item['customization']['size'] ?? null;
            $unitPrice = CakePricing::priceForSize((float) $product->price, $size);

            $orderItem = OrderItem::create([
                'order_id' => $order->id,
                'product_id' => $product->id,
                'product_name_snapshot' => $product->name,
                'product_price_snapshot' => $unitPrice,
                'quantity' => $item['quantity'],
            ]);

            $totalAmount += $unitPrice * $item['quantity'];

            // Create customization if provided
            if (isset($item['customization']) && !empty($item['customization'])) {
                $orderItem->customization()->create($item['customization']);
            }
        }

        // Update order total
        $order->total_amount = $totalAmount;
        $order->save();

        // Create admin notification
        $adminUsers = \App\Models\User::where('role', 'admin')->get();
        foreach ($adminUsers as $admin) {
            Notification::create([
                'user_id' => $admin->id,
                'order_id' => $order->id,
                'title' => 'New Order',
                'message' => "New order {$order->order_number} from {$user->first_name} {$user->last_name}",
            ]);
        }

        $order->load('user', 'orderItems.customization');

        return response()->json([
            'success' => true,
            'message' => 'Order created successfully.',
            'data' => new OrderResource($order),
        ], 201);
    }

    /**
     * Accept an order (admin only).
     */
    public function accept(Order $order): JsonResponse
    {
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
    }

    /**
     * Decline an order (admin only).
     */
    public function decline(Order $order, DeclineOrderRequest $request): JsonResponse
    {
        $this->authorize('decline', $order);

        $reason = $request->validated()['reason'];

        $order->status = 'declined';
        $order->notes = ($order->notes ? $order->notes . "\n" : "") . "Declined: {$reason}";
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
    }

    /**
     * Mark order as preparing (admin only).
     */
    public function markPreparing(Order $order): JsonResponse
    {
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
    }

    /**
     * Mark order as ready (admin only).
     */
    public function markReady(Order $order): JsonResponse
    {
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
    }

    /**
     * Complete an order (admin only).
     */
    public function complete(Order $order): JsonResponse
    {
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
    }
}
