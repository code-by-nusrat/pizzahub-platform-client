"use client"

import { useSyncExternalStore } from "react"
import { MoonStar, Sun } from "lucide-react"

const STORAGE_KEY = "pizzahub-theme"
const CHANGE_EVENT = "pizzahub-theme-change"

// The class on <html> is the single source of truth. Reading it through
// useSyncExternalStore keeps this button in sync with the inline script in the
// root layout without a hydration mismatch or an extra render after mount.
function subscribe(onChange: () => void) {
  window.addEventListener(CHANGE_EVENT, onChange)
  window.addEventListener("storage", onChange)

  return () => {
    window.removeEventListener(CHANGE_EVENT, onChange)
    window.removeEventListener("storage", onChange)
  }
}

function getSnapshot() {
  return document.documentElement.classList.contains("dark")
}

function getServerSnapshot() {
  return false
}

// Half-moon button in the navbar. First click switches to the dark theme,
// clicking again brings the original cream theme back.
export default function ThemeToggle() {
  const isDark = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)

  function toggleTheme() {
    const next = !document.documentElement.classList.contains("dark")

    document.documentElement.classList.toggle("dark", next)

    try {
      localStorage.setItem(STORAGE_KEY, next ? "dark" : "light")
    } catch {
      // Private mode or storage disabled: the toggle still works for this page.
    }

    window.dispatchEvent(new Event(CHANGE_EVENT))
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
      aria-pressed={isDark}
      title={isDark ? "Light theme" : "Dark theme"}
      className="inline-flex h-10 w-10 items-center justify-center rounded-full transition hover:bg-[var(--nav-hover)]"
      style={{ color: "var(--nav-ink)" }}
    >
      {isDark ? (
        <Sun className="h-5 w-5" />
      ) : (
        <MoonStar className="h-5 w-5" />
      )}
    </button>
  )
}
