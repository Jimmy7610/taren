import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AppShell } from './components/layout/AppShell';
import { Home } from './pages/Home';
import { GamesIndex } from './pages/GamesIndex';
import { SnakeGame } from './pages/SnakeGame';
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
                        <Route path="/games" element={<GamesIndex />} />
                        <Route path="/games/snake" element={<SnakeGame />} />
                        <Route path="/music" element={<PlaceholderPage title={strings.routes.music} />} />
                        <Route path="/videos" element={<PlaceholderPage title={strings.routes.videos} />} />
                        <Route path="/portfolio" element={<PlaceholderPage title={strings.routes.portfolio} />} />
                        <Route path="/code" element={<PlaceholderPage title={strings.routes.code} />} />
                        <Route path="/:category/:slug" element={<ProjectDetail />} />
                    </Routes>
                </AppShell>
            </Router>
        </ThemeProvider>
    );
}

export default App;
