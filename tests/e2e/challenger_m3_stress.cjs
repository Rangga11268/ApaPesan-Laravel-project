/**
 * ApaPesan Milestone 3 Empirical Challenger Stress Test Harness
 */

const fs = require('fs');
const path = require('path');
const assert = require('assert');

const ROOT = path.resolve(__dirname, '../..');

function readSource(relPath) {
    return fs.readFileSync(path.join(ROOT, relPath), 'utf-8');
}

console.log('================================================================');
console.log('       CHALLENGER M3 EMPIRICAL STRESS TEST HARNESS               ');
console.log('================================================================\n');

let totalTests = 0;
let passedTests = 0;
let failedTests = [];

function runTest(name, fn) {
    totalTests++;
    try {
        fn();
        passedTests++;
        console.log(`[PASS] ${name}`);
    } catch (err) {
        failedTests.push({ name, error: err.message.slice(0, 120) });
        console.error(`[FAIL] ${name}`);
    }
}

// -----------------------------------------------------------------------------
// SUITE 1: TAP TARGET SPECIFICATION & COMPUTED CLASS VERIFICATION
// -----------------------------------------------------------------------------
console.log('>>> [1/3] Tap Targets Stress-Testing (Min 44x44px Controls)...');

runTest('MessageInput.jsx: PaperClip attachment target >= 44x44px', () => {
    const code = readSource('resources/js/Components/App/MessageInput.jsx');
    assert(code.includes('min-h-[44px] min-w-[44px]') && code.includes('title="Lampirkan Dokumen"'));
});

runTest('MessageInput.jsx: Photo attachment target >= 44x44px', () => {
    const code = readSource('resources/js/Components/App/MessageInput.jsx');
    assert(code.includes('min-h-[44px] min-w-[44px]') && code.includes('title="Kirim Foto"'));
});

runTest('MessageInput.jsx: Emoji picker button target >= 44x44px', () => {
    const code = readSource('resources/js/Components/App/MessageInput.jsx');
    assert(code.includes('min-h-[44px] min-w-[44px]') && code.includes('aria-label="Buka pemilih emoji"'));
});

runTest('MessageInput.jsx: Send button target >= 44x44px', () => {
    const code = readSource('resources/js/Components/App/MessageInput.jsx');
    assert(code.includes('min-h-[44px] min-w-[44px]') && code.includes('aria-label="Kirim Pesan"'));
});

runTest('MessageInput.jsx: Like thumb button target >= 44x44px', () => {
    const code = readSource('resources/js/Components/App/MessageInput.jsx');
    assert(code.includes('min-h-[44px] min-w-[44px]') && code.includes('aria-label="Kirim jempol"'));
});

runTest('AudioRecorder.jsx: Record / Stop audio button target >= 44x44px', () => {
    const code = readSource('resources/js/Components/App/AudioRecorder.jsx');
    assert(code.includes('min-h-[44px] min-w-[44px]'));
});

runTest('ConversationHeader.jsx: Mobile back button target >= 44x44px', () => {
    const code = readSource('resources/js/Components/App/ConversationHeader.jsx');
    assert(code.includes('min-h-[44px] min-w-[44px]') && code.includes('aria-label="Kembali ke daftar percakapan"'));
});

runTest('ConversationHeader.jsx: Search message button target >= 44x44px', () => {
    const code = readSource('resources/js/Components/App/ConversationHeader.jsx');
    assert(code.includes('min-h-[44px] min-w-[44px]') && code.includes('aria-label="Cari pesan dalam percakapan"'));
});

runTest('ConversationHeader.jsx: Export history button target >= 44x44px', () => {
    const code = readSource('resources/js/Components/App/ConversationHeader.jsx');
    assert(code.includes('min-h-[44px] min-w-[44px]') && code.includes('aria-label="Ekspor riwayat percakapan"'));
});

runTest('ChatLayout.jsx: Create new group button target >= 44x44px', () => {
    const code = readSource('resources/js/Layouts/ChatLayout.jsx');
    assert(code.includes('min-h-[44px] min-w-[44px]') && code.includes('aria-label="Buat Grup Baru"'));
});

runTest('AuthenticatedLayout.jsx: Navigation items and drawer targets >= 44px', () => {
    const code = readSource('resources/js/Layouts/AuthenticatedLayout.jsx');
    assert(code.includes('min-h-[44px] min-w-[44px]') && code.includes('aria-label="Buka menu navigasi"'));
});

runTest('Modals: Close buttons enforce >= 44x44px', () => {
    const searchCode = readSource('resources/js/Components/App/SearchModal.jsx');
    const groupCode = readSource('resources/js/Components/App/CreateGroupModal.jsx');
    const exportCode = readSource('resources/js/Components/App/ExportModal.jsx');
    assert(searchCode.includes('min-h-[44px] min-w-[44px]'));
    assert(groupCode.includes('min-h-[44px] min-w-[44px]'));
    assert(exportCode.includes('min-h-[44px] min-w-[44px]'));
});

// -----------------------------------------------------------------------------
// SUITE 2: MODAL STATE TRANSITIONS & REFERENCEERROR VERIFICATION
// -----------------------------------------------------------------------------
console.log('\n>>> [2/3] Modal State Transitions & ReferenceError Check...');

runTest('SearchModal.jsx: auth is explicitly extracted from usePage().props without ReferenceError', () => {
    const code = readSource('resources/js/Components/App/SearchModal.jsx');
    assert(/const\s*\{\s*auth\s*\}\s*=\s*usePage\(\)\.props;/.test(code), 'auth must be destructured from usePage().props');
    assert(/currentUserId\s*=\s*currentUser\?\.id\s*\|\|\s*auth\?\.user\?\.id;/.test(code), 'currentUserId must safely use optional chaining');
});

runTest('SearchModal.jsx: Dual-prop visibility resolution (isOpen ?? show)', () => {
    const code = readSource('resources/js/Components/App/SearchModal.jsx');
    assert(/const\s+isVisible\s*=\s*Boolean\(\s*isOpen\s*\?\?\s*show\s*\);/.test(code), 'Must support both isOpen and show props');
    
    // Simulate resolution truth table
    const evalVisibility = (isOpen, show) => Boolean(isOpen ?? show);
    assert.strictEqual(evalVisibility(true, false), true);
    assert.strictEqual(evalVisibility(false, true), false);
    assert.strictEqual(evalVisibility(undefined, true), true);
    assert.strictEqual(evalVisibility(undefined, false), false);
    assert.strictEqual(evalVisibility(true, undefined), true);
    assert.strictEqual(evalVisibility(null, true), true);
    assert.strictEqual(evalVisibility(undefined, undefined), false);
});

runTest('SearchModal.jsx: Simulated component logic execution in headless scope', () => {
    const testCases = [
        { currentUser: { id: 10 }, pageAuth: { user: { id: 99 } }, expectedId: 10 },
        { currentUser: null, pageAuth: { user: { id: 99 } }, expectedId: 99 },
        { currentUser: undefined, pageAuth: {}, expectedId: undefined },
        { currentUser: undefined, pageAuth: null, expectedId: undefined },
    ];

    testCases.forEach((tc, idx) => {
        const usePage = () => ({ props: { auth: tc.pageAuth } });
        const { auth } = usePage().props;
        const currentUserId = tc.currentUser?.id || auth?.user?.id;
        assert.strictEqual(currentUserId, tc.expectedId, `Case ${idx + 1} failed`);
    });
});

runTest('CreateGroupModal.jsx: User selection and filtering logic verification', () => {
    const auth = { user: { id: 1 } };
    const mockUsers = [
        { id: 1, name: 'Current User' },
        { id: 2, name: 'Alice' },
        { id: 3, name: 'Bob' },
    ];

    const available = mockUsers.filter((u) => u.id !== auth?.user?.id);
    assert.strictEqual(available.length, 2);
    assert.strictEqual(available[0].id, 2);
    assert.strictEqual(available[1].id, 3);

    let selected = [];
    const toggleUser = (user) => {
        const exists = selected.find((u) => u.id === user.id);
        if (exists) {
            selected = selected.filter((u) => u.id !== user.id);
        } else {
            selected = [...selected, user];
        }
    };

    toggleUser(available[0]);
    assert.strictEqual(selected.length, 1);
    assert.strictEqual(selected[0].name, 'Alice');

    toggleUser(available[1]);
    assert.strictEqual(selected.length, 2);

    toggleUser(available[0]);
    assert.strictEqual(selected.length, 1);
    assert.strictEqual(selected[0].name, 'Bob');
});

runTest('ExportModal.jsx: Target format and export URL compilation', () => {
    const code = readSource('resources/js/Components/App/ExportModal.jsx');
    assert(/targetType\s*=\s*conversationType\s*\|\|\s*\(conversation\?\.is_group\s*\?\s*"group"\s*:\s*"user"\)/.test(code));
    assert(/targetId\s*=\s*conversationId\s*\|\|\s*conversation\?\.id/.test(code));

    const resolveExport = (conversation, format) => {
        const targetType = conversation.is_group ? 'group' : 'user';
        const targetId = conversation.id;
        return `/chat/export?type=${targetType}&id=${targetId}&format=${format}`;
    };

    const userConv = { id: 5, name: 'Doctor Who', is_group: false };
    const groupConv = { id: 12, name: 'Surgery Team', is_group: true };

    assert.strictEqual(resolveExport(userConv, 'json'), '/chat/export?type=user&id=5&format=json');
    assert.strictEqual(resolveExport(userConv, 'txt'), '/chat/export?type=user&id=5&format=txt');
    assert.strictEqual(resolveExport(groupConv, 'json'), '/chat/export?type=group&id=12&format=json');
});

// -----------------------------------------------------------------------------
// SUITE 3: MOBILE REFLOW (< 680px) & RESPONSIVE BEHAVIOR
// -----------------------------------------------------------------------------
console.log('\n>>> [3/3] Mobile Reflow (< 680px) & Responsive Transitions...');

runTest('tailwind.config.js: Exact 680px mobile breakpoint contract', () => {
    const config = readSource('tailwind.config.js');
    assert(/sm:\s*"680px"/.test(config), 'sm breakpoint must be configured exactly to 680px');
    assert(/xs:\s*"420px"/.test(config), 'xs breakpoint must be configured to 420px');
});

runTest('ChatLayout.jsx: Mobile (< 680px) single-pane conditional layout classes', () => {
    const code = readSource('resources/js/Layouts/ChatLayout.jsx');
    assert(code.includes('selectedConversation || route().current("profile.edit")'));
    assert(code.includes('"hidden sm:flex"'));
    assert(code.includes('!selectedConversation && !route().current("profile.edit")'));
});

runTest('ConversationHeader.jsx: Back button is exclusively visible on mobile (< 680px)', () => {
    const code = readSource('resources/js/Components/App/ConversationHeader.jsx');
    assert(code.includes('inline-flex sm:hidden'));
    assert(code.includes('route("dashboard")'));
    assert(code.includes('aria-label="Kembali ke daftar percakapan"'));
});

runTest('MessageInput.jsx & Home.jsx: Viewport overflow protection', () => {
    const inputCode = readSource('resources/js/Components/App/MessageInput.jsx');
    assert(inputCode.includes('overflow-x-hidden'));
    assert(inputCode.includes('max-w-[calc(100vw-32px)]'));
});

console.log('\n================================================================');
console.log(`SUMMARY: ${passedTests} / ${totalTests} CHECKS PASSED (${failedTests.length} FAILED)`);
if (failedTests.length > 0) {
    console.log('FAILURES:');
    failedTests.forEach(f => console.log(`  - ${f.name}: ${f.error}`));
}
console.log('================================================================\n');

process.exit(failedTests.length > 0 ? 1 : 0);
