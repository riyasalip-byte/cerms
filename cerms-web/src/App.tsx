import { AppRouter } from '@/router/AppRouter'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from '@/components/ui/sonner'
import { ThemeProvider } from 'next-themes'
import { TooltipProvider } from '@/components/ui/tooltip'

const queryClient = new QueryClient()

export default function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <TooltipProvider>
        <QueryClientProvider client={queryClient}>
          <AppRouter />
          <Toaster position="top-right" />
        </QueryClientProvider>
      </TooltipProvider>
    </ThemeProvider>
  )
}
