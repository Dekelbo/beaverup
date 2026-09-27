ALTER TABLE learning_items
    ADD COLUMN isFavorite TINYINT(1) NOT NULL DEFAULT 0 AFTER context;

ALTER TABLE learning_items
    MODIFY type ENUM('word', 'phrase', 'rewrite', 'expression', 'grammar', 'culture', 'song') NOT NULL;
