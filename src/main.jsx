import React from 'react';
import { createRoot } from 'react-dom/client';
import MagsevoApp from './App';

const rootElement = document.getElementById('magsevo-root');

if (rootElement) {
    const root = createRoot(rootElement);
    root.render(
        <React.StrictMode>
            <MagsevoApp />
        </React.StrictMode>
    );
} else {
    console.error('Magsevo root element not found!');
}
