// MedCompanion Website - Interactive Features

// Smooth scroll for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Fade in elements on scroll
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('fade-in-up');
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

// Observe all feature cards, pricing cards, and FAQ items
document.querySelectorAll('.feature-card, .pricing-card, .faq-item, .step').forEach(el => {
    observer.observe(el);
});

// Add active state to navigation on scroll
let sections = document.querySelectorAll('section[id]');
let navLinks = document.querySelectorAll('.nav-links a');

window.addEventListener('scroll', () => {
    let current = '';

    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        if (scrollY >= (sectionTop - 200)) {
            current = section.getAttribute('id');
        }
    });

    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href').slice(1) === current) {
            link.classList.add('active');
        }
    });
});

// Add parallax effect to hero section
window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const hero = document.querySelector('.hero');
    if (hero) {
        hero.style.transform = `translateY(${scrolled * 0.5}px)`;
        hero.style.opacity = 1 - (scrolled / 600);
    }
});

// Animate progress ring
const animateProgressRing = () => {
    const ring = document.querySelector('.progress-ring circle:last-child');
    if (ring) {
        const circumference = 2 * Math.PI * 35; // r = 35
        const progress = 0.85; // 85%
        const offset = circumference - (progress * circumference);

        ring.style.strokeDasharray = circumference;
        ring.style.strokeDashoffset = circumference;

        setTimeout(() => {
            ring.style.transition = 'stroke-dashoffset 1.5s ease-in-out';
            ring.style.strokeDashoffset = offset;
        }, 500);
    }
};

// Run animation when page loads
window.addEventListener('load', animateProgressRing);

// Add hover effect to glass cards
document.querySelectorAll('.glass-card').forEach(card => {
    card.addEventListener('mouseenter', function () {
        this.style.transform = 'translateY(-8px) scale(1.02)';
    });

    card.addEventListener('mouseleave', function () {
        this.style.transform = 'translateY(0) scale(1)';
    });
});

// Mobile menu toggle (if needed)
const createMobileMenu = () => {
    const nav = document.querySelector('.nav');
    const navLinks = document.querySelector('.nav-links');

    if (window.innerWidth <= 968) {
        const menuButton = document.createElement('button');
        menuButton.className = 'mobile-menu-button';
        menuButton.innerHTML = '☰';
        menuButton.style.cssText = `
            background: none;
            border: none;
            font-size: 1.5rem;
            cursor: pointer;
            color: var(--dark-gray);
        `;

        menuButton.addEventListener('click', () => {
            navLinks.style.display = navLinks.style.display === 'flex' ? 'none' : 'flex';
            navLinks.style.flexDirection = 'column';
            navLinks.style.position = 'absolute';
            navLinks.style.top = '100%';
            navLinks.style.left = '0';
            navLinks.style.right = '0';
            navLinks.style.background = 'rgba(255, 255, 255, 0.95)';
            navLinks.style.padding = '1rem';
            navLinks.style.borderRadius = 'var(--radius-standard)';
            navLinks.style.marginTop = '1rem';
        });

        if (!document.querySelector('.mobile-menu-button')) {
            nav.querySelector('.nav-container').insertBefore(menuButton, navLinks);
        }
    }
};

window.addEventListener('resize', createMobileMenu);
createMobileMenu();

// Add typing effect to hero title (optional)
const typeWriter = (element, text, speed = 50) => {
    let i = 0;
    element.innerHTML = '';

    function type() {
        if (i < text.length) {
            element.innerHTML += text.charAt(i);
            i++;
            setTimeout(type, speed);
        }
    }

    type();
};

// Uncomment to enable typing effect
// window.addEventListener('load', () => {
//     const heroTitle = document.querySelector('.hero-title');
//     if (heroTitle) {
//         const text = heroTitle.textContent;
//         typeWriter(heroTitle, text, 30);
//     }
// });

// Add floating animation to phone mockup
const floatAnimation = () => {
    const phone = document.querySelector('.phone-mockup');
    if (phone) {
        let position = 0;
        let direction = 1;

        setInterval(() => {
            position += direction * 0.5;
            if (position >= 10 || position <= -10) {
                direction *= -1;
            }
            phone.style.transform = `translateY(${position}px)`;
        }, 50);
    }
};

window.addEventListener('load', floatAnimation);

// Track button clicks (for analytics)
document.querySelectorAll('.btn').forEach(button => {
    button.addEventListener('click', function (e) {
        const buttonText = this.textContent.trim();
        console.log(`Button clicked: ${buttonText}`);

        // Add your analytics tracking here
        // Example: gtag('event', 'click', { button_name: buttonText });
    });
});

// Add gradient animation to gradient text
const animateGradient = () => {
    const gradientText = document.querySelector('.gradient-text');
    if (gradientText) {
        let hue = 0;
        setInterval(() => {
            hue = (hue + 1) % 360;
            gradientText.style.background = `linear-gradient(135deg, 
                hsl(${hue}, 70%, 60%) 0%, 
                hsl(${(hue + 60) % 360}, 70%, 60%) 100%)`;
            gradientText.style.webkitBackgroundClip = 'text';
            gradientText.style.webkitTextFillColor = 'transparent';
        }, 50);
    }
};

// Uncomment to enable gradient animation
// window.addEventListener('load', animateGradient);

console.log('MedCompanion website loaded! 💊');
