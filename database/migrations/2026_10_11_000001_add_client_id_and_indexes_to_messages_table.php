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
            $table->string('client_id', 36)->nullable()->unique()->after('id');
            $table->index(['sender_id', 'receiver_id', 'id'], 'messages_direct_cursor_idx');
            $table->index(['group_id', 'id'], 'messages_group_cursor_idx');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('messages', function (Blueprint $table) {
            $table->dropIndex('messages_direct_cursor_idx');
            $table->dropIndex('messages_group_cursor_idx');
            $table->dropColumn('client_id');
        });
    }
};
