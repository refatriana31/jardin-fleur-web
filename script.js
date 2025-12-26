/**
 * JardinFleur - Premium Flower Shop
 * Main JavaScript
 */

document.addEventListener('DOMContentLoaded', () => {
  initHeader();
  initSmoothScroll();
  initMobileMenu();
  initLazyLoading();
  initAnimations();
  initProductModal();
  initCartDrawer();
  initContactForm();
});

// ===================================
// Cart State (localStorage)
// ===================================
const cartState = {
  items: JSON.parse(localStorage.getItem('jardinfleur-cart') || '[]'),
  
  save() {
    localStorage.setItem('jardinfleur-cart', JSON.stringify(this.items));
    this.updateUI();
  },
  
  add(product) {
    const existing = this.items.find(item => item.id === product.id);
    if (existing) {
      existing.quantity += 1;
    } else {
      this.items.push({ ...product, quantity: 1 });
    }
    this.save();
  },
  
  remove(productId) {
    this.items = this.items.filter(item => item.id !== productId);
    this.save();
  },
  
  getTotal() {
    return this.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  },
  
  getCount() {
    return this.items.reduce((sum, item) => sum + item.quantity, 0);
  },
  
  updateUI() {
    // Update badge
    const badge = document.querySelector('.cart-badge');
    const count = this.getCount();
    if (badge) {
      if (count > 0) {
        badge.textContent = count > 99 ? '99+' : count;
        badge.classList.add('visible');
      } else {
        badge.classList.remove('visible');
      }
    }
    
    // Update cart drawer
    renderCartItems();
  }
};

// Initialize cart UI on load
setTimeout(() => cartState.updateUI(), 100);

// ===================================
// Header Scroll Effect
// ===================================
function initHeader() {
  const header = document.querySelector('.header');
  if (!header) return;

  const scrollThreshold = 100;

  function updateHeader() {
    if (window.scrollY > scrollThreshold) {
      header.classList.add('scrolled');
      header.classList.remove('transparent');
    } else {
      header.classList.remove('scrolled');
      header.classList.add('transparent');
    }
  }

  updateHeader();

  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        updateHeader();
        ticking = false;
      });
      ticking = true;
    }
  });
}

// ===================================
// Smooth Scrolling
// ===================================
function initSmoothScroll() {
  const anchorLinks = document.querySelectorAll('a[href^="#"]');

  anchorLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      if (href === '#') return;

      e.preventDefault();
      const target = document.querySelector(href);
      
      if (target) {
        const headerHeight = document.querySelector('.header')?.offsetHeight || 0;
        const targetPosition = target.getBoundingClientRect().top + window.scrollY - headerHeight;

        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        });

        // Close mobile menu if open
        const navMenu = document.querySelector('.nav-menu');
        const menuToggle = document.querySelector('.menu-toggle');
        if (navMenu?.classList.contains('active')) {
          navMenu.classList.remove('active');
          menuToggle?.classList.remove('active');
          menuToggle?.setAttribute('aria-expanded', 'false');
        }
        
        // Close cart drawer if open
        closeCartDrawer();
      }
    });
  });
}

// ===================================
// Mobile Menu
// ===================================
function initMobileMenu() {
  const menuToggle = document.querySelector('.menu-toggle');
  const navMenu = document.querySelector('.nav-menu');

  if (!menuToggle || !navMenu) return;

  menuToggle.addEventListener('click', () => {
    const isOpen = navMenu.classList.toggle('active');
    menuToggle.classList.toggle('active');
    menuToggle.setAttribute('aria-expanded', isOpen.toString());
  });

  document.addEventListener('click', (e) => {
    if (!menuToggle.contains(e.target) && !navMenu.contains(e.target)) {
      navMenu.classList.remove('active');
      menuToggle.classList.remove('active');
      menuToggle.setAttribute('aria-expanded', 'false');
    }
  });
}

// ===================================
// Lazy Loading
// ===================================
function initLazyLoading() {
  const lazyImages = document.querySelectorAll('img[loading="lazy"]');
  
  if ('loading' in HTMLImageElement.prototype) {
    lazyImages.forEach(img => {
      img.addEventListener('load', () => {
        img.classList.add('loaded');
      });
    });
  } else {
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.classList.add('loaded');
          observer.unobserve(img);
        }
      });
    });

    lazyImages.forEach(img => {
      imageObserver.observe(img);
    });
  }
}

// ===================================
// Scroll Animations
// ===================================
function initAnimations() {
  const animatedElements = document.querySelectorAll('.animate-on-scroll');
  
  if (!animatedElements.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('fade-in-up');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  });

  animatedElements.forEach(el => {
    observer.observe(el);
  });
}

// ===================================
// Product Modal
// ===================================
let currentProduct = null;

function initProductModal() {
  const modal = document.getElementById('product-modal');
  const backdrop = document.getElementById('modal-backdrop');
  const closeBtn = document.getElementById('modal-close');
  const closeBtnFooter = document.getElementById('modal-close-btn');
  const addToCartBtn = document.getElementById('modal-add-to-cart');
  const productCards = document.querySelectorAll('.product-card');

  if (!modal) return;

  // Open modal on product card click
  productCards.forEach(card => {
    const openModal = () => {
      const product = {
        id: card.dataset.productId,
        name: card.dataset.productName,
        category: card.dataset.productCategory,
        price: parseInt(card.dataset.productPrice),
        image: card.dataset.productImage,
        description: card.dataset.productDescription
      };
      
      currentProduct = product;
      
      document.getElementById('modal-title').textContent = product.name;
      document.getElementById('modal-image').src = product.image;
      document.getElementById('modal-image').alt = product.name;
      document.getElementById('modal-price').textContent = `$${product.price}`;
      document.getElementById('modal-description').textContent = product.description;
      
      openProductModal();
    };
    
    card.addEventListener('click', openModal);
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openModal();
      }
    });
  });

  // Close modal
  closeBtn?.addEventListener('click', closeProductModal);
  closeBtnFooter?.addEventListener('click', closeProductModal);
  backdrop?.addEventListener('click', closeProductModal);
  
  // Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeProductModal();
      closeCartDrawer();
    }
  });

  // Add to cart
  addToCartBtn?.addEventListener('click', () => {
    if (currentProduct) {
      cartState.add(currentProduct);
      showToast('success', `${currentProduct.name} added to cart!`);
      closeProductModal();
    }
  });
}

function openProductModal() {
  const modal = document.getElementById('product-modal');
  const backdrop = document.getElementById('modal-backdrop');
  
  modal?.classList.add('active');
  backdrop?.classList.add('active');
  backdrop?.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
  
  // Focus trap
  setTimeout(() => {
    document.getElementById('modal-close')?.focus();
  }, 100);
}

function closeProductModal() {
  const modal = document.getElementById('product-modal');
  const backdrop = document.getElementById('modal-backdrop');
  
  modal?.classList.remove('active');
  backdrop?.classList.remove('active');
  backdrop?.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
  currentProduct = null;
}

// ===================================
// Cart Drawer
// ===================================
function initCartDrawer() {
  const cartIcon = document.getElementById('cart-icon');
  const cartClose = document.getElementById('cart-close');
  const cartBackdrop = document.getElementById('cart-backdrop');
  const cartShopLink = document.getElementById('cart-shop-link');

  cartIcon?.addEventListener('click', toggleCartDrawer);
  cartClose?.addEventListener('click', closeCartDrawer);
  cartBackdrop?.addEventListener('click', closeCartDrawer);
  cartShopLink?.addEventListener('click', closeCartDrawer);
  
  // Initial render
  renderCartItems();
}

function toggleCartDrawer() {
  const drawer = document.getElementById('cart-drawer');
  const backdrop = document.getElementById('cart-backdrop');
  
  if (drawer?.classList.contains('active')) {
    closeCartDrawer();
  } else {
    drawer?.classList.add('active');
    backdrop?.classList.add('active');
    backdrop?.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }
}

function closeCartDrawer() {
  const drawer = document.getElementById('cart-drawer');
  const backdrop = document.getElementById('cart-backdrop');
  
  drawer?.classList.remove('active');
  backdrop?.classList.remove('active');
  backdrop?.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}

function renderCartItems() {
  const cartBody = document.getElementById('cart-items');
  const cartEmpty = document.getElementById('cart-empty');
  const cartFooter = document.getElementById('cart-footer');
  const cartTotal = document.getElementById('cart-total');
  
  if (!cartBody) return;
  
  // Clear existing items (except empty state)
  const existingItems = cartBody.querySelectorAll('.cart-item');
  existingItems.forEach(item => item.remove());
  
  if (cartState.items.length === 0) {
    cartEmpty.style.display = 'block';
    cartFooter.style.display = 'none';
    return;
  }
  
  cartEmpty.style.display = 'none';
  cartFooter.style.display = 'block';
  
  cartState.items.forEach(item => {
    const itemEl = document.createElement('div');
    itemEl.className = 'cart-item';
    itemEl.innerHTML = `
      <img src="${item.image}" alt="${item.name}" class="cart-item-image">
      <div class="cart-item-details">
        <div class="cart-item-name">${item.name}</div>
        <div class="cart-item-price">$${item.price} × ${item.quantity}</div>
      </div>
      <button class="cart-item-remove" aria-label="Remove ${item.name}" data-id="${item.id}">&times;</button>
    `;
    
    const removeBtn = itemEl.querySelector('.cart-item-remove');
    removeBtn.addEventListener('click', () => {
      cartState.remove(item.id);
      showToast('info', `${item.name} removed from cart`);
    });
    
    cartBody.insertBefore(itemEl, cartEmpty);
  });
  
  cartTotal.textContent = `$${cartState.getTotal()}`;
}

// ===================================
// Contact Form
// ===================================
function initContactForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const name = document.getElementById('contact-name');
    const email = document.getElementById('contact-email');
    const message = document.getElementById('contact-message');
    
    let isValid = true;
    
    // Clear previous errors
    clearFormErrors();
    
    // Validate name
    if (!name.value.trim()) {
      showFieldError('name', 'Please enter your name');
      isValid = false;
    }
    
    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.value.trim()) {
      showFieldError('email', 'Please enter your email');
      isValid = false;
    } else if (!emailRegex.test(email.value)) {
      showFieldError('email', 'Please enter a valid email');
      isValid = false;
    }
    
    // Validate message
    if (!message.value.trim()) {
      showFieldError('message', 'Please enter your message');
      isValid = false;
    }
    
    if (isValid) {
      // Simulate form submission
      showToast('success', 'Thank you! Your message has been sent.');
      form.reset();
    }
  });
}

function showFieldError(field, message) {
  const input = document.getElementById(`contact-${field}`);
  const error = document.getElementById(`${field}-error`);
  
  input?.classList.add('error');
  if (error) error.textContent = message;
}

function clearFormErrors() {
  const inputs = document.querySelectorAll('.form-input, .form-textarea');
  const errors = document.querySelectorAll('.form-error');
  
  inputs.forEach(input => input.classList.remove('error'));
  errors.forEach(error => error.textContent = '');
}

// ===================================
// Toast Notifications
// ===================================
function showToast(type, message) {
  const container = document.getElementById('toast-container');
  if (!container) return;
  
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  
  const icons = {
    success: '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="toast-icon"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>',
    error: '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="toast-icon"><path stroke-linecap="round" stroke-linejoin="round" d="m9.75 9.75 4.5 4.5m0-4.5-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>',
    info: '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="toast-icon"><path stroke-linecap="round" stroke-linejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" /></svg>'
  };
  
  toast.innerHTML = `
    ${icons[type] || icons.info}
    <span class="toast-message">${message}</span>
    <button class="toast-close" aria-label="Dismiss">&times;</button>
  `;
  
  container.appendChild(toast);
  
  // Trigger animation
  requestAnimationFrame(() => {
    toast.classList.add('active');
  });
  
  // Close button
  const closeBtn = toast.querySelector('.toast-close');
  closeBtn.addEventListener('click', () => removeToast(toast));
  
  // Auto dismiss
  setTimeout(() => removeToast(toast), 3000);
}

function removeToast(toast) {
  toast.classList.remove('active');
  setTimeout(() => toast.remove(), 300);
}

// Expose for global access
window.showToast = showToast;

