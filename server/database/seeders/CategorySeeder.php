<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            [
                'name' => 'Celebration Cakes',
                'description' => 'Custom cakes for birthdays, weddings, and special events.',
            ],
            [
                'name' => 'Pastries',
                'description' => 'French pastries, tarts, and gourmet sweets.',
            ],
            [
                'name' => 'Breads',
                'description' => 'Artisan breads and rolls baked daily.',
            ],
        ];

        foreach ($categories as $category) {
            Category::firstOrCreate(
                ['name' => $category['name']],
                ['description' => $category['description']],
            );
        }
    }
}
