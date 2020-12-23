const httpProxy = require('http-proxy')
const https = require('https')
const fs = require('fs')

const proxy = httpProxy.createServer()

const api = 'http://localhost:3000'
const apex = 'http://localhost:3001'
const admin = 'http://localhost:3002'

const key = fs.readFileSync('./.cert/key.pem')
const cert = fs.readFileSync('./.cert/cert.pem')
const server = https.createServer({ key: key, cert: cert }, (req, res) => {
  let target = apex

  if (req.headers.host.startsWith('api.')) {
    target = api
  } else if (req.headers.host.startsWith('admin.')) {
    target = admin
  }
  // console.log(
  //   'reverse proxy request for',
  //   'req.headers.host:',
  //   req.headers.host,
  //   'target:',
  //   target
  // )
  proxy.web(req, res, { target })
})

try {
  server.listen(443, () => {
    console.log('https proxy ready.')
  })
} catch (e) {
  console.warn('caught proxy.web error:', e)
}
