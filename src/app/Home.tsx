import { useEffect } from 'react'

import Header from '@/components/Header'
import { checkCode, genCode } from '@/lib/code'
import { ConnectStatus } from '@/lib/webrtc'

import ConnectBox from './ConnectBox'
import Error, { toErrorPage } from './Error'
import FileShareBox from './FileShareBox'
import { FileShareGlobal } from './store'

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
    <main className="flex h-screen flex-col">
      <Header />
      <div className="flex flex-1 flex-row justify-center overflow-y-auto">
        {child}
      </div>
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

  return status !== ConnectStatus.CONNECTED ? <ConnectBox /> : <FileShareBox />
}
