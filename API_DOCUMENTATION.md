# Akshar Blog API — Documentation

> **Base URL:** `http://localhost:3000/api/v1`
>
> **Swagger UI:** `http://localhost:3000/docs`

---

## Table of Contents

- [Authentication](#authentication)
- [Blogs](#blogs)
- [Comments](#comments)
- [Users](#users)
- [Feed](#feed)
- [Notifications](#notifications)
- [Error Handling](#error-handling)
- [Rate Limiting](#rate-limiting)

---

## Authentication

All protected endpoints require a **Bearer token** in the `Authorization` header:

```
Authorization: Bearer <jwt_token>
```

Tokens are issued on login and registration. The JWT payload contains:

```json
{
  "userId": "MongoDB ObjectId",
  "email": "user@example.com"
}
```

---

### `POST /auth/register`

Create a new user account. Returns a JWT token so the user is auto-logged in.

**Request Body:**

| Field      | Type   | Required | Description            |
|------------|--------|----------|------------------------|
| `name`     | string | ✅       | Full name              |
| `email`    | string | ✅       | Unique email address   |
| `username` | string | ✅       | Unique username        |
| `password` | string | ✅       | Password (min 6 chars) |

**Response `201`:**

```json
{
  "message": "User registered succesfully",
  "token": "eyJhbGci...",
  "user": {
    "_id": "665a...",
    "id": "665a...",
    "name": "Aashish",
    "email": "aashish@example.com",
    "username": "aashish"
  }
}
```

**Errors:** `400` (missing fields, user already exists), `500` (server error)

---

### `POST /auth/login`

Authenticate an existing user.

**Request Body:**

| Field      | Type   | Required | Description |
|------------|--------|----------|-------------|
| `email`    | string | ✅       | Email       |
| `password` | string | ✅       | Password    |

**Response `200`:**

```json
{
  "message": "Login successful",
  "token": "eyJhbGci...",
  "user": {
    "_id": "665a...",
    "id": "665a...",
    "name": "Aashish",
    "email": "aashish@example.com",
    "username": "aashish"
  }
}
```

**Errors:** `400` (missing fields), `401` (invalid credentials)

---

## Blogs

### `GET /blogs`  🌐 Public

Get all **published** blogs with pagination and optional tag filter.

**Query Parameters:**

| Param   | Type    | Default | Description                 |
|---------|---------|---------|-----------------------------|
| `tag`   | string  | —       | Filter by tag               |
| `page`  | number  | 1       | Page number                 |
| `limit` | number  | 10      | Articles per page           |

**Response `200`:**

```json
{
  "success": true,
  "page": 1,
  "limit": 10,
  "total": 42,
  "results": 10,
  "data": [
    {
      "_id": "...",
      "title": "The Art of Chai",
      "content": "...",
      "tags": ["culture", "food"],
      "status": "published",
      "slug": "the-art-of-chai",
      "author": { "_id": "...", "name": "Priya", "username": "priya" },
      "likes": ["userId1", "userId2"],
      "likesCount": 2,
      "createdAt": "2026-02-14T...",
      "updatedAt": "2026-02-14T..."
    }
  ]
}
```

---

### `GET /blogs/search`  🌐 Public

Full-text search across published articles (sorted by relevance).

**Query Parameters:**

| Param   | Type   | Default | Description        |
|---------|--------|---------|--------------------|
| `q`     | string | —       | **Required.** Search query |
| `page`  | number | 1       | Page number        |
| `limit` | number | 10      | Results per page   |

**Response `200`:**

```json
{
  "success": true,
  "results": 3,
  "data": [ /* Article objects */ ]
}
```

**Errors:** `400` (missing `q`)

---

### `GET /blogs/slug/:slug`  🌐 Public

Get a single published blog by its SEO-friendly slug.

**Response `200`:**

```json
{
  "success": true,
  "data": { /* Article object with populated author */ }
}
```

**Errors:** `404` (not found)

---

### `GET /blogs/:id`  🌐 Public

Get a single blog by its MongoDB ID (any status).

**Response `200`:**

```json
{
  "success": true,
  "data": { /* Article object */ }
}
```

**Errors:** `400` (invalid ID format), `404` (not found)

---

### `POST /blogs`  🔒 Auth Required

Create a new blog (always saved as **draft**).

**Request Body:**

| Field     | Type     | Required | Description         |
|-----------|----------|----------|---------------------|
| `title`   | string   | ✅       | Article title       |
| `content` | string   | ✅       | Article body        |
| `tags`    | string[] | ❌       | Array of tag names  |

**Response `201`:**

```json
{
  "success": true,
  "data": {
    "_id": "...",
    "title": "My Article",
    "status": "draft",
    "slug": "my-article",
    "author": "userId",
    ...
  }
}
```

---

### `PUT /blogs/:id`  🔒 Auth Required (Owner only)

Update an existing blog. Only the author can update.

**Request Body** (all optional):

| Field     | Type     | Description       |
|-----------|----------|-------------------|
| `title`   | string   | New title         |
| `content` | string   | New content       |
| `tags`    | string[] | Updated tags      |

**Response `200`:**

```json
{
  "success": true,
  "data": { /* Updated article */ }
}
```

**Errors:** `403` (not the author), `404` (not found)

---

### `PATCH /blogs/:id/publish`  🔒 Auth Required (Owner only)

Publish a draft blog.

**Response `200`:**

```json
{
  "success": true,
  "message": "Blog published successfully",
  "data": { /* Article with status: "published" */ }
}
```

**Errors:** `400` (already published), `403` (not the author), `404` (not found)

---

### `PATCH /blogs/:id/archive`  🔒 Auth Required (Owner only)

Archive a blog (removes from public listing).

**Response `200`:**

```json
{
  "success": true,
  "message": "Blog archived successfully",
  "data": { /* Article with status: "archived" */ }
}
```

**Errors:** `403` (not the author), `404` (not found)

---

### `DELETE /blogs/:id`  🔒 Auth Required (Owner only)

Permanently delete a blog.

**Response `200`:**

```json
{
  "success": true,
  "message": "Blog deleted successfully"
}
```

**Errors:** `403` (not the author), `404` (not found)

---

### `POST /blogs/:id/like`  🔒 Auth Required

Like a published blog. Creates a notification for the author.

**Response `200`:**

```json
{
  "success": true,
  "likesCount": 5
}
```

**Errors:** `400` (already liked / unpublished blog), `404` (not found)

---

### `POST /blogs/:id/unlike`  🔒 Auth Required

Remove a like from a blog.

**Response `200`:**

```json
{
  "success": true,
  "likesCount": 4
}
```

**Errors:** `400` (not liked), `404` (not found)

---

## Comments

### `GET /blogs/:id/comments`  🌐 Public

Get all comments for a blog, sorted newest first.

**Response `200`:**

```json
{
  "success": true,
  "data": [
    {
      "_id": "...",
      "content": "Great article!",
      "blog": "blogId",
      "author": { "_id": "...", "name": "Arjun", "username": "arjun" },
      "createdAt": "2026-02-14T..."
    }
  ]
}
```

---

### `POST /blogs/:id/comments`  🔒 Auth Required

Add a comment to a blog. Creates a notification for the blog author. Rate limited to **20 requests/minute**.

**Request Body:**

| Field     | Type   | Required | Description   |
|-----------|--------|----------|---------------|
| `content` | string | ✅       | Comment text  |

**Response `201`:**

```json
{
  "success": true,
  "data": { /* Comment object */ }
}
```

---

### `DELETE /comments/:commentId`  🔒 Auth Required (Owner only)

Delete a comment. Only the comment author can delete.

**Response `200`:**

```json
{
  "success": true,
  "message": "Comment deleted"
}
```

**Errors:** `403` (not the author), `404` (not found)

---

## Users

### `GET /users/:username`  🌐 Public

Get a user's public profile and their published articles.

**Response `200`:**

```json
{
  "success": true,
  "user": {
    "_id": "...",
    "name": "Priya Sharma",
    "username": "priyasharma",
    "bio": "Writer and thinker.",
    "joinedAt": "2026-01-15T...",
    "totalBlogs": 6,
    "followers": ["userId1", "userId2"],
    "following": ["userId3"]
  },
  "articles": [ /* Published Article objects */ ]
}
```

---

### `POST /users/:id/follow`  🔒 Auth Required

Follow a user. Creates a notification for the target user.

**Response `200`:**

```json
{
  "success": true,
  "message": "User followed successfully"
}
```

**Errors:** `400` (can't follow yourself / already following), `404` (user not found)

---

### `POST /users/:id/unfollow`  🔒 Auth Required

Unfollow a user.

**Response `200`:**

```json
{
  "success": true,
  "message": "User unfollowed successfully"
}
```

**Errors:** `400` (not following this user)

---

## Feed

### `GET /feed`  🔒 Auth Required

Get published articles from users the authenticated user follows, sorted by newest first.

**Response `200`:**

```json
{
  "success": true,
  "data": [ /* Article objects from followed users */ ]
}
```

---

## Notifications

### `GET /notifications`  🔒 Auth Required

Get all notifications for the authenticated user.

**Response `200`:**

```json
{
  "success": true,
  "data": [
    {
      "_id": "...",
      "recipient": "userId",
      "sender": { "_id": "...", "name": "Arjun", "username": "arjun" },
      "type": "like",
      "blog": { "_id": "...", "title": "The Art of Chai" },
      "read": false,
      "createdAt": "2026-02-14T..."
    }
  ]
}
```

**Notification Types:** `like`, `comment`, `follow`

---

### `PATCH /notifications/:id/read`  🔒 Auth Required

Mark a notification as read.

**Response `200`:**

```json
{
  "success": true,
  "message": "Marked as read"
}
```

---

## Error Handling

All errors follow this format:

```json
{
  "success": false,
  "message": "Error description"
}
```

| Status Code | Meaning                              |
|-------------|--------------------------------------|
| `400`       | Bad request / validation error       |
| `401`       | Unauthorized (missing/invalid token) |
| `403`       | Forbidden (not the owner)            |
| `404`       | Resource not found                   |
| `500`       | Internal server error                |

---

## Rate Limiting

| Scope        | Max Requests | Time Window |
|--------------|-------------|-------------|
| **Global**   | 100         | 1 minute    |
| **Comments** | 20          | 1 minute    |

When rate limited, the API returns `429 Too Many Requests`.

---

## Data Models

### Article

```
{
  _id          ObjectId
  title        String (required)
  content      String
  tags         [String]
  status       "draft" | "published" | "archived"
  slug         String (auto-generated from title)
  author       ObjectId → User
  likes        [ObjectId → User]
  likesCount   Number
  createdAt    Date
  updatedAt    Date
}
```

### User

```
{
  _id          ObjectId
  name         String (required)
  email        String (required, unique)
  username     String (required, unique)
  password     String (hashed with bcryptjs)
  bio          String
  followers    [ObjectId → User]
  following    [ObjectId → User]
  createdAt    Date
  updatedAt    Date
}
```

### Comment

```
{
  _id          ObjectId
  content      String (required)
  blog         ObjectId → Article
  author       ObjectId → User
  createdAt    Date
  updatedAt    Date
}
```

### Notification

```
{
  _id          ObjectId
  recipient    ObjectId → User
  sender       ObjectId → User
  type         "like" | "comment" | "follow"
  blog         ObjectId → Article (optional)
  read         Boolean (default: false)
  createdAt    Date
}
```
