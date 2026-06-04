<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Product;
use Illuminate\Database\Seeder;

class ProductSeeder extends Seeder
{
    public function run(): void
    {
        $cakes = Category::where('name', 'Celebration Cakes')->first();
        $pastries = Category::where('name', 'Pastries')->first();
        $breads = Category::where('name', 'Breads')->first();

        if (!$cakes || !$pastries || !$breads) {
            return;
        }

        $products = [
            [
                'category_id' => $cakes->id,
                'name' => 'Strawberry Velvet Gateau',
                'description' => 'Layers of moist red velvet sponge with fresh strawberries and cream cheese frosting.',
                'price' => 1250.00,
                'is_available' => true,
            ],
            [
                'category_id' => $cakes->id,
                'name' => 'Chocolate Truffle Delight',
                'description' => 'Rich dark chocolate cake with truffle ganache and gold-dusted finish.',
                'price' => 1450.00,
                'is_available' => true,
            ],
            [
                'category_id' => $pastries->id,
                'name' => 'Salted Caramel Éclair',
                'description' => 'Choux pastry filled with salted caramel cream and dark chocolate glaze.',
                'price' => 185.00,
                'is_available' => true,
            ],
            [
                'category_id' => $pastries->id,
                'name' => 'Mango Passion Tart',
                'description' => 'Buttery tart shell with mango-passion fruit curd and torched meringue.',
                'price' => 220.00,
                'is_available' => true,
            ],
            [
                'category_id' => $breads->id,
                'name' => 'Honey Oat Loaf',
                'description' => 'Soft artisan loaf with local honey, rolled oats, and sunflower seeds.',
                'price' => 165.00,
                'is_available' => true,
            ],
            [
                'category_id' => $breads->id,
                'name' => 'Garlic Herb Focaccia',
                'description' => 'Olive oil focaccia topped with roasted garlic, rosemary, and sea salt.',
                'price' => 195.00,
                'is_available' => true,
            ],
        ];

        foreach ($products as $product) {
            Product::firstOrCreate(
                ['name' => $product['name'], 'category_id' => $product['category_id']],
                $product,
            );
        }
    }
}
