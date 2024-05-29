# File Share

[Let's try!](https://file-share-6c2.pages.dev)

## Goal

Quickly share files between devices.

- Quickly -> Browser
- Share files -> WebRTC

## Todo

Limited by [peerjs](https://github.com/peers/peerjs), we cannot impl these features:

- [x] accurate send/recv progress
- [x] handling control message prior to file data chunk
- [ ] improved memory usage

So let's rewrite! My fork is [here](https://github.com/GStarP/peerjs).
