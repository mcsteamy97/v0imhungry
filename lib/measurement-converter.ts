export type MeasurementSystem = "volume" | "metric"

interface ConversionRule {
  pattern: RegExp
  volumeUnit: string
  metricUnit: string
  metricMultiplier: number
  metricUnitLabel: string
}

const conversionRules: ConversionRule[] = [
  // Cups to ml
  { pattern: /(\d+(?:\.\d+)?(?:\/\d+)?)\s*cups?/gi, volumeUnit: "cup", metricUnit: "ml", metricMultiplier: 240, metricUnitLabel: "ml" },
  // Tablespoons to ml
  { pattern: /(\d+(?:\.\d+)?(?:\/\d+)?)\s*(?:tablespoons?|tbsps?|Tbs)/gi, volumeUnit: "tbsp", metricUnit: "ml", metricMultiplier: 15, metricUnitLabel: "ml" },
  // Teaspoons to ml
  { pattern: /(\d+(?:\.\d+)?(?:\/\d+)?)\s*(?:teaspoons?|tsps?)/gi, volumeUnit: "tsp", metricUnit: "ml", metricMultiplier: 5, metricUnitLabel: "ml" },
  // Ounces to grams
  { pattern: /(\d+(?:\.\d+)?(?:\/\d+)?)\s*(?:ounces?|oz)/gi, volumeUnit: "oz", metricUnit: "g", metricMultiplier: 28.35, metricUnitLabel: "g" },
  // Pounds to grams
  { pattern: /(\d+(?:\.\d+)?(?:\/\d+)?)\s*(?:pounds?|lbs?)/gi, volumeUnit: "lb", metricUnit: "g", metricMultiplier: 453.6, metricUnitLabel: "g" },
  // Fluid ounces to ml
  { pattern: /(\d+(?:\.\d+)?(?:\/\d+)?)\s*(?:fluid ounces?|fl\.?\s*oz)/gi, volumeUnit: "fl oz", metricUnit: "ml", metricMultiplier: 29.57, metricUnitLabel: "ml" },
  // Quarts to liters
  { pattern: /(\d+(?:\.\d+)?(?:\/\d+)?)\s*quarts?/gi, volumeUnit: "qt", metricUnit: "L", metricMultiplier: 0.946, metricUnitLabel: "L" },
  // Pints to ml
  { pattern: /(\d+(?:\.\d+)?(?:\/\d+)?)\s*pints?/gi, volumeUnit: "pt", metricUnit: "ml", metricMultiplier: 473, metricUnitLabel: "ml" },
  // Gallons to liters
  { pattern: /(\d+(?:\.\d+)?(?:\/\d+)?)\s*gallons?/gi, volumeUnit: "gal", metricUnit: "L", metricMultiplier: 3.785, metricUnitLabel: "L" },
  // Inches to cm (for baking)
  { pattern: /(\d+(?:\.\d+)?(?:\/\d+)?)\s*(?:inches?|in\.?|")/gi, volumeUnit: "in", metricUnit: "cm", metricMultiplier: 2.54, metricUnitLabel: "cm" },
  // Fahrenheit to Celsius
  { pattern: /(\d+(?:\.\d+)?)\s*°?\s*F(?:ahrenheit)?/gi, volumeUnit: "°F", metricUnit: "°C", metricMultiplier: 0, metricUnitLabel: "°C" },
]

function parseFraction(value: string): number {
  if (value.includes("/")) {
    const parts = value.split("/")
    return parseFloat(parts[0]) / parseFloat(parts[1])
  }
  return parseFloat(value)
}

function formatNumber(num: number): string {
  if (num >= 1000) return Math.round(num).toLocaleString()
  if (Number.isInteger(num)) return num.toString()
  if (num < 10) return num.toFixed(1).replace(/\.0$/, "")
  return Math.round(num).toString()
}

export function convertIngredient(ingredient: string, system: MeasurementSystem): string {
  if (system === "volume") return ingredient

  let result = ingredient

  for (const rule of conversionRules) {
    result = result.replace(rule.pattern, (match, amount) => {
      const numericValue = parseFraction(amount)

      if (rule.volumeUnit === "°F") {
        // Fahrenheit to Celsius conversion
        const celsius = Math.round((numericValue - 32) * (5 / 9))
        return `${celsius}${rule.metricUnitLabel}`
      }

      const metricValue = numericValue * rule.metricMultiplier
      return `${formatNumber(metricValue)} ${rule.metricUnitLabel}`
    })
  }

  return result
}

export function convertIngredients(ingredients: string[], system: MeasurementSystem): string[] {
  return ingredients.map((ingredient) => convertIngredient(ingredient, system))
}

export function convertInstructions(instructions: string[], system: MeasurementSystem): string[] {
  if (system === "volume") return instructions
  return instructions.map((instruction) => convertIngredient(instruction, system))
}
