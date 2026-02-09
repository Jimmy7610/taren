import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from './state/theme';
import { LanguageProvider } from './state/language';
import AppRoutes from './routes';
import './styles/globals.css';

const App = () => {
    return (
        <ThemeProvider>
            <LanguageProvider>
                <BrowserRouter>
                    <AppRoutes />
                </BrowserRouter>
            </LanguageProvider>
        </ThemeProvider>
    );
};

export default App;
