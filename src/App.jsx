import React from 'react';
import { CommandPaletteProvider } from './context/CommandPaletteContext';
import { RealTimeProvider } from './context/RealTimeContext';
import Omnibar from './components/Omnibar/Omnibar';
import StatusIndicator from './components/StatusIndicator/StatusIndicator';
import Hero from './components/Hero/Hero';
import BentoGrid from './components/Dashboard/BentoGrid';

// This is the root component that wraps the application with necessary contexts
// It renders the Omnibar, Hero, and Bento Grid
const MagsevoApp = () => {
    return (
        <RealTimeProvider>
            <CommandPaletteProvider>
                <div className="magsevo-app-root">
                    <Omnibar />
                    <StatusIndicator />

                    {/* Only render Hero/Bento if we are on the home page */}
                    {/* Check if #magsevo-root is in the right place, typically top of main */}
                    <Hero />
                    <BentoGrid />
                </div>
            </CommandPaletteProvider>
        </RealTimeProvider>
    );
};

export default MagsevoApp;
