import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AppShell } from './components/layout/AppShell';
import { Home } from './pages/Home';
import { ProjectDetail } from './pages/ProjectDetail';
import { PlaceholderPage } from './pages/PlaceholderPage';
import { AdminDashboard } from './pages/AdminDashboard';
import { ExperimentsPage } from './pages/ExperimentsPage';
import { GamesHubPage } from './pages/GamesHubPage';
import { NeonSnakePlayPage } from './pages/NeonSnakePlayPage';
import { Game2048PlayPage } from './pages/Game2048PlayPage';
import { HexlinePlayPage } from './pages/HexlinePlayPage';
import { DigitalSandPage } from './pages/DigitalSandPage';
import { DigitalSandPlayPage } from './pages/DigitalSandPlayPage';
import { VectorFieldPage } from './pages/VectorFieldPage';
import { VectorFieldPlayPage } from './pages/VectorFieldPlayPage';
import { OrbitInkPage } from './pages/OrbitInkPage';
import { OrbitInkPlayPage } from './pages/OrbitInkPlayPage';
import { SignalGardenPage } from './pages/SignalGardenPage';
import { SignalGardenPlayPage } from './pages/SignalGardenPlayPage';
import { KidsHubPage } from './pages/KidsHubPage';
import { LetterLabPlayPage } from './pages/LetterLabPlayPage';
import { DailyPage } from './pages/DailyPage';
import { DailyTodayPage } from './pages/DailyTodayPage';
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
                        <Route path="/games" element={<GamesHubPage />} />
                        <Route path="/games/neon-snake" element={<Navigate to="/games/neon-snake/play" replace />} />
                        <Route path="/games/neon-snake/play" element={<NeonSnakePlayPage />} />
                        <Route path="/games/2048" element={<Navigate to="/games/2048/play" replace />} />
                        <Route path="/games/2048/play" element={<Game2048PlayPage />} />
                        <Route path="/games/hexline/play" element={<HexlinePlayPage />} />
                        <Route path="/experiments" element={<ExperimentsPage />} />
                        <Route path="/experiments/digital-sand" element={<DigitalSandPage />} />
                        <Route path="/experiments/digital-sand/play" element={<DigitalSandPlayPage />} />
                        <Route path="/experiments/vector-field" element={<VectorFieldPage />} />
                        <Route path="/experiments/vector-field/play" element={<VectorFieldPlayPage />} />
                        <Route path="/experiments/orbit-ink" element={<OrbitInkPage />} />
                        <Route path="/experiments/orbit-ink/play" element={<OrbitInkPlayPage />} />
                        <Route path="/experiments/signal-garden" element={<SignalGardenPage />} />
                        <Route path="/experiments/signal-garden/play" element={<SignalGardenPlayPage />} />
                        <Route path="/kids" element={<KidsHubPage />} />
                        <Route path="/kids/letter-lab" element={<LetterLabPlayPage />} />
                        <Route path="/kids/letter-lab/play" element={<LetterLabPlayPage />} />
                        <Route path="/daily" element={<DailyPage />} />
                        <Route path="/daily/today" element={<DailyTodayPage />} />
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
