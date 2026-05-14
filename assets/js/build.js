// INSTÄLLNING - Öka detta nummer med 1 innan varje push till main, så Jimmy kan se att live-sidan visar rätt version.
window.TAREN_BUILD_NUMBER = 122;

document.addEventListener('DOMContentLoaded', () => {
    // Hidden build meta for developer inspection (F12)
    const meta = document.createElement('meta');
    meta.name = 'taren-build';
    meta.content = window.TAREN_BUILD_NUMBER;
    document.head.appendChild(meta);
    
    // Also add as an HTML comment at the end of body for easy source viewing
    const comment = document.createComment(` Taren build: ${window.TAREN_BUILD_NUMBER} `);
    document.body.appendChild(comment);
});
