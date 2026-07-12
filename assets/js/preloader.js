// Record the moment this script executes — as close as possible to when the GIF starts.
const _preloaderScriptStart = performance.now();

document.addEventListener('DOMContentLoaded', () => {
    const preloader = document.getElementById('preloader');
    const splashLogo = document.querySelector('.splash-logo-img, .splash-logo');
    const navLogo = document.querySelector('.navbar-brand .site-logo, .navbar-brand .logo-stacked');
    const mainContent = document.querySelector('.main-content');

    if (!preloader || !splashLogo || !navLogo) {
        if (preloader) preloader.style.display = 'none';
        if (mainContent) mainContent.style.opacity = '1';
        return;
    }

    navLogo.style.opacity = '0';

    // GIF active drawing animation duration: 3210ms
    const gifDuration = 3210;
    const elapsed = performance.now() - _preloaderScriptStart;
    const remaining = Math.max(0, gifDuration - elapsed);

    // Prepare the moving logo clone immediately so it's ready to animate
    const navRect = navLogo.getBoundingClientRect();
    const splashRect = splashLogo.getBoundingClientRect();

    const movingLogo = splashLogo.cloneNode(true);
    movingLogo.classList.remove('splash-logo', 'splash-logo-img');
    movingLogo.classList.add('logo-moving');

    movingLogo.style.top = splashRect.top + 'px';
    movingLogo.style.left = splashRect.left + 'px';
    movingLogo.style.width = splashRect.width + 'px';
    movingLogo.style.height = splashRect.height + 'px';
    movingLogo.style.transform = 'scale(1)';
    movingLogo.style.opacity = '0'; // invisible until animation starts
    movingLogo.style.transition = 'none';

    document.body.appendChild(movingLogo);

    // When the GIF animation completes (after 210ms total delay) — fire the slide/move transition
    setTimeout(() => {
        // Show moving logo, hide original
        splashLogo.style.visibility = 'hidden';
        splashLogo.style.opacity = '0';
        movingLogo.style.transition = '';
        movingLogo.style.opacity = '1';

        requestAnimationFrame(() => {
            movingLogo.classList.add('in-flight');

            // Get fresh navRect in case of scroll/resize
            const currentNavRect = navLogo.getBoundingClientRect();
            movingLogo.style.top = currentNavRect.top + 'px';
            movingLogo.style.left = currentNavRect.left + 'px';
            movingLogo.style.width = currentNavRect.width + 'px';
            movingLogo.style.height = currentNavRect.height + 'px';
            movingLogo.style.transform = 'scale(1)';
            movingLogo.style.transformOrigin = 'top left';

            // Slide preloader out simultaneously
            preloader.classList.add('fade-out');

            setTimeout(() => movingLogo.classList.remove('in-flight'), 500);
        });

        // After transition — show real nav logo and reveal site
        setTimeout(() => {
            document.body.classList.add('splash-done');
            if (mainContent) mainContent.classList.add('content-unveil');

            movingLogo.style.transition = 'opacity 0.3s ease';
            movingLogo.style.opacity = '0';
            navLogo.style.transition = 'opacity 0.3s ease';
            navLogo.style.opacity = '1';

            document.dispatchEvent(new CustomEvent('logoArrived'));

            setTimeout(() => {
                preloader.remove();
                movingLogo.remove();
            }, 350);
        }, 700);

    }, remaining);
});
