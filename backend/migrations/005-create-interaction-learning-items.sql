CREATE TABLE IF NOT EXISTS interaction_learning_items (
    interactionId INT NOT NULL,
    itemId INT NOT NULL,
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (interactionId, itemId),
    CONSTRAINT fk_interaction_learning_items_interaction
        FOREIGN KEY (interactionId) REFERENCES interactions(interactionId)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    CONSTRAINT fk_interaction_learning_items_item
        FOREIGN KEY (itemId) REFERENCES learning_items(itemId)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);
