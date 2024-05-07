import { Home } from '@/app/Home'
import { Toaster } from '@/components/ui/sonner'
import { ThemeProvider } from '@/components/ui/theme-provider'

function App() {
  return (
    <ThemeProvider defaultTheme="dark">
      <Home />
      <Toaster richColors position="top-center" />
    </ThemeProvider>
  )
}

export default App
