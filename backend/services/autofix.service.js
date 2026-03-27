const fs = require('fs');
const path = require('path');
const { addLog } = require('./audit.service');
const { generate } = require('./gemini.service');
const { MODELS } = require('../config/gemini.config');

/**
 * Generate fix code using Gemini AI
 */
const generateFix = async (fileContent, issue, filename) => {
    try {
        const prompt = `
You are an expert code fixer. Given the following code and issue, provide ONLY the fixed code without any explanation.

File: ${filename}
Issue: ${issue.title}
Type: ${issue.type}
Severity: ${issue.priority}

Original Code:
\`\`\`
${fileContent}
\`\`\`

Issue Details: ${issue.description || 'N/A'}

Provide ONLY the corrected code in a code block. Do not add explanations or markdown formatting outside the code block.
`;

        const response = await generate(prompt, MODELS.FAST);
        
        // Extract code from response
        const codeMatch = response.match(/\`\`\`[\w]*\n([\s\S]*?)\n\`\`\`/) || 
                         response.match(/\`\`\`([\s\S]*?)\`\`\`/);
        
        const fixedCode = codeMatch ? codeMatch[1] : response;
        
        return { success: true, fixedCode };
    } catch (err) {
        addLog({ action: 'FIX_GENERATION_FAILED', error: err.message });
        console.error('Fix generation failed:', err);
        return { success: false, error: err.message };
    }
};

/**
 * Apply fix to a specific file at a line
 */
const applyLineRangeFix = async (filePath, issue, fileContent) => {
    try {
        const lines = fileContent.split('\n');
        const startLine = (issue.line || 1) - 1;
        
        // Generate the fix for the problematic line/section
        const fixResult = await generateFix(fileContent, issue, path.basename(filePath));
        
        if (!fixResult.success) {
            return { success: false, error: fixResult.error };
        }
        
        // Replace the entire file with fixed version for safety
        const fixedContent = fixResult.fixedCode;
        
        fs.writeFileSync(filePath, fixedContent, 'utf8');
        addLog({ 
            action: 'FIX_APPLIED', 
            file: filePath, 
            issue: issue.title,
            line: issue.line 
        });
        
        return { success: true, appliedAt: issue.line };
    } catch (err) {
        addLog({ action: 'FIX_APPLICATION_FAILED', file: filePath, error: err.message });
        console.error('Fix application failed:', err);
        return { success: false, error: err.message };
    }
};

/**
 * Auto-fix specific issues in files
 */
const autoFixIssues = async (tasks, repoPath) => {
    const results = [];
    
    for (const task of tasks) {
        try {
            const filePath = path.join(repoPath, task.file);
            
            // Check if file exists
            if (!fs.existsSync(filePath)) {
                addLog({ action: 'FILE_NOT_FOUND', file: task.file });
                results.push({ ...task, fixed: false, reason: 'File not found' });
                continue;
            }
            
            // Read file content
            const fileContent = fs.readFileSync(filePath, 'utf8');
            
            // Apply fix based on task type
            let fixResult;
            
            if (task.type === 'CODE_SMELL' && task.title.includes('Remove console.log')) {
                // Simple fix: remove console.log
                const fixedContent = fileContent.split('\n')
                    .filter(line => !line.includes('console.log'))
                    .join('\n');
                
                fs.writeFileSync(filePath, fixedContent, 'utf8');
                fixResult = { success: true };
                
            } else if (task.type === 'QUALITY') {
                // Use AI to fix
                fixResult = await applyLineRangeFix(filePath, task, fileContent);
            } else {
                fixResult = await applyLineRangeFix(filePath, task, fileContent);
            }
            
            if (fixResult.success) {
                results.push({ ...task, fixed: true });
                task.status = 'FIXED';
            } else {
                results.push({ ...task, fixed: false, reason: fixResult.error });
                task.status = 'FIX_FAILED';
            }
        } catch (err) {
            addLog({ action: 'ISSUE_FIX_ERROR', task: task.title, error: err.message });
            results.push({ ...task, fixed: false, reason: err.message });
        }
    }
    
    return results;
};

/**
 * Verify fixes by analyzing fixed code
 */
const verifyFixes = async (filePath) => {
    try {
        if (!fs.existsSync(filePath)) {
            return { success: false, error: 'File not found' };
        }
        
        const content = fs.readFileSync(filePath, 'utf8');
        const prompt = `
Verify the quality of the following code. Check for:
- Syntax errors
- Logic issues
- Best practices violations

Respond in JSON format:
{
  "isValid": true/false,
  "issues": ["issue1", "issue2"],
  "verdict": "PASS/FAIL"
}

Code:
${content}
`;
        
        const response = await generate(prompt, MODELS.FAST);
        const result = JSON.parse(response);
        
        addLog({ 
            action: 'VERIFICATION_COMPLETE', 
            file: filePath, 
            verdict: result.verdict 
        });
        
        return { success: true, ...result };
    } catch (err) {
        addLog({ action: 'VERIFICATION_FAILED', error: err.message });
        return { success: false, error: err.message };
    }
};

module.exports = {
    generateFix,
    applyLineRangeFix,
    autoFixIssues,
    verifyFixes
};
