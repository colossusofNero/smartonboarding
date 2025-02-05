import React from 'react';
import { createRoot } from 'react-dom/client';
import OnboardingForm from './components/OnboardingForm';

const container = document.getElementById('onboarding-root');

if (container) {
    const root = createRoot(container);
    root.render(
        <React.StrictMode>
            <div className="min-h-screen bg-gray-50 p-4">
                <OnboardingForm />
            </div>
        </React.StrictMode>
    );
} else {
    console.error('Could not find onboarding-root element');
}