const Client = require('ssh2').Client;
const NeoScp = require('../lib/NeoScp');

const conn = new Client();

conn.connect({
   host: '192.168.0.2',
   port: 22,
   username: 'root',
   password: 'password'
});

const localFile = './file.txt';
const remoteFile = 'tmp/file.txt';

describe('#NeoScp()', () => {
   context('with no argument', () => {
      it('should throw an error', () => {
         conn.on('ready', () => {
            new NeoScp().should.throw();
         });
      })
   });
});

describe('#NeoScp.putFile()', () => {
   context('with no arguments', () => {
      it('should throw an error', () => {
         conn.on('ready', () => {
            new NeoScp().putFile().should.throw();
         });
      })
   });
});

describe('#NeoScp.getFile()', () => {
   context('with no arguments', () => {
      it('should throw an error', () => {
         conn.on('ready', () => {
            new NeoScp().getFile().should.throw();
         });
      })
   });
});