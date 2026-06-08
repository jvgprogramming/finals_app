<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create admin user
        User::create([
            'first_name' => 'John',
            'middle_name' => 'Michael',
            'last_name' => 'Doe',
            'suffix_name' => null,
            'username' => 'johndoe',
            'password' => 'password123',
            'profile_picture' => null,
            'role' => 'admin',
        ]);

        // Create additional test users
        User::create([
            'first_name' => 'Jane',
            'middle_name' => 'Marie',
            'last_name' => 'Smith',
            'suffix_name' => null,
            'username' => 'janesmith',
            'password' => 'password123',
            'profile_picture' => null,
        ]);

        User::create([
            'first_name' => 'Robert',
            'middle_name' => null,
            'last_name' => 'Johnson',
            'suffix_name' => 'Jr.',
            'username' => 'rjohnson',
            'password' => 'password123',
            'profile_picture' => null,
        ]);

        User::create([
            'first_name' => 'Emily',
            'middle_name' => 'Rose',
            'last_name' => 'Brown',
            'suffix_name' => null,
            'username' => 'ebrown123',
            'password' => 'password123',
            'profile_picture' => null,
        ]);

        User::create([
            'first_name' => 'Michael',
            'middle_name' => 'David',
            'last_name' => 'Wilson',
            'suffix_name' => null,
            'username' => 'mwilson',
            'password' => 'password123',
            'profile_picture' => null,
        ]);
    }
}
