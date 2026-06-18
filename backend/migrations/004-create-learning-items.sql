CREATE TABLE IF NOT EXISTS learning_items (
    itemId INT AUTO_INCREMENT PRIMARY KEY,
    userId INT NOT NULL,
    language VARCHAR(100) NOT NULL,
    type ENUM('word', 'phrase', 'rewrite', 'expression') NOT NULL,
    sourceText VARCHAR(255) NOT NULL,
    normalizedSourceText VARCHAR(255) NOT NULL,
    meaning TEXT NOT NULL,
    context VARCHAR(255),
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_learning_items_user
        FOREIGN KEY (userId) REFERENCES users(userId)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    CONSTRAINT uq_learning_item_identity
        UNIQUE (userId, language, type, normalizedSourceText)
);
