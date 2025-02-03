import React from 'react';
import { createRoot } from 'react-dom/client';
import OnboardingForm from './components/OnboardingForm';

document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('onboarding-root');
    
    if (container) {
        const root = createRoot(container);
        root.render(
            <React.StrictMode>
                <OnboardingForm />
            </React.StrictMode>
        );
    }
});