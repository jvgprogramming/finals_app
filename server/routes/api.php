<?php

use App\Http\Controllers\api\AuthController;
use App\Http\Controllers\api\CartController;
use App\Http\Controllers\api\CategoryController;
use App\Http\Controllers\api\NotificationController;
use App\Http\Controllers\api\OrderController;
use App\Http\Controllers\api\ProductController;
use App\Http\Controllers\api\UserController;
use Illuminate\Support\Facades\Route;

// Public auth routes
Route::controller(AuthController::class)->prefix('/auth')->group(function () {
    // Login and register are rate limited: 5 attempts per minute (brute force protection)
    Route::post('/login', 'login')->middleware('throttle:auth');
    Route::post('/register', 'register')->middleware('throttle:auth');
    Route::post('/logout', 'logout')->middleware('auth:sanctum');
    Route::get('/me', 'me')->middleware('auth:sanctum');
});

// Public product routes
Route::controller(CategoryController::class)->prefix('/categories')->group(function () {
    Route::get('/', 'index');
});

Route::controller(ProductController::class)->prefix('/products')->group(function () {
    Route::get('/', 'index');
    Route::get('/{product}', 'show');
});

// Protected user routes (rate limited: 60 per minute)
Route::middleware(['auth:sanctum', 'throttle:api'])->group(function () {
    Route::controller(UserController::class)->prefix('/user')->group(function () {
        Route::get('/loadUsers', 'loadUsers');
        Route::post('/storeUser', 'storeUser');
        Route::post('/updateUser/{user}', 'updateUser');
        Route::put('/destroyUser/{user}', 'destroyUser');
    });

    // Protected product routes (admin only)
    Route::controller(ProductController::class)->prefix('/products')->group(function () {
        Route::post('/', 'store');
        Route::post('/{product}', 'update');
        Route::delete('/{product}', 'destroy');
    });

    // Order routes (rate limited: 10 per minute)
    Route::controller(OrderController::class)->prefix('/orders')->middleware('throttle:orders')->group(function () {
        Route::get('/', 'index');
        Route::get('/{order}', 'show');
        Route::post('/', 'store');
        Route::patch('/{order}/accept', 'accept');
        Route::patch('/{order}/decline', 'decline');
        Route::patch('/{order}/mark-preparing', 'markPreparing');
        Route::patch('/{order}/mark-ready', 'markReady');
        Route::patch('/{order}/complete', 'complete');
    });

    // Cart routes (rate limited: 60 per minute)
    Route::controller(CartController::class)->prefix('/cart')->middleware('throttle:api')->group(function () {
        Route::get('/', 'index');
        Route::post('/add', 'add');
        Route::post('/update/{cartItem}', 'updateQuantity');
        Route::delete('/remove/{cartItem}', 'remove');
        Route::delete('/clear', 'clear');
        Route::post('/sync', 'sync');
    });

    // Notification routes (rate limited: 60 per minute)
    Route::controller(NotificationController::class)->prefix('/notifications')->middleware('throttle:api')->group(function () {
        Route::get('/', 'index');
        Route::patch('/{notification}/read', 'markRead');
        Route::patch('/mark-all-read', 'markAllRead');
    });
});
