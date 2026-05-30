<?php

namespace App\Repositories;

use App\Models\User;
use Illuminate\Pagination\Paginator;

class UserRepository implements UserRepositoryInterface
{
    /**
     * Get all users with pagination and search.
     */
    public function getUsers(int $page = 1, ?string $search = null): Paginator
    {
        $query = User::query();

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('first_name', 'like', "%{$search}%")
                    ->orWhere('middle_name', 'like', "%{$search}%")
                    ->orWhere('last_name', 'like', "%{$search}%")
                    ->orWhere('username', 'like', "%{$search}%");
            });
        }

        return $query
            ->orderBy('last_name', 'asc')
            ->orderBy('first_name', 'asc')
            ->orderBy('middle_name', 'asc')
            ->orderBy('suffix_name', 'asc')
            ->paginate(10, ['*'], 'page', $page);
    }

    /**
     * Store a new user.
     */
    public function store(array $data): User
    {
        return User::create($data);
    }

    /**
     * Update an existing user.
     */
    public function update(User $user, array $data): User
    {
        $user->update($data);
        return $user->fresh();
    }

    /**
     * Soft delete a user.
     */
    public function destroy(User $user): bool
    {
        return $user->delete();
    }

    /**
     * Find user by ID.
     */
    public function findById(int $id): ?User
    {
        return User::find($id);
    }

    /**
     * Find user by username.
     */
    public function findByUsername(string $username): ?User
    {
        return User::where('username', $username)->first();
    }
}
