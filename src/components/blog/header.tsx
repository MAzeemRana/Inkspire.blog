'use client'

import { useState } from 'react'
import { useTheme } from 'next-themes'
import { Feather, Moon, Sun, Menu, Lock, Home, LayoutList, Info, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { type View } from '@/lib/store'
import { useRouterView, useNavigate } from '@/lib/router'
import { cn } from '@/lib/utils'
import type { Settings } from '@/lib/types'

interface HeaderProps {
  settings?: Settings
}

export function Header({ settings }: HeaderProps) {
  const view = useRouterView()
  const navigate = useNavigate()
  const { theme, setTheme } = useTheme()
  const [mobileOpen, setMobileOpen] = useState(false)
  const siteName = settings?.siteName || 'Inkspire'

  const go = (v: View) => {
    navigate(v)
    setMobileOpen(false)
  }

  const navItems: { label: string; icon: React.ReactNode; active: boolean; onClick: () => void }[] = [
    { label: 'Home', icon: <Home className="w-4 h-4" />, active: view.name === 'home', onClick: () => go({ name: 'home' }) },
    { label: 'Articles', icon: <LayoutList className="w-4 h-4" />, active: view.name === 'articles', onClick: () => go({ name: 'articles' }) },
    { label: 'About', icon: <Info className="w-4 h-4" />, active: view.name === 'about', onClick: () => go({ name: 'about' }) },
  ]

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/85 backdrop-blur-md supports-[backdrop-filter]:bg-background/70">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex h-16 items-center justify-between gap-4">
          <button
            onClick={() => go({ name: 'home' })}
            className="flex items-center gap-2.5 group"
            aria-label={`${siteName} home`}
          >
            <span className="w-9 h-9 rounded-xl bg-primary text-primary-foreground grid place-items-center shadow-sm group-hover:scale-105 transition-transform">
              <Feather className="w-5 h-5" />
            </span>
            <span className="font-serif text-2xl font-bold tracking-tight">{siteName}</span>
          </button>

          <nav className="hidden md:flex items-center gap-1" aria-label="Main navigation">
            {navItems.map((item) => (
              <Button
                key={item.label}
                variant={item.active ? 'secondary' : 'ghost'}
                size="sm"
                onClick={item.onClick}
                className="rounded-full px-4 font-medium"
              >
                {item.label}
              </Button>
            ))}
          </nav>

          <div className="flex items-center gap-1.5">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full"
              onClick={() => go({ name: 'articles' })}
              aria-label="Search articles"
            >
              <Search className="w-[1.1rem] h-[1.1rem]" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              aria-label="Toggle dark mode"
            >
              <Sun className="w-[1.1rem] h-[1.1rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute w-[1.1rem] h-[1.1rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => go({ name: 'admin' })}
              className="hidden md:inline-flex rounded-full gap-2"
            >
              <Lock className="w-3.5 h-3.5" /> Admin
            </Button>

            {/* Mobile menu */}
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden rounded-full" aria-label="Open menu">
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-72">
                <SheetHeader>
                  <SheetTitle className="font-serif text-xl flex items-center gap-2">
                    <Feather className="w-5 h-5 text-primary" /> {siteName}
                  </SheetTitle>
                </SheetHeader>
                <div className="mt-2 flex flex-col gap-1 px-2">
                  {navItems.map((item) => (
                    <button
                      key={item.label}
                      onClick={item.onClick}
                      className={cn(
                        'flex items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-colors',
                        item.active ? 'bg-secondary text-secondary-foreground' : 'hover:bg-accent'
                      )}
                    >
                      {item.icon} {item.label}
                    </button>
                  ))}
                  <button
                    onClick={() => go({ name: 'admin' })}
                    className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium hover:bg-accent transition-colors"
                  >
                    <Lock className="w-4 h-4" /> Admin Dashboard
                  </button>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  )
}
