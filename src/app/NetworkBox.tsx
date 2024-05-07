import { Globe } from 'lucide-react'

import { IceCandidateInfo } from '@/lib/webrtc'

import { FileShareGlobal } from './store'

export default function NetworkBox() {
  const [networkInfo] = FileShareGlobal.manager.networkInfo.useState()
  const ip = networkInfo?.remote.ip || networkInfo?.remote.address || 'Unknown'
  const type = networkInfo?.remote
    ? connectionType(networkInfo?.remote)
    : 'Unknown'

  return (
    <>
      <div className="m-2 flex h-[20px] flex-row items-center justify-center space-x-2 text-sm sm:hidden">
        <Globe size={16} />
        <div>{type}</div>
      </div>
      <div className="m-6 hidden w-72 flex-col rounded-lg border p-6 sm:flex">
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
