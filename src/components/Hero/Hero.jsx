import React from 'react';
import { motion } from 'framer-motion';

const Hero = () => {
    return (
        <div className="relative w-full h-[600px] overflow-hidden bg-black flex items-center justify-center">
            {/* Mesh Gradient Background */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_#1a2e3a_0%,_#0d1117_100%)] opacity-80" />

            {/* Animated Orbs/Glows */}
            <motion.div
                animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.3, 0.5, 0.3],
                    x: [0, 50, 0],
                    y: [0, -30, 0]
                }}
                transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-[100px]"
            />
            <motion.div
                animate={{
                    scale: [1, 1.3, 1],
                    opacity: [0.2, 0.4, 0.2],
                    x: [0, -40, 0],
                    y: [0, 40, 0]
                }}
                transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 2 }}
                className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-blue-600/20 rounded-full blur-[100px]"
            />

            {/* Content */}
            <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                >
                    <h1 className="text-5xl md:text-7xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 mb-6 tracking-tight drop-shadow-[0_0_15px_rgba(6,182,212,0.5)]">
                        Magsevo Core
                    </h1>
                    <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto font-light leading-relaxed">
                        Next-Generation Video Management System powered by AI-driven analytics and real-time monitoring.
                    </p>

                    <div className="flex flex-wrap gap-4 justify-center">
                        <button
                            className="px-8 py-3 bg-cyan-500 hover:bg-cyan-400 text-black font-bold rounded-full transition-all shadow-[0_0_20px_rgba(6,182,212,0.4)] hover:shadow-[0_0_30px_rgba(6,182,212,0.6)]"
                            onClick={() => {
                                // Scroll to content
                                document.getElementById('filter-bar')?.scrollIntoView({ behavior: 'smooth' });
                            }}
                        >
                            Explore Library
                        </button>
                        <button
                            className="px-8 py-3 bg-white/5 hover:bg-white/10 text-white font-semibold rounded-full border border-white/10 backdrop-blur-md transition-all hover:border-cyan-500/50"
                            onClick={() => {
                                // Trigger command palette
                                window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true }));
                            }}
                        >
                            <span className="mr-2">Command Center</span>
                            <kbd className="bg-white/10 px-2 py-0.5 rounded text-xs text-gray-400">⌘K</kbd>
                        </button>
                    </div>
                </motion.div>
            </div>

            {/* Grid Overlay for Texture */}
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay pointer-events-none" />
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,black,transparent)] pointer-events-none" />
        </div>
    );
};

export default Hero;
