// ============================================
// CALL DEMOS PAGE
// Tab switching + Audio/Video sync + Keyboard Support
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    console.log('Call Demos Page Loaded');

    // Handle Start Quiz button click
    const startQuizBtn = document.getElementById('start-quiz-btn');
    if (startQuizBtn) {
        startQuizBtn.addEventListener('click', function() {
            // Store the state that we're coming from the call examples page
            sessionStorage.setItem('startQuizFromCallExamples', 'true');
            // Navigate to the homepage
            window.location.href = '/';
        });
    }

    const industryTabs = document.querySelectorAll('.industry-tab');
    const audioPlayer = document.getElementById('main-audio');
    const videoPlayer = document.getElementById('call-video');

    // Industry tab switching
    industryTabs.forEach((tab, index) => {
        tab.addEventListener('click', () => switchTab(tab, industryTabs));

        // Keyboard navigation
        tab.addEventListener('keydown', (e) => {
            let newIndex = index;

            if (e.key === 'ArrowRight') {
                e.preventDefault();
                newIndex = (index + 1) % industryTabs.length;
            } else if (e.key === 'ArrowLeft') {
                e.preventDefault();
                newIndex = (index - 1 + industryTabs.length) % industryTabs.length;
            } else if (e.key === 'Home') {
                e.preventDefault();
                newIndex = 0;
            } else if (e.key === 'End') {
                e.preventDefault();
                newIndex = industryTabs.length - 1;
            }

            if (newIndex !== index) {
                industryTabs[newIndex].click();
                industryTabs[newIndex].focus();
            }
        });
    });

    function switchTab(tab, allTabs) {
        const industry = tab.dataset.industry;

        // Stop audio and video
        if (audioPlayer) {
            audioPlayer.pause();
            audioPlayer.currentTime = 0;
        }
        if (videoPlayer) {
            videoPlayer.pause();
            videoPlayer.currentTime = 0;
        }

        // Update ARIA attributes and classes
        allTabs.forEach(t => {
            t.classList.remove('active');
            t.setAttribute('aria-selected', 'false');
            t.setAttribute('tabindex', '-1');
        });

        tab.classList.add('active');
        tab.setAttribute('aria-selected', 'true');
        tab.setAttribute('tabindex', '0');

        // Track tab switch (with consent check)
        if (window.CookieConsent && window.CookieConsent.hasConsent('analytics')) {
            if (typeof gtag === 'function') {
                gtag('event', 'tab_switch', {
                    industry: industry
                });
            }
        }

        // Update audio source (when you add real audio files)
        // audioPlayer.src = `../audio/${industry}.mp3`;

        // Update video source (when you add real video files)
        // videoPlayer.src = `../videos/${industry}.mp4`;
    }

    // Sync audio with video (when both are added)
    if (audioPlayer && videoPlayer) {
        audioPlayer.addEventListener('play', () => {
            videoPlayer.play();
            trackMediaEvent('play');
        });

        audioPlayer.addEventListener('pause', () => {
            videoPlayer.pause();
            trackMediaEvent('pause');
        });

        audioPlayer.addEventListener('seeked', () => {
            videoPlayer.currentTime = audioPlayer.currentTime;
        });

        // Error handling for media
        audioPlayer.addEventListener('error', () => {
            console.error('Audio failed to load');
        });

        videoPlayer.addEventListener('error', () => {
            console.error('Video failed to load');
        });
    }

    function trackMediaEvent(action) {
        if (window.CookieConsent && window.CookieConsent.hasConsent('analytics')) {
            if (typeof gtag === 'function') {
                gtag('event', 'media_' + action, {
                    media_type: 'call_demo'
                });
            }
        }
    }

    console.log('Call Demos page loaded! 🎥');
});
