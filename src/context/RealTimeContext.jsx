import React, { createContext, useContext, useEffect, useState } from 'react';

const RealTimeContext = createContext();

export const RealTimeProvider = ({ children }) => {
    const [events, setEvents] = useState([]);
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        // Mock WebSocket/SSE connection
        console.log('Initializing Real-Time Connection...');
        setIsConnected(true);

        const interval = setInterval(() => {
            // Simulate incoming event
            const newEvent = {
                id: Date.now(),
                type: 'SYSTEM_ALERT',
                message: 'New high-priority log detected.',
                timestamp: new Date().toISOString()
            };
            setEvents(prev => [newEvent, ...prev].slice(0, 50)); // Keep last 50
        }, 30000); // Every 30 seconds

        return () => {
            clearInterval(interval);
            setIsConnected(false);
            console.log('Real-Time Connection Closed.');
        };
    }, []);

    return (
        <RealTimeContext.Provider value={{ events, isConnected }}>
            {children}
        </RealTimeContext.Provider>
    );
};

export const useRealTime = () => useContext(RealTimeContext);
