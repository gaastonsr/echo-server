// Native.
const fs = require('fs')
const https = require('https')
const http = require('http')
const assert = require('assert')

// npm.
const express = require('express')
const concat = require('concat-stream')

// Constants.
const ALLOWED_PROTOCOLS = new Set(['http', 'https'])
const PROTOCOL = process.env.PROTOCOL || 'http'
const PORT = process.env.PORT || 8001
const HOST = process.env.HOST || '127.0.0.1'

assert(
  ALLOWED_PROTOCOLS.has(PROTOCOL),
  `Protocol "${PROTOCOL}" is invalid. Valid options: ${JSON.stringify(Array.from(ALLOWED_PROTOCOLS))}.`,
)

const app = express()

app.use(function(request, response, next){
  request.pipe(concat((data) => {
    // `data` is a Buffer.
    request.body = data
    next()
  }))
})

app.all('*', (request, response) => {
  const headers = Object.entries(request.headers).map(([name, value]) => {
    return `${name}: ${value}`
  }).join('\n')

  const echo = `${headers}\n\n${request.body}`

  console.log(echo)
  response.status(200).send(`<pre>${echo}</pre>`)
});

function getHTTPServer() {
  return http.createServer({}, app)
}

function getHTTPSServer() {
  return https.createServer({
    key: fs.readFileSync('./cert/server.key'),
    cert: fs.readFileSync('./cert/server.cert')
  }, app)
}

function getServer(protocol) {
  switch (protocol) {
    case 'http': return getHTTPServer()
    case 'https': return getHTTPSServer()
    default: throw new Error(`Invalid protocol "${protocol}"`)
  }
}

getServer(PROTOCOL).listen({ port: PORT, host: HOST }, () => {
  console.log(`🔒 ${PROTOCOL} server ready at https://${HOST}:${PORT}/`)
})
