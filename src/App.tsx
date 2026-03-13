import { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AppShell } from './components/layout/AppShell';
import { strings } from './constants/strings';

// Lazy load all pages for better performance
const Home = lazy(() => import('./pages/Home').then(m => ({ default: m.Home })));
const ProjectDetail = lazy(() => import('./pages/ProjectDetail').then(m => ({ default: m.ProjectDetail })));
const PlaceholderPage = lazy(() => import('./pages/PlaceholderPage').then(m => ({ default: m.PlaceholderPage })));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard').then(m => ({ default: m.AdminDashboard })));
const ExperimentsPage = lazy(() => import('./pages/ExperimentsPage').then(m => ({ default: m.ExperimentsPage })));
const GamesHubPage = lazy(() => import('./pages/GamesHubPage').then(m => ({ default: m.GamesHubPage })));
const NeonSnakePlayPage = lazy(() => import('./pages/NeonSnakePlayPage').then(m => ({ default: m.NeonSnakePlayPage })));
const Game2048PlayPage = lazy(() => import('./pages/Game2048PlayPage').then(m => ({ default: m.Game2048PlayPage })));
const HexlinePlayPage = lazy(() => import('./pages/HexlinePlayPage').then(m => ({ default: m.HexlinePlayPage })));
const DigitalSandPage = lazy(() => import('./pages/DigitalSandPage').then(m => ({ default: m.DigitalSandPage })));
const DigitalSandPlayPage = lazy(() => import('./pages/DigitalSandPlayPage').then(m => ({ default: m.DigitalSandPlayPage })));
const VectorFieldPage = lazy(() => import('./pages/VectorFieldPage').then(m => ({ default: m.VectorFieldPage })));
const VectorFieldPlayPage = lazy(() => import('./pages/VectorFieldPlayPage').then(m => ({ default: m.VectorFieldPlayPage })));
const OrbitInkPage = lazy(() => import('./pages/OrbitInkPage').then(m => ({ default: m.OrbitInkPage })));
const OrbitInkPlayPage = lazy(() => import('./pages/OrbitInkPlayPage').then(m => ({ default: m.OrbitInkPlayPage })));
const SignalGardenPage = lazy(() => import('./pages/SignalGardenPage').then(m => ({ default: m.SignalGardenPage })));
const SignalGardenPlayPage = lazy(() => import('./pages/SignalGardenPlayPage').then(m => ({ default: m.SignalGardenPlayPage })));
const KidsHubPage = lazy(() => import('./pages/KidsHubPage').then(m => ({ default: m.KidsHubPage })));
const LetterLabPlayPage = lazy(() => import('./pages/LetterLabPlayPage').then(m => ({ default: m.LetterLabPlayPage })));
const DailyPage = lazy(() => import('./pages/DailyPage').then(m => ({ default: m.DailyPage })));
const DailyTodayPage = lazy(() => import('./pages/DailyTodayPage').then(m => ({ default: m.DailyTodayPage })));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage').then(m => ({ default: m.NotFoundPage })));

// Loading Component
const PageLoading = () => (
    <div className="flex h-[70vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent/20 border-t-accent" />
    </div>
);

// App entry point
function App() {
    return (
        <ThemeProvider>
            <Router>
                <AppShell>
                    <Suspense fallback={<PageLoading />}>
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
                            <Route path="/kids/letter-lab" element={<Navigate to="/kids/letter-lab/play" replace />} />
                            <Route path="/kids/letter-lab/play" element={<LetterLabPlayPage />} />
                            <Route path="/daily" element={<DailyPage />} />
                            <Route path="/daily/today" element={<DailyTodayPage />} />
                            <Route path="/portfolio" element={<PlaceholderPage title={strings.routes.portfolio} />} />
                            <Route path="/code" element={<PlaceholderPage title={strings.routes.code} />} />
                            <Route path="/:category/:slug" element={<ProjectDetail />} />
                            <Route path="*" element={<NotFoundPage />} />
                        </Routes>
                    </Suspense>
                </AppShell>
            </Router>
        </ThemeProvider>
    );
}

export default App;
