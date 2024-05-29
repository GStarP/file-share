import { atomx } from 'helux'
import Peer, { DataConnection, PeerOptions } from 'peerjs'
import { toast } from 'sonner'

export enum ConnectStatus {
  OFFLINE,
  WAITING,
  CONNECTING,
  CONNECTED,
}

const PEERJS_CONFIG: PeerOptions = {
  debug: 3,
  config: {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun.l.google.com:5349' },
      { urls: 'stun:stun1.l.google.com:3478' },
      { urls: 'stun:stun1.l.google.com:5349' },
      { urls: 'stun:stun2.l.google.com:19302' },
      { urls: 'stun:stun2.l.google.com:5349' },
      { urls: 'stun:stun3.l.google.com:3478' },
      { urls: 'stun:stun3.l.google.com:5349' },
      { urls: 'stun:stun4.l.google.com:19302' },
      { urls: 'stun:stun4.l.google.com:5349' },
    ],
  },
}

const ERR_TEXT = {
  ICE_FAIL: 'Connection to peer failed, please check firewall',
}

export class WebRtcManager {
  code = ''
  status = atomx<ConnectStatus>(ConnectStatus.OFFLINE)
  err = atomx<string | null>(null)
  networkInfo = atomx<Awaited<ReturnType<typeof getSelectedCandidate>> | null>(
    null,
  )

  protected _peer: Peer | null = null
  protected _conn: DataConnection | null = null

  /* @Override */
  protected _onMessage?: (msg: string) => void
  protected _onData?: (data: ArrayBuffer) => void
  protected _onSendProgress?: (progress: number) => void
  protected _onRecvProgress?: (progress: number) => void

  setup(code: string) {
    this.code = code
    this._setupPeerJS()
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
    this.status.setState(ConnectStatus.OFFLINE)
    this.err.setState(null)
    this.networkInfo.setState(null)
  }

  private _setupPeerJS() {
    const realCode = `gstarp_file-share_${this.code}`
    this._peer = new Peer(realCode, PEERJS_CONFIG)
    // if id already taken, just connect it
    this._peer.on('error', (err) => {
      if (err.type === 'unavailable-id') {
        this._connect(realCode)
      }
      // TODO: error handling
      console.error(err)
    })
    this._peer.on('open', () => {
      this.status.setState(ConnectStatus.WAITING)
    })
    this._peer.on('connection', (conn) => {
      this.status.setState(ConnectStatus.CONNECTING)
      this._setupDataConnection(conn)
    })
  }

  private _connect(peerId: string) {
    this._peer?.destroy()
    this._peer = new Peer(PEERJS_CONFIG)
    this._peer.on('open', () => {
      this.status.setState(ConnectStatus.CONNECTING)
      this._setupDataConnection(this._peer!.connect(peerId))
    })
  }

  private _setupDataConnection(dc: DataConnection) {
    this._conn = dc

    this._setupRTCPeerConnection(dc.peerConnection)

    dc.on('open', () => {
      this.status.setState(ConnectStatus.CONNECTED)
      this._ensureNetworkInfo()
      this._peer?.disconnect()
    })
    dc.on('message', (msg) => {
      this._onMessage?.(msg)
    })
    dc.on('data', (data) => {
      this._onData?.(data as ArrayBuffer)
    })
    dc.on('recvProgress', (progress) => {
      this._onRecvProgress?.(progress)
    })
    dc.on('sendProgress', (progress) => {
      this._onSendProgress?.(progress)
    })
    dc.on('error', (e) => {
      console.log(`[FS] dc.onerror: ${e}`)
    })
    dc.on('iceStateChanged', (state) => {
      console.log(`[FS] dc.onIceStateChanged: ${state}`)

      if (state === 'disconnected' || state === 'failed') {
        this.err.setState(ERR_TEXT.ICE_FAIL)
      }
    })
    dc.on('close', () => {
      console.log('[FS] dc.onclose')
      toast.warning('Peer has left')
    })
  }

  private _setupRTCPeerConnection(pc: RTCPeerConnection) {
    pc.oniceconnectionstatechange = () => {
      console.log(
        `[FS] pc.oniceconnectionstatechange: ${pc.iceConnectionState}`,
      )
      if (
        pc.iceConnectionState === 'disconnected' ||
        pc.iceConnectionState === 'failed'
      ) {
        this.err.setState(ERR_TEXT.ICE_FAIL)
      }
    }
  }

  private async _ensureNetworkInfo(maxTries = 3, interval = 1000) {
    let tries = 0
    const tryLater = () =>
      setTimeout(async () => {
        const pc = this._conn?.peerConnection
        if (pc) {
          const candidate = await getSelectedCandidate(pc)
          console.debug('ensureSelectedCandidate', candidate)
          tries++
          this.networkInfo.setState(candidate)
          // info complete
          if (
            candidate &&
            (candidate.remote.ip || candidate.remote.address) &&
            candidate.remote.candidateType &&
            candidate.remote.protocol
          ) {
            return
          }
          // achieve max tries
          if (tries >= maxTries) return
        }
        tryLater()
      }, interval)
    tryLater()
  }
}

/**
 * Utils
 */

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
