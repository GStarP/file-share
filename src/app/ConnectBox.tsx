import { Copy } from 'lucide-react'
import { toast } from 'sonner'
import QRCode from 'react-qr-code'

export default function ConnectBox() {
  const url = location.href

  const copyUrl = () => {
    navigator.clipboard
      .writeText(url)
      .then(() => {
        toast.success('copied to clipboard')
      })
      .catch((e) => {
        console.error(e)
      })
  }
  return (
    <div className="flex flex-col items-center justify-center flex-1">
      <h4 className="scroll-m-20 text-xl font-semibold tracking-tight mb-8 mt-[-64px]">
        Open on another Device
      </h4>
      <div className="bg-white p-2 rounded w-fit mb-8">
        <QRCode size={200} value={url} />
      </div>
      <div className="flex items-center h-10 border border-input rounded-md px-4 py-2 text-sm">
        <p>{url}</p>
        <Copy
          className="hover:cursor-pointer ml-4 hover:opacity-60 transition-opacity"
          size={18}
          onClick={copyUrl}
        />
      </div>
    </div>
  )
}
