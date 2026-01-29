import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRealTime } from '../../context/RealTimeContext';
import { Activity, Wifi } from 'lucide-react';

const StatusIndicator = () => {
    const { isConnected, events } = useRealTime();
    const [latestEvent, setLatestEvent] = useState(null);

    useEffect(() => {
        if (events.length > 0) {
            setLatestEvent(events[0]);
            const timer = setTimeout(() => setLatestEvent(null), 5000); // Hide after 5s
            return () => clearTimeout(timer);
        }
    }, [events]);

    return (
        <div className="fixed bottom-6 left-6 z-50 flex flex-col items-start gap-2 font-sans pointer-events-none">
            {/* Connection Status */}
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full backdrop-blur-md border border-white/5 transition-colors duration-500 ${isConnected ? 'bg-cyan-950/30 text-cyan-400' : 'bg-red-950/30 text-red-400'}`}>
                <Wifi className={`w-3 h-3 ${isConnected ? 'animate-pulse' : ''}`} />
                <span className="text-xs font-medium tracking-wider uppercase">
                    {isConnected ? 'System Online' : 'Disconnected'}
                </span>
            </div>

            {/* Live Event Notification */}
            <AnimatePresence>
                {latestEvent && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, x: -20 }}
                        animate={{ opacity: 1, y: 0, x: 0 }}
                        exit={{ opacity: 0, y: 20, scale: 0.9 }}
                        className="flex items-center gap-3 px-4 py-3 rounded-lg bg-[#0d1117]/90 border border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.15)] backdrop-blur-xl"
                    >
                        <div className="relative flex h-8 w-8 items-center justify-center rounded-md bg-cyan-500/20">
                            <Activity className="w-4 h-4 text-cyan-400" />
                            <span className="absolute -top-1 -right-1 flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
                            </span>
                        </div>
                        <div>
                            <h4 className="text-sm font-semibold text-cyan-50">New Event Detected</h4>
                            <p className="text-xs text-cyan-200/70">{latestEvent.message}</p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default StatusIndicator;
