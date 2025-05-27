// Global variables
let currentMealIngredients = []
let currentUser = null

// Google Charts
google.charts.load("current", { packages: ["corechart"] })

// Initialize dashboard
document.addEventListener("DOMContentLoaded", () => {
  checkAuthentication()
  initializeEventListeners()
})

// Check if user is authenticated
async function checkAuthentication() {
  try {
    const response = await fetch("/api/profile")
    if (response.ok) {
      currentUser = await response.json()
      updateWelcomeMessage()
    } else {
      window.location.href = "/login.html"
    }
  } catch (error) {
    console.error("Authentication check failed:", error)
    window.location.href = "/login.html"
  }
}

// Update welcome message with user's name
function updateWelcomeMessage() {
  if (currentUser && currentUser.first_name) {
    const dynName = document.getElementById("dyn-name")
    if (dynName) {
      dynName.textContent = currentUser.first_name + "'s Meals"
    }
  }
}

// Initialize event listeners
function initializeEventListeners() {
  // About form submission
  const aboutForm = document.getElementById("aboutForm")
  if (aboutForm) {
    aboutForm.addEventListener("submit", handleAboutFormSubmit)
  }

  // Meal form submission
  const mealForm = document.getElementById("mealForm")
  if (mealForm) {
    mealForm.addEventListener("submit", handleMealFormSubmit)
  }

  // Enter key for adding ingredients
  const ingredientInput = document.getElementById("ingredient")
  const quantityInput = document.getElementById("quantity")

  if (ingredientInput && quantityInput) {
    ;[ingredientInput, quantityInput].forEach((input) => {
      input.addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
          e.preventDefault()
          addIngredient()
        }
      })
    })
  }
}

// Handle about form submission
async function handleAboutFormSubmit(e) {
  e.preventDefault()

  const formData = new FormData(e.target)
  const data = {
    firstName: currentUser.first_name,
    lastName: currentUser.last_name,
    age: formData.get("age"),
    weight: formData.get("weight"),
    height: formData.get("height"),
    activityLevel: formData.get("activityLevel"),
    dietType: formData.get("dietType"),
  }

  try {
    const response = await fetch("/api/profile", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })

    if (response.ok) {
      alert("Profile updated successfully!")
      currentUser = { ...currentUser, ...data }
      updateWelcomeMessage()
    } else {
      alert("Failed to update profile. Please try again.")
    }
  } catch (error) {
    console.error("Error updating profile:", error)
    alert("Failed to update profile. Please try again.")
  }
}

// Add ingredient to meal
function addIngredient() {
  const ingredientInput = document.getElementById("ingredient")
  const quantityInput = document.getElementById("quantity")

  const ingredient = ingredientInput.value.trim()
  const quantity = Number.parseFloat(quantityInput.value)

  if (!ingredient || !quantity || quantity <= 0) {
    alert("Please enter both ingredient name and a valid quantity.")
    return
  }

  // Add to ingredients array
  currentMealIngredients.push({
    name: ingredient,
    quantity: quantity,
  })

  // Update display
  updateMealList()

  // Clear inputs
  ingredientInput.value = ""
  quantityInput.value = ""
  ingredientInput.focus()
}

// Update meal ingredients list display
function updateMealList() {
  const mealList = document.getElementById("meal-list")

  if (currentMealIngredients.length === 0) {
    mealList.innerHTML = '<p class="text-muted">No ingredients added yet.</p>'
    return
  }

  mealList.innerHTML = currentMealIngredients
    .map(
      (ingredient, index) => `
        <div class="ingredient-item d-flex justify-content-between align-items-center mb-2 p-2 border rounded">
            <span>${ingredient.name} - ${ingredient.quantity}g</span>
            <button type="button" class="btn btn-sm btn-danger" onclick="removeIngredient(${index})">Remove</button>
        </div>
    `,
    )
    .join("")
}

// Remove ingredient from meal
function removeIngredient(index) {
  currentMealIngredients.splice(index, 1)
  updateMealList()
}

// Handle meal form submission
async function handleMealFormSubmit(e) {
  e.preventDefault()

  const formData = new FormData(e.target)
  const mealName = formData.get("mealName")

  if (!mealName.trim()) {
    alert("Please enter a meal name.")
    return
  }

  if (currentMealIngredients.length === 0) {
    alert("Please add at least one ingredient.")
    return
  }

  // Simulate nutritional analysis
  const nutritionalData = calculateNutrition(currentMealIngredients)

  // Save search history
  await saveSearchHistory(mealName, {
    mealName: mealName,
    ingredients: currentMealIngredients,
    nutritionalData: nutritionalData,
  })

  // Save meal to database
  await saveMeal(mealName, currentMealIngredients, nutritionalData)

  // Display results
  displayNutritionalResults(nutritionalData)
}

// Calculate nutrition (simplified simulation)
function calculateNutrition(ingredients) {
  // This is a simplified calculation for demonstration
  // In a real app, you'd use a nutrition API or database
  let totalCalories = 0
  let totalProtein = 0
  let totalCarbs = 0
  let totalFat = 0

  ingredients.forEach((ingredient) => {
    // Simplified nutrition values per 100g
    const nutritionPer100g = getNutritionData(ingredient.name.toLowerCase())
    const factor = ingredient.quantity / 100

    totalCalories += nutritionPer100g.calories * factor
    totalProtein += nutritionPer100g.protein * factor
    totalCarbs += nutritionPer100g.carbs * factor
    totalFat += nutritionPer100g.fat * factor
  })

  return {
    calories: Math.round(totalCalories),
    protein: Math.round(totalProtein * 10) / 10,
    carbs: Math.round(totalCarbs * 10) / 10,
    fat: Math.round(totalFat * 10) / 10,
  }
}

// Get simplified nutrition data (this would normally come from a nutrition API)
function getNutritionData(ingredient) {
  const nutritionDatabase = {
    chicken: { calories: 165, protein: 31, carbs: 0, fat: 3.6 },
    rice: { calories: 130, protein: 2.7, carbs: 28, fat: 0.3 },
    broccoli: { calories: 34, protein: 2.8, carbs: 7, fat: 0.4 },
    salmon: { calories: 208, protein: 22, carbs: 0, fat: 12 },
    pasta: { calories: 131, protein: 5, carbs: 25, fat: 1.1 },
    beef: { calories: 250, protein: 26, carbs: 0, fat: 15 },
    potato: { calories: 77, protein: 2, carbs: 17, fat: 0.1 },
    egg: { calories: 155, protein: 13, carbs: 1.1, fat: 11 },
    bread: { calories: 265, protein: 9, carbs: 49, fat: 3.2 },
    apple: { calories: 52, protein: 0.3, carbs: 14, fat: 0.2 },
    banana: { calories: 89, protein: 1.1, carbs: 23, fat: 0.3 },
    cheese: { calories: 402, protein: 25, carbs: 1.3, fat: 33 },
    milk: { calories: 42, protein: 3.4, carbs: 5, fat: 1 },
    yogurt: { calories: 59, protein: 10, carbs: 3.6, fat: 0.4 },
    spinach: { calories: 23, protein: 2.9, carbs: 3.6, fat: 0.4 },
    tomato: { calories: 18, protein: 0.9, carbs: 3.9, fat: 0.2 },
    carrot: { calories: 41, protein: 0.9, carbs: 10, fat: 0.2 },
    onion: { calories: 40, protein: 1.1, carbs: 9.3, fat: 0.1 },
  }

  // Default values for unknown ingredients
  return nutritionDatabase[ingredient] || { calories: 100, protein: 5, carbs: 15, fat: 3 }
}

// Display nutritional results with chart
function displayNutritionalResults(nutritionalData) {
  const resultsSection = document.getElementById("results-section")
  resultsSection.style.display = "block"

  // Update text display
  const totalTextContainer = document.getElementById("totalTextContainer")
  totalTextContainer.innerHTML = `
        <div class="nutrition-summary">
            <h5>Total Nutrition</h5>
            <p><strong>Calories:</strong> ${nutritionalData.calories} kcal</p>
            <p><strong>Protein:</strong> ${nutritionalData.protein}g</p>
            <p><strong>Carbohydrates:</strong> ${nutritionalData.carbs}g</p>
            <p><strong>Fat:</strong> ${nutritionalData.fat}g</p>
        </div>
    `

  // Create pie chart
  google.charts.setOnLoadCallback(() => drawNutritionChart(nutritionalData))

  // Scroll to results
  resultsSection.scrollIntoView({ behavior: "smooth" })
}

// Draw nutrition pie chart
function drawNutritionChart(nutritionalData) {
  const data = google.visualization.arrayToDataTable([
    ["Nutrient", "Grams"],
    ["Protein", nutritionalData.protein],
    ["Carbohydrates", nutritionalData.carbs],
    ["Fat", nutritionalData.fat],
  ])

  const options = {
    title: "Macronutrient Distribution",
    titleTextStyle: {
      color: "#1f4002",
      fontSize: 18,
      fontName: "Be Vietnam Pro",
    },
    pieHole: 0.4,
    colors: ["#1f4002", "#A8C0A3", "#1a4f11"],
    backgroundColor: "transparent",
    legend: {
      textStyle: {
        color: "#1f4002",
        fontName: "Be Vietnam Pro",
      },
    },
  }

  const chart = new google.visualization.PieChart(document.getElementById("nutritionChart"))
  chart.draw(data, options)
}

// Save search history
async function saveSearchHistory(query, results) {
  try {
    await fetch("/api/search-history", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        searchQuery: query,
        searchResults: results,
      }),
    })
  } catch (error) {
    console.error("Error saving search history:", error)
  }
}

// Save meal to database
async function saveMeal(mealName, ingredients, nutritionalData) {
  try {
    await fetch("/api/meals", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        mealName: mealName,
        ingredients: ingredients,
        nutritionalData: nutritionalData,
      }),
    })
  } catch (error) {
    console.error("Error saving meal:", error)
  }
}

// Reset meal form
function resetMealForm() {
  currentMealIngredients = []
  updateMealList()
  document.getElementById("mealForm").reset()
  document.getElementById("results-section").style.display = "none"
}

// Logout function
async function logout() {
  try {
    await fetch("/api/logout", { method: "POST" })
    window.location.href = "/login.html"
  } catch (error) {
    console.error("Logout error:", error)
    window.location.href = "/login.html"
  }
}
