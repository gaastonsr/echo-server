// Native.
const fs = require('fs')
const https = require('https')

// npm.
const express = require('express')
const concat = require('concat-stream')

// Constants.
const port = process.env.PORT || 8001
const host = process.env.HOST || '127.0.0.1'
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

const server = https.createServer({
  key: fs.readFileSync('./cert/server.key'),
  cert: fs.readFileSync('./cert/server.cert')
}, app)

server.listen({
  port,
  host,
}, () => {
  console.log(`🔒 https echo server ready at https://${host}:${port}/`)
})
