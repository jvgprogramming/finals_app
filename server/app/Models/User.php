<?php

namespace App\Models;

use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

#[Fillable(['first_name', 'middle_name', 'last_name', 'suffix_name', 'birth_date', 'username', 'password', 'profile_picture', 'role'])]
#[Hidden(['password'])]
/**
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\Order> $orders
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\Notification> $notifications
 */
class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable, HasApiTokens, SoftDeletes;

    protected $table = 'users';

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'password' => 'hashed',
            'birth_date' => 'date',
        ];
    }

    /**
     * Get the user's age computed attribute.
     */
    protected function age(): Attribute
    {
        return Attribute::make(
            get: function ($value) {
                if ($this->birth_date) {
                    return $this->birth_date->diffInYears(now());
                }
                return null;
            }
        );
    }

    /**
     * Get all orders belonging to this user.
     */
    public function orders(): HasMany
    {
        return $this->hasMany(Order::class);
    }

    /**
     * Get all notifications belonging to this user.
     */
    public function notifications(): HasMany
    {
        return $this->hasMany(Notification::class);
    }
}
