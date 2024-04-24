import { WebRtcManager } from './webrtc'

export type FileInfo = {
  id: number
  name: string
  type: string
  size: number
}

export type Msg =
  | {
      type: MsgType.SEND
      data: FileInfo
    }
  | {
      type: MsgType.SEND_ACK
      data: boolean
    }

export enum MsgType {
  SEND,
  SEND_ACK,
}

export class FileShareManager extends WebRtcManager {
  private _fid = 0
  private _sendFileQueue: (FileInfo & { file: File })[] = []
  private _recvFileQueue: (FileInfo & { blob?: Blob })[] = []

  constructor(code: string) {
    super(code)
  }

  _onData: ((data: unknown) => void) | undefined = async (data) => {
    if (typeof data === 'string') {
      const msg: Msg = JSON.parse(data)
      if (msg.type === MsgType.SEND) {
        // @DEV
        console.debug(msg)
        this._recvFileQueue.push(msg.data)
        this.sendData(
          JSON.stringify({
            type: MsgType.SEND_ACK,
            data: true,
          })
        )
      } else if (msg.type === MsgType.SEND_ACK) {
        if (msg.data) {
          if (this._sendFileQueue.length === 0) {
            console.error('no file to send')
            return
          }
          const file = this._sendFileQueue[0]
          const buffer = await readFileAsArrayBuffer(file.file)
          this.sendData(buffer)
        } else {
          this._sendFileQueue.shift()
        }
      }
    } else {
      if (this._recvFileQueue.length === 0) {
        console.error('no file to receive')
        return
      }
      const arrayBuffer = data as ArrayBuffer
      const url = arrayBufferToObjectURL(
        arrayBuffer,
        this._recvFileQueue[0].type
      )
      const file = this._recvFileQueue[0]
      downloadObjectURL(url, file.name)
      URL.revokeObjectURL(url)
      this._recvFileQueue.shift()
    }
  }

  sendFile(rawFile: File) {
    const file: FileInfo = {
      id: this._fid++,
      name: rawFile.name,
      type: rawFile.type,
      size: rawFile.size,
    }

    this._sendFileQueue.push({
      ...file,
      file: rawFile,
    })

    const msg: Msg = {
      type: MsgType.SEND,
      data: file,
    }
    this.sendData(JSON.stringify(msg))
  }
}

export function downloadObjectURL(url: string, filename: string) {
  const a = document.createElement('a')
  a.download = filename
  a.href = url
  a.style.display = 'none'
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
}

export function arrayBufferToObjectURL(
  arrayBuffer: ArrayBuffer,
  type: string
): string {
  const blob = new Blob([arrayBuffer], { type })
  return URL.createObjectURL(blob)
}

export async function readFileAsArrayBuffer(file: File): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      resolve(reader.result as ArrayBuffer)
    }
    reader.onerror = () => {
      reject(reader.error)
    }
    reader.readAsArrayBuffer(file)
  })
}
