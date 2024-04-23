import { ThemeProvider } from '@/components/ui/theme-provider'
import { Toaster } from '@/components/ui/sonner'
import { Home } from '@/app/Home'

function App() {
  return (
    <ThemeProvider defaultTheme="dark">
      <Home />
      <Toaster richColors position="top-center" />
    </ThemeProvider>
  )
}

export default App
