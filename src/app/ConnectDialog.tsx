import { CircleX, LoaderCircle } from 'lucide-react'

import { Dialog, DialogContent } from '@/components/ui/dialog'
import { ConnectStatus } from '@/lib/webrtc'

import { FileShareGlobal } from './store'

export function ConnectDialog() {
  const [status] = FileShareGlobal.manager.status.useState()
  const [err] = FileShareGlobal.manager.err.useState()

  const offline = status === ConnectStatus.OFFLINE
  const connecting = status === ConnectStatus.CONNECTING
  const open = offline || connecting

  const isLoading = err === null

  const title = isLoading
    ? offline
      ? 'Connecting to Server'
      : 'Connecting to Peer'
    : err || 'Unknown Error'

  return (
    <Dialog open={open}>
      <DialogContent className="w-[90%] rounded-lg">
        <div className="flex flex-col items-center py-2">
          {isLoading ? (
            <>
              <LoaderCircle className="mb-4 animate-spin" size={48} />
              <p>{title}</p>
            </>
          ) : (
            <>
              <CircleX className="mb-4" size={48} />
              <p className="mb-1 text-center">{title}</p>
              <a className="text-sm text-muted-foreground underline" href="/">
                Retry
              </a>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
