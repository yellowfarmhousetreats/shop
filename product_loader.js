// ========== PRODUCT DATA LOADER ==========
let menuItems = [];

async function loadProducts() {
  try {
    const response = await fetch("products.json");
    if (!response.ok) {
      throw new Error("Failed to load products");
    }
    menuItems = await response.json();
    return menuItems;
  } catch (error) {
    console.error("Error loading products:", error);
    return [];
  }
}

// ========== INITIALIZE PRODUCTS ==========
async function initializeProducts() {
  await loadProducts();

  const grid = document.getElementById("productsGrid");
  if (!grid) return;

  grid.innerHTML = "";

  menuItems.forEach((item, index) => {
    const defaultPrice = item.basePrice || item.sizePrice[item.sizes[0]];

    const card = document.createElement("div");
    card.className = "product-card";
    card.innerHTML = `
      <div class="product-header">
        <div class="product-name">${item.emoji} ${item.name}</div>
        <div class="product-price">from $${defaultPrice.toFixed(2)}</div>
      </div>
      <div class="product-form">
        <div class="form-group">
          <label>Size:</label>
          <select id="size-${index}" class="size-select" onchange="updatePrice(${index})">
            ${item.sizes
              .map((size) => `<option value="${size}">${size}</option>`)
              .join("")}
          </select>
        </div>
        ${
          item.flavors && item.flavors.length > 0
            ? `
          <div class="form-group">
            <label>Flavor:</label>
            <select id="flavor-${index}" class="flavor-select" onchange="updateDietaryOptions(${index})">
              ${item.flavors
                .map((flavor) => `<option value="${flavor}">${flavor}</option>`)
                .join("")}
            </select>
          </div>
        `
            : ""
        }
        ${
          item.flavorNotes
            ? `
          <div class="form-group">
            <label>Flavor Notes:</label>
            <input type="text" id="notes-${index}" class="flavor-notes" placeholder="Optional flavor preferences">
          </div>
        `
            : ""
        }
        <div class="form-group">
          <label>Quantity:</label>
          <input type="number" id="qty-${index}" class="quantity-input" min="1" value="1">
        </div>
        <div class="dietary-section" id="dietary-${index}">
          <div class="dietary-checkboxes">
            <div class="dietary-option" id="gluten-option-${index}">
              <input type="checkbox" id="gluten-${index}" class="gluten-checkbox">
              <label for="gluten-${index}">Gluten Free</label>
            </div>
            <div class="dietary-option" id="sugar-option-${index}">
              <input type="checkbox" id="sugar-${index}" class="sugar-checkbox">
              <label for="sugar-${index}">Sugar Free</label>
            </div>
          </div>
        </div>
        <button class="add-to-cart-btn" onclick="addToCart(${index})">Add to Cart</button>
      </div>
    `;
    grid.appendChild(card);
    updateDietaryOptions(index);
  });

  updateDietaryFilters();
}

function updatePrice(index) {
  const item = menuItems[index];
  const cards = document.querySelectorAll(".product-card");
  const card = cards[index];
  const sizeSelect = card.querySelector(".size-select");
  const priceDisplay = card.querySelector(".product-price");

  const selectedSize = sizeSelect.value;
  const price = item.sizePrice[selectedSize] || item.basePrice;
  priceDisplay.textContent = `from $${price.toFixed(2)}`;
}

function updateDietaryOptions(index) {
  const item = menuItems[index];
  const flavorSelect = document.getElementById(`flavor-${index}`);
  const selectedFlavor = flavorSelect.value;
  const dietarySection = document.getElementById(`dietary-${index}`);
  const glutenOption = document.getElementById(`gluten-option-${index}`);
  const sugarOption = document.getElementById(`sugar-option-${index}`);
  
  const flavorNotes = item.flavorNotes[selectedFlavor] || {};
  
  document.getElementById(`gluten-${index}`).checked = false;
  document.getElementById(`sugar-${index}`).checked = false;
  
  if (flavorNotes.glutenFree) {
    glutenOption.classList.remove('hidden');
  } else {
    glutenOption.classList.add('hidden');
  }
  
  if (flavorNotes.sugarFree) {
    sugarOption.classList.remove('hidden');
  } else {
    sugarOption.classList.add('hidden');
  }
  
  if (flavorNotes.glutenFree || flavorNotes.sugarFree) {
    dietarySection.classList.remove('hidden');
  } else {
    dietarySection.classList.add('hidden');
  }
}

// ========== DIETARY FILTERING ==========
function updateDietaryFilters() {
  const dietaryContainer = document.getElementById("dietaryFilters");
  if (!dietaryContainer) return;

  const allDietaryTags = new Set();
  menuItems.forEach((item) => {
    if (item.dietary) {
      item.dietary.forEach((tag) => allDietaryTags.add(tag));
    }
  });

  dietaryContainer.innerHTML = Array.from(allDietaryTags)
    .map(
      (tag) => `
      <label>
        <input type="checkbox" value="${tag}" onchange="filterProducts()">
        ${tag}
      </label>
    `
    )
    .join("");
}

function filterProducts() {
  const checkedFilters = Array.from(
    document.querySelectorAll("#dietaryFilters input:checked")
  ).map((cb) => cb.value);

  const cards = document.querySelectorAll(".product-card");

  cards.forEach((card, index) => {
    const item = menuItems[index];

    if (checkedFilters.length === 0) {
      card.style.display = "block";
    } else {
      const matches = checkedFilters.every(
        (filter) => item.dietary && item.dietary.includes(filter)
      );
      card.style.display = matches ? "block" : "none";
    }
  });
}

// ========== INITIALIZE ON PAGE LOAD ==========
document.addEventListener("DOMContentLoaded", initializeProducts);
