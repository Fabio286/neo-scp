const fs = require('fs');
const path = require('path');
const EventEmitter = require('events');
/**
 * Real SCP file transferer
 *
 * @class NeoScp
 * @extends {EventEmitter}
 */
class NeoScp extends EventEmitter {
   constructor (connection) {
      super();
      this.conn = connection;
   }

   debug (data) {
      this.emit('debug', data);
   }

   /**
    * Sends the file to remote host
    *
    * @param {string} localFile
    * @param {string} remoteFile
    * @param {function} callback
    * @memberof NeoScp
    */
   putFile (localFile, remoteFile, callback) {
      let self = this;

      const remoteDirectory = path.dirname(remoteFile);
      const remoteBaseName = path.basename(remoteFile);
      const start = new Date();

      self.conn.exec(`scp -t ${remoteDirectory}; wc -c ${remoteFile}`, (err, stream) => {
         if (err) callback(err);

         const fileData = fs.readFileSync(localFile);

         const stats = fs.statSync(localFile);
         const mode = stats.mode & 511;

         stream.write(`C0${mode.toString(8)} ${fileData.byteLength} ${remoteBaseName}\n`);
         stream.write(fileData);
         stream.end();

         stream.on('close', () => {
            self.debug('Stream close');

            self.getFileSize(remoteFile, (err, size) => {
               if (err) callback(err);
               let result = {
                  duration: new Date() - start,
                  localSize: fileData.byteLength,
                  remoteSize: parseInt(size, 10)
               };

               callback(null, result);
            });
         });

         stream.on('data', (data) => {
            self.debug(`STDOUT: "${data}"`);
         });

         stream.stderr.on('data', data => {
            self.debug(`STDERR: "${data}"`);
         });
      });
   }

   /**
    * Gets a file from host
    *
    * @param {string} remoteFile
    * @param {string} localFile
    * @param {function} callback
    * @memberof NeoScp
    */
   getFile(remoteFile, localFile, callback){
      let self = this;

      self.conn.exec(`scp -f ${remoteFile}`, (err, stream) => {
         if (err) callback(err);

         let fileBuffer = Buffer.from([0]);

         stream.write(Buffer.from([0]));
            
         stream.on('close', () => {
            self.debug('Stream close');
                           
            fs.writeFileSync(localFile, fileBuffer.slice(1, -1));

            stream.end();
            callback();
         });

         let jump = 0;
         stream.on('data', (data) => {
            stream.write(Buffer.from([0]));
            if(jump === 0) {
               jump = 1;
               return;
            }

            fileBuffer = Buffer.concat([fileBuffer, data]);
                           
            self.debug(`STDOUT: "${data}"`);
         });

         stream.stderr.on('data', data => {
            self.debug(`STDERR: "${data}"`);
         });
      });

   }

   /**
    * Gets the remote file size
    *
    * @param {string} remoteFile
    * @param {function} callback
    * @memberof NeoScp
    */
   getFileSize (remoteFile, callback) {
      let self = this;
      self.conn.exec(`ls -la ${remoteFile} | tr -s ' '| cut -d' ' -f5`, (err, stream) => {
         if (err) callback(err);

         stream.on('data', data => {
            self.debug(`STDOUT: "${data}"`);
            callback(null, data.toString());
         });

         stream.stderr.on('data', data => {
            self.debug(`STDERR: "${data}"`);
         });
      });
   }
}

module.exports = NeoScp;
