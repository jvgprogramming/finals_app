<?php

namespace App\Services;

use App\Models\User;
use App\Repositories\UserRepositoryInterface;
use Illuminate\Pagination\Paginator;
use Illuminate\Support\Facades\Storage;

class UserService
{
    public function __construct(
        protected UserRepositoryInterface $userRepository
    ) {}

    /**
     * Get all users with pagination and search.
     */
    public function getUsers(int $page = 1, ?string $search = null): array
    {
        $users = $this->userRepository->getUsers($page, $search);
        
        // Transform the users to include full profile picture URLs
        $users->getCollection()->transform(function ($user) {
            $user->profile_picture = $user->profile_picture 
                ? url('storage/profile_pictures/' . $user->profile_picture) 
                : null;
            return $user;
        });

        return [
            'data' => $users->items(),
            'current_page' => $users->currentPage(),
            'last_page' => $users->lastPage(),
        ];
    }

    /**
     * Store a new user with profile picture upload.
     */
    public function storeUser(array $data): User
    {
        // Handle profile picture upload
        if (isset($data['profile_picture']) && $data['profile_picture']) {
            $file = $data['profile_picture'];
            $filename = sha1($file->getClientOriginalName() . '_' . time()) . '.' . $file->getClientOriginalExtension();
            $file->storeAs('profile_pictures', $filename, 'public');
            $data['profile_picture'] = $filename;
        } else {
            $data['profile_picture'] = null;
        }

        // Hash password
        $data['password'] = bcrypt($data['password']);

        return $this->userRepository->store($data);
    }

    /**
     * Update an existing user with profile picture upload.
     */
    public function updateUser(User $user, array $data): User
    {
        // Handle profile picture upload
        if (isset($data['profile_picture']) && $data['profile_picture']) {
            // Delete old profile picture if exists
            if ($user->profile_picture) {
                Storage::disk('public')->delete('profile_pictures/' . $user->profile_picture);
            }

            $file = $data['profile_picture'];
            $filename = sha1($file->getClientOriginalName() . '_' . time()) . '.' . $file->getClientOriginalExtension();
            $file->storeAs('profile_pictures', $filename, 'public');
            $data['profile_picture'] = $filename;
        } else {
            // Keep existing profile picture if not updating
            unset($data['profile_picture']);
        }

        // Hash password if provided
        if (isset($data['password']) && $data['password']) {
            $data['password'] = bcrypt($data['password']);
        } else {
            unset($data['password']);
        }

        return $this->userRepository->update($user, $data);
    }

    /**
     * Delete a user (soft delete).
     */
    public function deleteUser(User $user): bool
    {
        return $this->userRepository->destroy($user);
    }

    /**
     * Find user by username.
     */
    public function findByUsername(string $username): ?User
    {
        return $this->userRepository->findByUsername($username);
    }

    /**
     * Find user by ID.
     */
    public function findById(int $id): ?User
    {
        return $this->userRepository->findById($id);
    }
}
