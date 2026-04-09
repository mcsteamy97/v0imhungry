"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

interface BookmarksContextType {
  bookmarks: string[]
  toggleBookmark: (recipeId: string) => void
  isBookmarked: (recipeId: string) => boolean
}

const BookmarksContext = createContext<BookmarksContextType | undefined>(undefined)

export function BookmarksProvider({ children }: { children: ReactNode }) {
  const [bookmarks, setBookmarks] = useState<string[]>([])
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const saved = localStorage.getItem("hungryBookmarks")
    if (saved) {
      try {
        setBookmarks(JSON.parse(saved))
      } catch (e) {
        console.error("Failed to parse bookmarks", e)
      }
    }
  }, [])

  useEffect(() => {
    if (mounted) {
      localStorage.setItem("hungryBookmarks", JSON.stringify(bookmarks))
    }
  }, [bookmarks, mounted])

  const toggleBookmark = (recipeId: string) => {
    setBookmarks((prev) =>
      prev.includes(recipeId) ? prev.filter((id) => id !== recipeId) : [...prev, recipeId]
    )
  }

  const isBookmarked = (recipeId: string) => bookmarks.includes(recipeId)

  return (
    <BookmarksContext.Provider value={{ bookmarks, toggleBookmark, isBookmarked }}>
      {children}
    </BookmarksContext.Provider>
  )
}

export function useBookmarks() {
  const context = useContext(BookmarksContext)
  if (!context) {
    throw new Error("useBookmarks must be used within BookmarksProvider")
  }
  return context
}
