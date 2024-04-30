import { Button } from '@/components/ui/button'
import { FileShareGlobal } from './store'
import { ShareFileStatus, downloadObjectURL } from '@/lib/file'

export default function FileShareBox() {
  return (
    <div>
      <input
        type="file"
        onChange={(e) => {
          const file = e.target.files?.[0]
          console.log('upload file', file)
          if (file) {
            FileShareGlobal.manager?.sendFile(file)
          }
        }}
      />

      <div className="flex flex-col gap-6">
        <SendFileList />
        <RecvFileList />
      </div>
    </div>
  )
}

function SendFileList() {
  const [sendFileQueue] = FileShareGlobal.manager.sendFileQueue.useState()

  return (
    <div className="flex flex-col">
      <h2>SEND</h2>
      {Array.from(sendFileQueue.values()).map((file) => (
        <div className="flex flex-row gap-4" key={`send-${file.id}`}>
          <div>{file.name}</div>
          <div>{file.type}</div>
          <div>{file.size}</div>

          <div>{file.status}</div>

          {file.status === ShareFileStatus.ERR && <b>{file.err}</b>}
        </div>
      ))}
    </div>
  )
}

function RecvFileList() {
  const [recvFileQueue] = FileShareGlobal.manager.recvFileQueue.useState()

  return (
    <div>
      <h2>RECV</h2>
      {Array.from(recvFileQueue.values()).map((file) => (
        <div className="flex flex-row gap-4" key={`recv-${file.id}`}>
          <div>{file.name}</div>
          <div>{file.type}</div>
          <div>{file.size}</div>

          <div>{file.status}</div>

          {file.status === ShareFileStatus.ERR && <b>{file.err}</b>}

          {file.status === ShareFileStatus.WAITING && (
            <>
              <Button
                onClick={() =>
                  FileShareGlobal.manager?.ackSendFile(file.id, true)
                }
              >
                Confirm
              </Button>
              <Button
                onClick={() =>
                  FileShareGlobal.manager?.ackSendFile(file.id, false)
                }
              >
                Cancel
              </Button>
            </>
          )}

          {file.status === ShareFileStatus.OK && (
            <Button
              onClick={() => {
                console.debug('blobUrl', file.blobUrl)
                if (file.blobUrl) {
                  downloadObjectURL(file.blobUrl, file.name)
                }
              }}
            >
              Download
            </Button>
          )}
        </div>
      ))}
    </div>
  )
}
