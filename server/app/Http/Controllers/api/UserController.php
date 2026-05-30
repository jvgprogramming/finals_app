<?php

namespace App\Http\Controllers\api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreUserRequest;
use App\Http\Requests\UpdateUserRequest;
use App\Http\Resources\UserResource;
use App\Models\User;
use App\Services\UserService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class UserController extends Controller
{
    public function __construct(
        protected UserService $userService
    ) {}

    /**
     * Get users with pagination and search.
     */
    public function loadUsers(Request $request): JsonResponse
    {
        $page = $request->query('page', 1);
        $search = $request->query('search', null);

        $users = $this->userService->getUsers($page, $search);

        return response()->json([
            'success' => true,
            'message' => 'Users retrieved successfully',
            'users' => [
                'data' => UserResource::collection($users['data']),
                'current_page' => $users['current_page'],
                'last_page' => $users['last_page'],
            ],
        ], 200);
    }

    /**
     * Store a new user.
     */
    public function storeUser(StoreUserRequest $request): JsonResponse
    {
        $validated = $request->validated();

        $user = $this->userService->storeUser($validated);

        return response()->json([
            'success' => true,
            'message' => 'User successfully created',
            'user' => new UserResource($user),
        ], 201);
    }

    /**
     * Update an existing user.
     */
    public function updateUser(UpdateUserRequest $request, User $user): JsonResponse
    {
        $validated = $request->validated();

        $updatedUser = $this->userService->updateUser($user, $validated);

        return response()->json([
            'success' => true,
            'message' => 'User successfully updated',
            'user' => new UserResource($updatedUser),
        ], 200);
    }

    /**
     * Delete (soft delete) a user.
     */
    public function destroyUser(User $user): JsonResponse
    {
        $this->userService->deleteUser($user);

        return response()->json([
            'success' => true,
            'message' => 'User successfully deleted',
        ], 200);
    }
}
