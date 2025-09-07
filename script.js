// Theme Toggle
const themeToggle = document.getElementById('themeToggle');
const body = document.body;

// Check for saved theme preference
const currentTheme = localStorage.getItem('theme') || 'light';
if (currentTheme === 'dark') {
    body.setAttribute('data-theme', 'dark');
    themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
}

themeToggle.addEventListener('click', () => {
    const theme = body.getAttribute('data-theme');
    if (theme === 'dark') {
        body.removeAttribute('data-theme');
        localStorage.setItem('theme', 'light');
        themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
    } else {
        body.setAttribute('data-theme', 'dark');
        localStorage.setItem('theme', 'dark');
        themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
    }
});

// Mobile Menu Toggle
const menuToggle = document.getElementById('menuToggle');
const navMenu = document.getElementById('navMenu');

menuToggle.addEventListener('click', () => {
    navMenu.classList.toggle('active');
    menuToggle.innerHTML = navMenu.classList.contains('active') 
        ? '<i class="fas fa-times"></i>' 
        : '<i class="fas fa-bars"></i>';
});

// Search Toggle
const searchToggle = document.getElementById('searchToggle');
const searchBar = document.getElementById('searchBar');
const searchInput = document.getElementById('searchInput');
const searchButton = document.getElementById('searchButton');

searchToggle.addEventListener('click', () => {
    searchBar.classList.toggle('active');
    if (searchBar.classList.contains('active')) {
        searchInput.focus();
    }
});

// Search Functionality
function performSearch() {
    const searchTerm = searchInput.value.toLowerCase().trim();
    const blogCards = document.querySelectorAll('.blog-card');
    let hasResults = false;

    if (searchTerm === '') {
        // Reset to show all articles with pagination
        activeFilter = 'all';
        currentPage = 1;
        updatePagination();
        // Remove any no-results message
        const noResults = document.querySelector('.no-results');
        if (noResults) {
            noResults.remove();
        }
        return;
    }

    // Hide all cards first
    blogCards.forEach(card => {
        card.style.display = 'none';
    });

    // Create array of matching cards
    const matchingCards = [];
    blogCards.forEach(card => {
        const title = card.querySelector('.blog-title').textContent.toLowerCase();
        const excerpt = card.querySelector('.blog-excerpt').textContent.toLowerCase();
        const category = card.getAttribute('data-category').toLowerCase();

        if (title.includes(searchTerm) || excerpt.includes(searchTerm) || category.includes(searchTerm)) {
            matchingCards.push(card);
            hasResults = true;
        }
    });

    // Sort matching cards by date (newest first)
    matchingCards.sort((a, b) => {
        const dateA = new Date(a.getAttribute('data-date'));
        const dateB = new Date(b.getAttribute('data-date'));
        return dateB - dateA;
    });

    // Show sorted matching cards
    matchingCards.forEach(card => {
        card.style.display = 'block';
    });

    if (!hasResults) {
        // Show no results message
        const blogGrid = document.querySelector('.blog-grid');
        if (!document.querySelector('.no-results')) {
            const noResults = document.createElement('div');
            noResults.className = 'no-results';
            noResults.style.gridColumn = '1 / -1';
            noResults.style.textAlign = 'center';
            noResults.style.padding = '3rem';
            noResults.innerHTML = `
                <i class="fas fa-search" style="font-size: 3rem; color: var(--text-color); opacity: 0.3; margin-bottom: 1rem;"></i>
                <h3>No results found for "${searchTerm}"</h3>
                <p>Try searching with different keywords</p>
            `;
            blogGrid.appendChild(noResults);
        }
    } else {
        const noResults = document.querySelector('.no-results');
        if (noResults) {
            noResults.remove();
        }
    }
    
    // Hide pagination during search
    document.querySelector('.pagination').style.display = searchTerm ? 'none' : 'flex';
}

searchButton.addEventListener('click', performSearch);
searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        performSearch();
    }
});

// Category Filter
const categoryCards = document.querySelectorAll('.category-card');
const filterButtons = document.querySelectorAll('.filter-btn');

categoryCards.forEach(card => {
    card.addEventListener('click', () => {
        const category = card.getAttribute('data-category');
        filterArticles(category);
        
        // Update active filter button
        filterButtons.forEach(btn => {
            btn.classList.remove('active');
            if (btn.getAttribute('data-filter') === category) {
                btn.classList.add('active');
            }
        });
        
        // Scroll to blog section
        document.getElementById('featured').scrollIntoView({ behavior: 'smooth' });
    });
});

// Filter Buttons
filterButtons.forEach(button => {
    button.addEventListener('click', () => {
        const filter = button.getAttribute('data-filter');
        
        // Update active state
        filterButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        
        // Filter articles
        filterArticles(filter);
    });
});

function filterArticles(category) {
    activeFilter = category;
    currentPage = 1;
    updatePagination();
}

// Pagination
let currentPage = 1;
const articlesPerPage = 6;
let blogCards = document.querySelectorAll('.blog-card');
let activeFilter = 'all';

const prevPageBtn = document.getElementById('prevPage');
const nextPageBtn = document.getElementById('nextPage');
const pageNumbers = document.getElementById('pageNumbers');

function getVisibleCards() {
    // Re-query all blog cards to ensure we have all of them
    blogCards = document.querySelectorAll('.blog-card');
    
    let cards;
    if (activeFilter === 'all') {
        cards = Array.from(blogCards);
    } else {
        cards = Array.from(blogCards).filter(card => {
            const cardCategory = card.getAttribute('data-category');
            return cardCategory === activeFilter;
        });
    }
    
    // Sort cards by date (newest to oldest)
    cards.sort((a, b) => {
        const dateA = new Date(a.getAttribute('data-date'));
        const dateB = new Date(b.getAttribute('data-date'));
        return dateB - dateA; // Descending order (newest first)
    });
    
    return cards;
}

function updatePagination() {
    const visibleCards = getVisibleCards();
    const totalVisiblePages = Math.ceil(visibleCards.length / articlesPerPage);
    
    // Ensure current page is valid
    if (currentPage > totalVisiblePages && totalVisiblePages > 0) {
        currentPage = totalVisiblePages;
    }
    if (currentPage < 1) {
        currentPage = 1;
    }
    
    // First hide all cards
    blogCards.forEach(card => {
        card.style.display = 'none';
    });
    
    // Show cards for current page
    const startIndex = (currentPage - 1) * articlesPerPage;
    const endIndex = startIndex + articlesPerPage;
    
    visibleCards.slice(startIndex, endIndex).forEach(card => {
        card.style.display = 'block';
        card.style.animation = 'fadeInUp 0.5s ease';
    });
    
    // Update page numbers
    pageNumbers.innerHTML = '';
    
    if (totalVisiblePages <= 1) {
        // Hide pagination if only one page or no pages
        prevPageBtn.style.display = totalVisiblePages === 0 ? 'none' : 'block';
        nextPageBtn.style.display = totalVisiblePages === 0 ? 'none' : 'block';
        
        if (totalVisiblePages === 1) {
            const pageBtn = document.createElement('button');
            pageBtn.className = 'page-number active';
            pageBtn.textContent = '1';
            pageNumbers.appendChild(pageBtn);
        }
    } else {
        prevPageBtn.style.display = 'block';
        nextPageBtn.style.display = 'block';
        
        // Calculate page range to display
        let startPage = Math.max(1, currentPage - 2);
        let endPage = Math.min(totalVisiblePages, startPage + 4);
        
        if (endPage - startPage < 4) {
            startPage = Math.max(1, endPage - 4);
        }
        
        // Add first page and ellipsis if needed
        if (startPage > 1) {
            const firstBtn = document.createElement('button');
            firstBtn.className = 'page-number';
            firstBtn.textContent = '1';
            firstBtn.addEventListener('click', () => {
                currentPage = 1;
                updatePagination();
                document.getElementById('featured').scrollIntoView({ behavior: 'smooth' });
            });
            pageNumbers.appendChild(firstBtn);
            
            if (startPage > 2) {
                const ellipsis = document.createElement('span');
                ellipsis.textContent = '...';
                ellipsis.style.padding = '0 0.5rem';
                pageNumbers.appendChild(ellipsis);
            }
        }
        
        // Add page number buttons
        for (let i = startPage; i <= endPage; i++) {
            const pageBtn = document.createElement('button');
            pageBtn.className = 'page-number';
            pageBtn.textContent = i;
            if (i === currentPage) {
                pageBtn.classList.add('active');
            }
            pageBtn.addEventListener('click', () => {
                currentPage = i;
                updatePagination();
                document.getElementById('featured').scrollIntoView({ behavior: 'smooth' });
            });
            pageNumbers.appendChild(pageBtn);
        }
        
        // Add last page and ellipsis if needed
        if (endPage < totalVisiblePages) {
            if (endPage < totalVisiblePages - 1) {
                const ellipsis = document.createElement('span');
                ellipsis.textContent = '...';
                ellipsis.style.padding = '0 0.5rem';
                pageNumbers.appendChild(ellipsis);
            }
            
            const lastBtn = document.createElement('button');
            lastBtn.className = 'page-number';
            lastBtn.textContent = totalVisiblePages;
            lastBtn.addEventListener('click', () => {
                currentPage = totalVisiblePages;
                updatePagination();
                document.getElementById('featured').scrollIntoView({ behavior: 'smooth' });
            });
            pageNumbers.appendChild(lastBtn);
        }
    }
    
    // Update prev/next buttons
    prevPageBtn.disabled = currentPage === 1 || totalVisiblePages === 0;
    nextPageBtn.disabled = currentPage === totalVisiblePages || totalVisiblePages === 0;
    
    // Update button opacity for better UX
    prevPageBtn.style.opacity = prevPageBtn.disabled ? '0.5' : '1';
    nextPageBtn.style.opacity = nextPageBtn.disabled ? '0.5' : '1';
}

prevPageBtn.addEventListener('click', () => {
    if (currentPage > 1) {
        currentPage--;
        updatePagination();
        document.getElementById('featured').scrollIntoView({ behavior: 'smooth' });
    }
});

nextPageBtn.addEventListener('click', () => {
    const visibleCards = getVisibleCards();
    const totalVisiblePages = Math.ceil(visibleCards.length / articlesPerPage);
    
    if (currentPage < totalVisiblePages) {
        currentPage++;
        updatePagination();
        document.getElementById('featured').scrollIntoView({ behavior: 'smooth' });
    }
});

// Initialize pagination after DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        blogCards = document.querySelectorAll('.blog-card');
        // Sort all articles by date on initial load
        sortArticlesByDate();
        updatePagination();
    }, 100);
});

// Function to sort articles in the DOM by date
function sortArticlesByDate() {
    const blogGrid = document.querySelector('.blog-grid');
    if (!blogGrid) return;
    
    const articles = Array.from(blogGrid.querySelectorAll('.blog-card'));
    
    // Sort articles by date (newest first)
    articles.sort((a, b) => {
        const dateA = new Date(a.getAttribute('data-date'));
        const dateB = new Date(b.getAttribute('data-date'));
        return dateB - dateA;
    });
    
    // Remove all articles from the grid
    articles.forEach(article => article.remove());
    
    // Re-append them in sorted order
    articles.forEach(article => blogGrid.appendChild(article));
}

// Newsletter Form
const newsletterForm = document.querySelector('.newsletter-form');
if (newsletterForm) {
    newsletterForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = e.target.querySelector('input[type="email"]').value;
        
        // Simulate subscription
        alert(`Thank you for subscribing with email: ${email}`);
        e.target.reset();
    });
}

// Smooth Scroll for Navigation Links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    });
});

// Add scroll animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.animation = 'fadeInUp 0.8s ease forwards';
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

// Observe elements for animation
document.querySelectorAll('.blog-card, .category-card, .product-card').forEach(el => {
    observer.observe(el);
});

// Header scroll effect
let lastScroll = 0;
const header = document.querySelector('.header');

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    
    if (currentScroll <= 0) {
        header.style.boxShadow = 'var(--shadow)';
    } else if (currentScroll > lastScroll) {
        // Scrolling down
        header.style.transform = 'translateY(-100%)';
    } else {
        // Scrolling up
        header.style.transform = 'translateY(0)';
        header.style.boxShadow = 'var(--shadow-lg)';
    }
    
    lastScroll = currentScroll;
});

// Add loading animation for images
document.querySelectorAll('img').forEach(img => {
    img.addEventListener('load', function() {
        this.style.animation = 'fadeIn 0.5s ease';
    });
});

// Contact form validation (if on contact page)
const contactForm = document.querySelector('.contact-form');
if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData);
        
        // Simulate form submission
        console.log('Form submitted:', data);
        alert('Thank you for your message! We will get back to you soon.');
        e.target.reset();
    });
}

// Back to Top Button
const backToTopButton = document.getElementById('backToTop');

if (backToTopButton) {
    // Show/hide button based on scroll position
    window.addEventListener('scroll', () => {
        if (window.pageYOffset > 300) {
            backToTopButton.classList.add('show');
        } else {
            backToTopButton.classList.remove('show');
        }
    });

    // Smooth scroll to top when clicked
    backToTopButton.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}