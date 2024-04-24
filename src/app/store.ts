import { atom } from 'helux'
import { ConnectStatus, type getSelectedCandidate } from '@/lib/webrtc'
import { type FileShareManager } from '@/lib/file'

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
  manager: null as FileShareManager | null,
}
