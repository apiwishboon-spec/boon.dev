document.addEventListener('DOMContentLoaded', () => {
    console.log("Mission Control: Systems Online.");

    // 0. Space Theme: Celestial Assets
    const hero = document.getElementById('hero');
    if (hero) {
        // Add Nebulas
        ['nebula-1', 'nebula-2', 'nebula-3'].forEach(n => {
            const deb = document.createElement('div');
            deb.className = `nebula ${n}`;
            hero.appendChild(deb);
        });

        // Add Floating Planets
        const planets = ['planet-saturn', 'planet-mars'];
        planets.forEach((p, i) => {
            const planet = document.createElement('div');
            planet.className = `celestial-body ${p}`;
            planet.style.left = (20 + i * 50) + '%';
            planet.style.top = (30 + i * 20) + '%';
            planet.style.animation = `float ${15 + i * 5}s ease-in-out infinite`;
            hero.appendChild(planet);
        });
    }

    // 0. Space Theme: Starfield & Dust Generation
    const generateDust = (container, count) => {
        if (!container) return;
        for (let i = 0; i < count; i++) {
            const dust = document.createElement('div');
            dust.className = 'dust-particle';
            const size = Math.random() * 3 + 1 + 'px';
            dust.style.width = size;
            dust.style.height = size;
            dust.style.left = Math.random() * 100 + '%';
            dust.style.top = Math.random() * 100 + '%';
            dust.style.setProperty('--duration', Math.random() * 20 + 10 + 's');
            container.appendChild(dust);
        }
    };

    const starfield = document.getElementById('starfield');
    const dustContainer = document.getElementById('cosmic-dust');

    if (starfield) {
        for (let i = 0; i < 150; i++) {
            const star = document.createElement('div');
            star.className = 'star';
            const size = Math.random() * 2 + 1 + 'px';
            star.style.width = size;
            star.style.height = size;
            star.style.left = Math.random() * 100 + '%';
            star.style.top = Math.random() * 100 + '%';
            star.style.setProperty('--duration', Math.random() * 3 + 2 + 's');
            starfield.appendChild(star);
        }
    }

    generateDust(document.getElementById('cosmic-dust'), 80);

    // 0. Code Theme: Typewriter Effect
    const typewriter = document.getElementById('typewriter');
    if (typewriter) {
        const text = typewriter.getAttribute('data-text');
        let i = 0;
        function type() {
            if (i < text.length) {
                typewriter.textContent += text.charAt(i);
                i++;
                setTimeout(type, 50);
            }
        }
        // Start typing after a short delay
        setTimeout(() => {
            typewriter.style.opacity = '1';
            type();
        }, 1200);
    }

    // 4. Hide Science Decorations when in Hero
    const scienceDecor = document.querySelector('.science-decorations');
    const heroSection = document.getElementById('hero');
    if (scienceDecor && heroSection) {
        const heroObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    scienceDecor.style.opacity = '0';
                    scienceDecor.style.visibility = 'hidden';
                } else {
                    scienceDecor.style.opacity = '1';
                    scienceDecor.style.visibility = 'visible';
                }
            });
        }, { threshold: 0.1 });
        heroObserver.observe(heroSection);
    }

    // 1. Intersection Observer for Scroll Reveals
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.15
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');

                if (entry.target.classList.contains('stagger-container')) {
                    const children = entry.target.querySelectorAll('.stagger-item');
                    children.forEach((child, index) => {
                        setTimeout(() => {
                            child.classList.add('active');
                        }, index * 100);
                    });
                }
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    const revealElements = document.querySelectorAll('.scroll-reveal');
    revealElements.forEach(el => observer.observe(el));

    // Also observe individual stagger items for simplicity
    document.querySelectorAll('.stagger-item').forEach(item => observer.observe(item));

    // 2. 3D Tilt Effect REMOVED based on user feedback
    // The cards will now use simple CSS hover effects defined in styles.css

    // 3. Parallax & Scroll Logic
    const shapes = document.querySelectorAll('.shape');
    const rotateItems = document.querySelectorAll('.rotate-on-scroll');
    let lastScrollY = window.scrollY;
    let ticking = false;

    function updateScroll() {
        const scrollY = window.scrollY;

        // Parallax for Hero Shapes
        shapes.forEach((shape, index) => {
            const speed = (index + 1) * 0.15;
            shape.style.transform = `translateY(${scrollY * speed}px) rotate(${scrollY * 0.02}deg)`;
        });

        // Rotate specific elements based on scroll
        rotateItems.forEach(item => {
            // Simple rotation based on scroll position
            item.style.transform = `perspective(1000px) rotateY(${scrollY * 0.1}deg)`;
        });

        lastScrollY = scrollY;
        ticking = false;
    }

    window.addEventListener('scroll', () => {
        if (!ticking) {
            window.requestAnimationFrame(updateScroll);
            ticking = true;
        }
    });

    // 5. Voyager Easter Egg Interaction
    const voyager = document.getElementById('voyage-trigger');
    if (voyager) {
        let tapCount = 0;
        let lastTapTime = 0;
        const RESET_TIME = 3000; // 3 seconds
        const REQUIRED_TAPS = 7;

        voyager.addEventListener('pointerdown', (e) => {
            const currentTime = Date.now();

            // Check if we need to reset the count
            if (currentTime - lastTapTime > RESET_TIME) {
                tapCount = 0;
            }

            tapCount++;
            lastTapTime = currentTime;

            // Micro-feedback: Visual tap
            voyager.classList.add('probe-tap');
            setTimeout(() => voyager.classList.remove('probe-tap'), 200);

            // Progress feedback: Vibrate more as we get closer
            if (tapCount >= REQUIRED_TAPS - 2 && tapCount < REQUIRED_TAPS) {
                voyager.classList.add('probe-vibrate');
            }

            if (tapCount >= REQUIRED_TAPS) {
                // SUCCESS: Redirect to secret
                voyager.style.transition = 'all 1s ease-in';
                voyager.style.transform = 'scale(2) rotate(20deg) translateY(-100vh)';
                voyager.style.opacity = '0';

                setTimeout(() => {
                    window.location.href = 'secret.html';
                }, 800);
            }
        });
    }

    // 6. Dynamic Prizes Loading
    const prizesContainer = document.getElementById('prizes-container');
    if (prizesContainer) {
        fetch('prizes.json')
            .then(response => response.json())
            .then(data => {
                data.forEach((prize, index) => {
                    const extraClass = index === 0 ? ' featured-achievement' : '';
                    const badgeTitle = prize.badge.title ? `title="${prize.badge.title}"` : '';

                    const cardHtml = `
                        <div class="col-md-4 stagger-item">
                            <div class="card shadow-soft border-0 h-100 project-card${extraClass}">
                                <div class="card-body text-center p-4">
                                    <div class="certificate-frame archive mx-auto" style="transform: rotate(${prize.rotation});">
                                        <div class="certificate-inner">
                                            <img src="${prize.image}" alt="${prize.alt}" class="img-fluid d-block mx-auto">
                                        </div>
                                        <div class="certificate-pin ${prize.pin}"></div>
                                    </div>
                                    <h3 class="h5 fw-bold mt-3">${prize.title}</h3>
                                    <p class="text-muted small">${prize.description}</p>
                                    <span class="badge ${prize.badge.classes}" ${badgeTitle}>
                                        <i class="${prize.badge.icon} me-1"></i> ${prize.badge.text}
                                    </span>
                                </div>
                            </div>
                        </div>
                    `;
                    prizesContainer.insertAdjacentHTML('beforeend', cardHtml);
                });

                // Observe the new items to trigger fade-in animations if we have the generic observer
                if (typeof observer !== 'undefined') {
                    prizesContainer.querySelectorAll('.stagger-item').forEach(item => observer.observe(item));
                }
            })
            .catch(error => console.error('Error loading prizes:', error));
    }
});
