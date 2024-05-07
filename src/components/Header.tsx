import { Github } from 'lucide-react'

import ConnectStatusBox from '@/components/ConnectStatusBox'
import ThemeButton from '@/components/ThemeButton'
import { Button } from '@/components/ui/button'

export default function Header() {
  return (
    <div className="flex h-16 w-full flex-row items-center border-b p-4">
      <ConnectStatusBox />
      <div className="ml-auto flex flex-row space-x-2">
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
