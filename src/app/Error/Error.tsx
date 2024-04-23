import { Button } from '@/components/ui/button'

export default function Error() {
  const err = decodeURIComponent(location.hash.replace('#', ''))

  return (
    <div className="flex flex-col items-center mt-[50vh] translate-y-[calc(-100%_-_64px)]">
      <div className="flex flex-row space-x-3 text-4xl mb-6 items-center">
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
