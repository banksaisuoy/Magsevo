import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCommandPalette } from '../../hooks/useCommandPalette';
import { analyzeIntent } from '../../services/aiService';
import { Search, Terminal, Settings, LayoutDashboard, Database, ArrowRight, Command } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Utility for Tailwind class merging
function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const Omnibar = () => {
    const { isOpen, close, query, setQuery } = useCommandPalette();
    const [suggestions, setSuggestions] = useState([]);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const inputRef = useRef(null);

    // Focus input on open
    useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isOpen]);

    // Handle AI Intent Analysis
    useEffect(() => {
        if (!query) {
            setSuggestions([]);
            return;
        }

        const fetchIntents = async () => {
            setIsAnalyzing(true);
            try {
                const results = await analyzeIntent(query);
                setSuggestions(results);
                setSelectedIndex(0);
            } finally {
                setIsAnalyzing(false);
            }
        };

        const debounceTimer = setTimeout(fetchIntents, 300);
        return () => clearTimeout(debounceTimer);
    }, [query]);

    // Keyboard Navigation
    const handleKeyDown = (e) => {
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setSelectedIndex(prev => (prev + 1) % suggestions.length);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setSelectedIndex(prev => (prev - 1 + suggestions.length) % suggestions.length);
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (suggestions[selectedIndex]) {
                handleAction(suggestions[selectedIndex]);
            }
        }
    };

    const handleAction = (action) => {
        console.log('Executing:', action);
        close();

        if (action.action === 'NAVIGATE' && action.target) {
            if (action.target === '/') {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            } else if (action.target === '/settings') {
                if (window.MagsevoLegacy?.openSettings) {
                    window.MagsevoLegacy.openSettings();
                } else {
                    // Fallback
                    document.getElementById('admin-settings')?.click();
                }
            } else if (action.target === '/logs') {
                if (window.MagsevoLegacy?.openReports) {
                    window.MagsevoLegacy.openReports();
                } else {
                    document.getElementById('admin-view-reports')?.click();
                }
            } else {
                window.location.href = action.target;
            }
        } else if (action.action === 'EXECUTE') {
            if (action.function === 'triggerBackup') {
                if (window.MagsevoLegacy?.triggerBackup) {
                    window.MagsevoLegacy.triggerBackup();
                } else {
                    const btn = document.querySelector('[data-legacy-module="backup-system"]');
                    if (btn) btn.click();
                }
            }
        } else {
            // Generic fallback
            // Maybe search the video gallery?
            const searchBar = document.getElementById('search-bar');
            if (searchBar) {
                searchBar.value = query;
                searchBar.dispatchEvent(new Event('input'));
                // Scroll to gallery
                document.getElementById('video-gallery')?.scrollIntoView({ behavior: 'smooth' });
            }
        }
    };

    // Icon Mapping
    const getIcon = (iconName) => {
        const icons = { Search, Terminal, Settings, LayoutDashboard, Database };
        const IconComponent = icons[iconName] || Search;
        return <IconComponent className="w-5 h-5" />;
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[20vh] px-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={close}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -20 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        className="relative w-full max-w-2xl overflow-hidden rounded-2xl border border-white/10 bg-[#0d1117]/80 shadow-2xl backdrop-blur-xl ring-1 ring-white/10"
                    >
                        {/* Search Input */}
                        <div className="relative flex items-center border-b border-white/10 px-4 py-4">
                            <Command className="w-5 h-5 text-cyan-400 mr-3 animate-pulse" />
                            <input
                                ref={inputRef}
                                type="text"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="Ask Magsevo..."
                                className="flex-1 bg-transparent text-lg text-white placeholder-gray-500 focus:outline-none"
                            />
                            {isAnalyzing && (
                                <div className="absolute right-4 top-4">
                                    <div className="w-5 h-5 border-2 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin" />
                                </div>
                            )}
                        </div>

                        {/* Suggestions List */}
                        <div className="max-h-[60vh] overflow-y-auto py-2">
                            {suggestions.length === 0 && query && !isAnalyzing ? (
                                <div className="px-4 py-8 text-center text-gray-500">
                                    No commands found for "{query}"
                                </div>
                            ) : suggestions.length === 0 && !query ? (
                                <div className="px-4 py-8 text-center text-gray-500 text-sm">
                                    Try "Show error logs" or "Go to settings"
                                </div>
                            ) : (
                                <ul className="px-2">
                                    {suggestions.map((item, index) => (
                                        <li
                                            key={index}
                                            onClick={() => handleAction(item)}
                                            onMouseEnter={() => setSelectedIndex(index)}
                                            className={cn(
                                                "group flex cursor-pointer items-center justify-between rounded-xl px-4 py-3 transition-all duration-200",
                                                index === selectedIndex
                                                    ? "bg-white/5 shadow-inner"
                                                    : "hover:bg-white/5"
                                            )}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className={cn(
                                                    "flex h-10 w-10 items-center justify-center rounded-lg transition-colors",
                                                    index === selectedIndex ? "bg-cyan-500/20 text-cyan-400" : "bg-white/5 text-gray-400"
                                                )}>
                                                    {getIcon(item.icon)}
                                                </div>
                                                <div>
                                                    <h4 className={cn(
                                                        "font-medium transition-colors",
                                                        index === selectedIndex ? "text-cyan-50" : "text-gray-300"
                                                    )}>
                                                        {item.label}
                                                    </h4>
                                                    <p className="text-xs text-gray-500">
                                                        {item.action} • Confidence: {(item.confidence * 100).toFixed(0)}%
                                                    </p>
                                                </div>
                                            </div>
                                            {index === selectedIndex && (
                                                <ArrowRight className="w-4 h-4 text-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="border-t border-white/10 px-4 py-2 bg-white/5">
                            <div className="flex justify-between items-center text-xs text-gray-500">
                                <div className="flex gap-3">
                                    <span><kbd className="bg-white/10 px-1.5 py-0.5 rounded text-gray-300">↵</kbd> to select</span>
                                    <span><kbd className="bg-white/10 px-1.5 py-0.5 rounded text-gray-300">↑↓</kbd> to navigate</span>
                                    <span><kbd className="bg-white/10 px-1.5 py-0.5 rounded text-gray-300">esc</kbd> to close</span>
                                </div>
                                <div className="text-cyan-500/50">Magsevo AI Core v1.0</div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default Omnibar;
