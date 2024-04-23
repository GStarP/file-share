import { atom } from 'helux'
import type { WebRtcManager, getSelectedCandidate } from '@/lib/webrtc'

export enum ConnectStatus {
  WAITING,
  CONNECTING,
  CONNECTED,
  OFFLINE,
}

const [err, setErr] = atom<string>('')
const [status, setStatus] = atom(ConnectStatus.OFFLINE)
const [selectedCandidate, setSelectedCandidate] = atom<
  Awaited<ReturnType<typeof getSelectedCandidate>> | undefined
>(undefined)

export const FileShareStore = {
  err,
  setErr,
  status,
  setStatus,
  selectedCandidate,
  setSelectedCandidate,
}

export const FileShareGlobal = {
  code: '',
  manager: null as WebRtcManager | null,
}
