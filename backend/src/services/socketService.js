const { Server } = require('socket.io');
const env = require('../config/env');

const roomMembers = new Map();

const buildRoomName = room => `language:${String(room || '').trim()}`;

const getPublicMembers = roomName => {
    const members = roomMembers.get(roomName);
    return members ? Array.from(members.values()) : [];
};

const emitRoomUsers = (io, roomName) => {
    io.to(roomName).emit('room:users', {
        room: roomName.replace('language:', ''),
        users: getPublicMembers(roomName)
    });
};

const removeSocketFromRoom = (io, socket) => {
    if (!socket.data.roomName) {
        return;
    }

    const { roomName, userId, userName } = socket.data;
    const members = roomMembers.get(roomName);

    if (members) {
        members.delete(socket.id);

        if (members.size === 0) {
            roomMembers.delete(roomName);
        }
    }

    socket.leave(roomName);
    socket.to(roomName).emit('room:system', {
        room: roomName.replace('language:', ''),
        text: `${userName || 'A learner'} left the room.`,
        sentAt: new Date().toISOString()
    });
    emitRoomUsers(io, roomName);

    socket.data.roomName = null;
    socket.data.userId = null;
    socket.data.userName = null;
};

const initializeSocket = server => {
    const io = new Server(server, {
        cors: {
            origin: env.frontendUrls,
            methods: ['GET', 'POST']
        }
    });

    io.on('connection', socket => {
        socket.on('room:join', payload => {
            const room = String(payload?.room || '').trim();
            const userName = String(payload?.userName || 'Learner').trim() || 'Learner';
            const userId = payload?.userId || null;

            if (!room) {
                return;
            }

            removeSocketFromRoom(io, socket);

            const roomName = buildRoomName(room);
            socket.join(roomName);
            socket.data.roomName = roomName;
            socket.data.userId = userId;
            socket.data.userName = userName;

            if (!roomMembers.has(roomName)) {
                roomMembers.set(roomName, new Map());
            }

            roomMembers.get(roomName).set(socket.id, {
                socketId: socket.id,
                userId,
                userName
            });

            io.to(roomName).emit('room:system', {
                room,
                text: `${userName} joined ${room}.`,
                sentAt: new Date().toISOString()
            });
            emitRoomUsers(io, roomName);
        });

        socket.on('room:message', payload => {
            const roomName = socket.data.roomName;
            const text = String(payload?.text || '').trim();

            if (!roomName || !text) {
                return;
            }

            io.to(roomName).emit('room:message', {
                room: roomName.replace('language:', ''),
                userId: socket.data.userId,
                userName: socket.data.userName || 'Learner',
                text,
                sentAt: new Date().toISOString()
            });
        });

        socket.on('room:leave', () => {
            removeSocketFromRoom(io, socket);
        });

        socket.on('disconnect', () => {
            removeSocketFromRoom(io, socket);
        });
    });

    return io;
};

module.exports = {
    initializeSocket
};
