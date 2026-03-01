import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BookOpen, ExternalLink } from "lucide-react"

export function CookbookSection() {
  return (
    <Card className="glass-card rounded-3xl overflow-hidden">
      <CardHeader className="text-center px-8 pt-10 pb-4">
        <CardTitle className="flex items-center justify-center gap-3 text-2xl font-playfair tracking-tight">
          <BookOpen className="h-6 w-6 text-crimson" />
          Featured Cookbook
        </CardTitle>
        <CardDescription className="text-base mt-2 leading-relaxed">
          Discover more recipes in our curated cookbook collection
        </CardDescription>
      </CardHeader>
      <CardContent className="text-center space-y-5 px-8 pb-10">
        <h3 className="text-lg font-semibold">FoodDay Cookbook</h3>
        <p className="text-muted-foreground max-w-md mx-auto text-balance leading-relaxed">
          A comprehensive collection of delicious recipes perfect for creating memorable meals together. From quick
          weeknight dinners to special occasion feasts.
        </p>
        <Button asChild className="bg-crimson hover:bg-crimson/90 text-primary-foreground font-medium rounded-full apple-press px-6">
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
