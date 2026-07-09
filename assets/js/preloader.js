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

    // Hide navbar logo initially to prevent duplication during transition
    navLogo.style.opacity = '0';

    // Wait for the splash entrance animation to finish + hold time
    setTimeout(() => {
        // Calculate the destination (navbar logo position)
        const navRect = navLogo.getBoundingClientRect();
        const splashRect = splashLogo.getBoundingClientRect();

        // Create a clone for the transition animation
        const movingLogo = splashLogo.cloneNode(true);
        movingLogo.classList.remove('splash-logo', 'splash-logo-img');
        movingLogo.classList.add('logo-moving');

        // Initial state (centered as it appears in splash)
        movingLogo.style.top = splashRect.top + 'px';
        movingLogo.style.left = splashRect.left + 'px';
        movingLogo.style.width = splashRect.width + 'px';
        movingLogo.style.height = splashRect.height + 'px';
        movingLogo.style.transform = 'scale(1)';

        document.body.appendChild(movingLogo);

        // Hide the original splash logo completely to avoid duplication
        splashLogo.style.visibility = 'hidden';
        splashLogo.style.opacity = '0';

        // Trigger transition to navbar position after a short delay
        setTimeout(() => {
            requestAnimationFrame(() => {
                movingLogo.classList.add('in-flight');

                movingLogo.style.top = navRect.top + 'px';
                movingLogo.style.left = navRect.left + 'px';
                movingLogo.style.width = navRect.width + 'px';
                movingLogo.style.height = navRect.height + 'px';
                movingLogo.style.transform = 'scale(1)';
                movingLogo.style.transformOrigin = 'top left';

                // Slide the preloader out to the left simultaneously
                setTimeout(() => {
                    preloader.classList.add('fade-out');
                }, 200);

                // Remove in-flight blur just before logo arrives
                setTimeout(() => {
                    movingLogo.classList.remove('in-flight');
                }, 900);
            });
        }, 50);

        // After transition finishes — show real nav logo and reveal site
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
        }, 1200);

    }, 4000);
});
