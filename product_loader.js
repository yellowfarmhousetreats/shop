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

  // Group products by category
  const productsByCategory = {};
  for (const item of menuItems) {
    if (!productsByCategory[item.category]) {
      productsByCategory[item.category] = [];
    }
    productsByCategory[item.category].push(item);
  }

  let globalIndex = 0;

  for (const category of Object.keys(productsByCategory)) {
    const items = productsByCategory[category];
    const sectionResult = createCategorySection(category, items, globalIndex);
    grid.appendChild(sectionResult.node);
    globalIndex = sectionResult.nextIndex;
  }
}

function createCategorySection(category, items, startIndex) {
  const section = document.createElement("div");
  section.className = "category-section";

  const title = document.createElement("h2");
  title.className = "category-title";
  title.textContent = category;
  section.appendChild(title);

  const categoryGrid = document.createElement("div");
  categoryGrid.className = "products-grid";

  let index = startIndex;
  for (const item of items) {
    const card = createProductCard(item, index);
    categoryGrid.appendChild(card);
    updateDietaryOptions(index);
    index++;
  }

  section.appendChild(categoryGrid);
  return { node: section, nextIndex: index };
}

function createProductCard(item, index) {
  const defaultPrice = getDefaultPrice(item);

  const card = document.createElement("div");
  card.className = "product-card";

  if (item.image) {
    const imgWrap = document.createElement("div");
    imgWrap.className = "product-image";
    const img = document.createElement("img");
    img.src = item.image;
    img.alt = item.name || "";
    imgWrap.appendChild(img);
    card.appendChild(imgWrap);
  }

  const header = document.createElement("div");
  header.className = "product-header";
  const nameDiv = document.createElement("div");
  nameDiv.className = "product-name";
  nameDiv.textContent = item.name;
  const priceDiv = document.createElement("div");
  priceDiv.className = "product-price";
  priceDiv.textContent = `from $${defaultPrice.toFixed(2)}`;
  header.appendChild(nameDiv);
  header.appendChild(priceDiv);
  card.appendChild(header);

  const form = document.createElement("div");
  form.className = "product-form";

  // Size select
  const sizeGroup = document.createElement("div");
  sizeGroup.className = "form-group";
  const sizeLabel = document.createElement("label");
  sizeLabel.textContent = "Size:";
  const sizeSelect = document.createElement("select");
  sizeSelect.id = `size-${index}`;
  sizeSelect.className = "size-select";
  sizeSelect.addEventListener("change", () => updatePrice(index));
  for (const size of item.sizes) {
    const opt = document.createElement("option");
    opt.value = size;
    opt.textContent = size;
    sizeSelect.appendChild(opt);
  }
  sizeGroup.appendChild(sizeLabel);
  sizeGroup.appendChild(sizeSelect);
  form.appendChild(sizeGroup);

  // Flavor select (optional)
  if (item.flavors && item.flavors.length > 0) {
    const flavorGroup = document.createElement("div");
    flavorGroup.className = "form-group";
    const flavorLabel = document.createElement("label");
    flavorLabel.textContent = "Flavor:";
    const flavorSelect = document.createElement("select");
    flavorSelect.id = `flavor-${index}`;
    flavorSelect.className = "flavor-select";
    flavorSelect.addEventListener("change", () => updateDietaryOptions(index));
    for (const flavor of item.flavors) {
      const opt = document.createElement("option");
      opt.value = flavor;
      opt.textContent = flavor;
      flavorSelect.appendChild(opt);
    }
    flavorGroup.appendChild(flavorLabel);
    flavorGroup.appendChild(flavorSelect);
    form.appendChild(flavorGroup);
  }

  // Flavor notes (optional)
  if (item.flavorNotes) {
    const notesGroup = document.createElement("div");
    notesGroup.className = "form-group";
    const notesLabel = document.createElement("label");
    notesLabel.textContent = "Flavor Notes:";
    const notesInput = document.createElement("input");
    notesInput.type = "text";
    notesInput.id = `notes-${index}`;
    notesInput.className = "flavor-notes";
    notesInput.placeholder = "Optional flavor preferences";
    notesGroup.appendChild(notesLabel);
    notesGroup.appendChild(notesInput);
    form.appendChild(notesGroup);
  }

  // Quantity
  const qtyGroup = document.createElement("div");
  qtyGroup.className = "form-group";
  const qtyLabel = document.createElement("label");
  qtyLabel.textContent = "Quantity:";
  const qtyInput = document.createElement("input");
  qtyInput.type = "number";
  qtyInput.id = `qty-${index}`;
  qtyInput.className = "quantity-input";
  qtyInput.min = "1";
  qtyInput.value = "1";
  qtyGroup.appendChild(qtyLabel);
  qtyGroup.appendChild(qtyInput);
  form.appendChild(qtyGroup);

  // Dietary section
  const dietarySection = document.createElement("div");
  dietarySection.className = "dietary-section";
  dietarySection.id = `dietary-${index}`;

  const dietaryCheckboxes = document.createElement("div");
  dietaryCheckboxes.className = "dietary-checkboxes";

  const glutenOption = document.createElement("div");
  glutenOption.className = "dietary-option";
  glutenOption.id = `gluten-option-${index}`;
  const glutenInput = document.createElement("input");
  glutenInput.type = "checkbox";
  glutenInput.id = `gluten-${index}`;
  glutenInput.className = "gluten-checkbox";
  const glutenLabel = document.createElement("label");
  glutenLabel.htmlFor = `gluten-${index}`;
  glutenLabel.textContent = "Gluten Free";
  glutenOption.appendChild(glutenInput);
  glutenOption.appendChild(glutenLabel);

  const sugarOption = document.createElement("div");
  sugarOption.className = "dietary-option";
  sugarOption.id = `sugar-option-${index}`;
  const sugarInput = document.createElement("input");
  sugarInput.type = "checkbox";
  sugarInput.id = `sugar-${index}`;
  sugarInput.className = "sugar-checkbox";
  const sugarLabel = document.createElement("label");
  sugarLabel.htmlFor = `sugar-${index}`;
  sugarLabel.textContent = "Sugar Free";
  sugarOption.appendChild(sugarInput);
  sugarOption.appendChild(sugarLabel);

  dietaryCheckboxes.appendChild(glutenOption);
  dietaryCheckboxes.appendChild(sugarOption);
  dietarySection.appendChild(dietaryCheckboxes);
  form.appendChild(dietarySection);

  const addBtn = document.createElement("button");
  addBtn.className = "add-to-cart-btn";
  addBtn.textContent = "Add to Cart";
  addBtn.addEventListener("click", () => addToCart(index));
  form.appendChild(addBtn);

  card.appendChild(form);
  return card;
}

function getDefaultPrice(item) {
  if (typeof item.basePrice === "number") return item.basePrice;
  if (item.sizes && item.sizes.length > 0 && item.sizePrice) {
    const firstSize = item.sizes[0];
    return item.sizePrice[firstSize] || 0;
  }
  return 0;
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
  const dietarySection = document.getElementById(`dietary-${index}`);
  const glutenOption = document.getElementById(`gluten-option-${index}`);
  const sugarOption = document.getElementById(`sugar-option-${index}`);
  
  if (item.canGlutenfree) {
    glutenOption.classList.remove('hidden');
  } else {
    glutenOption.classList.add('hidden');
  }
  
  if (item.canSugarfree) {
    sugarOption.classList.remove('hidden');
  } else {
    sugarOption.classList.add('hidden');
  }
  
  if (item.canGlutenfree || item.canSugarfree) {
    dietarySection.classList.remove('hidden');
  } else {
    dietarySection.classList.add('hidden');
  }
}

// ========== DIETARY FILTERING ==========
function updateDietaryFilters() {
  // Removed as dietary tags are no longer in JSON
}

function filterProducts() {
  // Removed as dietary tags are no longer in JSON
}

// ========== INITIALIZE ON PAGE LOAD ==========
document.addEventListener("DOMContentLoaded", initializeProducts);
