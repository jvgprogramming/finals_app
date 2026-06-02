<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->string('customer_name')->nullable()->after('user_id');
            $table->string('customer_phone', 30)->nullable()->after('customer_name');
            $table->string('fulfillment_type', 20)->default('pickup')->after('customer_phone');
            $table->text('delivery_address')->nullable()->after('fulfillment_type');
            $table->decimal('delivery_fee', 10, 2)->default(0)->after('total_amount');
        });
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn([
                'customer_name',
                'customer_phone',
                'fulfillment_type',
                'delivery_address',
                'delivery_fee',
            ]);
        });
    }
};
