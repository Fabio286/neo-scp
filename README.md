# Neo SCP

Neo SCP is a lightweight **real SCP** module based on [ssh2](https://github.com/mscdex/ssh2) module.  
This module is inspired by [scp1](https://github.com/pghalliday/scp1).

This module is still in beta, optimizations and new features will coming in future releases.

## Installation

```npm
npm install neo-scp
```

## Usage

In order to use Neo SCP you must pass to `NeoScp` instance an [ssh2](https://github.com/mscdex/ssh2) connection as follow.

```js
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
         console.log(`Upload successfully (${res.duration}ms)`);
      else
         console.log('Damaged remote file');

      conn.end();
   });
});
```

## Methods

### .putFile()

Sends a file to remote host.  
You must pass the `localFile` path, the `remoteFile` destination path and a callback function.  
The callback returns as result an object with following data:

```js
{
   duration: Number, // transfer duration in ms
   localSize: Number, // size of local file in bytes
   remoteSize: Number // size of remote file in bytes
}
```

### .getFileSize()

Gets the remote file size.  
You must pass the `remoteFile` destination path and a callback function.  
The callback returns as result the size in bytes.

### .getFile()

Gets a file from remote host.
You must pass the `remoteFile` path, the `localFile` destination path and a callback function.

## Debug

NeoScp class emits the `debug` event with some debug informatione. The following code shows how to use it.

```js
Scp.on('debug', data => {
   console.log(data);
});
```
