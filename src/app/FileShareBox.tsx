import { Button } from '@/components/ui/button'
import { FileShareGlobal } from './store'
import {
  RecvFile,
  SendFile,
  ShareFileKind,
  ShareFileStatus,
  downloadObjectURL,
} from '@/lib/file'
import { Check, Download, MonitorDown, MonitorUp, X } from 'lucide-react'
import { fileSizeStr } from '@/lib/utils'

export default function FileShareBox() {
  return (
    <div className="flex flex-col flex-1 p-2">
      <input
        type="file"
        className="mt-2 mb-4"
        onChange={(e) => {
          const file = e.target.files?.[0]
          console.log('upload file', file)
          if (file) {
            FileShareGlobal.manager?.sendFile(file)
          }
        }}
      />

      <FileList />
    </div>
  )
}

function FileList() {
  const [files] = FileShareGlobal.manager.files.useState()

  return (
    <div className="flex flex-col gap-2">
      {Array.from(files.values()).map((file) => (
        <FileItem key={file.id} file={file} />
      ))}
    </div>
  )
}

function FileItem({ file }: { file: SendFile | RecvFile }) {
  const Icon = file.kind === ShareFileKind.SEND ? MonitorUp : MonitorDown

  return (
    <div className="flex flex-row border rounded-lg p-4">
      <Icon className="mr-4" size={28} />

      <div className="flex flex-col flex-1">
        <div className="mb-0.5 text-sm break-all">{file.name}</div>
        <div className="flex flex-row items-center text-sm text-muted-foreground">
          <div>
            {file.status === ShareFileStatus.SHARING
              ? file.kind === ShareFileKind.SEND
                ? 'Sending'
                : 'Receiving'
              : STATUS_TEXT[file.status]}
          </div>
          <div className="w-[1px] h-2/3 bg-border mx-1.5"></div>
          <div>
            {file.status === ShareFileStatus.ERR
              ? file.err || 'Unknown Error'
              : fileSizeStr(file.size)}
          </div>
        </div>
      </div>

      <div className="flex flex-row items-center h-full gap-2 ml-2">
        {file.status === ShareFileStatus.WAITING &&
          file.kind === ShareFileKind.RECV && (
            <>
              <Button variant="ghost" size="icon">
                <Check
                  onClick={() =>
                    FileShareGlobal.manager?.ackSendFile(file.id, true)
                  }
                />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() =>
                  FileShareGlobal.manager?.ackSendFile(file.id, false)
                }
              >
                <X />
              </Button>
            </>
          )}

        {file.status === ShareFileStatus.OK &&
          file.kind === ShareFileKind.RECV && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                console.debug('blobUrl', file.blobUrl)
                if (file.blobUrl) {
                  downloadObjectURL(file.blobUrl, file.name)
                }
              }}
            >
              <Download />
            </Button>
          )}
      </div>
    </div>
  )
}

const STATUS_TEXT: Record<ShareFileStatus, string> = {
  [ShareFileStatus.WAITING]: 'Waiting',
  [ShareFileStatus.ERR]: 'Error',
  [ShareFileStatus.QUEUEING]: 'Queueing',
  [ShareFileStatus.SHARING]: 'Sharing',
  [ShareFileStatus.OK]: 'Success',
}
