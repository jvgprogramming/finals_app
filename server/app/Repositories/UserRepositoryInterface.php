<?php

namespace App\Repositories;

use App\Models\User;
use Illuminate\Pagination\Paginator;

interface UserRepositoryInterface
{
    /**
     * Get all users with pagination and search.
     */
    public function getUsers(int $page = 1, ?string $search = null): Paginator;

    /**
     * Store a new user.
     */
    public function store(array $data): User;

    /**
     * Update an existing user.
     */
    public function update(User $user, array $data): User;

    /**
     * Soft delete a user.
     */
    public function destroy(User $user): bool;

    /**
     * Find user by ID.
     */
    public function findById(int $id): ?User;

    /**
     * Find user by username.
     */
    public function findByUsername(string $username): ?User;
}
