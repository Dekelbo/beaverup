import { useEffect, useMemo, useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getSocket } from '../services/socket';

const languageRooms = ['Spanish', 'German', 'English', 'French', 'Italian', 'Japanese'];

function formatTime(value) {
  return new Intl.DateTimeFormat('en', {
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(value));
}

// --- Render live language rooms ---
function BeaverHubPage() {
  const { user } = useAuth();
  const socket = useMemo(() => getSocket(), []);
  const messagesEndRef = useRef(null);
  const [selectedRoom, setSelectedRoom] = useState(user?.languageToLearn || languageRooms[0]);
  const [currentRoom, setCurrentRoom] = useState('');
  const [draft, setDraft] = useState('');
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [status, setStatus] = useState('Disconnected');

  useEffect(() => {
    function handleConnect() {
      setStatus('Connected');
    }

    function handleDisconnect() {
      setStatus('Disconnected');
      setCurrentRoom('');
      setUsers([]);
    }

    function handleRoomMessage(message) {
      setMessages(currentMessages => [...currentMessages, { ...message, kind: 'message' }]);
    }

    function handleRoomSystem(message) {
      setMessages(currentMessages => [...currentMessages, { ...message, kind: 'system' }]);
    }

    function handleRoomUsers(payload) {
      setUsers(payload.users || []);
    }

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('room:message', handleRoomMessage);
    socket.on('room:system', handleRoomSystem);
    socket.on('room:users', handleRoomUsers);

    socket.connect();

    return () => {
      socket.emit('room:leave');
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('room:message', handleRoomMessage);
      socket.off('room:system', handleRoomSystem);
      socket.off('room:users', handleRoomUsers);
      socket.disconnect();
    };
  }, [socket]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  function joinRoom() {
    socket.emit('room:join', {
      room: selectedRoom,
      userId: user?.userId,
      userName: user?.firstName || 'Learner'
    });
    setCurrentRoom(selectedRoom);
    setMessages([]);
  }

  function leaveRoom() {
    socket.emit('room:leave');
    setCurrentRoom('');
    setUsers([]);
  }

  function sendMessage(event) {
    event.preventDefault();

    if (!currentRoom || !draft.trim()) {
      return;
    }

    socket.emit('room:message', {
      room: currentRoom,
      userId: user?.userId,
      userName: user?.firstName || 'Learner',
      text: draft.trim()
    });
    setDraft('');
  }

  return (
    <section className="page beaver-hub">
      <div className="page-heading">
        <p className="eyebrow">Beaver Hub</p>
        <h1>Practice together in a language room.</h1>
        <p>Join a live room, send short practice messages, and see other learners respond instantly.</p>
      </div>

      <div className="hub-layout">
        <aside className="side-card hub-sidebar">
          <p className="eyebrow">Room</p>
          <label>
            Language
            <select disabled={Boolean(currentRoom)} onChange={event => setSelectedRoom(event.target.value)} value={selectedRoom}>
              {languageRooms.map(room => (
                <option key={room} value={room}>
                  {room}
                </option>
              ))}
            </select>
          </label>

          <div className="hub-actions">
            {!currentRoom ? (
              <button disabled={status !== 'Connected'} onClick={joinRoom} type="button">
                Join room
              </button>
            ) : (
              <button onClick={leaveRoom} type="button">
                Leave room
              </button>
            )}
          </div>

          <div className="hub-status">
            <span>Status</span>
            <strong>{currentRoom ? `${currentRoom} room` : status}</strong>
          </div>

          <div className="hub-status">
            <span>Online here</span>
            <strong>{users.length}</strong>
          </div>

          <div className="hub-users">
            {users.map(roomUser => (
              <span key={roomUser.socketId}>{roomUser.userName}</span>
            ))}
            {currentRoom && users.length === 0 && <p>No learners listed yet.</p>}
          </div>
        </aside>

        <div className="chat-panel hub-panel">
          <div className="chat-header">
            <div>
              <p className="eyebrow">Live practice</p>
              <h1>{currentRoom || selectedRoom}</h1>
            </div>
            <span className="level-pill">{users.length} online</span>
          </div>

          <div className="chat-thread hub-thread">
            {!currentRoom && (
              <div className="message beaver-message">
                <span>BeaverUP</span>
                <p>Choose a language room and join when you are ready.</p>
              </div>
            )}

            {currentRoom && messages.length === 0 && (
              <div className="message beaver-message">
                <span>BeaverUP</span>
                <p>You are in {currentRoom}. Send a short message to start practicing.</p>
              </div>
            )}

            {messages.map((message, index) => {
              const isOwnMessage = String(message.userId) === String(user?.userId);
              const className =
                message.kind === 'system'
                  ? 'message hub-system-message'
                  : `message ${isOwnMessage ? 'user-message' : 'beaver-message'}`;

              return (
                <div className={className} key={`${message.kind}-${message.sentAt}-${index}`}>
                  <span>{message.kind === 'system' ? 'Hub' : message.userName}</span>
                  <p>{message.text}</p>
                  <small>{message.sentAt ? formatTime(message.sentAt) : ''}</small>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          <form className="chat-input" onSubmit={sendMessage}>
            <textarea
              disabled={!currentRoom}
              onChange={event => setDraft(event.target.value)}
              placeholder={currentRoom ? `Write in ${currentRoom}...` : 'Join a room first...'}
              value={draft}
            />
            <button disabled={!currentRoom || !draft.trim()} type="submit">
              Send
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}

export default BeaverHubPage;
