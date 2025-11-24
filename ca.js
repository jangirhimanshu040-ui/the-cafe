// ** 1. Preloader Function **
window.onload = function() {
    const preloader = document.getElementById('preloader');
    
    // Hide the preloader after 1 second
    setTimeout(() => {
        preloader.style.opacity = '0'; // Fade out gradually
        
        // Remove display property after transition finishes
        setTimeout(() => {
            preloader.style.display = 'none';
        }, 500); // Matches the CSS transition time
    }, 1000); // Display the logo animation for 1 second
};


// ** 2. Scroll Animation Function (using Intersection Observer) **
document.addEventListener('DOMContentLoaded', () => {
    const animatedElements = document.querySelectorAll('[data-animate]');

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const element = entry.target;
                const animationName = element.getAttribute('data-animate');
                
                element.style.opacity = '1';
                element.classList.add(`animate__${animationName}`);
                
                // Remove the observer after the animation has run once
                observer.unobserve(element);
            }
        });
    }, {
        threshold: 0.2 // Start the animation when 20% of the element is visible
    });

    // Add each element to the observer
    animatedElements.forEach(element => {
        observer.observe(element);
    });
});


// ** 3. Online Ordering and Billing Logic (With Quantity Control) **

const cart = [];
const GST_RATE = 0.05; // 5% GST

const cartListElement = document.getElementById('cart-list');
const subtotalElement = document.getElementById('subtotal');
const gstAmountElement = document.getElementById('gst-amount');
const finalTotalElement = document.getElementById('final-total');
const checkoutBtn = document.getElementById('checkout-btn');


// ✅ Quantity Control: Increase item quantity
function incrementQuantity(name) {
    const item = cart.find(i => i.name === name);
    if (item) {
        item.quantity += 1;
        updateCartAndCalculate();
    }
}

// ✅ Quantity Control: Decrease item quantity (removes if quantity reaches 0)
function decrementQuantity(name) {
    const itemIndex = cart.findIndex(i => i.name === name);
    if (itemIndex > -1) {
        if (cart[itemIndex].quantity > 1) {
            cart[itemIndex].quantity -= 1;
        } else {
            // Remove item if quantity drops to 1 (upon decrement)
            cart.splice(itemIndex, 1);
        }
        updateCartAndCalculate();
    }
}

// ✅ Attach Quantity Event Listeners to the dynamically created + and - buttons
function attachQuantityEventListeners() {
    // Minus button listeners
    document.querySelectorAll('.quantity-btn.decrement').forEach(button => {
        button.onclick = (e) => {
            const name = e.target.getAttribute('data-name');
            decrementQuantity(name);
        };
    });
    
    // Plus button listeners
    document.querySelectorAll('.quantity-btn.increment').forEach(button => {
        button.onclick = (e) => {
            const name = e.target.getAttribute('data-name');
            incrementQuantity(name);
        };
    });
}


// 🛒 Main function to update cart display and calculate bill
function updateCartAndCalculate() {
    let subtotal = 0;
    cartListElement.innerHTML = ''; // Clear the list

    if (cart.length === 0) {
        cartListElement.innerHTML = '<li class="empty-cart-message">Your cart is empty.</li>';
        checkoutBtn.disabled = true;
    } else {
        checkoutBtn.disabled = false;
        
        // 1. Display cart items with new quantity controls
        cart.forEach(item => {
            const itemTotalPrice = item.price * item.quantity;
            
            const listItem = document.createElement('li');
            listItem.classList.add('cart-item');
            
            // Renders the Item Name, the [+ / Quantity / -] controls, and the total price
            listItem.innerHTML = `
                <span class="item-name">${item.name}</span>
                <div class="quantity-controls">
                    <button class="quantity-btn decrement" data-name="${item.name}">-</button>
                    <span class="quantity-display">${item.quantity}</span>
                    <button class="quantity-btn increment" data-name="${item.name}">+</button>
                </div>
                <span class="item-total-price">$ ${itemTotalPrice.toFixed(2)}</span>
            `;
            cartListElement.appendChild(listItem);
            
            // 2. Calculate Subtotal
            subtotal += itemTotalPrice;
        });
        
        // **IMPORTANT:** Attach event listeners after rendering the new elements
        attachQuantityEventListeners();
    }

    // 3. Calculate GST and Total
    const gstAmount = subtotal * GST_RATE;
    const finalTotal = subtotal + gstAmount;

    // 4. Update values in HTML
    subtotalElement.textContent = `$ ${subtotal.toFixed(2)}`;
    gstAmountElement.textContent = `$ ${gstAmount.toFixed(2)}`;
    finalTotalElement.textContent = `$ ${finalTotal.toFixed(2)}`;
}


// 🖱️ 'Add to Order' button click event
document.querySelectorAll('.add-to-cart-btn').forEach(button => {
    button.addEventListener('click', (event) => {
        const price = parseFloat(event.target.getAttribute('data-item-price'));
        const name = event.target.getAttribute('data-item-name');
        
        if (isNaN(price)) return; 

        const existingItem = cart.find(item => item.name === name);

        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push({ name, price, quantity: 1 });
        }
        
        // ✅ Visual Confirmation: Button flashes 'Added! ✓'
        const originalText = event.target.textContent;
        event.target.textContent = 'confirm! ✓';
        event.target.disabled = true;
        setTimeout(() => {
            event.target.textContent = originalText;
            event.target.disabled = false;
        }, 800);

        updateCartAndCalculate();
    });
});

// 🚀 Checkout button event
checkoutBtn.addEventListener('click', () => {
    const finalBill = finalTotalElement.textContent;
    alert(`Order placed successfully! Your total payable amount is ${finalBill}. (This is a frontend demo)`);
    
    // Clear cart after checkout (for demo)
    cart.length = 0; 
    updateCartAndCalculate();
});

// Initial call to set up the cart on page load
updateCartAndCalculate();