import { FileShareStore } from '@/app/store'
import clsx from 'clsx'
import { useAtom } from 'helux'
import './index.css'
import { ConnectStatus } from '@/lib/webrtc'

export default function ConnectStatusBox() {
  const [connectStatus] = useAtom(FileShareStore.status)

  const statusText = connectStatusText(connectStatus)

  return (
    <div className="flex items-center">
      <div
        className={clsx(
          'w-4 h-4 rounded-full',
          `connect-status__${statusText}`
        )}
      ></div>
      <p className="ml-4">
        {statusText[0].toUpperCase() + statusText.slice(1)}
      </p>
    </div>
  )
}
function connectStatusText(status: ConnectStatus) {
  switch (status) {
    case ConnectStatus.WAITING:
      return 'waiting'
    case ConnectStatus.CONNECTING:
      return 'connecting'
    case ConnectStatus.CONNECTED:
      return 'connected'
    case ConnectStatus.OFFLINE:
      return 'offline'
    default:
      return 'unknown'
  }
}
