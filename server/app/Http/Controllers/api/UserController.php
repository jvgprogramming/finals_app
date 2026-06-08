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
        try {
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
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to load users.',
            ], 500);
        }
    }

    /**
     * Store a new user.
     */
    public function storeUser(StoreUserRequest $request): JsonResponse
    {
        try {
            $validated = $request->validated();

            // Map front-end field name to the field UserService expects
            if (isset($validated['add_user_profile_picture'])) {
                $validated['profile_picture'] = $validated['add_user_profile_picture'];
                unset($validated['add_user_profile_picture']);
            }

            $user = $this->userService->storeUser($validated);

            return response()->json([
                'success' => true,
                'message' => 'User successfully created',
                'user' => new UserResource($user),
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create user.',
            ], 500);
        }
    }

    /**
     * Update an existing user.
     */
    public function updateUser(UpdateUserRequest $request, User $user): JsonResponse
    {
        try {
            $validated = $request->validated();

            // Map front-end field name to the field UserService expects
            if (isset($validated['edit_user_profile_picture'])) {
                $validated['profile_picture'] = $validated['edit_user_profile_picture'];
                unset($validated['edit_user_profile_picture']);
            }

            $updatedUser = $this->userService->updateUser($user, $validated);

            return response()->json([
                'success' => true,
                'message' => 'User successfully updated',
                'user' => new UserResource($updatedUser),
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update user.',
            ], 500);
        }
    }

    /**
     * Delete (soft delete) a user.
     */
    public function destroyUser(User $user): JsonResponse
    {
        try {
            $this->userService->deleteUser($user);

            return response()->json([
                'success' => true,
                'message' => 'User successfully deleted',
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete user.',
            ], 500);
        }
    }
}
