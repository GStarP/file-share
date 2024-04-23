export function toErrorPage(err: string) {
  location.href = `/err#${err}`
}
