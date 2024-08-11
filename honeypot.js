const { Server } = require('ssh2');
const fs = require('fs');
const pty = require('node-pty');
const path = require('path');
const moment = require('moment-timezone');


// passing the local time zone as an argument for log monitoring
const localTimeZone = process.argv[2] || 'UTC';


if (!moment.tz.names().includes(localTimeZone)) {
  console.error(`Invalid time zone: ${localTimeZone}. Using default (UTC).`);
}

// Create a new SSH server instance with the host key..
const honeypot = new Server({
  hostKeys: [fs.readFileSync('/home/sylph404/.ssh/id_rsa')]
});


const validUsername = 'sylph404';
const validPassword = '9898';


// Create a log file and stream to log all the activities
const logFile = path.join(__dirname, 'ssh_honeypot.log');
const logStream = fs.createWriteStream(logFile, { flags: 'a' });

function formatTimestamp() {
  return moment().tz(localTimeZone).format('YYYY-MM-DD HH:mm:ss');
}

function log(message, type = 'INFO') {
  const timestamp = formatTimestamp();
  const logMessage = `[${timestamp}] [${type}] ${message}`;
  logStream.write(`${logMessage}\n`);
  console.log(logMessage); 
}


// Function that simulate command output based on the command received from the client 
function simulateCommandOutput(command) {
  if (command.startsWith('ls')) {
    return 'file1.txt\nfile2.txt\n';
  } else if (command.startsWith('whoami')) {
    return 'sylph404\n';
  }
  return 'Command not found.\n';
}


honeypot.on('connection', function(client, info) {
  log(`Client connected from ${info.ip}`);

  client.on('authentication', function(ctx) {
    if (
      ctx.method === 'password' && 
      ctx.username === validUsername && 
      ctx.password === validPassword) 
      {
      log('Password authentication successful');
      ctx.accept();
    } else {
      log('Password authentication failed', 'ERROR');
      ctx.reject();
    }
  });

  client.on('ready', function() {
    log('Client authenticated successfully');

    client.on('session', function(accept, reject) {
      log('Session requested');
      const session = accept();
      
      session.on('pty', function(accept, reject, info) {
        log(`PTY requested: ${JSON.stringify(info)}`);
        accept();
      });

      session.on('shell', function(accept, reject) {
        log('Shell requested');
        const stream = accept();
        const ptyProcess = pty.spawn('/bin/bash', [], {
          name: 'xterm-color',
          cols: 80,
          rows: 30,
          cwd: process.env.HOME,
          env: process.env
        });

        ptyProcess.on('data', function(data) {
          stream.write(data);
          log(`PTY Data: ${data}`);
        });

        stream.on('data', function(data) {
          ptyProcess.write(data);
          log(`Stream Data: ${data}`);
        });

        stream.on('close', function() {
          log('PTY session closed');
        });

        stream.on('error', function(err) {
          log(`Stream Error: ${err.message}`, 'ERROR');
        });

        ptyProcess.on('exit', function() {
          log('PTY process exited');
        });

        stream.on('end', function() {
          log('Stream End: Client requested to end the session');
        });

        ptyProcess.on('signal', function(signal) {
          log(`PTY Process Signal: ${signal}`);
        });
      });

      session.on('exec', function(accept, reject, info) {
        log(`Exec command: ${info.command}`);
        const stream = accept();

        const output = simulateCommandOutput(info.command);
        stream.write(output);
        stream.end();
      });
    });
  });

  client.on('end', function() {
    log('Client disconnected');
  });

  client.on('error', function(err) {
    log(`Client Error: ${err.message}`, 'ERROR');
  });

});

// Start the honeypot server and log its status
honeypot.listen(22, '127.0.0.1', function() {
  const address = this.address();
  log(`Trapode SSH runs at ${address.address}:${address.port} from "${localTimeZone}"`);
});
