import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const CommandPaletteContext = createContext();

export const CommandPaletteProvider = ({ children }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [actions, setActions] = useState([]); // List of available commands/actions

    const togglePalette = useCallback(() => setIsOpen(prev => !prev), []);
    const openPalette = useCallback(() => setIsOpen(true), []);
    const closePalette = useCallback(() => {
        setIsOpen(false);
        setQuery(''); // Reset query on close
    }, []);

    // Keyboard shortcut listener (Cmd+K / Ctrl+K)
    useEffect(() => {
        const handleKeyDown = (e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                togglePalette();
            }
            if (e.key === 'Escape' && isOpen) {
                closePalette();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, togglePalette, closePalette]);

    const value = {
        isOpen,
        query,
        setQuery,
        openPalette,
        closePalette,
        actions,
        setActions
    };

    return (
        <CommandPaletteContext.Provider value={value}>
            {children}
        </CommandPaletteContext.Provider>
    );
};

export const useCommandPaletteContext = () => {
    const context = useContext(CommandPaletteContext);
    if (!context) {
        throw new Error('useCommandPaletteContext must be used within a CommandPaletteProvider');
    }
    return context;
};
