import clsx from 'clsx'
import { CloudUpload } from 'lucide-react'
import { useRef } from 'react'

type Props = {
  className?: string
  onChange?: (files: File[]) => void
}

export default function FileInput({ className, onChange }: Props) {
  const realInputRef = useRef<HTMLInputElement>(null)

  const realOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange?.(Array.from(e.target.files || []))
  }

  return (
    <div
      className={clsx([
        'flex flex-row justify-center gap-4 rounded-lg border border-dashed border-primary p-6 hover:cursor-pointer hover:bg-accent',
        className,
      ])}
      onClick={() => realInputRef.current?.click()}
    >
      <CloudUpload />
      <p>Click to Share</p>
      <input
        ref={realInputRef}
        type="file"
        className="hidden"
        onChange={realOnChange}
      ></input>
    </div>
  )
}
