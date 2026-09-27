ALTER TABLE interactions
    ADD COLUMN displayMessage TEXT NULL AFTER nextPrompt,
    ADD COLUMN glossary JSON NULL AFTER displayMessage,
    ADD COLUMN nextPromptTranslation TEXT NULL AFTER glossary,
    ADD COLUMN suggestedLearningItems JSON NULL AFTER nextPromptTranslation;
