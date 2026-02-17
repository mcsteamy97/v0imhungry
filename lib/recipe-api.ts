export interface Recipe {
  id: number
  title: string
  image: string
  readyInMinutes: number
  servings: number
  summary: string
  instructions: string
  extendedIngredients: Array<{
    id: number
    name: string
    amount: number
    unit: string
    original: string
  }>
  diets: string[]
  dishTypes: string[]
  cuisines: string[]
  spoonacularScore: number
  healthScore: number
}

export interface RecipeSearchParams {
  query?: string
  cuisine?: string
  diet?: string
  intolerances?: string
  type?: string
  maxReadyTime?: number
  minHealthScore?: number
  number?: number
  offset?: number
}

export interface ProcessedRecipe {
  id: number
  title: string
  category: string
  time: string
  difficulty: string
  image: string
  description: string
  tags: string[]
  variations: {
    standard: string
    dairyFree: string
    vegan: string
  }
  ingredients: string[]
  instructions: string[]
  servings: number
  healthScore: number
  mealTime?: "Breakfast" | "Lunch/Dinner" | "Dessert/Snack"
}

class RecipeAPIService {
  private baseURL = "https://api.spoonacular.com"
  private apiKey: string | undefined

  constructor() {
    this.apiKey = process.env.SPOONACULAR_API_KEY
    console.log("[v0] RecipeAPIService constructor - window check:", typeof window)
    console.log("[v0] RecipeAPIService constructor - API key available:", !!this.apiKey)
  }

  private hasValidApiKey(): boolean {
    return !!(this.apiKey && this.apiKey !== "demo-key" && this.apiKey.length > 10)
  }

  private logApiKeyStatus() {
    if (!this.apiKey) {
      console.log("[v0] SPOONACULAR_API_KEY environment variable is not set")
    } else if (this.apiKey === "demo-key") {
      console.log("[v0] Using demo API key - API calls will fail")
    } else {
      console.log("[v0] API key is configured")
    }
  }

  async searchRecipes(params: RecipeSearchParams): Promise<Recipe[]> {
    console.log("[v0] searchRecipes called - window check:", typeof window)

    if (!this.hasValidApiKey()) {
      console.log("[v0] No valid API key, using fallback recipes")
      this.logApiKeyStatus()
      return this.getFallbackRecipes(params)
    }

    const searchParams = new URLSearchParams({
      apiKey: this.apiKey!,
      number: (params.number || 12).toString(),
      offset: (params.offset || 0).toString(),
      addRecipeInformation: "true",
      fillIngredients: "true",
      instructionsRequired: "true",
      ...(params.query && { query: params.query }),
      ...(params.cuisine && { cuisine: params.cuisine }),
      ...(params.diet && { diet: params.diet }),
      ...(params.intolerances && { intolerances: params.intolerances }),
      ...(params.type && { type: params.type }),
      ...(params.maxReadyTime && { maxReadyTime: params.maxReadyTime.toString() }),
      ...(params.minHealthScore && { minHealthScore: params.minHealthScore.toString() }),
    })

    try {
      console.log("[v0] Making API request to Spoonacular")
      const response = await fetch(`${this.baseURL}/recipes/complexSearch?${searchParams}`)

      if (!response.ok) {
        console.log(`[v0] API request failed with status: ${response.status}`)
        if (response.status === 401) {
          console.log("[v0] API key is invalid or expired")
        }
        throw new Error(`Recipe API error: ${response.status}`)
      }

      const data = await response.json()
      console.log(`[v0] Successfully fetched ${data.results?.length || 0} recipes`)
      return data.results || []
    } catch (error) {
      console.error("Recipe API error:", error)
      console.log("[v0] Falling back to mock recipes")
      return this.getFallbackRecipes(params)
    }
  }

  async getRecipeById(id: number): Promise<Recipe | null> {
    console.log("[v0] getRecipeById called - window check:", typeof window)

    if (!this.hasValidApiKey()) {
      console.log("[v0] No valid API key, returning null for recipe details")
      this.logApiKeyStatus()
      return null
    }

    try {
      const response = await fetch(
        `${this.baseURL}/recipes/${id}/information?apiKey=${this.apiKey}&includeNutrition=false`,
      )

      if (!response.ok) {
        throw new Error(`Recipe API error: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error("Recipe API error:", error)
      return null
    }
  }

  async getTrendingRecipes(limit = 6): Promise<Recipe[]> {
    console.log("[v0] getTrendingRecipes called - window check:", typeof window)

    if (!this.hasValidApiKey()) {
      console.log("[v0] No valid API key, using fallback trending recipes")
      this.logApiKeyStatus()
      return this.getFallbackTrendingRecipes()
    }

    const searchParams = new URLSearchParams({
      apiKey: this.apiKey!,
      number: limit.toString(),
      addRecipeInformation: "true",
      fillIngredients: "true",
      instructionsRequired: "true",
      sort: "popularity", // Sort by popularity for trending
      minHealthScore: "60", // Ensure quality recipes
      tags: "romantic,date-night,dinner", // Focus on romantic themes
    })

    try {
      const response = await fetch(`${this.baseURL}/recipes/complexSearch?${searchParams}`)

      if (!response.ok) {
        throw new Error(`Trending recipes API error: ${response.status}`)
      }

      const data = await response.json()
      return data.results || []
    } catch (error) {
      console.error("Trending recipes API error:", error)
      return this.getFallbackTrendingRecipes()
    }
  }

  async getRandomPopularRecipes(tags = "romantic,dinner", limit = 3): Promise<Recipe[]> {
    console.log("[v0] getRandomPopularRecipes called - window check:", typeof window)

    if (!this.hasValidApiKey()) {
      console.log("[v0] No valid API key, using fallback random recipes")
      this.logApiKeyStatus()
      return this.getFallbackTrendingRecipes().slice(0, limit)
    }

    try {
      const response = await fetch(
        `${this.baseURL}/recipes/random?apiKey=${this.apiKey}&number=${limit}&tags=${tags}&include-tags=romantic,date-night`,
      )

      if (!response.ok) {
        throw new Error(`Random recipes API error: ${response.status}`)
      }

      const data = await response.json()
      return data.recipes || []
    } catch (error) {
      console.error("Random recipes API error:", error)
      return this.getFallbackTrendingRecipes().slice(0, limit)
    }
  }

  processRecipe(recipe: Recipe): ProcessedRecipe {
    const difficulty = this.getDifficulty(recipe.readyInMinutes, recipe.extendedIngredients?.length || 0)
    const category = this.getCategory(recipe.dishTypes)
    const tags = this.getTags(recipe)
    const mealTime = this.getMealTime(recipe.dishTypes)

    return {
      id: recipe.id,
      title: recipe.title,
      category,
      time: `${recipe.readyInMinutes} min`,
      difficulty,
      image: recipe.image || "/placeholder.svg",
      description: this.cleanSummary(recipe.summary),
      tags,
      variations: this.generateVariations(recipe),
      ingredients: recipe.extendedIngredients?.map((ing) => ing.original) || [],
      instructions: this.parseInstructions(recipe.instructions),
      servings: recipe.servings,
      healthScore: recipe.healthScore || 0,
      mealTime,
    }
  }

  private getDifficulty(time: number, ingredientCount: number): string {
    if (time <= 15 && ingredientCount <= 5) return "Easy"
    if (time <= 45 && ingredientCount <= 10) return "Medium"
    return "Hard"
  }

  private getCategory(dishTypes: string[]): string {
    if (!dishTypes?.length) return "dinner"

    const breakfast = ["breakfast", "brunch", "morning meal"]
    const lunch = ["lunch", "salad", "soup", "sandwich"]

    const dishType = dishTypes[0].toLowerCase()

    if (breakfast.some((type) => dishType.includes(type))) return "breakfast"
    if (lunch.some((type) => dishType.includes(type))) return "lunch"
    return "dinner"
  }

  private getTags(recipe: Recipe): string[] {
    const tags: string[] = []

    if (recipe.diets?.includes("vegetarian")) tags.push("vegetarian")
    if (recipe.diets?.includes("vegan")) tags.push("vegan")
    if (recipe.diets?.includes("gluten free")) tags.push("gluten-free")
    if (recipe.readyInMinutes <= 30) tags.push("quick")
    if (recipe.healthScore > 70) tags.push("healthy")
    if (recipe.dishTypes?.some((type) => type.includes("romantic"))) tags.push("romantic")

    return tags
  }

  private cleanSummary(summary: string): string {
    if (!summary) return "A delicious recipe perfect for romantic dining"

    // Remove HTML tags and limit length
    const cleaned = summary.replace(/<[^>]*>/g, "").trim()
    return cleaned.length > 120 ? cleaned.substring(0, 120) + "..." : cleaned
  }

  private generateVariations(recipe: Recipe): { standard: string; dairyFree: string; vegan: string } {
    const hasVegan = recipe.diets?.includes("vegan")
    const hasDairyFree = recipe.diets?.includes("dairy free")

    return {
      standard: "Classic preparation with traditional ingredients",
      dairyFree: hasDairyFree ? "Already dairy-free!" : "Substitute dairy with plant-based alternatives",
      vegan: hasVegan ? "Already vegan!" : "Replace animal products with plant-based options",
    }
  }

  private parseInstructions(instructions: string): string[] {
    if (!instructions) return ["Instructions not available"]

    // Remove HTML and split into steps
    const cleaned = instructions.replace(/<[^>]*>/g, "").trim()
    return cleaned.split(/\d+\.|\n/).filter((step) => step.trim().length > 10)
  }

  private getFallbackRecipes(params: RecipeSearchParams): Recipe[] {
    const allFallbackRecipes = [
      {
        id: 1001,
        title: "Romantic Candlelit Pasta",
        image: "/pasta-primavera-colorful-vegetables-romantic-lunch.jpg",
        readyInMinutes: 30,
        servings: 2,
        summary: "A romantic pasta dish perfect for intimate dinners with fresh vegetables and herbs",
        instructions:
          "1. Cook pasta according to package directions. 2. Sauté vegetables with garlic and herbs. 3. Toss pasta with vegetables and olive oil. 4. Serve with parmesan and candlelight.",
        extendedIngredients: [
          { id: 1, name: "pasta", amount: 200, unit: "g", original: "200g pasta" },
          { id: 2, name: "garlic", amount: 2, unit: "cloves", original: "2 cloves garlic" },
          { id: 3, name: "bell peppers", amount: 1, unit: "cup", original: "1 cup bell peppers" },
          { id: 4, name: "zucchini", amount: 1, unit: "medium", original: "1 medium zucchini" },
        ],
        diets: ["vegetarian"],
        dishTypes: ["dinner", "main course"],
        cuisines: ["italian"],
        spoonacularScore: 85,
        healthScore: 75,
      },
      {
        id: 1002,
        title: "Cozy Butternut Squash Risotto",
        image: "/butternut-squash-risotto-romantic-dinner.jpg",
        readyInMinutes: 45,
        servings: 2,
        summary: "Creamy, warming risotto perfect for cozy evenings together",
        instructions:
          "1. Roast butternut squash until tender. 2. Warm vegetable stock. 3. Cook arborio rice slowly, adding stock gradually. 4. Stir in roasted squash and parmesan.",
        extendedIngredients: [
          { id: 1, name: "arborio rice", amount: 200, unit: "g", original: "200g arborio rice" },
          { id: 2, name: "butternut squash", amount: 300, unit: "g", original: "300g butternut squash" },
          { id: 3, name: "vegetable stock", amount: 1, unit: "liter", original: "1 liter vegetable stock" },
        ],
        diets: ["vegetarian"],
        dishTypes: ["dinner", "main course"],
        cuisines: ["italian"],
        spoonacularScore: 88,
        healthScore: 82,
      },
      {
        id: 1003,
        title: "Fresh Avocado Toast Breakfast",
        image: "/avocado-toast-breakfast-romantic-morning.jpg",
        readyInMinutes: 10,
        servings: 2,
        summary: "A fresh and healthy breakfast to start your romantic morning",
        instructions:
          "1. Toast artisan bread until golden. 2. Mash ripe avocados with lime and salt. 3. Spread on toast and top with cherry tomatoes. 4. Drizzle with olive oil.",
        extendedIngredients: [
          { id: 1, name: "avocados", amount: 2, unit: "large", original: "2 large avocados" },
          { id: 2, name: "artisan bread", amount: 4, unit: "slices", original: "4 slices artisan bread" },
          { id: 3, name: "cherry tomatoes", amount: 1, unit: "cup", original: "1 cup cherry tomatoes" },
        ],
        diets: ["vegetarian", "vegan"],
        dishTypes: ["breakfast", "brunch"],
        cuisines: ["american"],
        spoonacularScore: 78,
        healthScore: 85,
      },
      {
        id: 3001,
        title: "Fennel & Apple Soup",
        image: "/fennel-apple-soup-elegant-starter.jpg",
        readyInMinutes: 35,
        servings: 4,
        summary:
          "An elegant soup combining the subtle licorice notes of fennel with sweet apples, perfect for romantic dinners",
        instructions:
          "1. Sauté sliced fennel and onions until tender. 2. Add diced apples and vegetable stock. 3. Simmer until flavors meld. 4. Blend until smooth and season to taste.",
        extendedIngredients: [
          { id: 1, name: "fennel bulb", amount: 2, unit: "large", original: "2 large fennel bulbs" },
          { id: 2, name: "apples", amount: 3, unit: "medium", original: "3 medium apples" },
          { id: 3, name: "vegetable stock", amount: 4, unit: "cups", original: "4 cups vegetable stock" },
          { id: 4, name: "onion", amount: 1, unit: "medium", original: "1 medium onion" },
        ],
        diets: ["vegetarian", "vegan", "gluten free"],
        dishTypes: ["soup", "appetizer"],
        cuisines: ["american"],
        spoonacularScore: 82,
        healthScore: 88,
      },
      {
        id: 3002,
        title: "Honey-Crisp Oven-Fried Chicken",
        image: "/honey-crisp-chicken-romantic-main.jpg",
        readyInMinutes: 50,
        servings: 4,
        summary: "A healthier take on fried chicken with a crispy coating and honey glaze, perfect for sharing",
        instructions:
          "1. Coat chicken in seasoned breadcrumbs. 2. Bake until golden and crispy. 3. Brush with honey glaze. 4. Serve hot with your favorite sides.",
        extendedIngredients: [
          { id: 1, name: "chicken pieces", amount: 2, unit: "lbs", original: "2 lbs chicken pieces" },
          { id: 2, name: "panko breadcrumbs", amount: 2, unit: "cups", original: "2 cups panko breadcrumbs" },
          { id: 3, name: "honey", amount: 3, unit: "tbsp", original: "3 tbsp honey" },
          { id: 4, name: "paprika", amount: 1, unit: "tsp", original: "1 tsp paprika" },
        ],
        diets: [],
        dishTypes: ["main course", "dinner"],
        cuisines: ["american"],
        spoonacularScore: 85,
        healthScore: 72,
      },
      {
        id: 3003,
        title: "Squash & Mushroom Salad",
        image: "/squash-mushroom-salad-fresh-romantic.jpg",
        readyInMinutes: 25,
        servings: 4,
        summary: "A vibrant salad featuring roasted squash and sautéed mushrooms, perfect for a light romantic meal",
        instructions:
          "1. Roast cubed squash until tender. 2. Sauté mushrooms with herbs. 3. Combine with mixed greens. 4. Dress with vinaigrette and serve.",
        extendedIngredients: [
          { id: 1, name: "butternut squash", amount: 1, unit: "medium", original: "1 medium butternut squash" },
          { id: 2, name: "mixed mushrooms", amount: 8, unit: "oz", original: "8 oz mixed mushrooms" },
          { id: 3, name: "mixed greens", amount: 4, unit: "cups", original: "4 cups mixed greens" },
          { id: 4, name: "balsamic vinegar", amount: 2, unit: "tbsp", original: "2 tbsp balsamic vinegar" },
        ],
        diets: ["vegetarian", "vegan", "gluten free"],
        dishTypes: ["salad", "side dish"],
        cuisines: ["american"],
        spoonacularScore: 80,
        healthScore: 92,
      },
      {
        id: 3004,
        title: "Hot & Sour Salmon with Greens",
        image: "/hot-sour-salmon-greens-romantic-dinner.jpg",
        readyInMinutes: 30,
        servings: 2,
        summary: "A sophisticated salmon dish with Asian-inspired flavors, perfect for an intimate dinner",
        instructions:
          "1. Marinate salmon in hot and sour sauce. 2. Pan-sear until crispy. 3. Sauté greens with garlic. 4. Serve salmon over greens with sauce.",
        extendedIngredients: [
          { id: 1, name: "salmon fillets", amount: 2, unit: "pieces", original: "2 salmon fillets" },
          { id: 2, name: "mixed greens", amount: 4, unit: "cups", original: "4 cups mixed greens" },
          { id: 3, name: "rice vinegar", amount: 2, unit: "tbsp", original: "2 tbsp rice vinegar" },
          { id: 4, name: "chili sauce", amount: 1, unit: "tbsp", original: "1 tbsp chili sauce" },
        ],
        diets: ["gluten free"],
        dishTypes: ["main course", "dinner"],
        cuisines: ["asian"],
        spoonacularScore: 88,
        healthScore: 85,
      },
      {
        id: 3005,
        title: "Autumn Vegetable Curry",
        image: "/autumn-vegetable-curry-cozy-romantic.jpg",
        readyInMinutes: 40,
        servings: 4,
        summary: "A warming curry featuring seasonal vegetables, perfect for cozy romantic evenings",
        instructions:
          "1. Sauté onions and spices. 2. Add seasonal vegetables and coconut milk. 3. Simmer until tender. 4. Serve with rice or naan.",
        extendedIngredients: [
          { id: 1, name: "sweet potato", amount: 2, unit: "medium", original: "2 medium sweet potatoes" },
          { id: 2, name: "coconut milk", amount: 1, unit: "can", original: "1 can coconut milk" },
          { id: 3, name: "curry powder", amount: 2, unit: "tbsp", original: "2 tbsp curry powder" },
          { id: 4, name: "cauliflower", amount: 1, unit: "head", original: "1 head cauliflower" },
        ],
        diets: ["vegetarian", "vegan", "gluten free"],
        dishTypes: ["main course", "dinner"],
        cuisines: ["indian"],
        spoonacularScore: 86,
        healthScore: 90,
      },
      {
        id: 3006,
        title: "Apple Crisp",
        image: "/apple-crisp-romantic-dessert-cozy.jpg",
        readyInMinutes: 55,
        servings: 6,
        summary: "A classic dessert featuring tender apples with a crispy oat topping, perfect for sharing",
        instructions:
          "1. Slice apples and toss with cinnamon. 2. Make oat crumble topping. 3. Layer in baking dish. 4. Bake until golden and bubbly.",
        extendedIngredients: [
          { id: 1, name: "apples", amount: 6, unit: "large", original: "6 large apples" },
          { id: 2, name: "rolled oats", amount: 1, unit: "cup", original: "1 cup rolled oats" },
          { id: 3, name: "brown sugar", amount: 0.5, unit: "cup", original: "1/2 cup brown sugar" },
          { id: 4, name: "cinnamon", amount: 1, unit: "tsp", original: "1 tsp cinnamon" },
        ],
        diets: ["vegetarian"],
        dishTypes: ["dessert"],
        cuisines: ["american"],
        spoonacularScore: 83,
        healthScore: 65,
      },
      {
        id: 3007,
        title: "Lentil, Apple & Walnut Salad with Cider Dressing",
        image: "/lentil-apple-walnut-salad-healthy-romantic.jpg",
        readyInMinutes: 20,
        servings: 4,
        summary:
          "A nutritious and flavorful salad combining protein-rich lentils with crisp apples and crunchy walnuts",
        instructions:
          "1. Cook lentils until tender. 2. Dice apples and toast walnuts. 3. Make cider vinaigrette. 4. Combine all ingredients and toss with dressing.",
        extendedIngredients: [
          { id: 1, name: "green lentils", amount: 1, unit: "cup", original: "1 cup green lentils" },
          { id: 2, name: "apples", amount: 2, unit: "medium", original: "2 medium apples" },
          { id: 3, name: "walnuts", amount: 0.5, unit: "cup", original: "1/2 cup walnuts" },
          { id: 4, name: "apple cider vinegar", amount: 3, unit: "tbsp", original: "3 tbsp apple cider vinegar" },
        ],
        diets: ["vegetarian", "vegan", "gluten free"],
        dishTypes: ["salad", "main course"],
        cuisines: ["american"],
        spoonacularScore: 87,
        healthScore: 95,
      },
      {
        id: 3008,
        title: "Curried Lentils with Walnuts, Spinach & Cherry Tomatoes",
        image: "/curried-lentils-spinach-romantic-healthy.jpg",
        readyInMinutes: 35,
        servings: 4,
        summary: "A protein-packed curry featuring lentils, fresh spinach, and cherry tomatoes in aromatic spices",
        instructions:
          "1. Cook lentils with curry spices. 2. Add cherry tomatoes and simmer. 3. Stir in fresh spinach. 4. Top with toasted walnuts and serve.",
        extendedIngredients: [
          { id: 1, name: "red lentils", amount: 1, unit: "cup", original: "1 cup red lentils" },
          { id: 2, name: "fresh spinach", amount: 4, unit: "cups", original: "4 cups fresh spinach" },
          { id: 3, name: "cherry tomatoes", amount: 1, unit: "cup", original: "1 cup cherry tomatoes" },
          { id: 4, name: "walnuts", amount: 0.5, unit: "cup", original: "1/2 cup walnuts" },
        ],
        diets: ["vegetarian", "vegan", "gluten free"],
        dishTypes: ["main course", "dinner"],
        cuisines: ["indian"],
        spoonacularScore: 89,
        healthScore: 93,
      },
    ]

    // Filter based on search parameters if provided
    let filteredRecipes = allFallbackRecipes

    if (params.diet) {
      filteredRecipes = filteredRecipes.filter((recipe) =>
        recipe.diets.some((diet) => diet.toLowerCase().includes(params.diet!.toLowerCase())),
      )
    }

    if (params.maxReadyTime) {
      filteredRecipes = filteredRecipes.filter((recipe) => recipe.readyInMinutes <= params.maxReadyTime!)
    }

    return filteredRecipes.slice(0, params.number || 12)
  }

  private getFallbackTrendingRecipes(): Recipe[] {
    return [
      {
        id: 2001,
        title: "Trending: Chocolate Lava Cake for Two",
        image: "/chocolate-lava-cake-romantic-dessert.jpg",
        readyInMinutes: 25,
        servings: 2,
        summary: "The most popular romantic dessert this week - rich, decadent, and perfect for sharing",
        instructions:
          "1. Melt chocolate and butter. 2. Mix with eggs and sugar. 3. Bake in ramekins. 4. Serve immediately with vanilla ice cream.",
        extendedIngredients: [
          { id: 1, name: "dark chocolate", amount: 100, unit: "g", original: "100g dark chocolate" },
          { id: 2, name: "butter", amount: 50, unit: "g", original: "50g butter" },
          { id: 3, name: "eggs", amount: 2, unit: "large", original: "2 large eggs" },
        ],
        diets: ["vegetarian"],
        dishTypes: ["dessert"],
        cuisines: ["french"],
        spoonacularScore: 92,
        healthScore: 45,
      },
      {
        id: 2002,
        title: "Viral: Strawberry Rose Risotto",
        image: "/strawberry-rose-risotto-romantic-pink-dish.jpg",
        readyInMinutes: 35,
        servings: 2,
        summary: "This Instagram-famous pink risotto is taking couples by storm with its unique sweet-savory flavor",
        instructions:
          "1. Prepare rose-infused stock. 2. Cook arborio rice slowly. 3. Add fresh strawberries and rose petals. 4. Finish with parmesan.",
        extendedIngredients: [
          { id: 1, name: "arborio rice", amount: 200, unit: "g", original: "200g arborio rice" },
          { id: 2, name: "fresh strawberries", amount: 150, unit: "g", original: "150g fresh strawberries" },
          { id: 3, name: "rose petals", amount: 2, unit: "tbsp", original: "2 tbsp edible rose petals" },
        ],
        diets: ["vegetarian"],
        dishTypes: ["main course", "dinner"],
        cuisines: ["italian", "fusion"],
        spoonacularScore: 88,
        healthScore: 72,
      },
      {
        id: 2003,
        title: "Popular: Champagne Poached Pears",
        image: "/champagne-poached-pears-elegant-romantic-dessert.jpg",
        readyInMinutes: 45,
        servings: 2,
        summary: "An elegant dessert that's been trending among couples celebrating special occasions",
        instructions:
          "1. Peel pears carefully. 2. Simmer in champagne with spices. 3. Reduce poaching liquid to syrup. 4. Serve with mascarpone.",
        extendedIngredients: [
          { id: 1, name: "pears", amount: 2, unit: "large", original: "2 large pears" },
          { id: 2, name: "champagne", amount: 500, unit: "ml", original: "500ml champagne" },
          { id: 3, name: "cinnamon stick", amount: 1, unit: "piece", original: "1 cinnamon stick" },
        ],
        diets: ["vegetarian", "gluten free"],
        dishTypes: ["dessert"],
        cuisines: ["french"],
        spoonacularScore: 85,
        healthScore: 68,
      },
      {
        id: 4001,
        title: "Chef's Special: Gumbo with Smoked Turkey & Wild Rice",
        image: "/gumbo-smoked-turkey-wild-rice-romantic.jpg",
        readyInMinutes: 60,
        servings: 4,
        summary:
          "A trending recipe from renowned chefs featuring rich gumbo with smoky flavors perfect for date nights",
        instructions:
          "1. Make a dark roux with flour and oil. 2. Add the holy trinity vegetables. 3. Stir in stock and smoked turkey. 4. Simmer with wild rice until tender.",
        extendedIngredients: [
          { id: 1, name: "smoked turkey", amount: 1, unit: "lb", original: "1 lb smoked turkey" },
          { id: 2, name: "wild rice", amount: 1, unit: "cup", original: "1 cup wild rice" },
          { id: 3, name: "okra", amount: 1, unit: "cup", original: "1 cup okra" },
          { id: 4, name: "chicken stock", amount: 6, unit: "cups", original: "6 cups chicken stock" },
        ],
        diets: ["gluten free"],
        dishTypes: ["main course", "dinner"],
        cuisines: ["cajun", "american"],
        spoonacularScore: 90,
        healthScore: 78,
      },
      {
        id: 4002,
        title: "Viral: Oven Roasted Stuffed Portobello Mushrooms",
        image: "/stuffed-portobello-mushrooms-romantic-vegetarian.jpg",
        readyInMinutes: 35,
        servings: 2,
        summary: "These Instagram-famous stuffed mushrooms are perfect for romantic vegetarian dinners",
        instructions:
          "1. Remove mushroom stems and scrape gills. 2. Stuff with herbed breadcrumb mixture. 3. Top with cheese. 4. Roast until tender and golden.",
        extendedIngredients: [
          { id: 1, name: "portobello mushrooms", amount: 4, unit: "large", original: "4 large portobello mushrooms" },
          { id: 2, name: "breadcrumbs", amount: 1, unit: "cup", original: "1 cup breadcrumbs" },
          { id: 3, name: "goat cheese", amount: 4, unit: "oz", original: "4 oz goat cheese" },
          { id: 4, name: "fresh herbs", amount: 0.25, unit: "cup", original: "1/4 cup fresh herbs" },
        ],
        diets: ["vegetarian"],
        dishTypes: ["main course", "dinner"],
        cuisines: ["italian", "american"],
        spoonacularScore: 86,
        healthScore: 82,
      },
      {
        id: 4003,
        title: "Popular: Yogurt Panna Cotta with Cranberry Pear Sauce",
        image: "/yogurt-panna-cotta-cranberry-pear-romantic.jpg",
        readyInMinutes: 30,
        servings: 4,
        summary:
          "An elegant dessert that's been trending for romantic occasions with its creamy texture and tart fruit sauce",
        instructions:
          "1. Dissolve gelatin in warm water. 2. Mix with yogurt and honey. 3. Pour into molds and chill. 4. Make cranberry pear sauce and serve.",
        extendedIngredients: [
          { id: 1, name: "Greek yogurt", amount: 2, unit: "cups", original: "2 cups Greek yogurt" },
          { id: 2, name: "cranberries", amount: 1, unit: "cup", original: "1 cup cranberries" },
          { id: 3, name: "pears", amount: 2, unit: "medium", original: "2 medium pears" },
          { id: 4, name: "honey", amount: 0.25, unit: "cup", original: "1/4 cup honey" },
        ],
        diets: ["vegetarian", "gluten free"],
        dishTypes: ["dessert"],
        cuisines: ["italian"],
        spoonacularScore: 84,
        healthScore: 75,
      },
    ]
  }

  private getMealTime(dishTypes: string[]): string | undefined {
    const breakfast = ["breakfast", "brunch", "morning meal"]
    const lunchDinner = ["lunch", "dinner", "main course", "appetizer"]
    const dessertSnack = ["dessert", "snack"]

    const dishType = dishTypes[0].toLowerCase()

    if (breakfast.some((type) => dishType.includes(type))) return "Breakfast"
    if (lunchDinner.some((type) => dishType.includes(type))) return "Lunch/Dinner"
    if (dessertSnack.some((type) => dishType.includes(type))) return "Dessert/Snack"

    return undefined
  }
}

export const recipeAPI = new RecipeAPIService()
