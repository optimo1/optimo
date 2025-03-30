// Main Application Module
const app = {
    // Initialize application
    init() {
        this.setupNavigation();
        this.setupScrollBehavior();
        this.setupVideoSection();
    },

    // Setup navigation
    setupNavigation() {
        // Handle navigation links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = anchor.getAttribute('href').substring(1);
                const targetElement = document.getElementById(targetId);
                
                if (targetElement) {
                    // Update active link
                    document.querySelectorAll('.nav-links a').forEach(link => {
                        link.classList.remove('active');
                    });
                    anchor.classList.add('active');

                    // Scroll to target
                    targetElement.scrollIntoView({ behavior: 'smooth' });
                }
            });
        });

        // Handle hash changes
        window.addEventListener('hashchange', () => {
            const hash = window.location.hash.substring(1) || 'home';
            const targetElement = document.getElementById(hash);
            
            if (targetElement) {
                // Update active link
                document.querySelectorAll('.nav-links a').forEach(link => {
                    link.classList.remove('active');
                });
                document.querySelector(`a[href="#${hash}"]`).classList.add('active');

                // Scroll to target
                targetElement.scrollIntoView({ behavior: 'smooth' });
            }
        });
    },

    // Setup smooth scroll behavior
    setupScrollBehavior() {
        // Add smooth scroll behavior to the whole page
        document.documentElement.style.scrollBehavior = 'smooth';
    },

    // Setup video section
    setupVideoSection() {
        // Replace placeholder video IDs with actual YouTube video IDs
        const videos = [
            {
                title: 'Financial Literacy Basics',
                id: '5nL3MqVh6Xk' // Example video ID
            },
            {
                title: 'Investment Strategies',
                id: 'QJ3Y3gW_KfE' // Example video ID
            },
            {
                title: 'Money Management Tips',
                id: 'Wf4j1k9QmQk' // Example video ID
            }
        ];

        const videoGrid = document.querySelector('.video-grid');
        videoGrid.innerHTML = videos.map(video => `
            <div class="video-card">
                <h3>${video.title}</h3>
                <iframe 
                    src="https://www.youtube.com/embed/${video.id}" 
                    frameborder="0" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                    allowfullscreen>
                </iframe>
            </div>
        `).join('');
    }
};

// Initialize application when the page loads
document.addEventListener('DOMContentLoaded', () => {
    app.init();
}); 
