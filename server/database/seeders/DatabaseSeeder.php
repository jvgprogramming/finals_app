<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Gender;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // User::factory(10)->create();

        // User::factory()->create([
        //     'name' => 'Test User',
        //     'email' => 'test@example.com',
        // ]);

       
        
        $birthDate = fake()->date();
        $age = date_diff(date_create($birthDate), date_create('now'))->y;
        User::factory() -> create([
            'first_name' => 'John',
            'middle_name' => 'Doe',
            'last_name' => 'Smith',
            'suffix_name' => null,
            'gender_id' => Gender::inRandomOrder()->first()->gender_id,
            'birth_date' => $birthDate,
            'age' => $age,
            'username' => 'johndoe',
            'password' => 'password123',
        ]);

        User::factory(50)->create();
    }
}
