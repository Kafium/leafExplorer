const config = require('./config.json')
const http = require('http');

const localIP = "0.0.0.0"
const port = config.portToListen

const net = require('net')
const explorer = new net.Socket()

explorer.connect(config.nodeToCommunicate.split(':')[1], config.nodeToCommunicate.split(':')[0], function () {
  function answerData(req, res) {
      if(req.url.startsWith('/api/getBlockByHash?')) {
        explorer.write(`getBlockByHash/${req.url.split('?')[1]}&&`)
        waitForData(explorer, 'Block').then(data => {
          res.writeHead(200, {'Content-Type': 'application/json'});

          res.write(data.toString().replace('Block/', '').replace('&&', ''))
          res.end()
        }).catch(err => {
          res.writeHead(200, {'Content-Type': 'application/json'});

          res.write(`{"Error": "${err}"}`)
          res.end()
        })
      }

      if(req.url.startsWith('/api/getDataByWallet?')) {
        explorer.write(`getWalletData/${req.url.split('?')[1]}&&`)
        waitForData(explorer, 'walletData').then(data => {
          res.writeHead(200, {'Content-Type': 'application/json'});

          res.write(data.toString().replace('walletData/', '').replace('&&', ''))
          res.end()
        }).catch(err => {
          res.writeHead(200, {'Content-Type': 'application/json'});

          res.write(`{"Error": "${err}"}`)
          res.end()
        })
      }

  }

  var server = http.createServer(answerData)

  server.listen(port, localIP)

  console.log('Server running at http://'+ localIP +':'+ port +'/')
})

function waitForData(socket, waitingData) {
  return new Promise((resolve, reject) => {
      socket.on('data', listener)

      function listener(data) {
          if(data.toString().includes(waitingData)) {
              resolve(data)
              socket.removeListener('data', listener)
          }
      }
      
      wait(5000).then(() => {
          reject('TIMEOUT')
          socket.removeListener('data', listener)
      })
  })
}

const wait = ms => new Promise(resolve => setTimeout(resolve, ms))