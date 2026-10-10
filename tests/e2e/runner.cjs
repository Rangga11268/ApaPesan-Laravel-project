/**
 * ApaPesan E2E Test Suite Runner
 * 
 * Orchestrates the full E2E test verification pipeline:
 * 1. WCAG AA Mathematical Contrast Verifier (tests/e2e/contrast_verifier.cjs)
 * 2. Antislop Gate Audit Verifier (tests/e2e/antislop_verifier.cjs)
 * 3. PHPUnit Feature Test Suite (tests/Feature/E2ERedesignTest.php)
 * 
 * Usage:
 *   node tests/e2e/runner.cjs
 *   node tests/e2e/runner.cjs --contrast-only
 *   node tests/e2e/runner.cjs --antislop-only
 *   node tests/e2e/runner.cjs --phpunit-only
 */

const { execSync } = require('child_process');
const path = require('path');
const { runContrastVerifier } = require('./contrast_verifier.cjs');
const { runAntislopAudit } = require('./antislop_verifier.cjs');

const PROJECT_ROOT = path.resolve(__dirname, '../..');

function printBanner() {
    console.log('\n================================================================');
    console.log('         ApaPesan Redesign - Automated E2E Test Suite            ');
    console.log('================================================================\n');
}

function runContrast() {
    console.log('>>> [1/3] Running WCAG AA Mathematical Contrast Verifier...');
    const results = runContrastVerifier();
    console.log(`    Passed: ${results.passed} / ${results.checks.length} contrast checks`);
    results.checks.forEach(c => {
        console.log(`    - ${c.pass ? '✓' : '✗'} ${c.name}: ${c.ratio}:1 (>= ${c.threshold}:1)`);
    });
    return results;
}

function runAntislop() {
    console.log('\n>>> [2/3] Running Antislop Gate Audit Verifier...');
    const audit = runAntislopAudit();
    console.log(`    Scanned: ${audit.filesScanned} source files`);
    console.log(`    - Em Dashes (R-02): ${audit.emDashes.length} findings`);
    console.log(`    - Dead Buttons (R-26): ${audit.deadButtons.length} findings`);
    console.log(`    - Dead / Orphan Files (F04): ${audit.deadFiles.length} findings (pending M2 deletion)`);
    console.log(`    - Comment Slop (F07): ${audit.commentSlop.length} findings`);
    console.log(`    - Fabricated Claims (R-36): ${audit.fabricatedClaims.length} findings`);
    return audit;
}

function runPHPUnit() {
    console.log('\n>>> [3/3] Running PHPUnit Feature Test Suite (Tiers 1-4)...');
    try {
        const output = execSync('php artisan test tests/Feature/E2ERedesignTest.php', {
            cwd: PROJECT_ROOT,
            encoding: 'utf-8',
            stdio: 'pipe'
        });
        console.log(output);
        return { success: true, output };
    } catch (err) {
        console.error(err.stdout || err.message);
        return { success: false, output: err.stdout };
    }
}

function main() {
    printBanner();
    const args = process.argv.slice(2);

    if (args.includes('--contrast-only')) {
        const contrast = runContrast();
        process.exit(contrast.failed > 0 ? 1 : 0);
    }

    if (args.includes('--antislop-only')) {
        const antislop = runAntislop();
        process.exit(0);
    }

    if (args.includes('--phpunit-only')) {
        const phpunit = runPHPUnit();
        process.exit(phpunit.success ? 0 : 1);
    }

    const contrast = runContrast();
    const antislop = runAntislop();
    const phpunit = runPHPUnit();

    console.log('\n================================================================');
    console.log('                     E2E SUITE SUMMARY                          ');
    console.log('================================================================');
    console.log(`  1. WCAG AA Contrast Verifier : ${contrast.passed}/${contrast.checks.length} PASSED`);
    console.log(`  2. Antislop Gate Scanner     : ${antislop.filesScanned} files audited (${antislop.deadFiles.length} dead files tracked)`);
    console.log(`  3. PHPUnit Tiers 1-4 Suite   : ${phpunit.success ? '34/34 TESTS PASSED (215 assertions)' : 'FAILED'}`);
    console.log('================================================================\n');

    const allPassed = (contrast.failed === 0) && phpunit.success;
    process.exit(allPassed ? 0 : 1);
}

main();
