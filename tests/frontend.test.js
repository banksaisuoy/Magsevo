const fs = require('fs');
const path = require('path');

describe('Frontend Data Fallbacks', () => {
    let appJsContent;

    beforeAll(() => {
        appJsContent = fs.readFileSync(path.join(__dirname, '../public/js/app.js'), 'utf8');
    });

    test('Mock data structure is present in app.js', () => {
        expect(appJsContent).toContain('mockData: {');
        expect(appJsContent).toContain('videos: [');
        expect(appJsContent).toContain('categories: [');
        expect(appJsContent).toContain('comments: [');
    });

    test('Mock fallback logic exists for API methods', () => {
        expect(appJsContent).toContain('catch (error) {');
        expect(appJsContent).toContain('Mock Fallbacks');
        expect(appJsContent).toContain("if (endpoint === '/auth/login') {");
        expect(appJsContent).toContain("if (endpoint === '/videos') {");
    });
});

describe('UI/UX Refinements Check', () => {
    let appJsContent;
    let stylesCssContent;

    beforeAll(() => {
        appJsContent = fs.readFileSync(path.join(__dirname, '../public/js/app.js'), 'utf8');
        stylesCssContent = fs.readFileSync(path.join(__dirname, '../public/css/styles.css'), 'utf8');
    });

    test('Hero Section implemented', () => {
        expect(stylesCssContent).toContain('.hero-section');
        expect(appJsContent).toContain('class="hero-section');
    });

    test('Theater mode layout implemented', () => {
        expect(stylesCssContent).toContain('.theater-mode-container');
        expect(appJsContent).toContain('class="theater-mode-container"');
    });

    test('Admin page tab layout updated', () => {
        expect(appJsContent).toContain('admin-panel border-0');
        expect(appJsContent).toContain('Sidebar Tabs');
        expect(appJsContent).toContain('Admin Dashboard');
    });
});

describe('Frontend XSS Prevention', () => {
    let appJsContent;
    let appAdminJsContent;

    beforeAll(() => {
        appJsContent = fs.readFileSync(path.join(__dirname, '../public/js/app.js'), 'utf8');
        appAdminJsContent = fs.readFileSync(path.join(__dirname, '../public/js/app-admin.js'), 'utf8');
    });

    test('escapeHtml utility exists and is used in app.js', () => {
        expect(appJsContent).toContain('escapeHtml(');
        expect(appJsContent).toContain('this.escapeHtml(');
    });

    test('escapeHtml utility is used in app-admin.js', () => {
        expect(appAdminJsContent).toContain('App.escapeHtml(');
    });
});

describe('App.escapeHtml behavior check', () => {
    let escapeHtml;
    beforeAll(() => {
        const fs = require('fs');
        const path = require('path');
        const appJsContent = fs.readFileSync(path.join(__dirname, '../public/js/app.js'), 'utf8');

        const funcStr = appJsContent.substring(appJsContent.indexOf('escapeHtml('), appJsContent.indexOf('state:'));
        const body = funcStr.substring(funcStr.indexOf('{') + 1, funcStr.lastIndexOf('}')).trim();
        escapeHtml = new Function('str', body);
    });

    test('It escapes basic script tags', () => {
        expect(escapeHtml('<script>alert(1)</script>')).toBe('&lt;script&gt;alert(1)&lt;/script&gt;');
    });

    test('It escapes quotes and ampersands', () => {
        expect(escapeHtml('"test" & \'test\'')).toBe('&quot;test&quot; &amp; &#39;test&#39;');
    });

    test('It handles null or undefined properly', () => {
        expect(escapeHtml(null)).toBe('');
        expect(escapeHtml(undefined)).toBe('');
    });
});
