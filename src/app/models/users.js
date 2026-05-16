// --- Mock user database ---
let users = [
    {
        userId: 1,
        firstName: "Ido",
        lastName: "Israeli",
        userRole: "admin",
        userNativeLanguage: "Hebrew",
        languageToLearn: "Spanish",
        currentLevel: "B2",
        createDate: "2026-05-06T12:00:00Z",
        updateDate: "2026-05-06T12:00:00Z"
    },
    {
      userId: 2,
      firstName: "Dekel",
      lastName: "Boneh",
      userRole: "admin",
      userNativeLanguage: "Hebrew",
      languageToLearn: "German",
      currentLevel: "A2",
      createDate: "2026-05-06T12:05:00Z",
      updateDate: "2026-05-06T12:05:00Z"
    },
    {
        userId: 3,
        firstName: "David",
        lastName: "Cohen",
        userRole: "admin",
        userNativeLanguage: "Hebrew",
        languageToLearn: "Japanese",
        currentLevel: "C1",
        createDate: "2026-05-06T12:10:00Z",
        updateDate: "2026-05-06T12:15:00Z"
    },
    {
        userId: 4,
        firstName: "Elena",
        lastName: "Rodriguez",
        userRole: "user",
        userNativeLanguage: "Spanish",
        languageToLearn: "English",
        currentLevel: "B1",
        createDate: "2026-05-06T12:20:00Z",
        updateDate: "2026-05-06T12:20:00Z"
    },
    {
        userId: 5,
        firstName: "Yuki",
        lastName: "Tanaka",
        userRole: "user",
        userNativeLanguage: "Japanese",
        languageToLearn: "Italian",
        currentLevel: "A1",
        createDate: "2026-05-06T12:25:00Z",
        updateDate: "2026-05-06T12:25:00Z"
    },
    {
        userId: 6,
        firstName: "Marcus",
        lastName: "Schmidt",
        userRole: "user",
        userNativeLanguage: "German",
        languageToLearn: "Hebrew",
        currentLevel: "B2",
        createDate: "2026-05-06T12:30:00Z",
        updateDate: "2026-05-06T12:30:00Z"
    },
    {
        userId: 7,
        firstName: "Fatima",
        lastName: "Zahra",
        userRole: "user",
        userNativeLanguage: "Arabic",
        languageToLearn: "Spanish",
        currentLevel: "C2",
        createDate: "2026-05-06T12:35:00Z",
        updateDate: "2026-05-06T12:35:00Z"
    },
    {
        userId: 8,
        firstName: "Liam",
        lastName: "O'Connor",
        userRole: "user",
        userNativeLanguage: "English",
        languageToLearn: "Portuguese",
        currentLevel: "A2",
        createDate: "2026-05-06T12:40:00Z",
        updateDate: "2026-05-06T12:40:00Z"
    },
    {
        userId: 9,
        firstName: "Chloe",
        lastName: "Dubois",
        userRole: "user",
        userNativeLanguage: "French",
        languageToLearn: "German",
        currentLevel: "B1",
        createDate: "2026-05-06T12:45:00Z",
        updateDate: "2026-05-06T12:50:00Z"
    },
    {
        userId: 10,
        firstName: "Chen",
        lastName: "Wei",
        userRole: "user",
        userNativeLanguage: "Chinese",
        languageToLearn: "English",
        currentLevel: "B2",
        createDate: "2026-05-06T12:55:00Z",
        updateDate: "2026-05-06T12:55:00Z"
    }
];

// --- Exporting users array for use in controllers ---
module.exports = users;