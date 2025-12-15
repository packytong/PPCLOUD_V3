// PP Cloud Media - JavaScript Functions

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize all functions
    initNavigation();
    initPortfolioFilter();
    initContactForm();
    initScrollEffects();
    initAnimations();
    initLazyLoading();
    initCaching();
});

// Initialize caching functionality
function initCaching() {
    // Cache frequently accessed DOM elements
    window.cache = {
        navLinks: document.querySelectorAll('.navbar-nav .nav-link[href^="#"]'),
        sections: document.querySelectorAll('section[id]'),
        filterButtons: document.querySelectorAll('[data-filter]'),
        portfolioItems: document.querySelectorAll('.portfolio-item'),
        contactForm: document.getElementById('contactForm'),
        scrollTop: document.getElementById('scrollTop'),
        navbar: document.querySelector('.navbar'),
        animatedElements: document.querySelectorAll('.service-card, .portfolio-item, .stat-box'),
        statNumbers: document.querySelectorAll('.stat-box h2'),
        phoneInput: document.getElementById('phone'),
        portfolioCards: document.querySelectorAll('.portfolio-card button')
    };
    
    // Cache location data if available
    if (typeof locationsData !== 'undefined') {
        localStorage.setItem('locationsData', JSON.stringify(locationsData));
        localStorage.setItem('locationsDataTimestamp', Date.now());
    }
    
    // Check for cached data and validate freshness (24 hours)
    const cachedTimestamp = localStorage.getItem('locationsDataTimestamp');
    if (cachedTimestamp && (Date.now() - parseInt(cachedTimestamp)) < 86400000) {
        const cachedData = localStorage.getItem('locationsData');
        if (cachedData) {
            console.log('Using cached locations data');
        }
    }
}

// Navigation functionality
function initNavigation() {
    // Smooth scrolling for navigation links
    const navLinks = window.cache.navLinks;
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            const targetSection = document.getElementById(targetId);
            
            if (targetSection) {
                const offsetTop = targetSection.offsetTop - 80;
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // Active navigation link based on scroll position
    const throttledScrollHandler = throttle(function() {
        const sections = window.cache.sections;
        const scrollY = window.pageYOffset;
        
        sections.forEach(section => {
            const sectionHeight = section.offsetHeight;
            const sectionTop = section.offsetTop - 100;
            const sectionId = section.getAttribute('id');
            
            if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
                document.querySelector('.navbar-nav .nav-link[href="#' + sectionId + '"]')?.classList.add('active');
                document.querySelector('.navbar-nav .nav-link:not([href="#' + sectionId + '"])')?.classList.remove('active');
            }
        });
    }, 100);
    
    window.addEventListener('scroll', throttledScrollHandler);
}

// Scroll to section function
function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        const offsetTop = section.offsetTop - 80;
        window.scrollTo({
            top: offsetTop,
            behavior: 'smooth'
        });
    }
}

// Portfolio filter functionality
function initPortfolioFilter() {
    const filterButtons = window.cache.filterButtons;
    const portfolioItems = window.cache.portfolioItems;
    
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remove active class from all buttons
            filterButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            const filterValue = this.getAttribute('data-filter');
            
            portfolioItems.forEach(item => {
                const itemCategory = item.getAttribute('data-category');
                
                if (filterValue === 'all' || itemCategory === filterValue) {
                    item.style.display = 'block';
                    setTimeout(() => {
                        item.style.opacity = '1';
                        item.style.transform = 'scale(1)';
                    }, 100);
                } else {
                    item.style.opacity = '0';
                    item.style.transform = 'scale(0.8)';
                    setTimeout(() => {
                        item.style.display = 'none';
                    }, 300);
                }
            });
        });
    });
}

// Contact form functionality
function initContactForm() {
    const contactForm = window.cache.contactForm;
    
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form values
            const formData = {
                name: document.getElementById('name').value,
                email: document.getElementById('email').value,
                phone: document.getElementById('phone').value,
                service: document.getElementById('service').value,
                message: document.getElementById('message').value
            };
            
            // Cache form data in sessionStorage for recovery
            sessionStorage.setItem('contactFormData', JSON.stringify(formData));
            
            // Validate form
            if (validateContactForm(formData)) {
                // Show loading state
                const submitButton = contactForm.querySelector('button[type="submit"]');
                const originalText = submitButton.innerHTML;
                submitButton.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>กำลังส่ง...';
                submitButton.disabled = true;
                
                // Simulate form submission
                setTimeout(() => {
                    // Show success modal
                    const successModal = new bootstrap.Modal(document.getElementById('successModal'));
                    successModal.show();
                    
                    // Reset form
                    contactForm.reset();
                    
                    // Clear cached form data on successful submission
                    sessionStorage.removeItem('contactFormData');
                    
                    // Reset button
                    submitButton.innerHTML = originalText;
                    submitButton.disabled = false;
                    
                    // Log form data (in real app, this would be sent to server)
                    console.log('Form submitted:', formData);
                }, 2000);
            }
        });
    }
    
    // Restore form data from sessionStorage if available
    const cachedFormData = sessionStorage.getItem('contactFormData');
    if (cachedFormData) {
        try {
            const formData = JSON.parse(cachedFormData);
            document.getElementById('name').value = formData.name || '';
            document.getElementById('email').value = formData.email || '';
            document.getElementById('phone').value = formData.phone || '';
            document.getElementById('service').value = formData.service || '';
            document.getElementById('message').value = formData.message || '';
        } catch (e) {
            console.error('Error restoring form data:', e);
        }
    }
}

// Form validation
function validateContactForm(data) {
    const errors = [];
    
    // Validate name
    if (!data.name || data.name.trim().length < 2) {
        errors.push('กรุณากรอกชื่อ-นามสกุลให้ครบถ้วน');
    }
    
    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!data.email || !emailRegex.test(data.email)) {
        errors.push('กรุณากรอกอีเมลให้ถูกต้อง');
    }
    
    // Validate phone
    const phoneRegex = /^[0-9]{9,10}$/;
    if (!data.phone || !phoneRegex.test(data.phone.replace(/[-\s]/g, ''))) {
        errors.push('กรุณากรอกเบอร์โทรศัพท์ให้ถูกต้อง');
    }
    
    // Validate message
    if (!data.message || data.message.trim().length < 10) {
        errors.push('กรุณากรอกข้อความอย่างน้อย 10 ตัวอักษร');
    }
    
    // Show errors if any
    if (errors.length > 0) {
        showValidationErrors(errors);
        return false;
    }
    
    return true;
}

// Show validation errors
function showValidationErrors(errors) {
    const errorHtml = errors.map(error => `<div class="alert alert-danger alert-dismissible fade show" role="alert">
        <i class="fas fa-exclamation-triangle me-2"></i>${error}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    </div>`).join('');
    
    // Insert errors at the top of the form
    const contactForm = document.getElementById('contactForm');
    const existingAlerts = contactForm.querySelectorAll('.alert');
    existingAlerts.forEach(alert => alert.remove());
    
    contactForm.insertAdjacentHTML('afterbegin', errorHtml);
    
    // Scroll to top of form
    contactForm.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// Scroll effects
function initScrollEffects() {
    const scrollTop = document.createElement('div');
    scrollTop.id = 'scrollTop';
    scrollTop.innerHTML = '<i class="fas fa-arrow-up"></i>';
    document.body.appendChild(scrollTop);
    
    // Cache the scroll top element
    window.cache.scrollTop = scrollTop;
    
    // Show/hide scroll to top button
    const throttledScrollHandler = throttle(function() {
        if (window.pageYOffset > 300) {
            scrollTop.classList.add('show');
        } else {
            scrollTop.classList.remove('show');
        }
        
        // Navbar background on scroll
        const navbar = window.cache.navbar;
        if (window.pageYOffset > 50) {
            navbar.style.background = 'rgba(52, 58, 64, 0.98)';
        } else {
            navbar.style.background = 'rgba(52, 58, 64, 0.95)';
        }
    }, 100);
    
    window.addEventListener('scroll', throttledScrollHandler);
    
    // Scroll to top functionality
    scrollTop.addEventListener('click', function() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

// Animation on scroll
function initAnimations() {
    const animatedElements = window.cache.animatedElements;
    
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    animatedElements.forEach(element => {
        element.style.opacity = '0';
        element.style.transform = 'translateY(30px)';
        element.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(element);
    });
}

// Lazy loading for images
function initLazyLoading() {
    const images = document.querySelectorAll('img[data-src]');
    
    const imageObserver = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                
                // Cache loaded images to avoid re-loading
                const cacheKey = `img_${img.dataset.src}`;
                const cachedSrc = sessionStorage.getItem(cacheKey);
                
                if (cachedSrc) {
                    img.src = cachedSrc;
                } else {
                    img.src = img.dataset.src;
                    sessionStorage.setItem(cacheKey, img.dataset.src);
                }
                
                img.classList.add('loaded');
                imageObserver.unobserve(img);
            }
        });
    });
    
    images.forEach(img => imageObserver.observe(img));
}

// Counter animation for statistics
function animateCounter(element, target, duration = 2000) {
    const start = 0;
    const increment = target / (duration / 16);
    let current = start;
    
    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            current = target;
            clearInterval(timer);
        }
        
        if (element.textContent.includes('+')) {
            element.textContent = Math.floor(current) + '+';
        } else if (element.textContent.includes('/')) {
            element.textContent = '24/7';
        } else {
            element.textContent = Math.floor(current);
        }
    }, 16);
}

// Initialize counter animation when stats are visible
function initCounterAnimation() {
    const statNumbers = window.cache.statNumbers;
    const observerOptions = {
        threshold: 0.5
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting && !entry.target.classList.contains('animated')) {
                entry.target.classList.add('animated');
                const text = entry.target.textContent;
                
                if (text.includes('40+')) {
                    animateCounter(entry.target, 40);
                } else if (text.includes('70+')) {
                    animateCounter(entry.target, 70);
                } else if (text.includes('1000+')) {
                    animateCounter(entry.target, 1000);
                }
            }
        });
    }, observerOptions);
    
    statNumbers.forEach(stat => observer.observe(stat));
}

// Phone number formatting
function formatPhoneNumber(input) {
    const cleaned = input.value.replace(/\D/g, '');
    const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
    
    if (match) {
        input.value = `${match[1]}-${match[2]}-${match[3]}`;
    }
}

// Add phone formatting to phone input
document.addEventListener('DOMContentLoaded', function() {
    const phoneInput = window.cache.phoneInput;
    if (phoneInput) {
        phoneInput.addEventListener('input', function() {
            formatPhoneNumber(this);
        });
    }
});

// Portfolio modal functionality
function initPortfolioModal() {
    const portfolioCards = window.cache.portfolioCards;
    
    portfolioCards.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            // In a real application, this would open a modal with project details
            console.log('Portfolio item clicked:', this.closest('.portfolio-item'));
        });
    });
}

// Initialize portfolio modal after DOM is loaded
document.addEventListener('DOMContentLoaded', initPortfolioModal);

// Initialize counter animation
document.addEventListener('DOMContentLoaded', initCounterAnimation);

// Utility functions
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// Performance optimization for scroll events
const optimizedScroll = throttle(function() {
    // Scroll-related operations
}, 100);

window.addEventListener('scroll', optimizedScroll);

// Error handling
window.addEventListener('error', function(e) {
    console.error('JavaScript Error:', e.error);
});

// Service Worker registration (for PWA functionality)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
        navigator.serviceWorker.register('/service-worker.js')
            .then(function(registration) {
                console.log('SW registered: ', registration);
                
                // Check for updates periodically
                setInterval(() => {
                    registration.update();
                }, 60 * 60 * 1000); // Check every hour
            })
            .catch(function(registrationError) {
                console.log('SW registration failed: ', registrationError);
            });
    });
    
    // Listen for controlling service worker
    let refreshing = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (refreshing) return;
        refreshing = true;
        window.location.reload();
    });
}
