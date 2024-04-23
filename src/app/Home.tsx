import Header from '@/components/Header'
import ConnectBox from './ConnectBox'
import { checkCode, genCode } from './code'
import { ConnectStatus, FileShareGlobal, FileShareStore } from './store'
import Error, { toErrorPage } from './Error'
import { useEffect } from 'react'
import { WebRtcManager } from '@/lib/webrtc'
import { useAtom } from 'helux'
import NetworkBox from './NetworkBox'
export function Home() {
  const pathname = location.pathname
  let child: JSX.Element | null = null
  if (pathname === '/err') {
    child = <Error />
  } else if (pathname === '/') {
    const code = genCode()
    location.href = `/${code}`
  } else {
    const code = pathname.replace('/', '')
    if (!checkCode(code)) {
      toErrorPage('invalid code')
    } else {
      FileShareGlobal.code = code
      child = <Main />
    }
  }

  return (
    <main className="flex flex-col h-screen">
      <Header />
      <div className="flex flex-row flex-1 justify-center">{child}</div>
    </main>
  )
}

function Main() {
  useEffect(() => {
    if (!FileShareGlobal.manager) {
      const manager = new WebRtcManager(FileShareGlobal.code)
      manager.on('statusChange', (status) => {
        FileShareStore.setStatus(status)
        return void 0
      })
      FileShareGlobal.manager = manager
    }
  }, [])

  const [status] = useAtom(FileShareStore.status)

  return status !== ConnectStatus.CONNECTED ? (
    <ConnectBox />
  ) : (
    <div className="w-full h-full">
      <NetworkBox />
    </div>
  )
}
