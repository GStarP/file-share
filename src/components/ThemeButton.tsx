import { Button } from "@/components/ui/button"
import { useTheme } from "@/components/ui/theme-provider"
import { Sun, Moon} from 'lucide-react'

export default function ThemeButton() {
  const { theme, setTheme } = useTheme()
  const Icon = theme === 'light' ? Sun : Moon

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light')
  }

  return (
    <Button className="transition-none" variant="ghost" size="icon" onClick={toggleTheme}>
      <Icon />
    </Button>
  )
}
