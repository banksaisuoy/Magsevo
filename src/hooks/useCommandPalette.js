import { useCommandPaletteContext } from '../context/CommandPaletteContext';

export const useCommandPalette = () => {
    const {
        isOpen,
        openPalette,
        closePalette,
        query,
        setQuery,
        actions,
        setActions
    } = useCommandPaletteContext();

    const registerAction = (action) => {
        setActions(prev => [...prev, action]);
    };

    return {
        isOpen,
        open: openPalette,
        close: closePalette,
        query,
        setQuery,
        registerAction,
        actions
    };
};
