'use client'

import { useState, useCallback, useEffect } from "react"
import { useRouter } from "next/navigation"
import { CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator } from "@/components/ui/command"
import { searchItems } from "@/app/actions/search"
import { Building2, Loader2, LucideLandmark, Search, Users } from "lucide-react"

export function GlobalSearch() {
    const [open, setOpen] = useState(false)
    const [searchQuery, setSearchQuery] = useState("")
    const [results, setResults] = useState<{
        properties: any[]
        spaces: any[]
        tenants: any[]
    }>({ properties: [], spaces: [], tenants: [] })
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault()
                setOpen((open) => !open)
            }
        }

        document.addEventListener("keydown", down)
        return () => document.removeEventListener("keydown", down)
    }, [])

    const handleSearch = useCallback(async (value: string) => {
        setLoading(true)

        try {
            if (!value || value.length < 2) {
                setResults({ properties: [], spaces: [], tenants: [] })
                setLoading(false)
                return
            }

            const data = await searchItems(value)
            setResults(data)
        } catch (error) {
            console.error("Search failed:", error)
            setResults({ properties: [], spaces: [], tenants: [] })
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        const timer = setTimeout(() => {
            handleSearch(searchQuery)
        }, 300)

        return () => clearTimeout(timer)
    }, [searchQuery, handleSearch])

    const onSelect = (href: string) => {
        setOpen(false)
        router.push(href)
    }

    const handleOpenChange = (open: boolean) => {
        setOpen(open)
        if (!open) {
            setSearchQuery("")
            setResults({ properties: [], spaces: [], tenants: [] })
            setLoading(false)
        }
    }

    const handleItemClick = (href: string) => {
      onSelect(href); // Reuse onSelect for consistency and closing
    }


    return (
        <>
            <button
                onClick={() => setOpen(true)}
                className="inline-flex items-center gap-3 px-3 h-9 text-sm text-muted-foreground rounded-md border border-input bg-transparent shadow-sm hover:bg-accent hover:text-accent-foreground transition-colors"
            >
                <Search className="h-4 w-4" />
                <span className="hidden sm:inline-flex mr-4">Search anything...</span>
            </button>

            <CommandDialog open={open} onOpenChange={handleOpenChange}>
                <CommandInput
                    placeholder="Search properties, spaces, tenants..."
                    value={searchQuery}
                    onValueChange={setSearchQuery}
                />
                <CommandList className="max-h-[500px] overflow-y-auto">
                    {loading ? (
                        <CommandEmpty>
                            <div className="flex items-center justify-center gap-2 py-6">
                                <Loader2 className="h-4 w-4 animate-spin" />
                                <span className="text-sm text-muted-foreground">Searching...</span>
                            </div>
                        </CommandEmpty>
                    ) : !searchQuery || searchQuery.length < 2 ? (
                        <CommandEmpty>
                            <div className="flex flex-col items-center justify-center gap-2 py-6">
                                <Search className="h-8 w-8 text-muted-foreground/40" />
                                <span className="text-sm text-muted-foreground">
                                    Enter at least 2 characters to search...
                                </span>
                            </div>
                        </CommandEmpty>
                    ) : results.properties.length === 0 &&
                        results.spaces.length === 0 &&
                        results.tenants.length === 0 ? (
                        <CommandEmpty>
                            <div className="flex flex-col items-center justify-center gap-2 py-6">
                                <span className="text-sm">
                                    No results found for &quot;{searchQuery}&quot;
                                </span>
                            </div>
                        </CommandEmpty>
                    ) : (
                        <>
                            {results.properties.length > 0 && (
                                <CommandGroup heading="Properties">
                                    {results.properties.map((item) => (
                                        <CommandItem
                                            key={item.id}
                                            value={item.title}
                                            onSelect={() => onSelect(item.href)}
                                            onClick={() => handleItemClick(item.href)} // Use handleItemClick
                                            className="cursor-pointer"
                                        >
                                            <div className="flex items-center gap-3 w-full hover:bg-muted hover:text-muted-foreground rounded-md p-2">
                                                <div className="flex h-10 w-10 items-center justify-center rounded-md border bg-background">
                                                    <Building2 className="h-5 w-5" />
                                                </div>
                                                <div className="flex flex-col flex-1 overflow-hidden">
                                                    <div className="font-medium truncate">{item.title}</div>
                                                    <div className="text-xs truncate">
                                                        {item.subtitle}
                                                    </div>
                                                </div>
                                            </div>
                                        </CommandItem>
                                    ))}
                                </CommandGroup>
                            )}
                            {results.spaces.length > 0 && (
                                <>
                                    <CommandSeparator />
                                    <CommandGroup heading="Spaces">
                                        {results.spaces.map((item) => (
                                            <CommandItem
                                                key={item.id}
                                                value={item.title}
                                                onSelect={() => onSelect(item.href)}
                                                onClick={() => handleItemClick(item.href)} // Use handleItemClick
                                                className="cursor-pointer"
                                            >
                                               <div className="flex items-center gap-3 w-full hover:bg-muted hover:text-muted-foreground rounded-md p-2">
                                                    <div className="flex h-10 w-10 items-center justify-center rounded-md border bg-background">
                                                        <LucideLandmark className="h-5 w-5" />
                                                    </div>
                                                    <div className="flex flex-col flex-1 overflow-hidden">
                                                        <div className="font-medium truncate">{item.title}</div>
                                                        <div className="text-xs truncate">
                                                            {item.subtitle}
                                                        </div>
                                                    </div>
                                                </div>
                                            </CommandItem>
                                        ))}
                                    </CommandGroup>
                                </>
                            )}
                            {results.tenants.length > 0 && (
                                <>
                                    <CommandSeparator />
                                    <CommandGroup heading="Tenants">
                                        {results.tenants.map((item) => (
                                            <CommandItem
                                                key={item.id}
                                                value={item.title}
                                                onSelect={() => onSelect(item.href)}
                                                onClick={() => handleItemClick(item.href)} // Use handleItemClick
                                                className="cursor-pointer"
                                            >
                                                <div className="flex items-center gap-3 w-full hover:bg-muted hover:text-muted-foreground rounded-md p-2">
                                                    <div className="flex h-10 w-10 items-center justify-center rounded-md border bg-background">
                                                        <Users className="h-5 w-5" />
                                                    </div>
                                                    <div className="flex flex-col flex-1 overflow-hidden">
                                                        <div className="font-medium text-foreground truncate">{item.title}</div>
                                                        <div className="text-xs text-foreground/70 truncate">
                                                            {item.subtitle}
                                                        </div>
                                                    </div>
                                                </div>
                                            </CommandItem>
                                        ))}
                                    </CommandGroup>
                                </>
                            )}
                            <CommandSeparator />
                            <div className="p-2 text-xs text-muted-foreground">
                                <div className="flex items-center justify-between">
                                    <div className="flex gap-2">
                                        <kbd className="rounded border bg-muted px-1.5 font-mono">↑</kbd>
                                        <kbd className="rounded border bg-muted px-1.5 font-mono">↓</kbd>
                                        <span>to navigate</span>
                                    </div>
                                    <div className="flex gap-2">
                                        <kbd className="rounded border bg-muted px-1.5 font-mono">enter</kbd>
                                        <span>to select</span>
                                    </div>
                                    <div className="flex gap-2">
                                        <kbd className="rounded border bg-muted px-1.5 font-mono">esc</kbd>
                                        <span>to close</span>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </CommandList>
            </CommandDialog>
        </>
    )
}