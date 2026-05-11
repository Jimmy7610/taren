/**
 * main.js
 * Minimal JavaScript for UI enhancements.
 * Game logic is strictly forbidden here.
 */

document.addEventListener('DOMContentLoaded', () => {
    // Generate unique visuals for each placeholder card
    const visuals = document.querySelectorAll('.card-visual-inner');
    
    const colors = [
        ['#8b6cff', '#4f3e99'],
        ['#4ade80', '#14532d'],
        ['#60a5fa', '#1e3a8a'],
        ['#f472b6', '#831843'],
        ['#c084fc', '#581c87'],
        ['#2dd4bf', '#134e4a'],
        ['#fbbf24', '#78350f'],
        ['#f87171', '#7f1d1d'],
        ['#94a3b8', '#334155']
    ];

    visuals.forEach((visual, index) => {
        const [primary, secondary] = colors[index % colors.length];
        
        // Abstract gradient generation
        const angle = 45 + (index * 35) % 360;
        const xPos = 20 + (index * 15) % 60;
        const yPos = 30 + (index * 25) % 40;
        
        if (index % 3 === 0) {
            visual.style.background = `radial-gradient(circle at ${xPos}% ${yPos}%, ${primary}40, ${secondary}80, transparent)`;
        } else if (index % 3 === 1) {
            visual.style.background = `linear-gradient(${angle}deg, ${primary}30, ${secondary}90)`;
        } else {
            visual.style.background = `conic-gradient(from ${angle}deg at ${xPos}% ${yPos}%, ${primary}50, ${secondary}90, #18181b)`;
        }

        // Add CSS glowing orb effect
        const orb = document.createElement('div');
        orb.style.position = 'absolute';
        orb.style.width = '100px';
        orb.style.height = '100px';
        orb.style.borderRadius = '50%';
        orb.style.background = primary;
        orb.style.filter = 'blur(40px)';
        orb.style.opacity = '0.4';
        orb.style.top = `${yPos}%`;
        orb.style.left = `${xPos}%`;
        orb.style.transform = 'translate(-50%, -50%)';
        
        visual.appendChild(orb);
    });
});
