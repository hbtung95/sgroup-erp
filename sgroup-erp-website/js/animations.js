// ============================================
// Premium Animations System
// Buttery smooth scroll reveals & interactions
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    // 1. Setup Elements for Reveal
    // Add .reveal class to items we want to animate
    const setupRevealElements = () => {
        // Sections
        document.querySelectorAll('.section-header').forEach(el => el.classList.add('reveal-up'));
        
        // Cards with stagger effect
        const grids = document.querySelectorAll('.grid');
        grids.forEach(grid => {
            const cards = grid.querySelectorAll('.card');
            cards.forEach((card, index) => {
                card.classList.add('reveal-up');
                card.style.transitionDelay = `${index * 100}ms`; // Staggered delay
            });
        });

        // Mermaid, SOPs, Data Models, Tech Stack
        document.querySelectorAll('.mermaid-wrap, .sop-card, .data-card, .tech-card').forEach(el => {
            el.classList.add('reveal-up');
        });
    };

    // 2. Intersection Observer
    const observeElements = () => {
        const observerOptions = {
            root: null,
            rootMargin: '0px 0px -10% 0px', // Trigger slightly before it comes into view
            threshold: 0.1
        };

        const observer = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('revealed');
                    
                    // Trigger counters if it's the stats row
                    if (entry.target.classList.contains('stats-row')) {
                        startCounters();
                    }
                    
                    observer.unobserve(entry.target); // Only animate once
                }
            });
        }, observerOptions);

        document.querySelectorAll('.reveal-up, .stats-row').forEach(el => {
            observer.observe(el);
        });
    };

    // 3. Counter Animation (Smooth ease-out)
    const outQuad = (t) => t * (2 - t);
    const startCounters = () => {
        const stats = document.querySelectorAll('.stat-val');
        
        stats.forEach(stat => {
            const target = parseInt(stat.getAttribute('data-count'));
            const suffix = stat.getAttribute('data-suffix') || '';
            const duration = 2000; // 2 seconds
            let start = null;

            const step = (timestamp) => {
                if (!start) start = timestamp;
                const progress = timestamp - start;
                const percentage = Math.min(progress / duration, 1);
                
                // Pure ease out formula
                const easedProgress = Math.min(outQuad(percentage), 1);
                const current = Math.floor(easedProgress * target);
                
                stat.innerHTML = current + suffix;
                
                if (progress < duration) {
                    window.requestAnimationFrame(step);
                } else {
                    stat.innerHTML = target + suffix; // ensure exact final value
                }
            };
            window.requestAnimationFrame(step);
        });
    };

    // Add necessary CSS to the head for these animations so we don't have to wait for CSS files
    const animationStyles = document.createElement('style');
    animationStyles.textContent = `
        .reveal-up {
            opacity: 0;
            transform: translateY(30px);
            filter: blur(10px);
            transition: opacity 0.8s cubic-bezier(0.2, 0.8, 0.2, 1), transform 0.8s cubic-bezier(0.2, 0.8, 0.2, 1), filter 0.8s cubic-bezier(0.2, 0.8, 0.2, 1);
            will-change: opacity, transform, filter;
        }
        .reveal-up.revealed {
            opacity: 1;
            transform: translateY(0);
            filter: blur(0);
        }
    `;
    document.head.appendChild(animationStyles);

    // 4. Stat Cards Interaction
    const setupStatCards = () => {
        const statCards = document.querySelectorAll('.stat-card');
        statCards.forEach(card => {
            card.addEventListener('mouseenter', () => {
                statCards.forEach(c => c.classList.remove('active'));
                card.classList.add('active');
            });
        });
    };

    // Initialize
    setupRevealElements();
    setupStatCards();
    
    // Slight delay so initial load isn't janky
    setTimeout(observeElements, 100);
});
