<?php

namespace Database\Seeders;

use Carbon\Carbon;
use App\Models\Conversation;
use App\Models\Group;
use App\Models\Message;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Create admin user
        $admin = User::factory()->create([
            'name' => 'Admin',
            'email' => 'admin@apapesan.com',
            'password' => Hash::make('password'),
            'is_admin' => true,
            'email_verified_at' => now(),
        ]);

        // Create demo users with realistic names
        $demoUsers = [
            ['name' => 'Budi Santoso', 'email' => 'budi@example.com'],
            ['name' => 'Siti Rahayu', 'email' => 'siti@example.com'],
            ['name' => 'Ahmad Wijaya', 'email' => 'ahmad@example.com'],
            ['name' => 'Dewi Lestari', 'email' => 'dewi@example.com'],
            ['name' => 'Rudi Hartono', 'email' => 'rudi@example.com'],
            ['name' => 'Maya Putri', 'email' => 'maya@example.com'],
            ['name' => 'Eko Prasetyo', 'email' => 'eko@example.com'],
            ['name' => 'Rina Wulandari', 'email' => 'rina@example.com'],
            ['name' => 'Dian Permana', 'email' => 'dian@example.com'],
            ['name' => 'Fitri Handayani', 'email' => 'fitri@example.com'],
        ];

        $users = collect();
        foreach ($demoUsers as $userData) {
            $users->push(User::factory()->create([
                'name' => $userData['name'],
                'email' => $userData['email'],
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
            ]));
        }

        // Create additional random users
        User::factory(5)->create([
            'email_verified_at' => now(),
        ]);

        // Create groups with meaningful names
        $groupNames = [
            ['name' => 'Tim Development', 'description' => 'Grup untuk koordinasi tim development'],
            ['name' => 'Marketing Squad', 'description' => 'Diskusi strategi marketing'],
            ['name' => 'HR & Admin', 'description' => 'Koordinasi HR dan administrasi'],
            ['name' => 'Random Chat', 'description' => 'Tempat ngobrol santai'],
            ['name' => 'Project Alpha', 'description' => 'Diskusi project alpha'],
        ];

        foreach ($groupNames as $groupData) {
            $group = Group::factory()->create([
                'owner_id' => $admin->id,
                'name' => $groupData['name'],
                'description' => $groupData['description'],
            ]);

            // Add admin and random users to group
            $memberIds = User::inRandomOrder()->limit(rand(3, 6))->pluck('id')->toArray();
            $group->users()->attach(array_unique([$admin->id, ...$memberIds]));
        }

        // Create sample messages between users
        $allUsers = User::all();

        // Create private messages
        foreach ($allUsers->take(5) as $user1) {
            foreach ($allUsers->where('id', '!=', $user1->id)->take(3) as $user2) {
                $messageCount = rand(3, 10);
                for ($i = 0; $i < $messageCount; $i++) {
                    $sender = rand(0, 1) ? $user1 : $user2;
                    $receiver = $sender->id === $user1->id ? $user2 : $user1;

                    Message::factory()->create([
                        'sender_id' => $sender->id,
                        'receiver_id' => $receiver->id,
                        'group_id' => null,
                        'message' => $this->getRandomMessage(),
                        'created_at' => now()->subMinutes(rand(1, 10000)),
                    ]);
                }
            }
        }

        // Create group messages
        foreach (Group::all() as $group) {
            $members = $group->users;
            $messageCount = rand(10, 30);

            for ($i = 0; $i < $messageCount; $i++) {
                $sender = $members->random();

                Message::factory()->create([
                    'sender_id' => $sender->id,
                    'receiver_id' => null,
                    'group_id' => $group->id,
                    'message' => $this->getRandomMessage(),
                    'created_at' => now()->subMinutes(rand(1, 10000)),
                ]);
            }
        }

        // Create conversations from messages
        $privateMessages = Message::whereNull('group_id')->orderBy('created_at')->get();

        $conversations = $privateMessages->groupBy(function ($message) {
            return collect([$message->sender_id, $message->receiver_id])->sort()->implode('_');
        })->map(function ($groupedMessages) {
            return [
                'user_id1' => $groupedMessages->first()->sender_id,
                'user_id2' => $groupedMessages->first()->receiver_id,
                'last_message_id' => $groupedMessages->last()->id,
                'created_at' => now(),
                'updated_at' => now(),
            ];
        });

        Conversation::insert($conversations->values()->toArray());

        // Update group last_message_id
        foreach (Group::all() as $group) {
            $lastMessage = Message::where('group_id', $group->id)->latest()->first();
            if ($lastMessage) {
                $group->update(['last_message_id' => $lastMessage->id]);
            }
        }

        $this->command->info('Database seeded successfully!');
        $this->command->info('Admin login: admin@apapesan.com / password');
        $this->command->info('Demo user login: budi@example.com / password');
    }

    /**
     * Get random Indonesian chat messages
     */
    private function getRandomMessage(): string
    {
        $messages = [
            'Halo, apa kabar?',
            'Baik, terima kasih! Kamu gimana?',
            'Lagi ngapain nih?',
            'Sudah makan belum?',
            'Gimana projectnya?',
            'Oke siap, nanti aku kabarin ya',
            'Makasih banyak ya!',
            'Sama-sama 😊',
            'Wah keren banget!',
            'Setuju banget sama pendapatmu',
            'Kapan kita meeting lagi?',
            'Besok jam 10 bisa?',
            'Aku lagi di jalan nih',
            'Tunggu sebentar ya',
            'Sudah selesai belum?',
            'Nanti aku follow up lagi',
            'Tolong cek emailnya ya',
            'Siap boss! 👍',
            'Noted, akan aku kerjakan',
            'Deadline-nya kapan?',
            'Minggu depan ya',
            'Oke fix, deal!',
            'Hahaha lucu banget 😂',
            'Serius nih?',
            'Iya beneran!',
            'Wah mantap!',
            'Good job team! 🎉',
            'Terima kasih atas kerjasamanya',
            'Sampai jumpa besok',
            'Selamat malam! 🌙',
        ];

        return $messages[array_rand($messages)];
    }
}
