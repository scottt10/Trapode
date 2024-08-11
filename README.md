## Trapode - SSH Honeypot

Trapode is an SSH honeypot designed to trap and monitor malicious activity on your network. It simulates an SSH server and logs various interactions, including authentication attempts, commands executed, and session activities.

---

## Features:

- Authentication Handling: Simulates authentication attempts and logs success or failure.
- Command Simulation: Responds to basic commands like ls and whoami.
- Session Logging: Logs all interactions within the SSH session.
- Timezone Configuration: Allows dynamic time zone configuration for log timestamps.

---

## Installation and Usage:

- [Installation and usage](#installation-and-usage)
  - [Prerequisties](#prerequisites)
  - [From source](#from-source)
  - [Configuration](#configuration)
  - [Usages](#usages)
- [Sample output](#sample-output)
 
---

## Installation and Usage

### Prerequisites:
- Node.js (>= 14.x)
- node-pty package

### From Source:

**Clone the repository:**

```
$ git clone https://github.com/scottt10/Trapode.git
$ cd trapode
```

**Install dependencies:**
```
$ npm install
```

**Generate SSH Key:** Ensure you have an SSH key pair for the server. You can generate one with: 

```
ssh-keygen -t rsa -b 2048 -f ~/.ssh/id_rsa
```

**Configure SSH Key Path:** Update the path to your SSH key in the index.js file if needed
```javascript
const honeypot = new Server({
  hostKeys: [fs.readFileSync('/home/yourusername/.ssh/id_rsa')]
});
```

### Usages:

```
$ node index.js [TIMEZONE]
```
[TIMEZONE] is optional. If not provided, it defaults to UTC.

---

### Commands:

- Start Server: Runs the SSH honeypot on localhost at port 22.
- Stop Server: Use Ctrl+C in the terminal where the server is running.

----

### Logging:

- Logs are saved to ssh_honeypot.log in the project directory.
- Logs include timestamps based on the provided or default time zone.

----


## License 

This project is licensed under the MIT License. See the LICENSE file for details.

## Contributing

Contributions are welcome! Please fork the repository, create a pull request, and open issues for any bugs or feature requests.

## Notice

The project is currently under development, with advanced features and enhancements planned for future releases. Stay tuned for updates and new capabilities.
