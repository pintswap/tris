const padBuffer = (addr) => {
  return Buffer.from(addr.substr(2).padStart(32*2, 0), 'hex')
}

module.exports = {
  padBuffer
}