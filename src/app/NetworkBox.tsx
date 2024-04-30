import { FileShareGlobal } from './store'
import { IceCandidateInfo } from '@/lib/webrtc'
import { Globe } from 'lucide-react'

export default function NetworkBox() {
  const [networkInfo] = FileShareGlobal.manager.networkInfo.useState()
  const ip = networkInfo?.remote.ip || networkInfo?.remote.address || 'Unknown'
  const type = networkInfo?.remote
    ? connectionType(networkInfo?.remote)
    : 'Unknown'

  return (
    <>
      <div className="flex sm:hidden flex-row justify-center items-center m-2 text-sm space-x-2 h-[20px]">
        <Globe size={16} />
        <div>{type}</div>
      </div>
      <div className="hidden sm:flex flex-col w-72 border rounded-lg m-6 p-6">
        <div className="flex flex-row items-center justify-between">
          <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight">
            Network
          </h3>
          <Globe size={24} />
        </div>
        <div className="mt-6 flex flex-row">
          <div className="w-1/2">
            <small className="text-sm font-medium leading-none">Type</small>
            <p className="mt-1">{type}</p>
          </div>
          <div>
            <small className="text-sm font-medium leading-none">Peer IP</small>
            <p className="mt-1">{ip}</p>
          </div>
        </div>
      </div>
    </>
  )
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
