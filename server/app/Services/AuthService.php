<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Support\Facades\Hash;

class AuthService
{
    /**
     * Authenticate user and return token.
     */
    public function login(string $username, string $password): ?array
    {
        $user = User::where('username', $username)->first();

        if (! $user || ! Hash::check($password, $user->password)) {
            return null;
        }

        // Delete existing tokens
        $user->tokens()->delete();

        // Create new token
        $token = $user->createToken('auth_token')->plainTextToken;

        return [
            'token' => $token,
            'user' => $user,
        ];
    }

    /**
     * Logout user by deleting current token.
     */
    public function logout(User $user): void
    {
        $user->tokens()->delete();
    }

    /**
     * Get authenticated user.
     */
    public function me(User $user): User
    {
        return $user;
    }
}
