import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { createInteraction } from '../services/api';

const modeLabels = {
  conversation: 'Conversation',
  story: 'Story',
  translate: 'Translate'
};

const startMessages = {
  conversation: 'Choose your language, level, and optional topic. Then answer in the chat.',
  story: 'Choose your language, level, optional topic, and optional words. Then generate a story.',
  translate: 'Choose the target language and write the text you want translated.'
};

function getInitialMessages(mode) {
  if (mode === 'translate') {
    return [{ role: 'beaver', parts: [startMessages.translate] }];
  }

  return [];
}

// --- Build a BeaverUP chat response ---
function buildBeaverMessage(interaction) {
  const parts = [];

  if (interaction.nativeRewrite) {
    parts.push(`Native version: ${interaction.nativeRewrite}`);
  }

  if (interaction.higherLevelRewrite) {
    parts.push(`Higher-level version: ${interaction.higherLevelRewrite}`);
  }

  if (interaction.storyText) {
    parts.push(interaction.storyText);
  }

  if (interaction.wordTranslations?.length > 0) {
    interaction.wordTranslations.forEach(item => {
      parts.push(`${item.sourceText}: ${item.translation}`);
    });
  }

  if (interaction.translation) {
    Object.entries(interaction.translation).forEach(([language, translation]) => {
      parts.push(`${language}: ${translation}`);
    });
  }

  if (interaction.nextPrompt) {
    parts.push(`Next: ${interaction.nextPrompt}`);
  }

  return parts.length > 0 ? parts : ['Practice response saved.'];
}

function ThinkingMessage() {
  return (
    <div className="message beaver-message thinking-message">
      <span>BeaverUP</span>
      <video autoPlay loop muted playsInline src="/WhatsApp Video 2026-05-30 at 19.39.32.mp4" />
      <p>Sending...</p>
    </div>
  );
}

// --- Render practice workspace ---
function WorkspacePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialMode = searchParams.get('mode') || 'conversation';
  const resolvedInitialMode = ['conversation', 'story', 'translate'].includes(initialMode) ? initialMode : 'conversation';
  const [settings, setSettings] = useState({
    mode: resolvedInitialMode,
    language: 'German',
    level: 'A2',
    topic: '',
    wordGroup: ''
  });
  const [messages, setMessages] = useState([
    ...getInitialMessages(resolvedInitialMode)
  ]);
  const [sessionStarted, setSessionStarted] = useState(resolvedInitialMode === 'translate');
  const [userInput, setUserInput] = useState('');
  const [lastStory, setLastStory] = useState(null);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const showStartButton = ['conversation', 'story'].includes(settings.mode) && !sessionStarted;

  const submitLabel = useMemo(() => {
    if (settings.mode === 'story') {
      return lastStory ? 'Create next story' : 'Send';
    }

    if (settings.mode === 'translate') {
      return 'Translate';
    }

    return 'Send';
  }, [lastStory, settings.mode]);

  // --- Update session settings ---
  function handleSettingChange(event) {
    const { name, value } = event.target;
    setSettings(currentSettings => ({ ...currentSettings, [name]: value }));

    if (name === 'mode') {
      setSearchParams({ mode: value });
      setMessages(getInitialMessages(value));
      setSessionStarted(value === 'translate');
      setLastStory(null);
      setUserInput('');
      setError('');
    }
  }

  // --- Build mode-specific request body ---
  function buildInteractionPayload(isStart = false) {
    const basePayload = {
      mode: settings.mode,
      language: settings.language,
      level: settings.level
    };

    if (settings.mode !== 'translate' && settings.topic.trim()) {
      basePayload.topic = settings.topic.trim();
    }

    if (settings.mode === 'conversation') {
      return {
        ...basePayload,
        interactionType: 'conversation_turn',
        userInput: isStart ? undefined : userInput.trim()
      };
    }

    if (settings.mode === 'story') {
      const words = settings.wordGroup
        .split(',')
        .map(word => word.trim())
        .filter(Boolean);

      return {
        ...basePayload,
        interactionType: isStart ? 'story_start' : 'story_followup',
        previousInteractionId: lastStory?.interactionId || null,
        previousTopic: lastStory?.topic || null,
        userInput: isStart ? undefined : userInput.trim(),
        wordGroup: words
      };
    }

    return {
      ...basePayload,
      interactionType: 'translate_request',
      userInput: userInput.trim()
    };
  }

  // --- Start conversation or first story before showing text input ---
  async function handleStart(event) {
    event.preventDefault();
    setError('');

    if (!settings.language.trim()) {
      setError('Language is required.');
      return;
    }

    setSending(true);

    try {
      const interaction = await createInteraction(buildInteractionPayload(true));

      setMessages(currentMessages => [
        ...currentMessages,
        { role: 'beaver', parts: buildBeaverMessage(interaction) }
      ]);
      setSessionStarted(true);

      if (settings.mode === 'story') {
        setLastStory(interaction);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setSending(false);
    }
  }

  // --- Send interaction to backend ---
  async function handleSubmit(event) {
    event.preventDefault();
    setError('');

    if (!settings.language.trim()) {
      setError(settings.mode === 'translate' ? 'Target language is required.' : 'Language is required.');
      return;
    }

    if (settings.mode === 'story' && !userInput.trim()) {
      setError('Write the difficult or interesting words first.');
      return;
    }

    if (settings.mode !== 'story' && !userInput.trim()) {
      setError('Write something first.');
      return;
    }

    setSending(true);

    try {
      const payload = buildInteractionPayload(false);
      const userMessage = userInput.trim() || 'Generate a story.';
      const interaction = await createInteraction(payload);

      setMessages(currentMessages => [
        ...currentMessages,
        { role: 'user', parts: [userMessage] },
        { role: 'beaver', parts: buildBeaverMessage(interaction) }
      ]);

      if (settings.mode === 'story') {
        setLastStory(interaction);
      }

      setUserInput('');
    } catch (err) {
      setError(err.message);
    } finally {
      setSending(false);
    }
  }

  return (
    <section className="workspace">
      <div className="chat-panel">
        <div className="chat-header">
          <div>
            <p className="eyebrow">Practice</p>
            <h1>{modeLabels[settings.mode]} workspace</h1>
          </div>
          <span className="level-pill">{settings.level}</span>
        </div>

        {error && <p className="status-message error-message">{error}</p>}

        <div className="chat-thread">
          {showStartButton && messages.length === 0 && !sending && (
            <div className="start-empty-state">
              <p>{settings.mode === 'story' ? 'Start a short story from your settings.' : 'Start a conversation from your settings.'}</p>
            </div>
          )}
          {messages.map((message, index) => (
            <div className={`message ${message.role === 'user' ? 'user-message' : 'beaver-message'}`} key={`${message.role}-${index}`}>
              <span>{message.role === 'user' ? 'You' : 'BeaverUP'}</span>
              {message.parts.map(part => (
                <p key={part}>{part}</p>
              ))}
            </div>
          ))}
          {sending && <ThinkingMessage />}
        </div>

        {showStartButton ? (
          <form className="start-input" onSubmit={handleStart}>
            <button disabled={sending} type="submit">
              {sending ? 'Sending...' : 'Start'}
            </button>
          </form>
        ) : (
          <form className="chat-input" onSubmit={handleSubmit}>
            <textarea
              onChange={event => setUserInput(event.target.value)}
              placeholder={settings.mode === 'story' ? 'Write difficult or interesting words...' : 'Write your message...'}
              value={userInput}
            />
            <button disabled={sending} type="submit">
              {sending ? 'Sending...' : submitLabel}
            </button>
          </form>
        )}
      </div>

      <aside className="side-card">
        <p className="eyebrow">Session settings</p>
        <label>
          Mode
          <select name="mode" onChange={handleSettingChange} value={settings.mode}>
            <option value="conversation">Conversation</option>
            <option value="story">Story</option>
            <option value="translate">Translate</option>
          </select>
        </label>
        <label>
          {settings.mode === 'translate' ? 'Target language' : 'Language'}
          <input name="language" onChange={handleSettingChange} type="text" value={settings.language} />
        </label>
        <label>
          Level
          <select name="level" onChange={handleSettingChange} value={settings.level}>
            <option value="A1">A1</option>
            <option value="A2">A2</option>
            <option value="B1">B1</option>
            <option value="B2">B2</option>
            <option value="C1">C1</option>
            <option value="C2">C2</option>
          </select>
        </label>
        {settings.mode !== 'translate' && (
          <label>
            Topic
            <input name="topic" onChange={handleSettingChange} placeholder="Optional: travel, work, food..." type="text" value={settings.topic} />
          </label>
        )}
        {settings.mode === 'story' && (
          <label>
            Word group
            <input name="wordGroup" onChange={handleSettingChange} placeholder="Optional: Hola, casa, madre" type="text" value={settings.wordGroup} />
          </label>
        )}
      </aside>
    </section>
  );
}

export default WorkspacePage;
