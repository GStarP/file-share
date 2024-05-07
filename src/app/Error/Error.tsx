import { Button } from '@/components/ui/button'

export default function Error() {
  const err = decodeURIComponent(location.hash.replace('#', ''))

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="mb-6 mt-[-2.5rem] flex flex-row items-center space-x-3 text-4xl">
        <p>ERROR</p>
        <div className="h-[2rem] w-[1px] bg-border"></div>
        <p>{err.toUpperCase()}</p>
      </div>
      <Button
        className="w-64"
        onClick={() => {
          location.href = '/'
        }}
      >
        Restart
      </Button>
    </div>
  )
}
