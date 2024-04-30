import Header from '@/components/Header'
import ConnectBox from './ConnectBox'
import { checkCode, genCode } from '@/lib/code'
import { FileShareGlobal } from './store'
import Error, { toErrorPage } from './Error'
import { useEffect } from 'react'
import { ConnectStatus } from '@/lib/webrtc'
import NetworkBox from './NetworkBox'
import FileShareBox from './FileShareBox'
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
      child = <Main code={code} />
    }
  }

  return (
    <main className="flex flex-col h-screen">
      <Header />
      <div className="flex flex-row flex-1 justify-center">{child}</div>
    </main>
  )
}

function Main({ code }: { code: string }) {
  useEffect(() => {
    const manager = FileShareGlobal.manager
    if (manager.status.state === ConnectStatus.OFFLINE) {
      manager.setup(code)
    }
    return () => {
      manager.close()
    }
  }, [code])

  const [status] = FileShareGlobal.manager.status.useState()

  return status !== ConnectStatus.CONNECTED ? (
    <ConnectBox />
  ) : (
    <div className="w-full h-full">
      <NetworkBox />
      <FileShareBox />
    </div>
  )
}
