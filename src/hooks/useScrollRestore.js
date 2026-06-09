// hooks/useScrollRestore.js
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export function useScrollRestore(key) {
    const location = useLocation();

    // Restore on mount
    useEffect(() => {
        const saved = sessionStorage.getItem(`scroll_${key}`);
        if (!saved || parseInt(saved) === 0) return;

        let attempts = 0;
        const tryScroll = setInterval(() => {
            const targetY = parseInt(saved);
            const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
            attempts++;
            if (maxScroll >= targetY || attempts >= 20) {
                window.scrollTo({ top: targetY, behavior: 'instant' });
                sessionStorage.removeItem(`scroll_${key}`);
                clearInterval(tryScroll);
            }
        }, 50);

        return () => clearInterval(tryScroll);
    }, [location.key]);
}

export function saveScroll(key) {
    sessionStorage.setItem(`scroll_${key}`, window.scrollY.toString());
}