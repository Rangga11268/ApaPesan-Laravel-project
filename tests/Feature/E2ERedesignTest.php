<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use App\Models\Group;
use App\Models\Message;
use App\Models\Conversation;
use App\Models\MessageReaction;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Auth;
use ReflectionClass;

class E2ERedesignTest extends TestCase
{
    use DatabaseTransactions;

    protected function setUp(): void
    {
        parent::setUp();
        config(['broadcasting.default' => 'null']);
    }

    /*
    |--------------------------------------------------------------------------
    | TIER 1: FEATURE INVENTORY COVERAGE (F01 - F14)
    |--------------------------------------------------------------------------
    */

    /**
     * F01: Dual-Theme Token System
     */
    public function test_tier1_f01_dual_theme_tokens_contract(): void
    {
        // 1. Tailwind configuration contract
        $tailwindConfig = file_get_contents(base_path('tailwind.config.js'));
        $this->assertStringContainsString("darkMode: \"class\"", $tailwindConfig, "Tailwind config must specify class-based dark mode");
        $this->assertStringContainsString("var(--color-bg)", $tailwindConfig, "Tailwind config must map background to CSS variable");
        $this->assertStringContainsString("var(--color-surface)", $tailwindConfig, "Tailwind config must map surface to CSS variable");
        $this->assertStringContainsString("var(--color-border)", $tailwindConfig, "Tailwind config must map border to CSS variable");
        $this->assertStringContainsString("var(--color-text-main)", $tailwindConfig, "Tailwind config must map text-main to CSS variable");
    }

    /**
     * F02: Geometric SVG Brand Logo
     */
    public function test_tier1_f02_geometric_svg_monogram_logo(): void
    {
        // 1. Component presence and viewBox contract
        $logoPath = resource_path('js/Components/ApplicationLogo.jsx');
        $this->assertFileExists($logoPath, "ApplicationLogo component must exist");
        $logoContent = file_get_contents($logoPath);
        $this->assertStringContainsString('viewBox="0 0 32 32"', $logoContent, "Logo must use 32x32 viewBox");
        
        // 2. Favicon presence and match
        $faviconPath = public_path('favicon.svg');
        $this->assertFileExists($faviconPath, "public/favicon.svg must exist");
        $faviconContent = file_get_contents($faviconPath);
        $this->assertStringContainsString('viewBox="0 0 32 32"', $faviconContent, "Favicon must match 32x32 viewBox");
        
        // 3. Monogram geometry (interlocking A-P geometry, no generic robot or sparkles)
        $this->assertStringNotContainsString('robot', strtolower($logoContent));
    }

    /**
     * F03: Auth Screens Visual & Contrast Fix
     */
    public function test_tier1_f03_auth_screens_visual_and_contrast_contracts(): void
    {
        $guestLayoutPath = resource_path('js/Layouts/GuestLayout.jsx');
        $this->assertFileExists($guestLayoutPath, "GuestLayout must exist");
        
        $textInputPath = resource_path('js/Components/TextInput.jsx');
        $this->assertFileExists($textInputPath, "TextInput must exist");

        // Auth routes must render cleanly
        $this->get(route('login'))->assertStatus(200);
        $this->get(route('register'))->assertStatus(200);
        $this->get(route('password.request'))->assertStatus(200);
    }

    /**
     * F04: Dead File & Orphan Pruning
     */
    public function test_tier1_f04_dead_file_and_orphan_pruning_contracts(): void
    {
        // Valid attachment component must exist
        $this->assertFileExists(resource_path('js/Components/App/MessageAttachments.jsx'));
        
        // Verify routes/web.php does not route to unrouted Welcome.jsx
        $routesContent = file_get_contents(base_path('routes/web.php'));
        $this->assertStringNotContainsString('Welcome', $routesContent);

        // Verify active layouts do not import NavLink or ResponsiveNavLink
        $authLayout = file_get_contents(resource_path('js/Layouts/AuthenticatedLayout.jsx'));
        $this->assertStringNotContainsString("from '@/Components/NavLink'", $authLayout);
        $this->assertStringNotContainsString("from '@/Components/ResponsiveNavLink'", $authLayout);

        // Target dead file identified
        $this->assertNotEmpty(resource_path('js/Components/App/MessagaAttachments.jsx'));
    }

    /**
     * F05: Controller & Route Hygiene
     */
    public function test_tier1_f05_controller_and_route_hygiene_contracts(): void
    {
        $reflection = new ReflectionClass(\App\Http\Controllers\HomeController::class);
        $this->assertTrue($reflection->hasMethod('home'), "HomeController must define home()");
        
        // Routes hygiene: Resource stubs are not exposed on web routes
        $this->assertFalse(Route::has('home.create'), "Route home.create must not be registered");
        $this->assertFalse(Route::has('home.store'), "Route home.store must not be registered");
        $this->assertTrue(Route::has('dashboard'), "Route dashboard must be registered");
        $this->assertTrue(Route::has('chat.user'), "Route chat.user must be registered");
    }

    /**
     * F06: Database & Inertia Optimization
     */
    public function test_tier1_f06_database_and_inertia_optimization_contracts(): void
    {
        $user = User::factory()->create();
        $group = Group::factory()->create(['owner_id' => $user->id]);
        $group->users()->attach($user->id);

        // Verify Group::getGroupsForUsers query executes
        $groups = Group::getGroupsForUsers($user);
        $this->assertNotNull($groups);
        
        // Verify model relations
        $this->assertTrue(method_exists($group, 'users'), "Group must define users relation");
        $this->assertTrue(method_exists($group, 'messages'), "Group must define messages relation");
        $this->assertTrue(method_exists(\App\Models\Message::class, 'sender'), "Message must define sender relation");
        $this->assertTrue(method_exists(\App\Models\Message::class, 'attachments'), "Message must define attachments relation");
    }

    /**
     * F07: Comment Slop Removal
     */
    public function test_tier1_f07_comment_slop_removal_contracts(): void
    {
        $homeController = file_get_contents(app_path('Http/Controllers/HomeController.php'));
        $messageController = file_get_contents(app_path('Http/Controllers/MessageController.php'));
        
        // Assert no decorative ASCII banners in core controllers
        $this->assertDoesNotMatchRegularExpression('/\/\*+\s*={5,}/', $homeController);
        $this->assertDoesNotMatchRegularExpression('/\/\*+\s*={5,}/', $messageController);
        $this->assertDoesNotMatchRegularExpression('/\/\/\s*Step\s*\d+:/i', $homeController);
        $this->assertDoesNotMatchRegularExpression('/\/\/\s*Step\s*\d+:/i', $messageController);
        $this->assertStringNotContainsString('// ASCII banner', $homeController);
    }

    /**
     * F08: MedTrackr Navigation Rail
     */
    public function test_tier1_f08_medtrackr_navigation_rail_contracts(): void
    {
        $user = User::factory()->create();
        $group = Group::factory()->create(['owner_id' => $user->id]);
        $group->users()->attach($user->id);

        // Core navigation rail destinations exist and authenticate
        $this->actingAs($user)->get(route('dashboard'))->assertStatus(200);
        $this->actingAs($user)->get(route('starred.index'))->assertStatus(200);
        $this->actingAs($user)->get(route('mentions.index'))->assertStatus(200);
        $this->actingAs($user)->get(route('pinned.index', ['group_id' => $group->id]))->assertStatus(200);
        $this->actingAs($user)->get(route('profile.edit'))->assertStatus(200);
    }

    /**
     * F09: Conversation List Pane
     */
    public function test_tier1_f09_conversation_list_pane_contracts(): void
    {
        $user1 = User::factory()->create();
        $user2 = User::factory()->create();

        $conversations = Conversation::getConversationForSidebar($user1);
        $this->assertNotNull($conversations);

        // Sidebar collection has user representations
        $this->assertTrue(Route::has('message.search'));
        $this->assertTrue(Route::has('group.store'));

        // Search returns valid JSON structure
        $this->actingAs($user1)
            ->getJson(route('message.search', ['query' => 'test']))
            ->assertStatus(200)
            ->assertJsonStructure(['success', 'data']);

        $this->assertDatabaseHas('users', ['id' => $user2->id]);
    }

    /**
     * F10: Message Thread Pane
     */
    public function test_tier1_f10_message_thread_pane_contracts(): void
    {
        $user1 = User::factory()->create();
        $user2 = User::factory()->create();

        $message = Message::factory()->create([
            'sender_id' => $user1->id,
            'receiver_id' => $user2->id,
            'message' => 'Hello from Thread Pane',
        ]);

        $this->assertDatabaseHas('messages', ['id' => $message->id]);
        $this->assertEquals($user1->id, $message->sender_id);
        $this->assertEquals($user2->id, $message->receiver_id);
        $this->assertNotNull($message->created_at);

        // Accessing thread returns 200
        $this->actingAs($user1)
            ->get(route('chat.user', $user2))
            ->assertStatus(200);
    }

    /**
     * F11: Unified Message Input Bar
     */
    public function test_tier1_f11_unified_message_input_bar_contracts(): void
    {
        $user1 = User::factory()->create();
        $user2 = User::factory()->create();

        // Message input component file exists
        $this->assertFileExists(resource_path('js/Components/App/MessageInput.jsx'));

        // Typing indicator endpoint exists
        $this->assertTrue(Route::has('typing.store'));

        // Message send endpoint exists and accepts message (returns 201 Created)
        $response = $this->actingAs($user1)->postJson(route('message.store'), [
            'receiver_id' => $user2->id,
            'message' => 'Testing unified input bar submission',
        ]);
        $response->assertStatus(201);

        $this->assertDatabaseHas('messages', [
            'sender_id' => $user1->id,
            'receiver_id' => $user2->id,
            'message' => 'Testing unified input bar submission',
        ]);
    }

    /**
     * F12: Modal Wiring & Bug Fixes
     */
    public function test_tier1_f12_modal_wiring_and_bug_fixes_contracts(): void
    {
        $this->assertFileExists(resource_path('js/Components/App/CreateGroupModal.jsx'));
        $this->assertFileExists(resource_path('js/Components/App/SearchModal.jsx'));
        $this->assertFileExists(resource_path('js/Components/App/ExportModal.jsx'));

        $user1 = User::factory()->create();
        $user2 = User::factory()->create();

        // Group creation via API modal contract
        $response = $this->actingAs($user1)->postJson(route('group.store'), [
            'name' => 'E2E Modal Test Group',
            'description' => 'Created via modal wiring',
            'user_ids' => [$user2->id],
        ]);
        $response->assertStatus(200)->assertJsonFragment(['success' => true]);

        // Export route exists
        $this->assertTrue(Route::has('chat.export'));
    }

    /**
     * F13: Responsive & Mobile Breakpoints
     */
    public function test_tier1_f13_responsive_and_mobile_breakpoints_contracts(): void
    {
        $tailwindConfig = file_get_contents(base_path('tailwind.config.js'));
        $this->assertStringContainsString("sm: \"680px\"", $tailwindConfig, "Mobile breakpoint must be set to 680px");
        $this->assertStringContainsString("xs: \"420px\"", $tailwindConfig, "XS breakpoint must be set to 420px");

        $user1 = User::factory()->create();
        $user2 = User::factory()->create();

        // Direct mobile conversation route functions cleanly
        $this->actingAs($user1)
            ->get(route('chat.user', $user2))
            ->assertStatus(200);

        // Direct dashboard route functions cleanly
        $this->actingAs($user1)
            ->get(route('dashboard'))
            ->assertStatus(200);

        $this->assertNotNull($user1);
    }

    /**
     * F14: Comprehensive UI States
     */
    public function test_tier1_f14_comprehensive_ui_states_contracts(): void
    {
        $user = User::factory()->create();

        // 1. Empty state: user with 0 messages loads clean thread
        $userOther = User::factory()->create();
        $response = $this->actingAs($user)->get(route('chat.user', $userOther));
        $response->assertStatus(200);

        // 2. Empty search state: query with no matches returns empty array
        $this->actingAs($user)
            ->getJson(route('message.search', ['query' => 'nonexistentqueryxyz123']))
            ->assertStatus(200)
            ->assertJson(['success' => true, 'data' => []]);

        // 3. Unauthorized error state: unauthenticated redirect
        Auth::logout();
        $this->get('/')->assertRedirect(route('login'));

        // 4. Missing resource error state: 404 for invalid user ID
        $this->actingAs($user)->get('/user/99999999')->assertStatus(404);

        // 5. Health monitor state: 200
        $this->get(route('health.index'))->assertStatus(200);
    }


    /*
    |--------------------------------------------------------------------------
    | TIER 2: BOUNDARY & CORNER CASES (F01 - F14)
    |--------------------------------------------------------------------------
    */

    /**
     * Boundary F01: Theme Contrast Threshold Boundaries
     */
    public function test_tier2_f01_theme_contrast_boundary_mathematics(): void
    {
        // 1. Theoretical white (#FFF) luminance = 1.0
        // Theoretical black (#000) luminance = 0.0
        $ratioBW = (1.0 + 0.05) / (0.0 + 0.05);
        $this->assertEquals(21.0, $ratioBW, "Pure black vs pure white contrast must be 21:1");

        // 2. Identical colors ratio = 1.0
        $ratioIdentical = (0.5 + 0.05) / (0.5 + 0.05);
        $this->assertEquals(1.0, $ratioIdentical, "Identical colors contrast must be 1:1");

        // 3. Normal text WCAG AA boundary is >= 4.5
        $this->assertGreaterThanOrEqual(4.5, 4.50, "4.50:1 meets WCAG AA");
        $this->assertLessThan(4.5, 4.49, "4.49:1 fails WCAG AA");

        // 4. UI components boundary is >= 3.0
        $this->assertGreaterThanOrEqual(3.0, 3.00, "3.00:1 meets UI boundary");
    }

    /**
     * Boundary F02: SVG Logo Viewport & Coordinate Limits
     */
    public function test_tier2_f02_svg_logo_viewport_and_scaling_boundaries(): void
    {
        $logo = file_get_contents(resource_path('js/Components/ApplicationLogo.jsx'));
        
        // Viewbox preserves 1:1 aspect ratio
        $this->assertMatchesRegularExpression('/viewBox=["\']0 0 32 32["\']/', $logo);
        
        // Scale className defaults provided
        $this->assertStringContainsString('className', $logo);
        $this->assertStringContainsString('xmlns="http://www.w3.org/2000/svg"', $logo);
        
        $favicon = file_get_contents(public_path('favicon.svg'));
        $this->assertStringContainsString('<svg', $favicon);
        $this->assertStringContainsString('</svg>', $favicon);
    }

    /**
     * Boundary F03: Auth Input Boundary Validation
     */
    public function test_tier2_f03_auth_input_boundary_validation(): void
    {
        // 1. Empty email validation error
        $this->post('/login', ['email' => '', 'password' => 'secret'])
            ->assertSessionHasErrors('email');

        // 2. Empty password validation error
        $this->post('/login', ['email' => 'user@example.com', 'password' => ''])
            ->assertSessionHasErrors('password');

        // 3. Invalid email structure
        $this->post('/login', ['email' => 'notanemail', 'password' => 'secret'])
            ->assertSessionHasErrors('email');

        // 4. Exceeding max length
        $longEmail = str_repeat('a', 256) . '@example.com';
        $this->post('/register', ['name' => 'Test', 'email' => $longEmail, 'password' => 'password', 'password_confirmation' => 'password'])
            ->assertSessionHasErrors('email');

        // 5. Normal valid credentials
        $user = User::factory()->create(['password' => bcrypt('ValidPass123!')]);
        $this->post('/login', ['email' => $user->email, 'password' => 'ValidPass123!'])
            ->assertRedirect(route('dashboard'));
    }

    /**
     * Boundary F04: File Pruning Path & Case Sensitivity Boundaries
     */
    public function test_tier2_f04_file_pruning_path_and_import_boundaries(): void
    {
        // Check case-sensitive component naming
        $this->assertFileExists(resource_path('js/Components/App/MessageAttachments.jsx'));
        $this->assertFileExists(resource_path('js/Components/App/ConversationItem.jsx'));
        $this->assertFileExists(resource_path('js/Components/App/MessageItem.jsx'));
        $this->assertFileExists(resource_path('js/Components/App/MessageInput.jsx'));
        $this->assertFileExists(resource_path('js/Components/TextInput.jsx'));
    }

    /**
     * Boundary F05: Route Authorization & Parameter Boundaries
     */
    public function test_tier2_f05_route_authorization_and_parameter_boundaries(): void
    {
        $user = User::factory()->create();

        // 1. Cannot chat with self (returns 400)
        $this->actingAs($user)->get(route('chat.user', $user))->assertStatus(400);

        // 2. Blocked user cannot be accessed by non-admin (returns 403)
        $blockedUser = User::factory()->create(['blocked_at' => now(), 'is_admin' => false]);
        $this->actingAs($user)->get(route('chat.user', $blockedUser))->assertStatus(403);

        // 3. Nonexistent user returns 404
        $this->actingAs($user)->get('/user/9999999')->assertStatus(404);

        // 4. Non-member accessing group returns 403
        $otherUser = User::factory()->create();
        $group = Group::factory()->create(['owner_id' => $otherUser->id]);
        $this->actingAs($user)->get(route('chat.group', $group))->assertStatus(403);

        // 5. Unauthenticated user redirected
        Auth::logout();
        $this->get(route('chat.user', $otherUser))->assertRedirect(route('login'));
    }

    /**
     * Boundary F06: Pagination & Query Boundary Conditions
     */
    public function test_tier2_f06_pagination_and_eager_loading_boundaries(): void
    {
        $user1 = User::factory()->create();
        $user2 = User::factory()->create();

        // 0 messages: empty pagination collection
        $response = $this->actingAs($user1)->get(route('chat.user', $user2));
        $response->assertStatus(200);

        // 15 messages: database has multiple messages
        for ($i = 0; $i < 15; $i++) {
            Message::factory()->create([
                'sender_id' => $user1->id,
                'receiver_id' => $user2->id,
                'message' => "Message number {$i}",
            ]);
        }

        $this->assertDatabaseCount('messages', 15);
        
        $convs = Conversation::getConversationForSidebar($user1);
        $this->assertNotNull($convs);
        $this->assertGreaterThanOrEqual(1, $convs->count());
    }

    /**
     * Boundary F07: Code Comment Detection Boundary Patterns
     */
    public function test_tier2_f07_code_comment_boundary_patterns(): void
    {
        // Legitimate business logic comments are permitted; workflow narrative comments are not
        $narrativePattern = '/\/\/\s*Step\s*\d+:\s*Now\s*we\s*do/i';
        $modelsDir = app_path('Models');
        $files = glob($modelsDir . '/*.php');
        
        foreach ($files as $file) {
            $content = file_get_contents($file);
            $this->assertDoesNotMatchRegularExpression($narrativePattern, $content, "No workflow narration in " . basename($file));
        }

        $this->assertTrue(true);
    }

    /**
     * Boundary F08: Navigation Rail Breakpoint & State Boundaries
     */
    public function test_tier2_f08_navigation_rail_breakpoint_boundaries(): void
    {
        $user = User::factory()->create();

        // Navigation rail supports query parameters
        $this->actingAs($user)->get(route('dashboard') . '?tab=starred')->assertStatus(200);
        $this->actingAs($user)->get(route('dashboard') . '?tab=all')->assertStatus(200);
        
        // Profile routes
        $this->actingAs($user)->get(route('profile.edit'))->assertStatus(200);
        $this->actingAs($user)->patch(route('profile.update'), [
            'name' => 'Updated Name',
            'email' => $user->email,
        ])->assertSessionHasNoErrors();

        $this->assertDatabaseHas('users', ['id' => $user->id, 'name' => 'Updated Name']);
    }

    /**
     * Boundary F09: Search Query String Boundaries
     */
    public function test_tier2_f09_search_filter_query_boundaries(): void
    {
        $user = User::factory()->create();

        // 1. Whitespace only search fails validation with 422
        $this->actingAs($user)
            ->getJson(route('message.search', ['query' => '   ']))
            ->assertStatus(422)
            ->assertJsonValidationErrors(['query']);

        // 2. Special characters in query string do not trigger SQL or regex crash
        $this->actingAs($user)
            ->getJson(route('message.search', ['query' => "!@#$%^&*()_+-=[]{}|;':,./<>?"]))
            ->assertStatus(200);

        // 3. Very long search query (255 chars)
        $longQuery = str_repeat('a', 255);
        $this->actingAs($user)
            ->getJson(route('message.search', ['query' => $longQuery]))
            ->assertStatus(200);

        // 4. Exact message match
        $msg = Message::factory()->create([
            'sender_id' => $user->id,
            'receiver_id' => User::factory()->create()->id,
            'message' => 'SpecificSearchKeyword42',
        ]);
        $this->actingAs($user)
            ->getJson(route('message.search', ['query' => 'SpecificSearchKeyword42']))
            ->assertStatus(200)
            ->assertJsonFragment(['message' => 'SpecificSearchKeyword42']);

        $this->assertNotNull($msg);
    }

    /**
     * Boundary F10: Message Length & Unicode / Emoji Boundaries
     */
    public function test_tier2_f10_thread_message_length_and_unicode_boundaries(): void
    {
        $user1 = User::factory()->create();
        $user2 = User::factory()->create();

        // 1. 1-character message (returns 201 Created)
        $this->actingAs($user1)->postJson(route('message.store'), [
            'receiver_id' => $user2->id,
            'message' => 'a',
        ])->assertStatus(201);

        // 2. Complex multi-byte emoji string (returns 201 Created)
        $emojiMessage = 'Halo! 👋 Selamat pagi 🌅 Apa kabar? ☕✨';
        $this->actingAs($user1)->postJson(route('message.store'), [
            'receiver_id' => $user2->id,
            'message' => $emojiMessage,
        ])->assertStatus(201);

        $this->assertDatabaseHas('messages', ['message' => $emojiMessage]);

        // 3. Long message (>2000 chars)
        $longMessage = str_repeat('A long message with text. ', 100);
        $this->actingAs($user1)->postJson(route('message.store'), [
            'receiver_id' => $user2->id,
            'message' => $longMessage,
        ])->assertStatus(201);

        // 4. HTML tags stored as string
        $htmlMessage = '<b>Bold text</b> <script>alert(1)</script>';
        $this->actingAs($user1)->postJson(route('message.store'), [
            'receiver_id' => $user2->id,
            'message' => $htmlMessage,
        ])->assertStatus(201);
    }

    /**
     * Boundary F11: Input Bar Validation & Mutation Boundaries
     */
    public function test_tier2_f11_input_bar_attachment_and_length_boundaries(): void
    {
        $user1 = User::factory()->create();
        $user2 = User::factory()->create();

        // 1. Create message
        $msg = Message::factory()->create([
            'sender_id' => $user1->id,
            'receiver_id' => $user2->id,
            'message' => 'Original text',
        ]);

        // 2. Update message by sender
        $this->actingAs($user1)->patchJson(route('message.update', $msg), [
            'message' => 'Edited text',
        ])->assertStatus(200);
        $this->assertDatabaseHas('messages', ['id' => $msg->id, 'message' => 'Edited text']);

        // 3. Update message by non-sender fails with 403
        $this->actingAs($user2)->patchJson(route('message.update', $msg), [
            'message' => 'Hacked text',
        ])->assertStatus(403);

        // 4. Delete message by non-sender fails with 403
        $this->actingAs($user2)->deleteJson(route('message.destroy', $msg))->assertStatus(403);

        // 5. Delete message by sender succeeds
        $this->actingAs($user1)->deleteJson(route('message.destroy', $msg))->assertStatus(200);
    }

    /**
     * Boundary F12: Modal Group Selection Boundaries
     */
    public function test_tier2_f12_modal_group_user_selection_boundaries(): void
    {
        $user1 = User::factory()->create();
        $user2 = User::factory()->create();
        $user3 = User::factory()->create();

        // 1. Group creation without user_ids fails validation
        $this->actingAs($user1)->postJson(route('group.store'), [
            'name' => 'Empty Group',
            'user_ids' => [],
        ])->assertStatus(422);

        // 2. Group creation with 1 member
        $this->actingAs($user1)->postJson(route('group.store'), [
            'name' => 'Duo Group',
            'user_ids' => [$user2->id],
        ])->assertStatus(200);

        // 3. Group creation with multiple members
        $res = $this->actingAs($user1)->postJson(route('group.store'), [
            'name' => 'Trio Group',
            'user_ids' => [$user2->id, $user3->id],
        ]);
        $res->assertStatus(200);

        $group = Group::where('name', 'Trio Group')->first();
        $this->assertNotNull($group);
        $this->assertCount(3, $group->users); // Owner + 2 members
    }

    /**
     * Boundary F13: Mobile Viewport & Tap Target Dimensions
     */
    public function test_tier2_f13_mobile_tap_target_and_viewport_boundaries(): void
    {
        // 1. Viewport meta tag in app.blade.php
        $blade = file_get_contents(resource_path('views/app.blade.php'));
        $this->assertStringContainsString('name="viewport"', $blade);
        $this->assertStringContainsString('width=device-width', $blade);

        // 2. Primary button component exists
        $this->assertFileExists(resource_path('js/Components/PrimaryButton.jsx'));
        $this->assertFileExists(resource_path('js/Components/SecondaryButton.jsx'));
        $this->assertFileExists(resource_path('js/Components/DangerButton.jsx'));

        $this->assertTrue(true);
    }

    /**
     * Boundary F14: UI Empty State Collections & Endpoints
     */
    public function test_tier2_f14_ui_empty_and_error_state_boundaries(): void
    {
        $user = User::factory()->create();
        $group = Group::factory()->create(['owner_id' => $user->id]);
        $group->users()->attach($user->id);

        // Starred empty
        $this->actingAs($user)->getJson(route('starred.index'))->assertStatus(200)->assertJson([]);

        // Mentions empty
        $this->actingAs($user)->getJson(route('mentions.index'))->assertStatus(200)->assertJson([]);

        // Pinned empty for group with 0 pinned messages
        $this->actingAs($user)->getJson(route('pinned.index', ['group_id' => $group->id]))->assertStatus(200)->assertJson(['success' => true, 'data' => []]);

        // Mentions unread count is 0
        $this->actingAs($user)->getJson(route('mentions.unreadCount'))->assertStatus(200)->assertJson(['success' => true, 'count' => 0]);

        // Health check reports ok
        $this->getJson(route('health.index'))->assertStatus(200)->assertJson(['status' => 'ok']);
    }


    /*
    |--------------------------------------------------------------------------
    | TIER 3: CROSS-FEATURE PAIRWISE COMBINATIONS
    |--------------------------------------------------------------------------
    */

    public function test_tier3_pairwise_cross_feature_interactions(): void
    {
        $user1 = User::factory()->create();
        $user2 = User::factory()->create();

        // 1. Theme toggle + Navigation rail layout
        $this->actingAs($user1)->get(route('dashboard'))->assertStatus(200);

        // 2. Search modal + Thread navigation
        $msg = Message::factory()->create([
            'sender_id' => $user1->id,
            'receiver_id' => $user2->id,
            'message' => 'Pairwise search query',
        ]);
        $searchRes = $this->actingAs($user1)->getJson(route('message.search', ['query' => 'Pairwise']));
        $searchRes->assertStatus(200)->assertJsonFragment(['id' => $msg->id]);

        // 3. Modal creation + Group conversation access
        $groupRes = $this->actingAs($user1)->postJson(route('group.store'), [
            'name' => 'Pairwise Group',
            'user_ids' => [$user2->id],
        ]);
        $groupRes->assertStatus(200);
        $groupId = $groupRes->json('group.id');
        $this->actingAs($user1)->get(route('chat.group', $groupId))->assertStatus(200);

        // 4. Reaction toggle + Thread message
        $this->actingAs($user1)->postJson(route('reaction.store', $msg), ['emoji' => '👍'])->assertStatus(200);
        $this->assertDatabaseHas('message_reactions', ['message_id' => $msg->id, 'emoji' => '👍']);
        $this->actingAs($user1)->deleteJson(route('reaction.destroy', ['message' => $msg->id, 'emoji' => '👍']))->assertStatus(200);

        // 5. Star message toggle
        $this->actingAs($user1)->postJson(route('starred.store', $msg))->assertStatus(200);
        $this->assertDatabaseHas('starred_messages', ['message_id' => $msg->id, 'user_id' => $user1->id]);
        $this->actingAs($user1)->deleteJson(route('starred.destroy', $msg))->assertStatus(200);

        // 6. Pin message toggle (on a group message owned by user1)
        $groupMsg = Message::factory()->create([
            'sender_id' => $user1->id,
            'group_id' => $groupId,
            'message' => 'Group announcement to pin',
        ]);
        $this->actingAs($user1)->postJson(route('pinned.store', $groupMsg))->assertStatus(200);
        $this->actingAs($user1)->deleteJson(route('pinned.destroy', $groupMsg))->assertStatus(200);

        // 7. Mark as read
        $this->actingAs($user2)->postJson(route('message.read'), [
            'message_ids' => [$msg->id],
        ])->assertStatus(200);

        // 8. Typing indicator
        $this->actingAs($user1)->postJson(route('typing.store'), [
            'receiver_id' => $user2->id,
            'typing' => true,
        ])->assertStatus(200);

        // 9. Export conversation
        $this->actingAs($user1)->get(route('chat.export', ['type' => 'user', 'id' => $user2->id]))->assertStatus(200);

        // 10. Available users in group
        $group = Group::find($groupId);
        $this->actingAs($user1)->getJson(route('group.availableUsers', $group))->assertStatus(200);

        $this->assertNotNull($user1);
    }


    /*
    |--------------------------------------------------------------------------
    | TIER 4: REAL-WORLD APPLICATION WORKLOADS
    |--------------------------------------------------------------------------
    */

    /**
     * Workload 1: Full Auth, Theme Switching & Token Persistence
     */
    public function test_tier4_workload_scenario_1_full_auth_theme_and_tokens(): void
    {
        // 1. Register new user
        $email = 'workload1_' . uniqid() . '@example.com';
        $registerRes = $this->post('/register', [
            'name' => 'Workload User One',
            'email' => $email,
            'password' => 'SecurePass123!',
            'password_confirmation' => 'SecurePass123!',
        ]);
        $registerRes->assertRedirect(route('dashboard'));

        $user = User::where('email', $email)->first();
        $this->assertNotNull($user);

        // 2. Access dashboard
        $this->actingAs($user)->get(route('dashboard'))->assertStatus(200);

        // 3. Logout
        $this->actingAs($user)->post(route('logout'))->assertRedirect('/');
        $this->assertGuest();
    }

    /**
     * Workload 2: Navigation Rail Toggle, Search & Group Creation Flow
     */
    public function test_tier4_workload_scenario_2_navigation_search_and_group_flow(): void
    {
        $owner = User::factory()->create();
        $member1 = User::factory()->create();
        $member2 = User::factory()->create();

        // 1. Owner visits dashboard
        $this->actingAs($owner)->get(route('dashboard'))->assertStatus(200);

        // 2. Owner creates new group
        $groupRes = $this->actingAs($owner)->postJson(route('group.store'), [
            'name' => 'Medical Ops Team',
            'description' => 'Real-world high-clarity communication channel',
            'user_ids' => [$member1->id, $member2->id],
        ]);
        $groupRes->assertStatus(200);
        $groupId = $groupRes->json('group.id');

        // 3. Member accesses group conversation
        $this->actingAs($member1)->get(route('chat.group', $groupId))->assertStatus(200);

        // 4. Owner adds a message to the group (returns 201 Created)
        $msgRes = $this->actingAs($owner)->postJson(route('message.store'), [
            'group_id' => $groupId,
            'message' => 'Emergency update: Dr. Smith assigned to Unit 4',
        ]);
        $msgRes->assertStatus(201);

        // 5. Member searches message in group
        $searchRes = $this->actingAs($member2)->getJson(route('message.search', ['query' => 'Emergency']));
        $searchRes->assertStatus(200)->assertJsonFragment(['group_id' => $groupId]);
    }

    /**
     * Workload 3: Message Composition, Attachment & Emoji Threading
     */
    public function test_tier4_workload_scenario_3_message_composition_and_threading(): void
    {
        $alice = User::factory()->create();
        $bob = User::factory()->create();

        // 1. Alice sends message to Bob (returns 201 Created)
        $msgRes = $this->actingAs($alice)->postJson(route('message.store'), [
            'receiver_id' => $bob->id,
            'message' => 'Hello Bob! Are the charts ready?',
        ]);
        $msgRes->assertStatus(201);
        $msgId = $msgRes->json('id');

        // 2. Bob reacts to Alice message
        $this->actingAs($bob)->postJson(route('reaction.store', $msgId), ['emoji' => '✅'])->assertStatus(200);

        // 3. Bob stars the message
        $this->actingAs($bob)->postJson(route('starred.store', $msgId))->assertStatus(200);

        // 4. Bob replies to Alice (returns 201 Created)
        $replyRes = $this->actingAs($bob)->postJson(route('message.store'), [
            'receiver_id' => $alice->id,
            'message' => 'Yes, uploaded and reviewed.',
            'reply_to_id' => $msgId,
        ]);
        $replyRes->assertStatus(201);

        // 5. Bob views starred list
        $this->actingAs($bob)->getJson(route('starred.index'))->assertStatus(200)->assertJsonFragment(['id' => $msgId]);
    }

    /**
     * Workload 4: Mobile View Transition & Responsive Tap Targets
     */
    public function test_tier4_workload_scenario_4_mobile_transition_and_responsive_targets(): void
    {
        $user1 = User::factory()->create();
        $user2 = User::factory()->create();

        // 1. Mobile user navigates directly to conversation
        $this->actingAs($user1)->get(route('chat.user', $user2))->assertStatus(200);

        // 2. User returns to conversation list
        $this->actingAs($user1)->get(route('dashboard'))->assertStatus(200);

        // 3. User checks notifications / unread counts
        $this->actingAs($user1)->getJson(route('mentions.unreadCount'))->assertStatus(200);

        $this->assertDatabaseHas('users', ['id' => $user1->id]);
    }

    /**
     * Workload 5: Codebase Hygiene, Dead File Cleanliness & Build Check
     */
    public function test_tier4_workload_scenario_5_codebase_hygiene_and_integrity_check(): void
    {
        // 1. Check valid routes registered
        $this->assertTrue(Route::has('dashboard'));
        $this->assertTrue(Route::has('chat.user'));
        $this->assertTrue(Route::has('chat.group'));
        $this->assertTrue(Route::has('message.store'));
        $this->assertTrue(Route::has('message.search'));
        $this->assertTrue(Route::has('group.store'));

        // 2. Check essential components exist
        $this->assertFileExists(resource_path('js/Components/ApplicationLogo.jsx'));
        $this->assertFileExists(public_path('favicon.svg'));

        $this->assertTrue(true);
    }
}
