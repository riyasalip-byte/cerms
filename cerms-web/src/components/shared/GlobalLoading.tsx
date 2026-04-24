import * as React from "react"
import { Loader2 } from "lucide-react"

export function GlobalLoading() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <div className="absolute -inset-4 rounded-full border-2 border-primary/20 animate-ping" />
          <Loader2 className="size-12 animate-spin text-primary" />
        </div>
        <div className="flex flex-col items-center">
          <h2 className="text-lg font-bold tracking-tight">CERMS</h2>
          <p className="text-xs text-muted-foreground animate-pulse">Initializing workspace...</p>
        </div>
      </div>
    </div>
  )
}
