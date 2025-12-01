// Scroll Reveal Animation - All Devices
(function() {
    // Configuration
    const revealConfig = {
        threshold: 0.15, // Trigger when 15% of element is visible
        rootMargin: '0px 0px -50px 0px' // Trigger slightly before element enters viewport
    };

    // Create intersection observer
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
                // Optionally unobserve after revealing (one-time animation)
                observer.unobserve(entry.target);
            }
        });
    }, revealConfig);

    // Function to add scroll reveal to elements
    function initScrollReveal() {
        // Add scroll-reveal class to major sections and elements
        const selectors = [
            '#one .col-6',           // About section columns
            '#two .col-6',           // Skills section columns
            '#resume .timeline-block', // Resume timeline items
            '#resume .timeline-block1',
            '#three .col-4',         // Project cards
            '#four',                 // Contact section
            '.resume-header'         // Section headers
        ];

        selectors.forEach(selector => {
            const elements = document.querySelectorAll(selector);
            elements.forEach(element => {
                element.classList.add('scroll-reveal');
                observer.observe(element);
            });
        });
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initScrollReveal);
    } else {
        initScrollReveal();
    }

    // Re-initialize on window resize if viewport changes to/from mobile
    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            const isMobile = window.innerWidth <= 736;
            if (isMobile && !document.querySelector('.scroll-reveal')) {
                initScrollReveal();
            }
        }, 250);
    });
})();

