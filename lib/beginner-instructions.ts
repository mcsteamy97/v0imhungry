// Transforms cooking instructions into beginner-friendly format with helpful tips

const cookingTips: Record<string, string> = {
  // Heat-related tips
  "medium heat": "Medium heat means the dial is around 5-6 (halfway). You should hear a gentle sizzle.",
  "high heat": "High heat is 8-10 on your dial. The pan should be very hot before adding food.",
  "low heat": "Low heat is 2-3 on your dial. Perfect for simmering without burning.",
  "simmer": "Simmering means tiny bubbles slowly rising - not a rolling boil.",
  "boil": "Boiling means large bubbles rapidly breaking the surface.",
  "preheat": "Always preheat your oven for 10-15 minutes before baking.",
  
  // Technique tips
  "saute": "Sauteing means cooking quickly in a little oil while stirring frequently.",
  "fold": "Folding means gently mixing by scooping from the bottom and turning over.",
  "whisk": "Whisking means stirring quickly in circles to add air and mix thoroughly.",
  "dice": "Dicing means cutting into small, even cubes (about 1/4 inch).",
  "mince": "Mincing means cutting into very tiny pieces - as small as possible.",
  "julienne": "Julienne means cutting into thin matchstick-sized strips.",
  "chop": "Chopping means cutting into rough, bite-sized pieces - doesn't need to be perfect.",
  "slice": "Slicing means cutting into thin, flat pieces.",
  "season to taste": "Start with a small pinch of salt, taste, and add more if needed.",
  "al dente": "Al dente pasta is cooked but still slightly firm when you bite it.",
  "room temperature": "Take ingredients out of the fridge 30 minutes before cooking.",
  "rest": "Resting meat means letting it sit for 5-10 minutes so juices redistribute.",
  "deglaze": "Add liquid to a hot pan and scrape up the browned bits - that's flavor!",
  "reduce": "Reducing means cooking liquid until some evaporates and it thickens.",
  "blanch": "Blanching means briefly boiling, then plunging into ice water to stop cooking.",
  "sear": "Searing means cooking on very high heat to create a brown crust.",
  "braise": "Braising means cooking slowly in liquid - great for tough cuts of meat.",
  "baste": "Basting means spooning pan juices over food while it cooks.",
}

const equipmentTips: Record<string, string> = {
  "skillet": "A skillet is a flat-bottomed pan with sloped sides - a frying pan works too.",
  "saucepan": "A saucepan is a deep pot with a long handle and lid.",
  "dutch oven": "A Dutch oven is a heavy pot with a lid - great for slow cooking.",
  "baking sheet": "A baking sheet is a flat metal pan, also called a cookie sheet.",
  "mixing bowl": "Any large bowl works for mixing - glass or metal is best.",
  "colander": "A colander is a bowl with holes for draining pasta or washing veggies.",
  "whisk": "A whisk is a wire utensil for mixing - a fork can work in a pinch.",
  "spatula": "A spatula is flat for flipping. A rubber spatula is for scraping bowls.",
}

export interface BeginnerStep {
  stepNumber: number
  instruction: string
  tip?: string
  timing?: string
  safetyNote?: string
}

export function transformToBeginnerFriendly(instructions: string[]): BeginnerStep[] {
  return instructions.map((instruction, index) => {
    const lowerInstruction = instruction.toLowerCase()
    let tip: string | undefined
    let safetyNote: string | undefined
    let timing: string | undefined

    // Check for cooking technique tips
    for (const [keyword, tipText] of Object.entries(cookingTips)) {
      if (lowerInstruction.includes(keyword)) {
        tip = tipText
        break
      }
    }

    // Check for equipment tips if no technique tip found
    if (!tip) {
      for (const [keyword, tipText] of Object.entries(equipmentTips)) {
        if (lowerInstruction.includes(keyword)) {
          tip = tipText
          break
        }
      }
    }

    // Add safety notes for dangerous steps
    if (lowerInstruction.includes("hot oil") || lowerInstruction.includes("deep fry")) {
      safetyNote = "Be careful! Hot oil can splatter. Keep your face away and use long utensils."
    } else if (lowerInstruction.includes("oven") || lowerInstruction.includes("broil")) {
      safetyNote = "Use oven mitts when handling hot pans. The oven and pans stay hot!"
    } else if (lowerInstruction.includes("knife") || lowerInstruction.includes("cut") || lowerInstruction.includes("chop")) {
      safetyNote = "Keep your fingers curled under (like a claw) when cutting to protect them."
    } else if (lowerInstruction.includes("boiling") || lowerInstruction.includes("steam")) {
      safetyNote = "Steam can burn! Lift lids away from you to let steam escape safely."
    }

    // Extract timing if mentioned
    const timeMatch = instruction.match(/(\d+[-\s]?\d*)\s*(minutes?|mins?|hours?|hrs?|seconds?|secs?)/i)
    if (timeMatch) {
      timing = `About ${timeMatch[0]}`
    }

    // Make the instruction clearer for beginners
    let clearedInstruction = instruction
      // Add clarifying phrases
      .replace(/^Heat/i, "Turn on the stove and heat")
      .replace(/^Add/i, "Now add")
      .replace(/^Mix/i, "Stir together to mix")
      .replace(/^Combine/i, "Put together in a bowl and mix")
      .replace(/^Season/i, "Add salt and pepper to season")
      .replace(/^Serve/i, "Put on plates and serve")
      .replace(/^Garnish/i, "For decoration, add")
      .replace(/^Set aside/i, "Put this to the side for now")
      .replace(/^Let/i, "Allow the food to")
      .replace(/^Remove/i, "Take out")
      .replace(/^Drain/i, "Pour through a colander to drain")
      .replace(/^Transfer/i, "Move")
      .replace(/^Stir in/i, "Add and stir in")
      .replace(/^Fold in/i, "Gently mix in")
      .replace(/^Bring to/i, "Heat until it reaches")
      .replace(/^Cover and/i, "Put a lid on and")

    return {
      stepNumber: index + 1,
      instruction: clearedInstruction,
      tip,
      timing,
      safetyNote,
    }
  })
}

export function getBeginnerIngredientTip(ingredient: string): string | undefined {
  const lower = ingredient.toLowerCase()
  
  if (lower.includes("garlic") && lower.includes("clove")) {
    return "A clove is one segment of a garlic bulb. Peel off the papery skin before using."
  }
  if (lower.includes("onion") && lower.includes("dice")) {
    return "Cut off the ends, peel the skin, cut in half, then make a grid pattern of cuts."
  }
  if (lower.includes("egg")) {
    return "Crack eggs on a flat surface (not the bowl edge) to avoid shell pieces."
  }
  if (lower.includes("butter") && lower.includes("soft")) {
    return "Leave butter out for 30-60 minutes, or microwave for 10 seconds at a time."
  }
  if (lower.includes("fresh") && (lower.includes("herb") || lower.includes("basil") || lower.includes("cilantro") || lower.includes("parsley"))) {
    return "Wash herbs gently and pat dry. Remove leaves from stems before chopping."
  }
  if (lower.includes("chicken") || lower.includes("meat")) {
    return "Always wash your hands after handling raw meat. Use a separate cutting board."
  }
  
  return undefined
}
