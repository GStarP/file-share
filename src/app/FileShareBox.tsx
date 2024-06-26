import {
  Check,
  Download,
  LogOut,
  MonitorDown,
  MonitorUp,
  X,
} from 'lucide-react'

import FileInput from '@/components/FileInput'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  RecvFile,
  SendFile,
  ShareFileKind,
  ShareFileStatus,
  downloadObjectURL,
} from '@/lib/file'
import { fileSizeStr } from '@/lib/utils'

import { FileShareGlobal } from './store'

export default function FileShareBox() {
  return (
    <div className="flex max-w-[40rem] flex-1 flex-col px-2 py-4 sm:px-4">
      <div className="mb-4 flex gap-4">
        <FileInput
          className="flex-1"
          onChange={(files) => {
            if (files.length > 0) {
              FileShareGlobal.manager.sendFile(files[0])
            }
          }}
        />
        <LogoutBtn />
      </div>
      <FileList />
    </div>
  )
}

function LogoutBtn() {
  return (
    <div className="flex justify-center gap-4 rounded-lg border border-dashed border-error p-6 hover:cursor-pointer hover:bg-accent">
      <LogOut
        className="text-error"
        onClick={() => {
          location.href = '/'
        }}
      />
    </div>
  )
}

function FileList() {
  const [files] = FileShareGlobal.manager.files.useState()

  return (
    <ScrollArea className="flex flex-1">
      <div className="flex w-full flex-1 flex-col gap-2">
        {Array.from(files.values()).map((file) => (
          <FileItem key={file.id} file={file} />
        ))}
      </div>
    </ScrollArea>
  )
}

function FileItem({ file }: { file: SendFile | RecvFile }) {
  const Icon = file.kind === ShareFileKind.SEND ? MonitorUp : MonitorDown

  const progress =
    file.size === 0 ? 0 : Math.min(100, (file.progress / file.size) * 100)

  return (
    <div className="flex flex-row rounded-lg border p-4">
      <Icon className="mr-4" size={28} />

      <div className="mr-1 flex flex-1 flex-col gap-0.5">
        <div className="break-all text-sm">{file.name}</div>
        <div className="flex flex-row items-center text-sm text-muted-foreground">
          <div>
            {file.status === ShareFileStatus.SHARING
              ? file.kind === ShareFileKind.SEND
                ? 'Sending'
                : 'Receiving'
              : STATUS_TEXT[file.status]}
          </div>
          <div className="mx-1.5 h-2/3 w-[1px] bg-border"></div>
          <div>
            {file.status === ShareFileStatus.ERR
              ? file.err || 'Unknown Error'
              : fileSizeStr(file.size)}
          </div>
          {file.status === ShareFileStatus.SHARING && progress < 100 && (
            <>
              <div className="mx-1.5 h-2/3 w-[1px] bg-border"></div>
              <p>{fileSizeStr(file.rate)}/s</p>
            </>
          )}
        </div>
        {file.status === ShareFileStatus.SHARING && (
          <div className="flex items-center">
            <Progress className="mr-2 h-2 flex-1" value={progress} />
            <p className="w-8 text-xs">{progress.toFixed(0)}%</p>
          </div>
        )}
      </div>

      <div className="ml-2 flex h-full flex-row items-center gap-1 self-center">
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
