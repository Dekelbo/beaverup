CREATE TABLE IF NOT EXISTS difficulty_feedback (
    id INT AUTO_INCREMENT PRIMARY KEY,
    userId INT NOT NULL,
    interactionId INT,
    language VARCHAR(100) NOT NULL,
    level ENUM('A1', 'A1+', 'A2', 'A2+', 'B1', 'B1+', 'B2', 'B2+', 'C1', 'C1+', 'C2', 'C2+') NOT NULL,
    feedback ENUM('too_easy', 'just_right', 'too_hard') NOT NULL,
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_difficulty_feedback_user
        FOREIGN KEY (userId) REFERENCES users(userId)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    CONSTRAINT fk_difficulty_feedback_interaction
        FOREIGN KEY (interactionId) REFERENCES interactions(interactionId)
        ON DELETE SET NULL
        ON UPDATE CASCADE
);
