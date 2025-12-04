// ============================================
// QUIZ APP STATE MANAGEMENT
// ============================================

const appState = {
    currentPage: 'landing',
    currentQuestion: 0,
    answers: {},
    quizData: [
        {
            id: 'business-type',
            question: 'First, what type of business do you run?',
            options: [
                { value: 'ecommerce', label: 'E-commerce / Online Store' },
                { value: 'service', label: 'Service-Based Business' },
                { value: 'coaching', label: 'Coaching / Consulting' },
                { value: 'agency', label: 'Marketing / Creative Agency' },
                { value: 'other', label: 'Other' }
            ]
        },
        {
            id: 'lead-volume',
            question: 'How many leads do you generate per month?',
            options: [
                { value: 'low', label: 'Less than 50 leads' },
                { value: 'medium', label: '50-200 leads' },
                { value: 'high', label: '200-500 leads' },
                { value: 'very-high', label: '500+ leads' }
            ]
        },
        {
            id: 'challenge',
            question: 'What\'s your biggest challenge right now?',
            options: [
                { value: 'lead-gen', label: 'Generating enough leads' },
                { value: 'follow-up', label: 'Following up with leads consistently' },
                { value: 'conversion', label: 'Converting leads into customers' },
                { value: 'time', label: 'Not enough time for everything' }
            ]
        },
        {
            id: 'crm-usage',
            question: 'Do you currently use a CRM?',
            options: [
                { value: 'none', label: 'No CRM - I use spreadsheets or notes' },
                { value: 'basic', label: 'Yes, a basic CRM' },
                { value: 'advanced', label: 'Yes, an advanced CRM (like Synoriya)' },
                { value: 'switching', label: 'Looking to switch CRMs' }
            ]
        },
        {
            id: 'revenue-goal',
            question: 'What\'s your monthly revenue goal?',
            options: [
                { value: 'starter', label: 'Under $10K/month' },
                { value: 'growing', label: '$10K - $50K/month' },
                { value: 'scaling', label: '$50K - $100K/month' },
                { value: 'enterprise', label: '$100K+/month' }
            ]
        }
    ]
};

// ============================================
// DOM ELEMENTS
// ============================================

const screens = {
    landing: document.getElementById('landing-screen'),
    quiz: document.getElementById('quiz-screen'),
    booking: document.getElementById('booking-screen')
};

const elements = {
    getStartedBtn: document.getElementById('get-started-btn'),
    questionContainer: document.getElementById('question-container'),
    progressDots: document.querySelectorAll('.progress-dot'),
    personalizedBenefit: document.getElementById('personalized-benefit')
};

// ============================================
// INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    console.log('Synoriya Landing Page loaded! 🚀');

    // Add keyboard support for quiz options
    addKeyboardSupport();

    // Check if we're coming from the call examples page
    if (sessionStorage.getItem('startQuizFromCallExamples') === 'true') {
        // Clear the flag so it doesn't trigger again on refresh
        sessionStorage.removeItem('startQuizFromCallExamples');

        // Small delay to ensure all elements are properly loaded
        setTimeout(() => {
            // Start the quiz
            trackEvent('quiz_started_from_call_examples');
            showScreen('quiz');
            renderQuestion(0);

            // Scroll to the quiz section
            const quizSection = document.getElementById('quiz-screen');
            if (quizSection) {
                quizSection.scrollIntoView({ behavior: 'smooth' });
            }
        }, 100);
    }
});

// ============================================
// KEYBOARD ACCESSIBILITY
// ============================================

function addKeyboardSupport() {
    // Handle Enter/Space on quiz options
    document.addEventListener('keydown', (e) => {
        if (e.target.classList.contains('option-card')) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                e.target.click();
            }
        }
    });

    // Make option cards focusable
    document.addEventListener('DOMSubtreeModified', () => {
        const optionCards = document.querySelectorAll('.option-card');
        optionCards.forEach(card => {
            if (!card.hasAttribute('tabindex')) {
                card.setAttribute('tabindex', '0');
            }
        });
    });
}

// ============================================
// ANALYTICS TRACKING (WITH CONSENT CHECK)
// ============================================

function trackEvent(eventName, eventParams = {}) {
    // Only track if user has given consent
    if (window.CookieConsent && window.CookieConsent.hasConsent('analytics')) {
        if (typeof gtag === 'function') {
            gtag('event', eventName, eventParams);
        }
    }
}

// ============================================
// SCREEN NAVIGATION
// ============================================

function showScreen(screenName) {
    // Fade out current screen
    const currentScreen = document.querySelector('.screen.active');
    if (currentScreen) {
        currentScreen.classList.add('fade-out');
        setTimeout(() => {
            currentScreen.classList.remove('active', 'fade-out');
        }, 300);
    }

    // Fade in new screen
    setTimeout(() => {
        screens[screenName].classList.add('active');
        appState.currentPage = screenName;

        // Track screen view
        trackEvent('screen_view', {
            screen_name: screenName
        });

        // Move focus to main content
        const mainContent = document.getElementById('main-content');
        if (mainContent) {
            mainContent.focus();
        }
    }, 300);
}

// ============================================
// QUIZ FUNCTIONALITY
// ============================================

function renderQuestion(index) {
    const question = appState.quizData[index];

    const questionHTML = `
        <div class="question">
            <h3 class="question-text">${question.question}</h3>
            <div class="options">
                ${question.options.map(option => `
                    <div class="option-card" data-value="${option.value}" tabindex="0" role="button" aria-label="${option.label}">
                        ${option.label}
                    </div>
                `).join('')}
            </div>
        </div>
    `;

    elements.questionContainer.innerHTML = questionHTML;

    // Add click handlers to options
    const optionCards = elements.questionContainer.querySelectorAll('.option-card');
    optionCards.forEach(card => {
        card.addEventListener('click', () => handleOptionClick(card, question.id));
    });

    // Update progress indicator
    updateProgress(index);
}

function handleOptionClick(card, questionId) {
    // Store answer
    appState.answers[questionId] = card.dataset.value;

    // Track quiz answer
    trackEvent('quiz_answer', {
        question_id: questionId,
        answer: card.dataset.value,
        question_number: appState.currentQuestion + 1
    });

    // Visual feedback
    const allCards = card.parentElement.querySelectorAll('.option-card');
    allCards.forEach(c => c.classList.remove('selected'));
    card.classList.add('selected');

    // Move to next question after delay
    setTimeout(() => {
        appState.currentQuestion++;

        if (appState.currentQuestion < appState.quizData.length) {
            renderQuestion(appState.currentQuestion);
        } else {
            // Track quiz completion
            trackEvent('quiz_completed', {
                total_questions: appState.quizData.length
            });
            showBookingScreen();
        }
    }, 400);
}

function updateProgress(index) {
    elements.progressDots.forEach((dot, i) => {
        if (i <= index) {
            dot.classList.add('active');
        } else {
            dot.classList.remove('active');
        }
    });

    // Update ARIA attributes
    const progressBar = document.querySelector('.progress-indicator');
    if (progressBar) {
        progressBar.setAttribute('aria-valuenow', index + 1);
    }
}

// ============================================
// BOOKING SCREEN PERSONALIZATION
// ============================================

function showBookingScreen() {
    // Personalize the benefit message based on their biggest challenge
    const challenge = appState.answers['challenge'];
    let benefit = 'transform your business';

    switch (challenge) {
        case 'lead-gen':
            benefit = 'generate more qualified leads automatically';
            break;
        case 'follow-up':
            benefit = 'automate your follow-ups and never miss a lead';
            break;
        case 'conversion':
            benefit = 'boost your conversion rates with smart automation';
            break;
        case 'time':
            benefit = 'save 10+ hours per week with automation';
            break;
    }

    elements.personalizedBenefit.textContent = benefit;

    // Show booking screen
    showScreen('booking');

    // Track booking page view
    trackEvent('booking_page_view', {
        challenge: challenge
    });

    //Load Calendly (with consent check)
    setTimeout(() => {
        loadCalendly();
    }, 500); // Small delay to ensure screen is visible

    // Store answers in localStorage (essential functionality - no consent needed)
    try {
        localStorage.setItem('quiz_answers', JSON.stringify(appState.answers));
    } catch (e) {
        console.error('Could not save quiz answers:', e);
    }
}

// ============================================
// CALENDLY INTEGRATION (CONSENT-PROTECTED)
// ============================================

function loadCalendly() {
    // Only load if we have consent for analytics/marketing cookies
    if (window.CookieConsent && window.CookieConsent.hasConsent('analytics')) {
        const bookingEmbed = document.getElementById('booking-embed');
        const placeholder = document.getElementById('calendly-placeholder');

        if (bookingEmbed && placeholder) {
            // Remove placeholder
            placeholder.remove();

            // Create Calendly widget
            const calendlyWidget = document.createElement('div');
            calendlyWidget.className = 'calendly-inline-widget';
            calendlyWidget.setAttribute('data-url', 'https://calendly.com/abdelalissa78/30min');
            calendlyWidget.style.minWidth = '320px';
            calendlyWidget.style.height = '700px';
            bookingEmbed.appendChild(calendlyWidget);

            // Load Calendly script
            const script = document.createElement('script');
            script.type = 'text/javascript';
            script.src = 'https://assets.calendly.com/assets/external/widget.js';
            script.async = true;
            document.body.appendChild(script);

            console.log('✅ Calendly loaded with consent');
        }
    } else {
        // Show message asking for consent
        const bookingEmbed = document.getElementById('booking-embed');
        if (bookingEmbed) {
            bookingEmbed.innerHTML = `
                <div style="padding: var(--space-xl); text-align: center; background: var(--card-bg); border: 1px solid var(--border-color); border-radius: 16px;">
                    <p style="color: var(--text-secondary); margin-bottom: var(--space-md); font-size: var(--font-body);">
                        📅 To view the booking calendar, please accept cookies.
                    </p>
                    <p style="color: var(--text-muted); font-size: var(--font-small);">
                        We use Calendly to manage appointments. Accepting cookies allows us to load the booking widget.
                    </p>
                </div>
            `;
        }
    }
}

// ============================================
// EVENT LISTENERS
// ============================================

// Get Started button
elements.getStartedBtn.addEventListener('click', () => {
    trackEvent('quiz_started');
    showScreen('quiz');
    renderQuestion(0);
});

// Error handling for Calendly
window.addEventListener('error', (e) => {
    if (e.message && e.message.includes('calendly')) {
        console.error('Calendly failed to load');
        const bookingEmbed = document.getElementById('booking-embed');
        if (bookingEmbed) {
            bookingEmbed.innerHTML = `
                <div style="padding: var(--space-lg); text-align: center; background: var(--card-bg); border-radius: 12px;">
                    <p style="color: var(--text-secondary); margin-bottom: var(--space-sm);">
                        The booking calendar could not be loaded.
                    </p>
                    <p style="color: var(--text-muted); font-size: var(--font-small);">
                        Please contact us directly or try again later.
                    </p>
                </div>
            `;
        }
    }
}, true);
