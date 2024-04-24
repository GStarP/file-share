import Emitter from 'blink-hub'
import Peer, { DataConnection } from 'peerjs'

export enum ConnectStatus {
  WAITING,
  CONNECTING,
  CONNECTED,
  OFFLINE,
}
export type WebRtcManagerEventMap = {
  statusChange: (status: ConnectStatus) => void
}

export class WebRtcManager {
  status = ConnectStatus.OFFLINE

  protected _emitter = new Emitter<WebRtcManagerEventMap>()
  protected _peer: Peer | null = null
  protected _conn: DataConnection | null = null
  protected _onData?: (data: unknown) => void

  constructor(protected _code: string) {
    this._setupPeerJS()
  }

  async getSelectedCandidate() {
    if (this._conn) {
      return await getSelectedCandidate(this._conn.peerConnection)
    }
    return undefined
  }

  sendData(data: string | ArrayBuffer) {
    if (!this._conn) {
      throw new Error('data connection not ready')
    }
    this._conn.send(data)
  }

  close() {
    this._peer?.destroy()
    this._peer = null
    this._setStatus(ConnectStatus.OFFLINE)
  }

  private _setupPeerJS() {
    const code = `gstarp_file-share_${this._code}`
    this._peer = new Peer(code, {
      debug: import.meta.env.DEV ? 3 : 1,
    })
    // if id already taken, just connect it
    this._peer.on('error', (err) => {
      if (err.type === 'unavailable-id') {
        this._connect(code)
      }
      // TODO: error handling
    })
    this._peer.on('open', () => {
      this._setStatus(ConnectStatus.WAITING)
    })
    this._peer.on('connection', (conn) => {
      this._setupDataConnection(conn)
    })
  }

  private _connect(peerId: string) {
    this._peer = new Peer({ debug: import.meta.env.DEV ? 3 : 1 })
    this._peer.on('open', () => {
      this._setStatus(ConnectStatus.CONNECTING)
      this._setupDataConnection(this._peer!.connect(peerId))
    })
  }

  private _setupDataConnection(dc: DataConnection) {
    this._conn = dc
    dc.on('open', () => {
      this._setStatus(ConnectStatus.CONNECTED)
      this._peer?.disconnect()
    })
    dc.on('data', (data) => {
      this._onData?.(data)
    })
  }

  private _setStatus(status: ConnectStatus) {
    this.status = status
    this._emitter.emit('statusChange', status)
  }

  on<E extends keyof WebRtcManagerEventMap>(
    event: E,
    listener: WebRtcManagerEventMap[E]
  ) {
    return this._emitter.subscribe(event, listener)
  }
}

export type IceCandidateInfo = {
  ip?: string
  address?: string
  protocol?: string
  candidateType?: string
  networkType?: string
}

export async function getSelectedCandidate(pc: RTCPeerConnection) {
  let selectedCandidatePair
  const stats = await pc.getStats()

  stats.forEach((report) => {
    if (report.type === 'transport') {
      selectedCandidatePair = stats.get(report.selectedCandidatePairId)
    }
  })

  if (selectedCandidatePair !== undefined) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const pair: any = selectedCandidatePair
    const localCandidate: IceCandidateInfo = stats.get(pair.localCandidateId)
    const remoteCandidate: IceCandidateInfo = stats.get(pair.remoteCandidateId)

    return {
      local: localCandidate,
      remote: remoteCandidate,
    }
  }
}
