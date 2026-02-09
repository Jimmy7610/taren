import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AppShell } from './components/layout/AppShell';
import { Home } from './pages/Home';
import { ProjectDetail } from './pages/ProjectDetail';
import { PlaceholderPage } from './pages/PlaceholderPage';
import { strings } from './constants/strings';

function App() {
    return (
        <ThemeProvider>
            <Router>
                <AppShell>
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/:category/:slug" element={<ProjectDetail />} />
                        <Route path="/games" element={<PlaceholderPage title={strings.routes.games} />} />
                        <Route path="/experiments" element={<PlaceholderPage title={strings.routes.experiments} />} />
                        <Route path="/music" element={<PlaceholderPage title={strings.routes.music} />} />
                        <Route path="/video" element={<PlaceholderPage title={strings.routes.video} />} />
                        <Route path="/sketches" element={<PlaceholderPage title={strings.routes.sketches} />} />
                        <Route path="/texts" element={<PlaceholderPage title={strings.routes.texts} />} />
                        <Route path="/now" element={<PlaceholderPage title={strings.routes.now} />} />
                    </Routes>
                </AppShell>
            </Router>
        </ThemeProvider>
    );
}

export default App;
