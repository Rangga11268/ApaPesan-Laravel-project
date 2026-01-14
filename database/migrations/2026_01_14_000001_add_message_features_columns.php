<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('messages', function (Blueprint $table) {
            $table->timestamp('read_at')->nullable()->after('conversation_id');
            $table->foreignId('reply_to_id')->nullable()->after('read_at')
                ->constrained('messages')->nullOnDelete();
            $table->timestamp('edited_at')->nullable()->after('reply_to_id');
            $table->timestamp('pinned_at')->nullable()->after('edited_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('messages', function (Blueprint $table) {
            $table->dropForeign(['reply_to_id']);
            $table->dropColumn(['read_at', 'reply_to_id', 'edited_at', 'pinned_at']);
        });
    }
};
