import { Copy } from 'lucide-react'
import QRCode from 'react-qr-code'
import { toast } from 'sonner'

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
    <div className="flex flex-1 flex-col items-center justify-center">
      <h4 className="mb-8 mt-[-64px] scroll-m-20 text-xl font-semibold tracking-tight">
        Open on another Device
      </h4>
      <div className="mb-8 w-fit rounded bg-white p-2">
        <QRCode size={200} value={url} />
      </div>
      <div className="flex h-10 items-center rounded-md border border-input px-4 py-2 text-sm">
        <p>{url}</p>
        <Copy
          className="ml-4 transition-opacity hover:cursor-pointer hover:opacity-60"
          size={18}
          onClick={copyUrl}
        />
      </div>
    </div>
  )
}
