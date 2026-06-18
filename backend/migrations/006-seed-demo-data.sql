INSERT INTO users (
    userId,
    firstName,
    lastName,
    userRole,
    userNativeLanguage,
    languageToLearn,
    currentLevel,
    email,
    passwordHash
) VALUES
    (1, 'Ido', 'Israeli', 'admin', 'Hebrew', 'Spanish', 'B2', 'idois@post.bgu.ac.il', '$2b$10$fq/mWDPblWNiI/ZlpPTJO.LqOuEfNP2F3mVX37HHppb5KeBTYyzUm'),
    (2, 'Dekel', 'Boneh', 'admin', 'Hebrew', 'German', 'A2', 'dekelbo3@gmail.com', '$2b$10$fq/mWDPblWNiI/ZlpPTJO.LqOuEfNP2F3mVX37HHppb5KeBTYyzUm')
ON DUPLICATE KEY UPDATE
    firstName = VALUES(firstName),
    lastName = VALUES(lastName),
    userRole = VALUES(userRole),
    userNativeLanguage = VALUES(userNativeLanguage),
    languageToLearn = VALUES(languageToLearn),
    currentLevel = VALUES(currentLevel),
    passwordHash = VALUES(passwordHash);

INSERT INTO admins (userId, permissionsLevel) VALUES
    (1, 'full_access'),
    (2, 'full_access')
ON DUPLICATE KEY UPDATE
    permissionsLevel = VALUES(permissionsLevel);
