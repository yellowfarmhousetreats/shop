// ========== CART MANAGEMENT ==========
let cart = [];

function addToCart(index) {
  const item = menuItems[index];
  const size = document.getElementById(`size-${index}`).value;
  const flavor = document.getElementById(`flavor-${index}`).value;
  const qty = parseInt(document.getElementById(`qty-${index}`).value) || 1;
  const glutenFree = document.getElementById(`gluten-${index}`)?.checked || false;
  const sugarFree = document.getElementById(`sugar-${index}`)?.checked || false;

  let price = item.basePrice || item.sizePrice[size];
  let flavorUpcharge = item.flavorPrices?.[flavor] || 0;
  let totalPrice = (price + flavorUpcharge) * qty;

  let specs = `${size}`;
  if (flavor !== 'Standard') specs += ` - ${flavor}`;
  if (glutenFree) specs += ' [GF]';
  if (sugarFree) specs += ' [SF]';

  const cartItem = {
    id: Date.now(),
    itemName: item.name,
    emoji: item.emoji,
    specs: specs,
    qty: qty,
    price: totalPrice,
    canShip: item.canShip || false
  };

  cart.push(cartItem);
  updateCart();
  showSuccess(`Added ${qty}x ${item.name} to order!`);
  
  document.getElementById(`qty-${index}`).value = 1;
}

function updateCart() {
  const orderItemsDiv = document.getElementById('orderItems');
  
  if (cart.length === 0) {
    orderItemsDiv.innerHTML = '<div class="empty-items">No items added yet</div>';
  } else {
    orderItemsDiv.innerHTML = cart.map(item => `
      <div class="order-item">
        <div class="order-item-details">
          <div>
            <div class="order-item-name">${item.emoji} ${item.itemName}</div>
            <div class="order-item-specs">${item.qty}x - ${item.specs}</div>
          </div>
          <div class="order-item-price">$${item.price.toFixed(2)}</div>
        </div>
        <div class="order-item-actions">
          <button type="button" class="btn btn-remove btn-small" onclick="removeFromCart(${cart.indexOf(item)})">Remove</button>
        </div>
      </div>
    `).join('');
  }

  checkShippingAvailability();
  calculateTotals();
}

function removeFromCart(index) {
  cart.splice(index, 1);
  updateCart();
}

function clearCart() {
  cart = [];
  updateCart();
}

// ========== SHIPPING AVAILABILITY ==========
function checkShippingAvailability() {
  const shippingNotice = document.getElementById("shippingNotice");
  if (!shippingNotice) return;

  const hasNonShippable = cart.some((item) => !item.canShip);

  if (hasNonShippable) {
    shippingNotice.style.display = "block";
    shippingNotice.innerHTML =
      "⚠️ Some items in your cart require local pickup only.";
  } else {
    shippingNotice.style.display = "none";
  }
}

// ========== PAYMENT DETAILS ==========
const paymentInfo = {
  Cash: "Pay 50% deposit now to secure your appointment. Bring remaining 50% at pickup.",
  "Cash App":
    "Send 50% deposit to: <a href='https://cash.app/$DanaBlueMoonHaven'>$DanaBlueMoonHaven</a>",
  Venmo:
    "Send 50% deposit to: <a href='https://venmo.com/BlueMoonHaven'>@BlueMoonHaven</a> to secure your appointment.",
  PayPal:
    "Send 50% deposit to: <a href='https://paypal.me/BlueMoonHaven'>@BlueMoonHaven</a> to secure your appointment.",
  Zelle:
    "Use Zelle to send 50% deposit to: <strong>805-709-4680</strong> to secure your appointment.",
};

function updatePaymentDetails() {
  const selectedMethod = document.querySelector(
    'input[name="payment_method"]:checked'
  )?.value;
  const detailsDiv = document.getElementById("paymentDetails");
  const contentDiv = document.getElementById("paymentDetailsContent");

  if (selectedMethod && paymentInfo[selectedMethod]) {
    contentDiv.innerHTML = paymentInfo[selectedMethod];
    detailsDiv.style.display = "block";
  } else {
    detailsDiv.style.display = "none";
  }
}

// ========== FULFILLMENT METHODS ==========
function handleFulfillmentChange() {
  const fulfillment = document.querySelector('input[name="fulfillment_method"]:checked').value;
  const pickupSection = document.getElementById('pickupSection');
  const shippingSection = document.getElementById('shippingSection');
  const pickupDateInput = document.getElementById('pickupDate');
  const pickupTimeInput = document.getElementById('pickupTime');
  const shippingInputs = document.querySelectorAll('#shippingSection input');
  const depositInfo = document.getElementById('depositPickupInfo');

  if (fulfillment === 'Pickup') {
    pickupSection.classList.add('visible');
    pickupSection.classList.remove('hidden-section');
    shippingSection.classList.remove('visible');
    shippingSection.classList.add('hidden-section');

    pickupDateInput.required = true;
    pickupTimeInput.required = true;
    shippingInputs.forEach(input => input.required = false);

    document.getElementById('summaryShippingRow').style.display = 'none';
    depositInfo.style.display = 'block';
  } else {
    pickupSection.classList.remove('visible');
    pickupSection.classList.add('hidden-section');
    shippingSection.classList.add('visible');
    shippingSection.classList.remove('hidden-section');

    pickupDateInput.required = false;
    pickupTimeInput.required = false;
    shippingInputs.forEach(input => input.required = true);

    document.getElementById('summaryShippingRow').style.display = 'flex';
    depositInfo.style.display = 'none';
  }
  calculateTotals();
}

// ========== SHIPPING CALCULATION ==========
function calculateShipping() {
  const zipCode = document.getElementById('shippingZip').value;
  let shippingCost = 0;

  if (zipCode) {
    const zip = parseInt(zipCode);
    if (zip >= 83600 && zip <= 83899) {
      shippingCost = 10;
    } else if (zip >= 97000 && zip <= 97999) {
      shippingCost = 15;
    } else if (zip >= 98000 && zip <= 99999) {
      shippingCost = 15;
    } else if (zip >= 84000 && zip <= 84999) {
      shippingCost = 12;
    } else {
      shippingCost = 20;
    }
  }

  document.getElementById('shippingCost').textContent = `$${shippingCost.toFixed(2)}`;
  calculateTotals();
}

// ========== CALCULATE TOTALS ==========
function calculateTotals() {
  let subtotal = cart.reduce((sum, item) => sum + item.price, 0);

  let shippingCost = 0;
  const fulfillment = document.querySelector('input[name="fulfillment_method"]:checked').value;
  if (fulfillment === 'Shipping') {
    const shippingCostText = document.getElementById('shippingCost').textContent;
    shippingCost = parseFloat(shippingCostText.replace('$', '')) || 0;
  }

  const total = subtotal + shippingCost;
  const deposit = total * 0.5; // 50% deposit
  const balance = total - deposit;

  document.getElementById('summarySubtotal').textContent = `$${subtotal.toFixed(2)}`;
  document.getElementById('summaryShipping').textContent = `$${shippingCost.toFixed(2)}`;
  document.getElementById('summaryTotal').textContent = `$${total.toFixed(2)}`;
  document.getElementById('summaryDeposit').textContent = `$${deposit.toFixed(2)}`;
  document.getElementById('summaryBalance').textContent = `$${balance.toFixed(2)}`;

  // Update deposit display
  document.getElementById('depositDisplayAmount').textContent = `$${deposit.toFixed(2)}`;
  document.getElementById('balanceDisplayAmount').textContent = `$${balance.toFixed(2)}`;

  const orderDetails = cart.map(item =>
    `${item.qty}x ${item.itemName} - ${item.specs}: $${item.price.toFixed(2)}`
  ).join('\n');
  document.getElementById('orderSummary').value = orderDetails + `\n\nTotal: $${total.toFixed(2)}\n50% Deposit Due: $${deposit.toFixed(2)}\nBalance Due at Pickup: $${balance.toFixed(2)}`;
}

// ========== FORM SUBMISSION ==========
document.getElementById('orderForm').addEventListener('submit', function(e) {
  if (cart.length === 0) {
    e.preventDefault();
    showError('Please add at least one item to your order.');
    return;
  }

  const name = document.getElementById('customerName').value.trim();
  const phone = document.getElementById('customerPhone').value.trim();
  if (!name || !phone) {
    e.preventDefault();
    showError('Please fill in your name and phone number.');
    return;
  }

  const paymentMethod = document.querySelector('input[name="payment_method"]:checked');
  if (!paymentMethod) {
    e.preventDefault();
    showError('Please select a payment method.');
    return;
  }

  const fulfillment = document.querySelector('input[name="fulfillment_method"]:checked').value;
  if (fulfillment === 'Pickup') {
    const pickupDate = document.getElementById('pickupDate').value;
    const pickupTime = document.getElementById('pickupTime').value;
    if (!pickupDate || !pickupTime) {
      e.preventDefault();
      showError('Please select a pickup date and time.');
      return;
    }
  }

  calculateTotals();
});

// ========== RESET FORM ==========
function resetFormComplete() {
  document.getElementById('orderForm').reset();
  cart = [];
  updateCart();
  document.getElementById('pickupDate').value = '';
  document.getElementById('pickupTime').value = '';

  document.getElementById('fulfillmentPickup').checked = true;
  handleFulfillmentChange();
  document.getElementById('paymentDetails').style.display = 'none';
}

// ========== ALERTS ==========
function showError(message) {
  const alert = document.getElementById('errorAlert');
  alert.textContent = '❌ ' + message;
  alert.classList.add('visible');
  setTimeout(() => alert.classList.remove('visible'), 5000);
}

function showSuccess(message) {
  const alert = document.getElementById('successAlert');
  alert.textContent = '✅ ' + message;
  alert.classList.add('visible');
  setTimeout(() => alert.classList.remove('visible'), 3000);
}

// ========== INITIALIZE ==========
document.addEventListener('DOMContentLoaded', function() {
  checkShippingAvailability();
  calculateTotals();

  const today = new Date().toISOString().split('T')[0];
  document.getElementById('pickupDate').min = today;
});