<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
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
            'birth_date' => '1990-05-15',
            'username' => 'johndoe',
            'password' => bcrypt('password123'),
            'profile_picture' => null,
        ]);

        // Create additional test users
        User::create([
            'first_name' => 'Jane',
            'middle_name' => 'Marie',
            'last_name' => 'Smith',
            'suffix_name' => null,
            'birth_date' => '1992-03-20',
            'username' => 'janesmith',
            'password' => bcrypt('password123'),
            'profile_picture' => null,
        ]);

        User::create([
            'first_name' => 'Robert',
            'middle_name' => null,
            'last_name' => 'Johnson',
            'suffix_name' => 'Jr.',
            'birth_date' => '1988-07-10',
            'username' => 'rjohnson',
            'password' => bcrypt('password123'),
            'profile_picture' => null,
        ]);

        User::create([
            'first_name' => 'Emily',
            'middle_name' => 'Rose',
            'last_name' => 'Brown',
            'suffix_name' => null,
            'birth_date' => '1995-11-25',
            'username' => 'ebrown123',
            'password' => bcrypt('password123'),
            'profile_picture' => null,
        ]);

        User::create([
            'first_name' => 'Michael',
            'middle_name' => 'David',
            'last_name' => 'Wilson',
            'suffix_name' => null,
            'birth_date' => '1991-09-05',
            'username' => 'mwilson',
            'password' => bcrypt('password123'),
            'profile_picture' => null,
        ]);
    }
}
