/**
 * Antislop Gate Verifier
 * 
 * Verifies Antislop Delivery Gate compliance across ApaPesan codebase:
 * 1. Rule R-02: Zero em dashes (—) in UI copy (excluding documentation carve-outs)
 * 2. Rule R-26: Zero dead button handlers (interactive buttons without actions or TODO labels)
 * 3. Feature F04: Zero dead or orphaned files (MessagaAttachments.jsx, Welcome.jsx, NavLink.jsx, ResponsiveNavLink.jsx)
 * 4. Feature F07: Zero comment slop (workflow narration, step numbers, ASCII banners)
 * 5. Rule R-36: Zero fabricated security or trust claims
 */

const fs = require('fs');
const path = require('path');

const PROJECT_ROOT = path.resolve(__dirname, '../..');

function walkDir(dir, filterExts = ['.jsx', '.js', '.php', '.blade.php']) {
    let files = [];
    if (!fs.existsSync(dir)) return files;
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            if (entry.name === 'node_modules' || entry.name === 'vendor' || entry.name === '.git' || entry.name === '.agents') {
                continue;
            }
            files = files.concat(walkDir(fullPath, filterExts));
        } else if (entry.isFile()) {
            const ext = path.extname(entry.name);
            if (filterExts.includes(ext)) {
                files.push(fullPath);
            }
        }
    }
    return files;
}

// 1. Em dash scanner
function checkEmDashes(files) {
    const findings = [];
    const EM_DASH_REGEX = /\u2014|—/;

    for (const file of files) {
        // Skip test files, skills, and documentation
        if (file.includes('tests') || file.includes('SKILL.md') || file.includes('.agents')) {
            continue;
        }

        const content = fs.readFileSync(file, 'utf-8');
        const lines = content.split('\n');
        lines.forEach((line, idx) => {
            if (EM_DASH_REGEX.test(line)) {
                // Check carve-out: rule citations or documentation headers
                if (line.includes('R-02') || line.includes('R-') || line.includes('antislop')) {
                    return;
                }
                findings.push({
                    file: path.relative(PROJECT_ROOT, file),
                    line: idx + 1,
                    snippet: line.trim()
                });
            }
        });
    }

    return findings;
}

// 2. Dead button scanner
function checkDeadButtons(jsxFiles) {
    const findings = [];
    // Match <button ...> where there is no onClick, no type="submit", and no form action
    for (const file of jsxFiles) {
        if (file.includes('tests')) continue;
        const content = fs.readFileSync(file, 'utf-8');
        const lines = content.split('\n');
        
        lines.forEach((line, idx) => {
            // Simplistic check for <button without onClick, type="submit", type="reset"
            if (/<button\b[^>]*>/i.test(line)) {
                const isSubmit = /type=["']submit["']/i.test(line);
                const isReset = /type=["']reset["']/i.test(line);
                const hasOnClick = /onClick\s*=/i.test(line);
                const hasForm = /form\s*=/i.test(line);
                const hasTodo = /\/\/\s*TODO/i.test(line);
                
                // If single line button tag has neither
                if (!isSubmit && !isReset && !hasOnClick && !hasForm && !hasTodo && line.includes('</button>')) {
                    findings.push({
                        file: path.relative(PROJECT_ROOT, file),
                        line: idx + 1,
                        snippet: line.trim()
                    });
                }
            }
        });
    }

    return findings;
}

// 3. Dead files scanner
function checkDeadFiles() {
    const deadFiles = [
        'resources/js/Components/App/MessagaAttachments.jsx',
        'resources/js/Pages/Welcome.jsx',
        'resources/js/Components/NavLink.jsx',
        'resources/js/Components/ResponsiveNavLink.jsx'
    ];

    const findings = [];
    for (const relPath of deadFiles) {
        const fullPath = path.join(PROJECT_ROOT, relPath);
        if (fs.existsSync(fullPath)) {
            findings.push({
                file: relPath,
                exists: true
            });
        }
    }

    return findings;
}

// 4. Comment slop scanner
function checkCommentSlop(files) {
    const findings = [];
    const SLOP_PATTERNS = [
        { name: 'Workflow narration step', regex: /\/\/\s*Step\s*\d+:/i },
        { name: 'ASCII decorative banner', regex: /\/\*+\s*={4,}|\/\/+\s*={4,}|\/\/+\s*-{6,}/ },
        { name: 'Laravel empty stub comments', regex: /\/\*\*\s*\*\s*Show the form for creating a new resource\./ },
        { name: 'Laravel empty stub store', regex: /\/\*\*\s*\*\s*Store a newly created resource in storage\./ },
        { name: 'Redundant narration', regex: /\/\/\s*Here we handle the\b/i }
    ];

    for (const file of files) {
        if (file.includes('tests') || file.includes('.agents')) continue;
        const content = fs.readFileSync(file, 'utf-8');
        const lines = content.split('\n');

        lines.forEach((line, idx) => {
            for (const p of SLOP_PATTERNS) {
                if (p.regex.test(line)) {
                    findings.push({
                        file: path.relative(PROJECT_ROOT, file),
                        line: idx + 1,
                        type: p.name,
                        snippet: line.trim()
                    });
                    break;
                }
            }
        });
    }

    return findings;
}

// 5. Fabricated claims scanner
function checkFabricatedClaims(files) {
    const findings = [];
    const CLAIM_PATTERNS = [
        /Aman\s*&\s*Terpercaya\s*-\s*Data\s*Anda\s*dilindungi/i,
        /10K\+\s*Users/i,
        /99\.9%\s*Uptime/i,
        /SOC\s*2\s*compliant/i,
        /ISO\s*27001/i
    ];

    for (const file of files) {
        if (file.includes('tests') || file.includes('.agents')) continue;
        const content = fs.readFileSync(file, 'utf-8');
        const lines = content.split('\n');

        lines.forEach((line, idx) => {
            for (const regex of CLAIM_PATTERNS) {
                if (regex.test(line)) {
                    findings.push({
                        file: path.relative(PROJECT_ROOT, file),
                        line: idx + 1,
                        snippet: line.trim()
                    });
                    break;
                }
            }
        });
    }

    return findings;
}

function runAntislopAudit() {
    const jsFiles = walkDir(path.join(PROJECT_ROOT, 'resources/js'), ['.jsx', '.js']);
    const phpFiles = walkDir(path.join(PROJECT_ROOT, 'app'), ['.php']);
    const allFiles = [...jsFiles, ...phpFiles];

    const emDashes = checkEmDashes(jsFiles);
    const deadButtons = checkDeadButtons(jsFiles);
    const deadFiles = checkDeadFiles();
    const commentSlop = checkCommentSlop(allFiles);
    const fabricatedClaims = checkFabricatedClaims(jsFiles);

    const totalViolations = emDashes.length + deadButtons.length + deadFiles.length + commentSlop.length + fabricatedClaims.length;

    return {
        emDashes,
        deadButtons,
        deadFiles,
        commentSlop,
        fabricatedClaims,
        totalViolations,
        filesScanned: allFiles.length
    };
}

if (require.main === module) {
    console.log('====================================================');
    console.log('             ANTISLOP GATE AUDIT REPORT              ');
    console.log('====================================================');

    const audit = runAntislopAudit();
    console.log(`Files scanned: ${audit.filesScanned}`);
    console.log('----------------------------------------------------');

    console.log(`1. Em Dashes (R-02): ${audit.emDashes.length} findings`);
    audit.emDashes.forEach(f => console.log(`   - ${f.file}:${f.line} -> "${f.snippet}"`));

    console.log(`2. Dead Buttons (R-26): ${audit.deadButtons.length} findings`);
    audit.deadButtons.forEach(f => console.log(`   - ${f.file}:${f.line} -> "${f.snippet}"`));

    console.log(`3. Dead / Orphan Files (F04): ${audit.deadFiles.length} findings`);
    audit.deadFiles.forEach(f => console.log(`   - ${f.file} (pending deletion by M2)`));

    console.log(`4. Comment Slop (F07): ${audit.commentSlop.length} findings`);
    audit.commentSlop.forEach(f => console.log(`   - ${f.file}:${f.line} [${f.type}] -> "${f.snippet}"`));

    console.log(`5. Fabricated Claims (R-36): ${audit.fabricatedClaims.length} findings`);
    audit.fabricatedClaims.forEach(f => console.log(`   - ${f.file}:${f.line} -> "${f.snippet}"`));

    console.log('====================================================');
    console.log(`Total Antislop Findings: ${audit.totalViolations}`);
    console.log('Status: Scanner executed cleanly and produced complete audit log.');
    console.log('====================================================');

    const isStrict = process.argv.includes('--strict');
    if (isStrict && audit.totalViolations > 0) {
        process.exit(1);
    } else {
        process.exit(0);
    }
}

module.exports = {
    checkEmDashes,
    checkDeadButtons,
    checkDeadFiles,
    checkCommentSlop,
    checkFabricatedClaims,
    runAntislopAudit
};
