import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BookOpen, ExternalLink, Heart } from "lucide-react"

export function CookbookSection() {
  return (
    <Card className="border-romantic/20 shadow-lg bg-gradient-to-r from-background to-romantic/5">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2 text-2xl font-playfair">
          <BookOpen className="h-6 w-6 text-primary" />
          Featured Cookbook
        </CardTitle>
        <CardDescription className="text-base">
          Discover more romantic recipes in our curated cookbook collection
        </CardDescription>
      </CardHeader>
      <CardContent className="text-center space-y-4">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Heart className="h-5 w-5 text-romantic" />
          <h3 className="text-lg font-semibold">FoodDay Cookbook</h3>
          <Heart className="h-5 w-5 text-romantic" />
        </div>
        <p className="text-muted-foreground max-w-md mx-auto text-balance">
          A comprehensive collection of delicious recipes perfect for creating memorable meals together. From quick
          weeknight dinners to special occasion feasts.
        </p>
        <Button asChild className="bg-romantic hover:bg-romantic/90 text-white font-medium">
          <a
            href="https://d3n8a8pro7vhmx.cloudfront.net/foodday/pages/24/attachments/original/1341506994/FoodDay_Cookbook.pdf?1341506994"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2"
          >
            <BookOpen className="h-4 w-4" />
            View Cookbook
            <ExternalLink className="h-4 w-4" />
          </a>
        </Button>
      </CardContent>
    </Card>
  )
}
