CREATE TABLE IF NOT EXISTS interactions (
    interactionId INT AUTO_INCREMENT PRIMARY KEY,
    userId INT NOT NULL,
    mode ENUM('conversation', 'story', 'translate') NOT NULL,
    interactionType ENUM('conversation_turn', 'story_start', 'story_followup', 'translate_request') NOT NULL,
    language VARCHAR(100) NOT NULL,
    level ENUM('A1', 'A1+', 'A2', 'A2+', 'B1', 'B1+', 'B2', 'B2+', 'C1', 'C1+', 'C2', 'C2+') NOT NULL,
    topic VARCHAR(150),
    previousTopic VARCHAR(150),
    previousInteractionId INT,
    wordGroup JSON,
    userInput TEXT,
    nativeRewrite TEXT,
    higherLevelRewrite TEXT,
    storyText TEXT,
    wordTranslations JSON,
    translation JSON,
    nextPrompt TEXT,
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_interactions_user
        FOREIGN KEY (userId) REFERENCES users(userId)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    CONSTRAINT fk_interactions_previous
        FOREIGN KEY (previousInteractionId) REFERENCES interactions(interactionId)
        ON DELETE SET NULL
        ON UPDATE CASCADE
);
