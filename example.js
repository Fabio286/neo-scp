const Client = require('ssh2').Client;
const NeoScp = require('neo-scp');

const conn = new Client();

conn.connect({
   host: '192.168.0.2',
   port: 22,
   username: 'root',
   password: 'password'
});

const localFile = 'local/file.txt';
const remoteFile = 'remote/file.txt';

conn.on('ready', () => {
   const Scp = new NeoScp(conn);

   Scp.putFile(localFile, remoteFile, (err, res) => {
      if (err) throw err;

      if (res.localSize === res.remoteSize)
         console.log('Upload successfully');
      else {
         console.log('Damaged remote file');
      }
   });
});