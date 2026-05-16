# BeaverUP Backend API

BeaverUP is a language learning backend built with Node.js and Express. It uses mock data. No real database and no real AI API are connected yet.

## How to Install

```bash
npm install
```

## How to Run

```bash
node src/app/app.js
```

Base URL:

```text
http://localhost:3000
```

## How to Test

1. Run `npm install`.
2. Start the server with `npm start`.
3. Open Postman.
4. Import the provided Postman collection from the docs folder.
5. Set the base URL to `http://localhost:3000`.
6. Add mock authorization headers where required:
    - `x-user-role: admin`
    - `x-user-id: 1`
7. Send the example requests in the collection.
8. Check that responses use the standard success/error JSON format.

## Response Format

All API responses use JSON.

Success response:

```json
{
    "success": true,
    "data": {},
    "error": null
}
```

Error response:

```json
{
    "success": false,
    "data": null,
    "error": {
        "code": "ERROR_CODE",
        "message": "Short readable message.",
        "details": {}
    }
}
```

## Authorization

Some requests use simple mock authorization headers:

```text
x-user-role: admin
x-user-id: 1
```

Roles:

```text
admin | user
```

## Status Codes

```text
200 OK - successful GET, PUT, DELETE
201 Created - successful POST
400 Bad Request - invalid or missing input
403 Forbidden - user is not allowed to access the resource
404 Not Found - route or item was not found
500 Internal Server Error - unexpected server error
```

## Resources

### Users

User fields:

```json
{
    "userId": 1,
    "firstName": "Ido",
    "lastName": "Israeli",
    "userRole": "admin",
    "userNativeLanguage": "Hebrew",
    "languageToLearn": "Spanish",
    "currentLevel": "B2",
    "createDate": "2026-05-06T12:00:00Z",
    "updateDate": "2026-05-06T12:00:00Z"
}
```

Endpoints:

```text
GET /users
GET /users/:id
POST /users
PUT /users/:id
DELETE /users/:id
```

Required fields for POST:

```text
firstName, lastName, userRole, userNativeLanguage, languageToLearn, currentLevel
```

Valid levels:

```text
A1 | A2 | B1 | B2 | C1 | C2
```

Level meaning:

```text
A1 - Beginner: understands and uses very basic phrases.
A2 - Elementary: handles simple daily conversations.
B1 - Intermediate: communicates in common situations.
B2 - Upper intermediate: speaks clearly on many topics.
C1 - Advanced: uses flexible and natural language.
C2 - Proficient: near-native understanding and expression.
```

### Learning Items

Learning items store the words, phrases, rewrites, and expressions the user learned.

Learning item fields:

```json
{
    "itemId": 1,
    "userId": 1,
    "language": "Spanish",
    "type": "phrase",
    "sourceText": "I'd like to get to...",
    "meaning": "A polite way to say I want to go to...",
    "context": "travel conversation"
}
```

Endpoints:

```text
GET /learning-items
GET /learning-items/:id
GET /learning-items/user/:userId
POST /learning-items
PUT /learning-items/:id
DELETE /learning-items/:id
```

Required fields for POST:

```text
userId, language, type, sourceText, meaning
```

Valid types:

```text
word | phrase | rewrite | expression
```

### Interactions

Interactions store the main BeaverUP learning flow. This includes Conversation, Story, and Translate modes.

For now, `POST /interactions` returns a mock AI-style response. Later, this mock part can be replaced with a real AI API call.

Interaction fields:

```json
{
    "interactionId": 1,
    "userId": 1,
    "mode": "conversation",
    "interactionType": "conversation_turn",
    "language": "Spanish",
    "level": "B1",
    "topic": "travel",
    "previousTopic": null,
    "previousInteractionId": null,
    "wordGroup": [],
    "userInput": "I want go to train station",
    "nativeRewrite": "I want to go to the train station.",
    "higherLevelRewrite": "I'd like to get to the train station.",
    "storyText": null,
    "wordTranslations": [],
    "translation": null,
    "learningItems": [],
    "nextPrompt": "How would you ask for a ticket?"
}
```

Mode behavior:

```text
conversation - uses conversation_turn and returns nativeRewrite, higherLevelRewrite, learningItems, and nextPrompt.
story - uses story_start or story_followup and returns storyText, wordTranslations, learningItems, and nextPrompt.
translate - uses translate_request and returns translation and possible learningItems.
```

Story flow:

```text
story_start - creates the first story from language, level, optional topic, and optional wordGroup.
story_followup - receives the user's difficult or interesting words in userInput and creates a new story.
wordGroup - optional array of words for the first story.
previousInteractionId - links a follow-up to the previous story interaction.
previousTopic - helps ensure the next story uses a different topic.
```

Endpoints:

```text
GET /interactions
GET /interactions/:id
GET /interactions/user/:userId
POST /interactions
PUT /interactions/:id
DELETE /interactions/:id
```

Required fields for POST:

```text
Base: userId, mode, language, level
conversation_turn: userInput
translate_request: userInput
story_start: userInput is not required; wordGroup is optional
story_followup: userInput
```

Valid modes:

```text
conversation | story | translate
```

Valid interaction types:

```text
conversation_turn | story_start | story_followup | translate_request
```

## Example Requests

Create an interaction:

```http
POST /interactions
x-user-role: user
x-user-id: 1
Content-Type: application/json
```

```json
{
    "userId": 1,
    "mode": "conversation",
    "interactionType": "conversation_turn",
    "language": "Spanish",
    "level": "B1",
    "topic": "travel",
    "userInput": "I want go to train station"
}
```

Create a story start interaction:

```json
{
    "userId": 1,
    "mode": "story",
    "interactionType": "story_start",
    "language": "Spanish",
    "level": "A1",
    "topic": "family",
    "wordGroup": ["Hola", "casa", "madre"]
}
```

Create a story follow-up interaction:

```json
{
    "userId": 1,
    "mode": "story",
    "interactionType": "story_followup",
    "language": "Spanish",
    "level": "A1",
    "topic": "market",
    "previousTopic": "family",
    "previousInteractionId": 3,
    "userInput": "madre, casa"
}
```

Create a learning item:

```http
POST /learning-items
x-user-role: user
x-user-id: 1
Content-Type: application/json
```

```json
{
    "userId": 1,
    "language": "Spanish",
    "type": "phrase",
    "sourceText": "I'd like to get to...",
    "meaning": "A polite way to say I want to go to...",
    "context": "travel conversation"
}
```

## Assumptions

Data resets when the server restarts.

## Concrete Response Examples

### Users

Successful `GET /users/1` response:

```json
{
    "success": true,
    "data": {
        "userId": 1,
        "firstName": "Ido",
        "lastName": "Israeli",
        "userRole": "admin",
        "userNativeLanguage": "Hebrew",
        "languageToLearn": "Spanish",
        "currentLevel": "B2",
        "createDate": "2026-05-06T12:00:00Z",
        "updateDate": "2026-05-06T12:00:00Z"
    },
    "error": null
}
```

Successful `POST /users` response:

```json
{
    "success": true,
    "data": {
        "userId": 11,
        "firstName": "Noa",
        "lastName": "Levi",
        "userRole": "user",
        "userNativeLanguage": "Hebrew",
        "languageToLearn": "Spanish",
        "currentLevel": "A2",
        "createDate": "2026-05-16T10:00:00.000Z",
        "updateDate": "2026-05-16T10:00:00.000Z"
    },
    "error": null
}
```

User validation error example:

```json
{
    "success": false,
    "data": null,
    "error": {
        "code": "VALIDATION_ERROR",
        "message": "Invalid user id.",
        "details": {
            "field": "id"
        }
    }
}
```

User not-found error example:

```json
{
    "success": false,
    "data": null,
    "error": {
        "code": "USER_NOT_FOUND",
        "message": "User not found.",
        "details": {}
    }
}
```

### Learning Items

Successful `GET /learning-items/1` response:

```json
{
    "success": true,
    "data": {
        "itemId": 1,
        "userId": 1,
        "language": "Spanish",
        "type": "phrase",
        "sourceText": "I'd like to get to...",
        "meaning": "A polite way to say I want to go to...",
        "context": "travel conversation"
    },
    "error": null
}
```

Successful `POST /learning-items` response:

```json
{
    "success": true,
    "data": {
        "itemId": 4,
        "userId": 1,
        "language": "Spanish",
        "type": "phrase",
        "sourceText": "I'd like to get to...",
        "meaning": "A polite way to say I want to go to...",
        "context": "travel conversation"
    },
    "error": null
}
```

Learning item authorization error example:

```json
{
    "success": false,
    "data": null,
    "error": {
        "code": "FORBIDDEN",
        "message": "You can only access your own data or must be an admin.",
        "details": {
            "requiredOwnerId": 1
        }
    }
}
```

Learning item not-found error example:

```json
{
    "success": false,
    "data": null,
    "error": {
        "code": "LEARNING_ITEM_NOT_FOUND",
        "message": "Learning item not found.",
        "details": {}
    }
}
```

### Interactions

Successful `POST /interactions` conversation response:

```json
{
    "success": true,
    "data": {
        "interactionId": 5,
        "userId": 1,
        "mode": "conversation",
        "interactionType": "conversation_turn",
        "language": "Spanish",
        "level": "B1",
        "topic": "travel",
        "previousTopic": null,
        "previousInteractionId": null,
        "wordGroup": [],
        "userInput": "I want go to train station",
        "nativeRewrite": "Natural B1-level rewrite: I want to go to the train station.",
        "higherLevelRewrite": "Higher-level version for a B1 learner: I'd like to get to the train station.",
        "storyText": null,
        "wordTranslations": [],
        "translation": null,
        "learningItems": [
            {
                "type": "phrase",
                "sourceText": "I'd like to get to...",
                "meaning": "A polite phrase that helps a B1 learner sound more natural."
            }
        ],
        "nextPrompt": "Answer at B1 level: How would you ask for a ticket?"
    },
    "error": null
}
```

Successful `POST /interactions` story response:

```json
{
    "success": true,
    "data": {
        "interactionId": 5,
        "userId": 1,
        "mode": "story",
        "interactionType": "story_start",
        "language": "Spanish",
        "level": "A1",
        "topic": "family",
        "previousTopic": null,
        "previousInteractionId": null,
        "wordGroup": ["Hola", "casa", "madre"],
        "userInput": null,
        "nativeRewrite": null,
        "higherLevelRewrite": null,
        "storyText": "Mock A1 Spanish story about family that uses Hola, casa, madre.",
        "wordTranslations": [
            {
                "sourceText": "Hola",
                "translation": "Mock Spanish translation for Hola"
            },
            {
                "sourceText": "casa",
                "translation": "Mock Spanish translation for casa"
            },
            {
                "sourceText": "madre",
                "translation": "Mock Spanish translation for madre"
            }
        ],
        "translation": null,
        "learningItems": [
            {
                "type": "word",
                "sourceText": "Hola",
                "meaning": "Useful Spanish word for A1-level story practice."
            },
            {
                "type": "word",
                "sourceText": "casa",
                "meaning": "Useful Spanish word for A1-level story practice."
            },
            {
                "type": "word",
                "sourceText": "madre",
                "meaning": "Useful Spanish word for A1-level story practice."
            }
        ],
        "nextPrompt": "Which words or phrases were difficult or interesting?"
    },
    "error": null
}
```

Interaction validation error example:

```json
{
    "success": false,
    "data": null,
    "error": {
        "code": "VALIDATION_ERROR",
        "message": "Missing required interaction fields.",
        "details": {
            "missingFields": ["userInput"]
        }
    }
}
```

Interaction not-found error example:

```json
{
    "success": false,
    "data": null,
    "error": {
        "code": "INTERACTION_NOT_FOUND",
        "message": "Interaction not found.",
        "details": {}
    }
}
```
