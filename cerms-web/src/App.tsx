import { AppRouter } from '@/router/AppRouter'
import { Toaster } from '@/components/ui/sonner'
import { ThemeProvider } from '@/providers/ThemeProvider'
import { TooltipProvider } from '@/components/ui/tooltip'



export default function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <TooltipProvider>
        <AppRouter />
        <Toaster position="top-right" />
      </TooltipProvider>
    </ThemeProvider>
  )
}
