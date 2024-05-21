import { atomx } from 'helux'
import { v4 as uuid } from 'uuid'

import { WebRtcManager } from './webrtc'

type FileInfo = {
  id: string
  type: string
  name: string
  size: number
}

export enum ShareFileStatus {
  WAITING,
  QUEUEING,
  SHARING,
  OK,
  ERR,
}

type ShareFile = FileInfo & {
  status: ShareFileStatus
  err?: string
  progress: number
  rate: number
}

export enum ShareFileKind {
  SEND,
  RECV,
}

export type SendFile = ShareFile & {
  kind: ShareFileKind.SEND
  file: File
}

export type RecvFile = ShareFile & {
  kind: ShareFileKind.RECV
  blobUrl?: string
}

type Msg =
  | {
      type: MsgType.SEND
      data: FileInfo
    }
  | {
      type: MsgType.SEND_ACK
      data: {
        id: string
        ok: boolean
      }
    }
  | {
      type: MsgType.SEND_START
      data: string
    }
  | {
      type: MsgType.RECV
      data: string
    }

enum MsgType {
  SEND,
  SEND_ACK,
  SEND_START,
  RECV,
}

const SHARE_FILE_ERR = {
  REFUSE: 'peer refuse to receive',
  NETWORK: 'network error',
}

class Progress {
  private lastTs = 0
  private lastSize = 0
  private curSize = 0

  constructor(public size: number) {}

  update(size: number) {
    this.curSize += size
    // ! update every 1s
    const ts = Date.now()
    const diff = ts - this.lastTs
    if (diff >= 1000) {
      const progress = this.curSize
      const rate = ((progress - this.lastSize) / diff) * 1000
      this.lastSize = progress
      this.lastTs = ts
      return [this.curSize, rate]
    }
    return null
  }
}

export class FileShareManager extends WebRtcManager {
  files = atomx(new Map<string, SendFile | RecvFile>())

  private _curSendFileId: string | undefined = undefined
  private _curRecvFileId: string | undefined = undefined
  private _sendProgress = new Progress(0)
  private _recvProgress = new Progress(0)

  constructor() {
    super()
  }

  protected _onData: ((data: unknown) => void) | undefined = async (data) => {
    if (typeof data === 'string') {
      const msg: Msg = JSON.parse(data)
      console.debug('[FS] onData', msg)
      if (msg.type === MsgType.SEND) {
        this._onSend(msg.data)
      } else if (msg.type === MsgType.SEND_ACK) {
        this._onSendAck(msg.data)
      } else if (msg.type === MsgType.SEND_START) {
        this._onSendStart(msg.data)
      } else if (msg.type === MsgType.RECV) {
        this._onRecv(msg.data)
      }
    } else {
      this._onFileData(data as ArrayBuffer)
    }
  }

  protected _onDataChunk?: ((data: ArrayBuffer) => void) | undefined = (
    data,
  ) => {
    console.debug('_onDataChunk:', data.byteLength)
    const ret = this._recvProgress.update(data.byteLength)
    if (ret) {
      this.files.setDraft((draft) => {
        if (this._curRecvFileId) {
          const file = draft.get(this._curRecvFileId)
          if (file) {
            file.progress = ret[0]
            file.rate = ret[1]
          }
        }
      })
    }
  }

  protected _onDataChunkSent?: ((size: number) => void) | undefined = (
    size,
  ) => {
    console.debug('_onDataChunkSent:', size)
    const ret = this._sendProgress.update(size)
    if (ret) {
      this.files.setDraft((draft) => {
        if (this._curSendFileId) {
          const file = draft.get(this._curSendFileId)
          if (file) {
            file.progress = ret[0]
            file.rate = ret[1]
          }
        }
      })
    }
  }

  sendFile(rawFile: File) {
    const file: FileInfo = {
      id: uuid(),
      name: rawFile.name,
      type: rawFile.type,
      size: rawFile.size,
    }

    this.files.setDraft((draft) => {
      draft.set(file.id, {
        ...file,
        kind: ShareFileKind.SEND,
        status: ShareFileStatus.WAITING,
        progress: 0,
        rate: 0,
        file: rawFile,
      })
    })

    this.sendData(
      JSON.stringify({
        type: MsgType.SEND,
        data: file,
      }),
    )
  }

  ackSendFile(id: string, ok: boolean) {
    this.sendData(JSON.stringify({ type: MsgType.SEND_ACK, data: { id, ok } }))
    if (ok) {
      this.files.setDraft((draft) => {
        const file = draft.get(id)
        if (file) {
          file.status = ShareFileStatus.QUEUEING
        }
      })
      // if nothing is sharing, start a share
      if (this._curRecvFileId === undefined) {
        this._startRecvFile(id)
      }
    }
  }

  private _onSend(file: FileInfo) {
    this.files.setDraft((draft) => {
      draft.set(file.id, {
        ...file,
        kind: ShareFileKind.RECV,
        status: ShareFileStatus.WAITING,
        progress: 0,
        rate: 0,
      })
    })
  }

  private _onSendAck({ id, ok }: { id: string; ok: boolean }) {
    this.files.setDraft((draft) => {
      const file = draft.get(id)
      if (file && file.kind === ShareFileKind.SEND) {
        if (ok) {
          file.status = ShareFileStatus.SHARING
          this._startSendFile(file)
        } else {
          file.status = ShareFileStatus.ERR
          file.err = SHARE_FILE_ERR.REFUSE
        }
      }
    })
  }

  private _onSendStart(id: string) {
    const file = this.files.stateRoot.val.get(id)
    if (file && file.kind === ShareFileKind.SEND) {
      this._startSendFile(file)
    }
  }

  private _onFileData(data: ArrayBuffer) {
    this.files.setDraft((draft) => {
      if (this._curRecvFileId) {
        const file = draft.get(this._curRecvFileId)
        if (file && file.kind === ShareFileKind.RECV) {
          file.blobUrl = arrayBufferToObjectURL(data, file.type)
          file.status = ShareFileStatus.OK
          file.progress = file.size
          this.sendData(
            JSON.stringify({
              type: MsgType.RECV,
              data: file.id,
            }),
          )
        }
        // cur file sharing finish, try to start next
        this._curRecvFileId = undefined
        let nextRecvFileId = undefined
        for (const file of this.files.stateRoot.val.values()) {
          if (
            file.kind === ShareFileKind.RECV &&
            file.status === ShareFileStatus.QUEUEING
          ) {
            nextRecvFileId = file.id
            break
          }
        }
        if (nextRecvFileId) {
          this._startRecvFile(nextRecvFileId)
        }
      }
    })
  }

  private _onRecv(id: string) {
    this.files.setDraft((draft) => {
      const file = draft.get(id)
      if (file) {
        file.status = ShareFileStatus.OK
      }
    })
  }

  private _startRecvFile(id: string) {
    if (this._curRecvFileId === undefined) {
      this._curRecvFileId = id
      const file = this.files.stateRoot.val.get(id)
      if (file) {
        this._recvProgress = new Progress(file.size)
        this.sendData(JSON.stringify({ type: MsgType.SEND_START, data: id }))
        this.files.setDraft((draft) => {
          const file = draft.get(id)
          if (file) {
            file.status = ShareFileStatus.SHARING
          }
        })
      }
    } else {
      console.warn(
        `_startRecvFile: other file is sharing, id=${this._curRecvFileId}`,
      )
    }
  }

  private async _startSendFile(file: SendFile) {
    this._curSendFileId = file.id
    this._sendProgress = new Progress(file.size)
    console.log('[FS] startSendFile:', this._curSendFileId)
    const buffer = await readFileAsArrayBuffer(file.file)
    this.sendData(buffer)
  }
}

/**
 * Utils
 */

/**
 * trigger browser download for blob url
 * @param url blob uri
 * @param filename download file name
 */
export function downloadObjectURL(url: string, filename: string) {
  const a = document.createElement('a')
  a.download = filename
  a.href = url
  a.style.display = 'none'
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
}

/**
 * convert ArrayBuffer to blob url
 * @param type mime type
 * @returns blob url
 */
export function arrayBufferToObjectURL(
  arrayBuffer: ArrayBuffer,
  type: string,
): string {
  const blob = new Blob([arrayBuffer], { type })
  return URL.createObjectURL(blob)
}

/**
 * read input file as ArrayBuffer
 */
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
