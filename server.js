const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http, { cors: { origin: "*" } });
const path = require('path');

app.use(express.static(path.join(__dirname, 'public')));

let participants = []; // [{id, role}]

io.on('connection', (socket) => {
  console.log('Подключился:', socket.id);

  if (participants.length >= 2) {
    socket.emit('status', 'busy');
    socket.disconnect();
    return;
  }

  const role = participants.length + 1;
  participants.push({ id: socket.id, role });
  socket.role = role;

  socket.emit('status', 'connected', role);

  if (participants.length === 2) {
    // Abonent 1 автоматически начинает звонок
    io.to(participants[0].id).emit('start-call');
  }

  // Signaling WebRTC
  socket.on('offer', (offer) => {
    const other = participants.find(p => p.id !== socket.id);
    if (other) io.to(other.id).emit('offer', offer);
  });

  socket.on('answer', (answer) => {
    const other = participants.find(p => p.id !== socket.id);
    if (other) io.to(other.id).emit('answer', answer);
  });

  socket.on('ice-candidate', (candidate) => {
    const other = participants.find(p => p.id !== socket.id);
    if (other) io.to(other.id).emit('ice-candidate', candidate);
  });

  // Текстовый чат
  socket.on('chat', (text) => {
    const other = participants.find(p => p.id !== socket.id);
    if (other) {
      io.to(other.id).emit('chat', { from: socket.role, text });
    }
  });

  socket.on('disconnect', () => {
    participants = participants.filter(p => p.id !== socket.id);
    io.emit('reset');
  });
});

const PORT = process.env.PORT || 3000;
http.listen(PORT, '0.0.0.0', () => {
  console.log(`\n✅ Сервер запущен на порту ${PORT}`);
  console.log(`\n📱 Локально: http://localhost:${PORT}`);
  console.log(`\n🌐 Для доступа с телефона запусти в новом терминале:`);
  console.log(`   npx localtunnel --port 3000\n`);
});
