import { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useWorkspaceSession } from '../context/WorkspaceSessionContext';
import { createInteraction } from '../services/api';
import DifficultyFeedback from '../components/DifficultyFeedback';
import HelperToolbar from '../components/HelperToolbar';
import LearningSuggestions from '../components/LearningSuggestions';
import LanguageMultiSelect from '../components/LanguageMultiSelect';
import { formatLanguages, getLearningLanguages, parseLanguages } from '../utils/languages';
import { LEVELS, getLevelLabel } from '../utils/levels';

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

const speechLanguageCodes = {
  Arabic: 'ar',
  Dutch: 'nl-NL',
  English: 'en-US',
  French: 'fr-FR',
  German: 'de-DE',
  Greek: 'el-GR',
  Hebrew: 'he-IL',
  Hindi: 'hi-IN',
  Italian: 'it-IT',
  Japanese: 'ja-JP',
  Korean: 'ko-KR',
  'Mandarin Chinese': 'zh-CN',
  Polish: 'pl-PL',
  Portuguese: 'pt-PT',
  Russian: 'ru-RU',
  Spanish: 'es-ES',
  Swedish: 'sv-SE',
  Thai: 'th-TH',
  Turkish: 'tr-TR',
  Vietnamese: 'vi-VN'
};

function getSpeechRecognition() {
  return window.SpeechRecognition || window.webkitSpeechRecognition || null;
}

function getInitialMessages(mode) {
  if (mode === 'translate') {
    return [{ role: 'beaver', text: startMessages.translate }];
  }

  return [];
}

// --- Coaching commentary fallback when the AI didn't return a displayMessage ---
function buildFallbackCoachingParts(interaction) {
  const parts = [];

  if (interaction.nativeRewrite && interaction.nativeRewrite !== interaction.userInput) {
    parts.push(`Corrected version: ${interaction.nativeRewrite}`);
  }

  if (interaction.higherLevelRewrite && interaction.higherLevelRewrite !== interaction.nativeRewrite) {
    parts.push(`More advanced version: ${interaction.higherLevelRewrite}`);
  }

  if (interaction.wordTranslations?.length > 0) {
    interaction.wordTranslations.forEach(item => {
      parts.push(`${item.sourceText}: ${item.translation}`);
    });
  }

  return parts;
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

// --- Render one AI turn: natural message, details, suggestions, feedback, helpers ---
function BeaverTurn({ changingQuestion, interaction, isLatest, onChangeQuestion, onFeedbackResult, onSuggestionSaved }) {
  const fallbackCoachingParts = buildFallbackCoachingParts(interaction);
  const showExercise = isLatest && interaction.mode !== 'translate' && Boolean(interaction.nextPrompt);
  const canChangeQuestion = showExercise && interaction.mode === 'conversation';

  return (
    <div className="message beaver-message">
      <span>BeaverUP</span>

      {interaction.displayMessage ? (
        <p>{interaction.displayMessage}</p>
      ) : fallbackCoachingParts.length > 0 ? (
        fallbackCoachingParts.map(part => <p key={part}>{part}</p>)
      ) : (
        <p>Nice work!</p>
      )}

      {interaction.storyText && <p className="beaver-primary-text">{interaction.storyText}</p>}

      {interaction.translation && (
        <div className="beaver-translation">
          {Object.entries(interaction.translation).map(([language, translation]) => (
            <p key={language}>
              <strong>{language}:</strong> {translation}
            </p>
          ))}
        </div>
      )}

      {interaction.nextPrompt && <p className="beaver-question">{interaction.nextPrompt}</p>}

      {showExercise && (
        <HelperToolbar
          glossary={interaction.glossary}
          nextPromptTranslation={interaction.nextPromptTranslation}
          onChangeQuestion={() => onChangeQuestion(interaction)}
          sendingChangeQuestion={changingQuestion}
          showChangeQuestion={canChangeQuestion}
        />
      )}

      <LearningSuggestions
        interactionId={interaction.interactionId}
        language={interaction.language}
        onSaved={onSuggestionSaved}
        suggestions={interaction.suggestedLearningItems}
      />

      {showExercise && <DifficultyFeedback interactionId={interaction.interactionId} onResult={onFeedbackResult} />}
    </div>
  );
}

// --- Build a fresh session for a given mode ---
function buildDefaultSession(mode, defaultLanguage, currentLevel) {
  return {
    settings: {
      mode,
      language: defaultLanguage,
      level: currentLevel || 'A2',
      topic: '',
      wordGroup: ''
    },
    messages: getInitialMessages(mode),
    sessionStarted: mode === 'translate',
    lastStory: null,
    userInput: ''
  };
}

// --- Render practice workspace ---
function WorkspacePage() {
  const { updateUser, user } = useAuth();
  const { session, setSession } = useWorkspaceSession();
  const [searchParams, setSearchParams] = useSearchParams();
  const modeParam = searchParams.get('mode');
  const resolvedInitialMode = ['conversation', 'story', 'translate'].includes(modeParam) ? modeParam : 'conversation';
  const learningLanguages = getLearningLanguages(user);
  const defaultLanguage = learningLanguages[0] || '';

  // Resume the saved session when returning to this page; start fresh only when there is
  // none yet, or the link that brought us here explicitly asked for a different mode.
  // Keyed on modeParam (not just mount) because switching modes via a link/nav click
  // re-renders this same route element instead of remounting it.
  useEffect(() => {
    if (!session || (modeParam && session.settings.mode !== modeParam)) {
      setSession(buildDefaultSession(resolvedInitialMode, defaultLanguage, user?.currentLevel));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modeParam]);

  const effectiveSession = session || buildDefaultSession(resolvedInitialMode, defaultLanguage, user?.currentLevel);
  const { settings, messages, sessionStarted, lastStory, userInput } = effectiveSession;

  function updateSession(updater) {
    setSession(current => {
      const base = current || effectiveSession;
      return typeof updater === 'function' ? updater(base) : { ...base, ...updater };
    });
  }

  function setSettings(updater) {
    updateSession(current => ({
      ...current,
      settings: typeof updater === 'function' ? updater(current.settings) : updater
    }));
  }

  function setMessages(updater) {
    updateSession(current => ({
      ...current,
      messages: typeof updater === 'function' ? updater(current.messages) : updater
    }));
  }

  function setSessionStarted(value) {
    updateSession(current => ({ ...current, sessionStarted: value }));
  }

  function setLastStory(value) {
    updateSession(current => ({ ...current, lastStory: value }));
  }

  function setUserInput(value) {
    updateSession(current => ({
      ...current,
      userInput: typeof value === 'function' ? value(current.userInput) : value
    }));
  }

  const [sending, setSending] = useState(false);
  const [changingQuestion, setChangingQuestion] = useState(false);
  const [error, setError] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [levelSuggestion, setLevelSuggestion] = useState(null);
  const recognitionRef = useRef(null);
  const showStartButton = ['conversation', 'story'].includes(settings.mode) && !sessionStarted;

  const latestBeaverInteractionIndex = useMemo(() => {
    for (let index = messages.length - 1; index >= 0; index -= 1) {
      if (messages[index].role === 'beaver' && messages[index].interaction) {
        return index;
      }
    }

    return -1;
  }, [messages]);

  const submitLabel = useMemo(() => {
    if (settings.mode === 'story') {
      return lastStory ? 'Create next story' : 'Send';
    }

    if (settings.mode === 'translate') {
      return 'Translate';
    }

    return 'Send';
  }, [lastStory, settings.mode]);

  function getSelectedSessionLanguages(mode = settings.mode, languageValue = settings.language) {
    const selectedLanguages = parseLanguages(languageValue).filter(language => learningLanguages.includes(language));

    if (mode === 'translate') {
      return selectedLanguages;
    }

    return [selectedLanguages[0] || learningLanguages[0] || ''].filter(Boolean);
  }

  const selectedSessionLanguages = getSelectedSessionLanguages();
  const supportsSpeechRecognition = typeof window !== 'undefined' && Boolean(getSpeechRecognition());

  useEffect(() => {
    return () => {
      recognitionRef.current?.stop();
    };
  }, []);

  useEffect(() => {
    if (settings.mode !== 'conversation' && isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    }
  }, [isListening, settings.mode]);

  // --- Update session settings ---
  function handleSettingChange(event) {
    const { name, value } = event.target;

    if (name === 'mode') {
      setSettings(currentSettings => {
        const selectedLanguages = getSelectedSessionLanguages(value, currentSettings.language);
        return {
          ...currentSettings,
          mode: value,
          language: formatLanguages(selectedLanguages)
        };
      });
      setSearchParams({ mode: value });
      setMessages(getInitialMessages(value));
      setSessionStarted(value === 'translate');
      setLastStory(null);
      setUserInput('');
      setLevelSuggestion(null);
      recognitionRef.current?.stop();
      setIsListening(false);
      setError('');
      return;
    }

    setSettings(currentSettings => ({ ...currentSettings, [name]: value }));
  }

  // --- Build mode-specific request body ---
  function buildInteractionPayload(isStart = false) {
    const basePayload = {
      mode: settings.mode,
      language: formatLanguages(selectedSessionLanguages),
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

    if (selectedSessionLanguages.length === 0) {
      setError('Language is required.');
      return;
    }

    setSending(true);

    try {
      const interaction = await createInteraction(buildInteractionPayload(true));

      setMessages(currentMessages => [...currentMessages, { role: 'beaver', interaction }]);
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

    if (selectedSessionLanguages.length === 0) {
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

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    }

    const payload = buildInteractionPayload(false);
    const userMessage = userInput.trim() || 'Generate a story.';

    setMessages(currentMessages => [...currentMessages, { role: 'user', text: userMessage }]);
    setUserInput('');
    setSending(true);

    try {
      const interaction = await createInteraction(payload);

      setMessages(currentMessages => [...currentMessages, { role: 'beaver', interaction }]);

      if (settings.mode === 'story') {
        setLastStory(interaction);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setSending(false);
    }
  }

  // --- Ask for a different question at the same language/level/topic ---
  async function handleChangeQuestion(interaction) {
    setError('');
    setChangingQuestion(true);

    try {
      const payload = {
        mode: 'conversation',
        language: interaction.language,
        level: interaction.level,
        interactionType: 'conversation_turn',
        changeQuestion: true,
        avoidRepeating: interaction.nextPrompt
      };

      if (interaction.topic) {
        payload.topic = interaction.topic;
      }

      const newInteraction = await createInteraction(payload);
      setMessages(currentMessages => [...currentMessages, { role: 'beaver', interaction: newInteraction }]);
    } catch (err) {
      setError(err.message);
    } finally {
      setChangingQuestion(false);
    }
  }

  // --- Accept or dismiss an adaptive level-change suggestion ---
  async function handleLevelSuggestionAccept() {
    if (!levelSuggestion) {
      return;
    }

    try {
      await updateUser({ currentLevel: levelSuggestion.suggestedLevel });
      setSettings(currentSettings => ({ ...currentSettings, level: levelSuggestion.suggestedLevel }));
    } catch (err) {
      setError(err.message);
    } finally {
      setLevelSuggestion(null);
    }
  }

  function toggleSpeechInput() {
    setError('');

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    const SpeechRecognition = getSpeechRecognition();

    if (!SpeechRecognition) {
      setError('Speech input is not supported in this browser. Try Chrome or Edge.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = speechLanguageCodes[selectedSessionLanguages[0]] || 'en-US';
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onresult = event => {
      let finalTranscript = '';

      for (let index = event.resultIndex; index < event.results.length; index += 1) {
        const result = event.results[index];

        if (result.isFinal) {
          finalTranscript += result[0].transcript;
        }
      }

      if (finalTranscript.trim()) {
        setUserInput(currentInput => `${currentInput}${currentInput.trim() ? ' ' : ''}${finalTranscript.trim()}`);
      }
    };

    recognition.onerror = event => {
      setIsListening(false);
      setError(event.error === 'not-allowed' ? 'Microphone permission was blocked.' : 'Speech input stopped. Please try again.');
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;

    try {
      recognition.start();
      setIsListening(true);
    } catch (err) {
      setIsListening(false);
      setError('Speech input could not start. Please try again.');
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
          <span className="level-pill">{getLevelLabel(settings.level)}</span>
        </div>

        {error && <p className="status-message error-message">{error}</p>}

        {levelSuggestion && (
          <div className="level-suggestion-banner">
            <p>{levelSuggestion.message}</p>
            <div className="level-suggestion-actions">
              <button onClick={handleLevelSuggestionAccept} type="button">
                {levelSuggestion.direction === 'up' ? 'Yes, level me up' : 'Sounds good'}
              </button>
              <button onClick={() => setLevelSuggestion(null)} type="button">
                Not yet
              </button>
            </div>
          </div>
        )}

        <div className="chat-thread">
          {showStartButton && messages.length === 0 && !sending && (
            <div className="start-empty-state">
              <p>{settings.mode === 'story' ? 'Start a short story from your settings.' : 'Start a conversation from your settings.'}</p>
            </div>
          )}
          {messages.map((message, index) => {
            if (message.role === 'user') {
              return (
                <div className="message user-message" key={`user-${index}`}>
                  <span>You</span>
                  <p>{message.text}</p>
                </div>
              );
            }

            if (message.interaction) {
              return (
                <BeaverTurn
                  changingQuestion={changingQuestion}
                  interaction={message.interaction}
                  isLatest={index === latestBeaverInteractionIndex}
                  key={`beaver-${message.interaction.interactionId}-${index}`}
                  onChangeQuestion={handleChangeQuestion}
                  onFeedbackResult={setLevelSuggestion}
                  onSuggestionSaved={() => {}}
                />
              );
            }

            return (
              <div className="message beaver-message" key={`beaver-static-${index}`}>
                <span>BeaverUP</span>
                <p>{message.text}</p>
              </div>
            );
          })}
          {sending && <ThinkingMessage />}
        </div>

        {showStartButton ? (
          <form className="start-input" onSubmit={handleStart}>
            <button disabled={sending} type="submit">
              {sending ? 'Sending...' : 'Start'}
            </button>
          </form>
        ) : (
          <form className={`chat-input ${settings.mode === 'conversation' ? 'has-mic' : ''}`} onSubmit={handleSubmit}>
            <textarea
              onChange={event => setUserInput(event.target.value)}
              placeholder={settings.mode === 'story' ? 'Write difficult or interesting words...' : 'Write your message...'}
              value={userInput}
            />
            {settings.mode === 'conversation' && (
              <button
                aria-pressed={isListening}
                className={`mic-button ${isListening ? 'is-listening' : ''}`}
                disabled={sending || !supportsSpeechRecognition}
                onClick={toggleSpeechInput}
                title={supportsSpeechRecognition ? 'Speak your answer' : 'Speech input is not supported in this browser'}
                type="button"
              >
                {isListening ? 'Stop mic' : 'Mic'}
              </button>
            )}
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
          {settings.mode === 'translate' ? (
            <LanguageMultiSelect
              allowSelectAll
              maxSelections={learningLanguages.length}
              name="language"
              onChange={handleSettingChange}
              options={learningLanguages}
              placeholder="Choose target languages"
              value={formatLanguages(selectedSessionLanguages)}
            />
          ) : (
            <select name="language" onChange={handleSettingChange} value={selectedSessionLanguages[0] || ''}>
              {learningLanguages.length === 0 && <option value="">Choose languages in settings first</option>}
              {learningLanguages.map(language => (
                <option key={language} value={language}>
                  {language}
                </option>
              ))}
            </select>
          )}
        </label>
        <label>
          Level
          <select name="level" onChange={handleSettingChange} value={settings.level}>
            {LEVELS.map(level => (
              <option key={level.code} value={level.code}>
                {level.code} - {level.name}
              </option>
            ))}
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
