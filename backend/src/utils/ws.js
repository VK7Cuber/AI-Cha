import { WebSocketServer } from 'ws';

let wss = null;

export function initWs(server) {
  if (wss) return wss;
  wss = new WebSocketServer({ server });
  wss.on('connection', (socket) => {
    socket.send(JSON.stringify({ event: 'connected', payload: { ok: true } }));
  });
  return wss;
}

export function wsBroadcast(event, payload) {
  if (!wss) return;
  const message = JSON.stringify({ event, payload });
  for (const client of wss.clients) {
    if (client.readyState === client.OPEN) {
      client.send(message);
    }
  }
}
