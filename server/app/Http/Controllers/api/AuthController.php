<?php

namespace App\Http\Controllers\api;

use App\Http\Requests\LoginRequest;
use App\Http\Resources\UserResource;
use App\Services\AuthService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;

class AuthController extends Controller
{
    public function __construct(
        protected AuthService $authService
    ) {}

    /**
     * Login endpoint.
     */
    public function login(LoginRequest $request): JsonResponse
    {
        $result = $this->authService->login(
            $request->validated('username'),
            $request->validated('password')
        );

        if (!$result) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid username or password',
            ], 401);
        }

        return response()->json([
            'success' => true,
            'message' => 'Login successful',
            'token' => $result['token'],
            'user' => new UserResource($result['user']),
        ], 200);
    }

    /**
     * Register endpoint.
     */
    public function register(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'first_name' => ['required', 'string', 'max:255'],
            'last_name' => ['required', 'string', 'max:255'],
            'username' => ['required', 'string', 'min:6', 'max:12', 'unique:users'],
            'password' => ['required', 'string', 'min:6', 'max:12', 'confirmed'],
            'birth_date' => ['nullable', 'date'],
        ]);

        try {
            $user = \App\Models\User::create([
                'first_name' => $validated['first_name'],
                'last_name' => $validated['last_name'],
                'username' => $validated['username'],
                'password' => $validated['password'],
                'birth_date' => $validated['birth_date'] ?? null,
                'role' => 'customer',
            ]);

            $token = $user->createToken('auth-token')->plainTextToken;

            return response()->json([
                'success' => true,
                'message' => 'User registered successfully',
                'token' => $token,
                'user' => new UserResource($user),
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Registration failed: ' . $e->getMessage(),
            ], 400);
        }
    }

    /**
     * Logout endpoint.
     */
    public function logout(Request $request): JsonResponse
    {
        $this->authService->logout($request->user());

        return response()->json([
            'success' => true,
            'message' => 'Logged out successfully',
        ], 200);
    }

    /**
     * Get authenticated user.
     */
    public function me(Request $request): JsonResponse
    {
        return response()->json([
            'success' => true,
            'message' => 'User retrieved successfully',
            'user' => new UserResource($this->authService->me($request->user())),
        ], 200);
    }
}

