// INSTÄLLNING - Öka detta nummer med 1 innan varje push till main, så Jimmy kan se att live-sidan visar rätt version.
window.TAREN_BUILD_NUMBER = 63;

document.addEventListener('DOMContentLoaded', () => {
    const badge = document.createElement('div');
    badge.className = 'build-badge';
    badge.innerText = `Build ${window.TAREN_BUILD_NUMBER}`;
    badge.setAttribute('aria-label', 'Current Taren build number');
    badge.title = 'Current Taren build number';
    document.body.appendChild(badge);
});
