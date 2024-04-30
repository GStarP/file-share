import { FileShareManager } from '@/lib/file'

export const FileShareStore = {}

export const FileShareGlobal = {
  manager: new FileShareManager(),
}

if (import.meta.env.DEV) {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  window.store = FileShareGlobal
}
