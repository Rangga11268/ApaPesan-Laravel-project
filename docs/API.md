# ApaPesan API Documentation

## Overview

ApaPesan is a real-time chat application built with Laravel (backend) and React/Inertia.js (frontend). This document covers all available API endpoints, their authentication requirements, rate limits, and response formats.

## Authentication

All API endpoints (except login/register) require authentication via Laravel session/Sanctum.

## Rate Limits

| Endpoint Category | Rate Limit | Description               |
| ----------------- | ---------- | ------------------------- |
| General API       | 60/min     | Default limit             |
| Message Send      | 30/min     | Sending new messages      |
| File Upload       | 10/min     | File attachments          |
| Search            | 20/min     | Message search            |
| Reactions         | 60/min     | Adding/removing reactions |
| Group Operations  | 20/min     | Creating/modifying groups |
| Export            | 5/min      | Chat export (heavy)       |
| Login             | 5/min      | Authentication attempts   |

When rate limit is exceeded, the API returns:

```json
{
    "message": "Too many requests. Please wait."
}
```

HTTP Status: `429 Too Many Requests`

---

## Messages API

### Get Private Chat Messages

```
GET /user/{user_id}
```

**Authorization:** User must be part of the conversation  
**Response:** Inertia page with messages

---

### Get Group Chat Messages

```
GET /group/{group_id}
```

**Authorization:** User must be a group member  
**Response:** Inertia page with messages

---

### Send Message

```
POST /message
```

**Rate Limit:** `message-send` (30/min)

**Request Body:**

```json
{
  "message": "Hello world",
  "receiver_id": 123,          // Required if no group_id
  "group_id": null,            // Required if no receiver_id
  "attachments": [File],       // Optional, max 10 files
  "reply_to_id": 456           // Optional, reply to message
}
```

**Authorization:**

- For private messages: User must not be blocked
- For group messages: User must be a group member

**Response:**

```json
{
    "id": 1,
    "message": "Hello world",
    "sender": { "id": 1, "name": "John" },
    "attachments": [],
    "created_at": "2026-02-19T10:00:00Z"
}
```

---

### Update Message

```
PATCH /message/{message_id}
```

**Request Body:**

```json
{
    "message": "Updated message content"
}
```

**Authorization:** Only message sender can edit  
**Response:** Updated MessageResource

---

### Delete Message

```
DELETE /message/{message_id}
```

**Authorization:** Only message sender can delete

**Response:**

```json
{
  "message": { ... },
  "prevMessage": { ... }
}
```

---

### Load Older Messages

```
GET /message/older/{message_id}
```

**Authorization:** User must have access to the conversation

**Response:** Paginated MessageResource collection

---

### Mark Messages as Read

```
POST /message/read
```

**Request Body:**

```json
{
    "message_ids": [1, 2, 3]
}
```

**Response:**

```json
{
    "success": true,
    "updated": 3
}
```

---

### Search Messages

```
GET /message/search?query={query}&user_id={id}&group_id={id}
```

**Rate Limit:** `search` (20/min)

**Query Parameters:**

- `query` (required): Search term (min 2 chars)
- `user_id` (optional): Filter by private conversation
- `group_id` (optional): Filter by group

**Authorization:**

- user_id: User must be part of the conversation
- group_id: User must be a group member
- no filter: Returns only accessible messages

**Response:**

```json
{
  "success": true,
  "data": [ MessageResource, ... ],
  "pagination": {
    "current_page": 1,
    "last_page": 5,
    "per_page": 20,
    "total": 100
  }
}
```

---

## Groups API

### Create Group

```
POST /group
```

**Rate Limit:** `group-operations` (20/min)

**Request Body:**

```json
{
    "name": "My Group",
    "description": "Optional description",
    "user_ids": [1, 2, 3]
}
```

**Response:**

```json
{
  "success": true,
  "group": { ... }
}
```

---

### Update Group

```
PATCH /group/{group_id}
```

**Rate Limit:** `group-operations` (20/min)

**Request Body:**

```json
{
    "name": "Updated Name",
    "description": "Updated description"
}
```

**Authorization:** Only group owner

**Response:**

```json
{
  "success": true,
  "group": { ... }
}
```

---

### Delete Group

```
DELETE /group/{group_id}
```

**Rate Limit:** `group-operations` (20/min)

**Authorization:** Only group owner

**Response:**

```json
{
    "success": true
}
```

---

### Add Member

```
POST /group/{group_id}/member
```

**Rate Limit:** `group-operations` (20/min)

**Request Body:**

```json
{
    "user_id": 123
}
```

**Authorization:** Only group owner or admin

**Response:**

```json
{
  "success": true,
  "group": { ... }
}
```

---

### Remove Member

```
DELETE /group/{group_id}/member/{user_id}
```

**Rate Limit:** `group-operations` (20/min)

**Authorization:**

- Owner can remove anyone (except themselves)
- Members can remove themselves
- Admin can remove non-owners

**Response:**

```json
{
  "success": true,
  "group": { ... }
}
```

---

### Get Available Users

```
GET /group/{group_id}/available-users
```

**Authorization:** User must be a group member

**Response:**

```json
{
    "success": true,
    "users": [{ "id": 1, "name": "John", "email": "john@example.com" }]
}
```

---

## Reactions API

### Add Reaction

```
POST /message/{message_id}/reaction
```

**Rate Limit:** `reactions` (60/min)

**Request Body:**

```json
{
    "emoji": "👍"
}
```

**Response:**

```json
{
  "success": true,
  "reaction": { ... }
}
```

**Error (409):** Reaction already exists

---

### Remove Reaction

```
DELETE /message/{message_id}/reaction/{emoji}
```

**Rate Limit:** `reactions` (60/min)

**Response:**

```json
{
    "success": true
}
```

**Error (404):** Reaction not found

---

## Starred Messages API

### List Starred Messages

```
GET /starred
```

**Response:**

```json
{
  "success": true,
  "data": [ MessageResource, ... ],
  "pagination": { ... }
}
```

---

### Star Message

```
POST /message/{message_id}/star
```

**Response:**

```json
{
    "success": true
}
```

**Error (409):** Already starred

---

### Unstar Message

```
DELETE /message/{message_id}/star
```

**Response:**

```json
{
    "success": true
}
```

**Error (404):** Not starred

---

## Export API

### Export Chat

```
GET /chat/export/{type}/{id}?format={format}
```

**Rate Limit:** `export` (5/min)

**Parameters:**

- `type`: `user` or `group`
- `id`: User ID or Group ID
- `format`: `json` (default) or `txt`

**Authorization:**

- For user chat: User must be part of conversation
- For group chat: User must be a group member

**Response (JSON):**

```json
{
    "chat_name": "John Doe",
    "exported_at": "2026-02-19T10:00:00Z",
    "message_count": 150,
    "messages": [
        {
            "id": 1,
            "sender": "John",
            "message": "Hello",
            "attachments": [],
            "created_at": "2026-02-19T09:00:00Z",
            "edited_at": null
        }
    ]
}
```

**Response (TXT):** Plain text file download

---

## Typing Indicator

### Send Typing Event

```
POST /typing
```

**Request Body:**

```json
{
    "receiver_id": 123, // For private chat
    "group_id": null // For group chat
}
```

**Response:**

```json
{
    "success": true
}
```

---

## Error Responses

### Standard Error Format

```json
{
    "message": "Error description",
    "errors": {
        "field": ["Validation error message"]
    }
}
```

### Common HTTP Status Codes

| Code | Description       |
| ---- | ----------------- |
| 200  | Success           |
| 201  | Created           |
| 400  | Bad Request       |
| 401  | Unauthorized      |
| 403  | Forbidden         |
| 404  | Not Found         |
| 409  | Conflict          |
| 422  | Validation Error  |
| 429  | Too Many Requests |
| 500  | Server Error      |

---

## WebSocket Events

ApaPesan uses Laravel Reverb for real-time communication.

### Channels

| Channel                            | Type     | Description           |
| ---------------------------------- | -------- | --------------------- |
| `online`                           | Presence | Online user status    |
| `message.user.{userId1}-{userId2}` | Private  | Private chat messages |
| `message.group.{groupId}`          | Private  | Group chat messages   |

### Events

| Event                  | Payload       | Description             |
| ---------------------- | ------------- | ----------------------- |
| `SocketMessage`        | Message data  | New message             |
| `SocketMessageDeleted` | Message ID    | Message deleted         |
| `MessageEdited`        | Message data  | Message edited          |
| `MessageRead`          | Message IDs   | Messages marked as read |
| `MessageReacted`       | Reaction data | Reaction added/removed  |
| `UserTyping`           | User data     | User is typing          |

---

## Authorization Matrix

| Action                | Owner | Admin | Member | Non-Member |
| --------------------- | ----- | ----- | ------ | ---------- |
| View Group Messages   | ✅    | ✅    | ✅     | ❌         |
| Send Group Messages   | ✅    | ✅    | ✅     | ❌         |
| Update Group          | ✅    | ❌    | ❌     | ❌         |
| Delete Group          | ✅    | ❌    | ❌     | ❌         |
| Add Member            | ✅    | ✅    | ❌     | ❌         |
| Remove Other Member   | ✅    | ✅\*  | ❌     | ❌         |
| Remove Self           | ✅    | ✅    | ✅     | N/A        |
| View Available Users  | ✅    | ✅    | ✅     | ❌         |
| Export Group Chat     | ✅    | ✅    | ✅     | ❌         |
| Search Group Messages | ✅    | ✅    | ✅     | ❌         |

\*Admin cannot remove owner

---

## Mentions API

### Get My Mentions

```
GET /mentions
```

**Response:**

```json
{
    "success": true,
    "data": [
        {
            "id": 1,
            "message": { "id": 123, "message": "Hey @{1}", ... },
            "mentioned_by": { "id": 2, "name": "John" },
            "is_read": false,
            "created_at": "2026-02-19T10:00:00Z"
        }
    ],
    "pagination": { ... }
}
```

---

### Get Unread Mentions Count

```
GET /mentions/unread-count
```

**Response:**

```json
{
    "success": true,
    "count": 5
}
```

---

### Mark Mentions as Read

```
POST /mentions/read
```

**Request Body:**

```json
{
    "mention_ids": [1, 2, 3]
}
```

---

### Mark All Mentions as Read

```
POST /mentions/read-all
```

---

### Search Users for Mention

```
GET /mentions/search-users?query=john&group_id=1
```

**Query Parameters:**

- `query` (required): Search term
- `group_id` (optional): Filter to group members only

**Response:**

```json
{
    "success": true,
    "data": [{ "id": 1, "name": "John Doe", "avatar_url": "..." }]
}
```

---

## Pinned Messages API

### Get Pinned Messages

```
GET /pinned?group_id=1
```

**Authorization:** User must be a group member

**Response:**

```json
{
    "success": true,
    "data": [ ...messages ]
}
```

---

### Pin a Message

```
POST /message/{message_id}/pin
```

**Authorization:** User must be group owner or admin  
**Limit:** Maximum 25 pinned messages per group

---

### Unpin a Message

```
DELETE /message/{message_id}/pin
```

**Authorization:** User must be group owner or admin

---

## Health Check API

### Basic Health Check

```
GET /health
```

**Authentication:** None required

**Response:**

```json
{
    "status": "ok",
    "timestamp": "2026-02-19T10:00:00Z"
}
```

---

### Detailed Health Check

```
GET /health/detailed
```

**Authentication:** None required

**Response:**

```json
{
    "status": "healthy",
    "timestamp": "2026-02-19T10:00:00Z",
    "version": "1.0.0",
    "environment": "production",
    "checks": {
        "database": { "status": "ok", "connection": "mysql" },
        "cache": { "status": "ok", "driver": "redis" },
        "queue": { "status": "ok", "connection": "database" },
        "disk": { "status": "ok", "used_percent": 45.2, "free_gb": 120.5 },
        "memory": { "status": "ok", "used_mb": 64, "used_percent": 25.0 }
    }
}
```

**Status Codes:**

- `200`: All checks passed
- `503`: One or more critical checks failed

---

## Authorization Matrix

| Action                | Owner | Admin | Member | Non-Member |
| --------------------- | ----- | ----- | ------ | ---------- |
| View Group Messages   | ✅    | ✅    | ✅     | ❌         |
| Send Group Messages   | ✅    | ✅    | ✅     | ❌         |
| Update Group          | ✅    | ❌    | ❌     | ❌         |
| Delete Group          | ✅    | ❌    | ❌     | ❌         |
| Add Member            | ✅    | ✅    | ❌     | ❌         |
| Remove Other Member   | ✅    | ✅\*  | ❌     | ❌         |
| Remove Self           | ✅    | ✅    | ✅     | N/A        |
| View Available Users  | ✅    | ✅    | ✅     | ❌         |
| Export Group Chat     | ✅    | ✅    | ✅     | ❌         |
| Search Group Messages | ✅    | ✅    | ✅     | ❌         |
| Pin/Unpin Messages    | ✅    | ✅    | ❌     | ❌         |

\*Admin cannot remove owner

---

## Best Practices

1. **Pagination**: Use pagination parameters for large data sets
2. **Rate Limits**: Implement exponential backoff when hitting rate limits
3. **WebSocket**: Subscribe to relevant channels for real-time updates
4. **Error Handling**: Always check response status codes
5. **Validation**: Validate input client-side before submitting
