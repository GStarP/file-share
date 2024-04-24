import { Github } from 'lucide-react'
import { Button } from '@/components/ui/button'
import ConnectStatusBox from '@/components/ConnectStatusBox'
import ThemeButton from '@/components/ThemeButton'

export default function Header() {
  return (
    <div className="flex flex-row items-center w-full h-16 border-b p-4">
      <ConnectStatusBox />
      <div className="flex flex-row ml-auto space-x-2">
        <ThemeButton />
        <Button variant="ghost" size="icon" onClick={toGithub}>
          <Github />
        </Button>
      </div>
    </div>
  )
}

function toGithub() {
  window.open('https://github.com/GStarP/file-share', '_blank')
}
