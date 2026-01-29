// Mock AI Service for Intent Recognition
// In production, this would call OpenAI or a local NLP model

export const analyzeIntent = async (query) => {
    if (!query) return [];

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 300));

    const lowerQuery = query.toLowerCase();

    // Mock Intent Logic
    const intents = [
        {
            keywords: ['log', 'error', 'debug', 'console'],
            action: 'NAVIGATE',
            target: '/logs',
            label: 'View System Logs',
            confidence: 0.9,
            icon: 'Terminal'
        },
        {
            keywords: ['user', 'profile', 'account', 'setting'],
            action: 'NAVIGATE',
            target: '/settings',
            label: 'User Settings',
            confidence: 0.8,
            icon: 'Settings'
        },
        {
            keywords: ['dashboard', 'home', 'main'],
            action: 'NAVIGATE',
            target: '/',
            label: 'Go to Dashboard',
            confidence: 0.95,
            icon: 'LayoutDashboard'
        },
        {
            keywords: ['backup', 'save', 'export'],
            action: 'EXECUTE',
            function: 'triggerBackup',
            label: 'Run System Backup',
            confidence: 0.7,
            icon: 'Database'
        }
    ];

    // Simple keyword matching for "AI" simulation
    const matches = intents.filter(intent =>
        intent.keywords.some(k => lowerQuery.includes(k))
    ).map(match => ({
        ...match,
        // Boost confidence if exact match
        confidence: match.keywords.includes(lowerQuery) ? 1.0 : match.confidence
    }));

    // Default Fallback
    if (matches.length === 0) {
        return [{
            action: 'SEARCH',
            target: query,
            label: `Search for "${query}"`,
            confidence: 0.5,
            icon: 'Search'
        }];
    }

    return matches.sort((a, b) => b.confidence - a.confidence);
};
