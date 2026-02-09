import React from 'react';
import { Routes, Route } from 'react-router-dom';
import AppShell from './shell/AppShell';
import Home from './pages/Home';
import About from './pages/About';
import { Play, Experiments, NotFound } from './pages/Placeholders';

const AppRoutes = () => {
    return (
        <Routes>
            <Route element={<AppShell />}>
                <Route path="/" element={<Home />} />
                <Route path="/about" element={<About />} />
                <Route path="/play" element={<Play />} />
                <Route path="/experiments" element={<Experiments />} />
                <Route path="/sketches" element={<NotFound />} />
                <Route path="/texts" element={<NotFound />} />
                <Route path="/now" element={<NotFound />} />
                <Route path="*" element={<NotFound />} />
            </Route>
        </Routes>
    );
};

export default AppRoutes;
