import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AppShell } from './components/layout/AppShell';
import { Home } from './pages/Home';
import { GamesIndex } from './pages/GamesIndex';
import { SnakeGame } from './pages/SnakeGame';
import { Game2048Page } from './pages/Game2048Page';
import { ProjectDetail } from './pages/ProjectDetail';
import { PlaceholderPage } from './pages/PlaceholderPage';
import { AdminDashboard } from './pages/AdminDashboard';
import { strings } from './constants/strings';

// App entry point
function App() {
    return (
        <ThemeProvider>
            <Router>
                <AppShell>
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/admin" element={<AdminDashboard />} />
                        <Route path="/games" element={<GamesIndex />} />
                        <Route path="/games/snake" element={<SnakeGame />} />
                        <Route path="/games/2048" element={<Game2048Page />} />
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
