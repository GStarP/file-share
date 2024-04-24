import { FileShareGlobal } from './store'

export default function FileShareBox() {
  return (
    <input
      type="file"
      onChange={(e) => {
        const file = e.target.files?.[0]
        console.log('upload file', file)
        if (file) {
          FileShareGlobal.manager?.sendFile(file)
        }
      }}
    />
  )
}
