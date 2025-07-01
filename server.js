const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const path = require('path');

const users = [];

app.use(express.static(path.join(__dirname, 'public')));

io.on('connection', (socket) => {
  socket.on('join', (user) => {
    user.id = socket.id;
    users.push(user);
    io.emit('userList', users);
  });

  socket.on('message', (msg) => {
    const user = users.find(u => u.id === socket.id);
    if (user) {
      io.emit('message', { nickname: user.nickname, message: msg });
    }
  });

  socket.on('privateMessage', ({ toNickname, message }) => {
    const recipient = users.find(u => u.nickname === toNickname);
    const sender = users.find(u => u.id === socket.id);
    if (recipient && sender) {
      io.to(recipient.id).emit('privateMessage', {
        from: sender.nickname,
        message
      });
    }
  });

  socket.on('disconnect', () => {
    const index = users.findIndex(u => u.id === socket.id);
    if (index !== -1) {
      users.splice(index, 1);
      io.emit('userList', users);
    }
  });
});

http.listen(3000, () => {
  console.log('שרת הצ\'אט פועל על http://localhost:3000');
});
