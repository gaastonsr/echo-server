// Native.
const fs = require('fs')
const https = require('https')

// npm.
const express = require('express')
const concat = require('concat-stream')

// Constants.
const port = 8001
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

  response.status(200).send(`<pre>${headers}\n\n${request.body}</pre>`)
});

const server = https.createServer({
  key: fs.readFileSync('./cert/server.key'),
  cert: fs.readFileSync('./cert/server.cert')
}, app)

server.listen(port, () => {
  console.log(`🔒 https echo server ready at https://localhost:${port}/`)
})
