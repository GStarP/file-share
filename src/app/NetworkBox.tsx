import { useEffect } from 'react'
import { ConnectStatus, FileShareGlobal, FileShareStore } from './store'
import { useAtom } from 'helux'
import { IceCandidateInfo, WebRtcManager } from '@/lib/webrtc'
import { Globe } from 'lucide-react'

export default function NetworkBox() {
  useEffect(() => {
    if (FileShareGlobal.manager?.status === ConnectStatus.CONNECTED) {
      ensureSelectedCandidate(FileShareGlobal.manager)
    }
  }, [])

  const [selectedCandidate] = useAtom(FileShareStore.selectedCandidate)
  const ip = selectedCandidate?.remote.ip || selectedCandidate?.remote.address
  const type = selectedCandidate?.remote
    ? connectionType(selectedCandidate?.remote)
    : undefined

  return (
    <>
      <div className="flex sm:hidden flex-row justify-center items-center m-2 text-sm space-x-2 h-[20px]">
        <Globe size={16} />
        <div>{type}</div>
      </div>
      <div className="hidden sm:flex flex-col w-64 border rounded-lg m-6 p-4">
        <div className="flex flex-row items-center justify-between">
          <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight">
            Network
          </h3>
          <Globe size={24} />
        </div>
        <div className="mt-4 flex flex-row">
          <div className="w-1/2">
            <small className="block text-sm">Type</small>
            <p className="mt-1">{type}</p>
          </div>
          <div>
            <small className="block text-sm">Peer IP</small>
            <p className="mt-1">{ip}</p>
          </div>
        </div>
      </div>
    </>
  )
}

async function ensureSelectedCandidate(
  manager: WebRtcManager,
  maxTries = 3,
  interval = 1000
) {
  let tries = 0
  const tryLater = () =>
    setTimeout(async () => {
      const candidate = await manager.getSelectedCandidate()
      tries++
      FileShareStore.setSelectedCandidate(candidate)
      // achieve max tries
      if (tries >= maxTries) return
      // info complete
      if (
        candidate &&
        (candidate.remote.ip || candidate.remote.address) &&
        candidate.remote.candidateType &&
        candidate.remote.protocol
      ) {
        return
      }
      tryLater()
    }, interval)

  tryLater()
}

function connectionType(candidate: IceCandidateInfo): string {
  if (candidate.ip?.startsWith('172') && candidate.candidateType === 'host') {
    return 'LAN'
  } else if (candidate.candidateType === 'relay') {
    return 'Forward'
  } else {
    return 'WAN'
  }
}
