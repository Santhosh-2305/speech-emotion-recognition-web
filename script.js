// Global Variables
let isRecording = false;
let mediaRecorder = null;
let audioChunks = [];
let currentAudioFile = null;

// Sample emotion data for simulation
const sampleEmotions = [
    { emotion: 'happy', emoji: '😊', confidence: 85, breakdown: { happy: 85, sad: 5, angry: 3, neutral: 7 } },
    { emotion: 'sad', emoji: '😢', confidence: 78, breakdown: { happy: 8, sad: 78, angry: 4, neutral: 10 } },
    { emotion: 'angry', emoji: '😡', confidence: 92, breakdown: { happy: 2, sad: 3, angry: 92, neutral: 3 } },
    { emotion: 'neutral', emoji: '😐', confidence: 73, breakdown: { happy: 12, sad: 8, angry: 7, neutral: 73 } }
];

// DOM Elements
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');
const audioFileInput = document.getElementById('audioFile');
const fileNameDisplay = document.getElementById('fileName');
const recordBtn = document.getElementById('recordBtn');
const recordText = document.getElementById('recordText');
const recordingIndicator = document.getElementById('recordingIndicator');
const analyzeBtn = document.getElementById('analyzeBtn');
const loadingIndicator = document.getElementById('loadingIndicator');
const resultSection = document.getElementById('resultSection');

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeEventListeners();
    initializeAnimations();
    checkMicrophonePermission();
});

// Event Listeners
function initializeEventListeners() {
    // Navigation
    hamburger.addEventListener('click', toggleMobileMenu);
    
    // Close mobile menu when clicking on nav links
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('active');
        });
    });
    
    // File upload
    audioFileInput.addEventListener('change', handleFileUpload);
    
    // Recording
    recordBtn.addEventListener('click', toggleRecording);
    
    // Analysis
    analyzeBtn.addEventListener('click', analyzeEmotion);
    
    // Smooth scrolling for navigation links
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
}

// Mobile Navigation
function toggleMobileMenu() {
    hamburger.classList.toggle('active');
    navMenu.classList.toggle('active');
}

// File Upload Handler
function handleFileUpload(event) {
    const file = event.target.files[0];
    if (file) {
        currentAudioFile = file;
        fileNameDisplay.textContent = `Selected: ${file.name}`;
        fileNameDisplay.style.display = 'block';
        enableAnalyzeButton();
        
        // Reset recording state
        resetRecordingState();
    }
}

// Recording Functions
async function checkMicrophonePermission() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach(track => track.stop());
        console.log('Microphone permission granted');
    } catch (error) {
        console.warn('Microphone permission denied or not available');
        recordBtn.disabled = true;
        recordBtn.innerHTML = '<i class="fas fa-microphone-slash"></i> Microphone Not Available';
    }
}

async function toggleRecording() {
    if (!isRecording) {
        await startRecording();
    } else {
        stopRecording();
    }
}

async function startRecording() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorder = new MediaRecorder(stream);
        audioChunks = [];
        
        mediaRecorder.ondataavailable = (event) => {
            audioChunks.push(event.data);
        };
        
        mediaRecorder.onstop = () => {
            const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
            currentAudioFile = new File([audioBlob], 'recorded_audio.wav', { type: 'audio/wav' });
            enableAnalyzeButton();
            
            // Reset file upload
            audioFileInput.value = '';
            fileNameDisplay.style.display = 'none';
        };
        
        mediaRecorder.start();
        isRecording = true;
        
        // Update UI
        recordBtn.classList.add('recording');
        recordText.textContent = 'Stop Recording';
        recordingIndicator.style.display = 'flex';
        
        // Auto-stop after 40 seconds
        setTimeout(() => {
            if (isRecording) {
                stopRecording();
            }
        }, 40000);
        
    } catch (error) {
        console.error('Error starting recording:', error);
        alert('Unable to access microphone. Please check permissions.');
    }
}

function stopRecording() {
    if (mediaRecorder && isRecording) {
        mediaRecorder.stop();
        mediaRecorder.stream.getTracks().forEach(track => track.stop());
        resetRecordingState();
    }
}

function resetRecordingState() {
    isRecording = false;
    recordBtn.classList.remove('recording');
    recordText.textContent = 'Start Recording';
    recordingIndicator.style.display = 'none';
}

function enableAnalyzeButton() {
    analyzeBtn.disabled = false;
    analyzeBtn.style.opacity = '1';
}

// Emotion Analysis
async function analyzeEmotion() {
    if (!currentAudioFile) {
        alert('Please upload an audio file or record your voice first.');
        return;
    }
    
    // Show loading
    loadingIndicator.style.display = 'flex';
    analyzeBtn.disabled = true;
    resultSection.style.display = 'none';
    
    // Simulate AI processing delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Get random emotion result for simulation
    const randomResult = sampleEmotions[Math.floor(Math.random() * sampleEmotions.length)];
    
    // Add some randomness to the confidence and breakdown
    const result = {
        ...randomResult,
        confidence: Math.max(60, Math.min(95, randomResult.confidence + (Math.random() - 0.5) * 20)),
        breakdown: {
            happy: Math.max(0, Math.min(100, randomResult.breakdown.happy + (Math.random() - 0.5) * 30)),
            sad: Math.max(0, Math.min(100, randomResult.breakdown.sad + (Math.random() - 0.5) * 30)),
            angry: Math.max(0, Math.min(100, randomResult.breakdown.angry + (Math.random() - 0.5) * 30)),
            neutral: Math.max(0, Math.min(100, randomResult.breakdown.neutral + (Math.random() - 0.5) * 30))
        }
    };
    
    // Normalize breakdown to sum to 100%
    const total = Object.values(result.breakdown).reduce((sum, val) => sum + val, 0);
    Object.keys(result.breakdown).forEach(key => {
        result.breakdown[key] = Math.round((result.breakdown[key] / total) * 100);
    });
    
    // Hide loading and show results
    loadingIndicator.style.display = 'none';
    displayResults(result);
    analyzeBtn.disabled = false;
}

function displayResults(result) {
    // Update main emotion display
    document.getElementById('emotionEmoji').textContent = result.emoji;
    document.getElementById('emotionName').textContent = capitalizeFirst(result.emotion);
    document.getElementById('confidenceScore').textContent = `${Math.round(result.confidence)}%`;
    
    // Animate confidence bar
    const confidenceFill = document.getElementById('confidenceFill');
    confidenceFill.style.width = '0%';
    setTimeout(() => {
        confidenceFill.style.width = `${result.confidence}%`;
    }, 100);
    
    // Update emotion breakdown bars
    Object.keys(result.breakdown).forEach(emotion => {
        const fill = document.querySelector(`.fill[data-emotion="${emotion}"]`);
        const percentage = document.querySelector(`.percentage[data-emotion="${emotion}"]`);
        
        if (fill && percentage) {
            fill.style.width = '0%';
            percentage.textContent = '0%';
            
            setTimeout(() => {
                fill.style.width = `${result.breakdown[emotion]}%`;
                percentage.textContent = `${result.breakdown[emotion]}%`;
            }, 200);
        }
    });
    
    // Show results with animation
    resultSection.style.display = 'block';
    resultSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
    
    // Add entrance animation
    const resultCard = resultSection.querySelector('.result-card');
    resultCard.style.opacity = '0';
    resultCard.style.transform = 'translateY(30px)';
    
    setTimeout(() => {
        resultCard.style.transition = 'all 0.6s ease';
        resultCard.style.opacity = '1';
        resultCard.style.transform = 'translateY(0)';
    }, 100);
}

// Utility Functions
function capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        section.scrollIntoView({ behavior: 'smooth' });
    }
}

// Animation Observers
function initializeAnimations() {
    // Intersection Observer for scroll animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, observerOptions);
    
    // Add animation classes to elements
    document.querySelectorAll('.process-step, .tech-card, .team-card, .feature-item').forEach(el => {
        el.classList.add('fade-in');
        observer.observe(el);
    });
    
    // Stagger animations for process steps
    document.querySelectorAll('.process-step').forEach((step, index) => {
        step.style.animationDelay = `${index * 0.2}s`;
    });
}

// Navbar scroll effect
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 100) {
        navbar.style.background = 'rgba(255, 255, 255, 0.98)';
        navbar.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
    } else {
        navbar.style.background = 'rgba(255, 255, 255, 0.95)';
        navbar.style.boxShadow = 'none';
    }
});

// Particle animation for background (optional enhancement)
function createParticles() {
    const particleContainer = document.createElement('div');
    particleContainer.className = 'particles';
    particleContainer.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: -1;
    `;
    
    for (let i = 0; i < 50; i++) {
        const particle = document.createElement('div');
        particle.style.cssText = `
            position: absolute;
            width: 2px;
            height: 2px;
            background: rgba(255, 255, 255, 0.5);
            border-radius: 50%;
            animation: float ${5 + Math.random() * 10}s linear infinite;
            left: ${Math.random() * 100}%;
            top: ${Math.random() * 100}%;
            animation-delay: ${Math.random() * 5}s;
        `;
        particleContainer.appendChild(particle);
    }
    
    document.body.appendChild(particleContainer);
}

// Add CSS for particle animation
const particleStyle = document.createElement('style');
particleStyle.textContent = `
    @keyframes float {
        0% { transform: translateY(0px) rotate(0deg); opacity: 0; }
        10% { opacity: 1; }
        90% { opacity: 1; }
        100% { transform: translateY(-100vh) rotate(360deg); opacity: 0; }
    }
`;
document.head.appendChild(particleStyle);

// Initialize particles (uncomment to enable)
// createParticles();

// Error handling for audio processing
window.addEventListener('error', (event) => {
    console.error('Application error:', event.error);
});

// Handle page visibility changes
document.addEventListener('visibilitychange', () => {
    if (document.hidden && isRecording) {
        stopRecording();
    }
});

// Keyboard shortcuts
document.addEventListener('keydown', (event) => {
    // Space bar to start/stop recording (when not in input fields)
    if (event.code === 'Space' && !event.target.matches('input, textarea')) {
        event.preventDefault();
        if (!recordBtn.disabled) {
            toggleRecording();
        }
    }
    
    // Enter to analyze (when analyze button is enabled)
    if (event.code === 'Enter' && !analyzeBtn.disabled && currentAudioFile) {
        analyzeEmotion();
    }
    
    // Escape to close mobile menu
    if (event.code === 'Escape') {
        navMenu.classList.remove('active');
    }
});

// Touch gestures for mobile (basic swipe detection)
let touchStartX = 0;
let touchEndX = 0;

document.addEventListener('touchstart', (event) => {
    touchStartX = event.changedTouches[0].screenX;
});

document.addEventListener('touchend', (event) => {
    touchEndX = event.changedTouches[0].screenX;
    handleSwipe();
});

function handleSwipe() {
    const swipeThreshold = 100;
    const swipeDistance = touchEndX - touchStartX;
    
    if (Math.abs(swipeDistance) > swipeThreshold) {
        if (swipeDistance > 0 && navMenu.classList.contains('active')) {
            // Swipe right - close menu
            navMenu.classList.remove('active');
        }
    }
}

// Performance optimization: Debounce scroll events
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

// Apply debouncing to scroll handler
const debouncedScrollHandler = debounce(() => {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 100) {
        navbar.style.background = 'rgba(255, 255, 255, 0.98)';
        navbar.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
    } else {
        navbar.style.background = 'rgba(255, 255, 255, 0.95)';
        navbar.style.boxShadow = 'none';
    }
}, 10);

window.addEventListener('scroll', debouncedScrollHandler);

// Console welcome message
console.log(`
🎤 Speech Emotion Recognition
============================
Welcome to the Speech Emotion Recognition demo!

Features:
- Upload audio files or record voice
- AI-powered emotion analysis
- Real-time confidence scoring
- Responsive design

Built with HTML, CSS, and JavaScript
`);

// Export functions for potential testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        analyzeEmotion,
        toggleRecording,
        handleFileUpload,
        displayResults
    };
}