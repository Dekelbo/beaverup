import { io } from 'socket.io-client';
import { API_BASE_URL } from './api';

let socket;

function getSocket() {
  if (!socket) {
    socket = io(API_BASE_URL, {
      autoConnect: false
    });
  }

  return socket;
}

export { getSocket };
