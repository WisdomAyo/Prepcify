# Lumio API — v1 Auth Endpoints

All requests must include `Accept: application/json`.  
All responses are JSON. Successful responses wrap data in a `data` key.

**Base URL:** `http://localhost:8000/api/v1`

---

## POST /auth/register

Register a new user account.

**Rate limit:** 3/minute per IP

**Request body:**
```json
{
  "email": "student@example.com",
  "password": "SecurePassword123!",
  "password_confirmation": "SecurePassword123!",
  "display_name": "Chidi Okeke",
  "first_name": "Chidi",
  "last_name": "Okeke",
  "user_type": "student"
}
```

**Success — 201 Created:**
```json
{
  "data": {
    "id": 1,
    "email": "student@example.com",
    "display_name": "Chidi Okeke",
    "user_type": "student",
    "email_verified_at": null,
    "created_at": "2026-04-23T14:00:00.000000Z"
  },
  "token": "1|abc123..."
}
```

**Errors:**
- `422` — Validation error (duplicate email, weak password, mismatched confirmation)
- `429` — Rate limit exceeded

---

## POST /auth/login

Log in with email or phone + password.

**Rate limit:** 5/minute per IP

**Request body (email):**
```json
{
  "email": "student@example.com",
  "password": "SecurePassword123!"
}
```

**Request body (phone):**
```json
{
  "phone": "+2348012345678",
  "password": "SecurePassword123!"
}
```

**Success — 200 OK:**
```json
{
  "data": {
    "id": 1,
    "email": "student@example.com",
    "user_type": "student",
    "last_login_at": "2026-04-23T14:05:00.000000Z"
  },
  "token": "2|xyz789..."
}
```

**Errors:**
- `422` — Invalid credentials
- `429` — Rate limit exceeded

---

## POST /auth/logout

Invalidate the current bearer token.

**Headers:** `Authorization: Bearer {token}`

**Success — 200 OK:**
```json
{
  "message": "Logged out successfully."
}
```

**Errors:**
- `401` — Unauthenticated

---

## POST /auth/password/forgot

Send a password reset link. Always returns 200 to prevent email enumeration.

**Rate limit:** 3/hour per IP, 1/5 minutes per email

**Request body:**
```json
{
  "email": "student@example.com"
}
```

**Success — 200 OK:**
```json
{
  "message": "If that email exists, a reset link has been sent."
}
```

**Errors:**
- `422` — Invalid email format
- `429` — Rate limit exceeded

---

## POST /auth/password/reset

Complete a password reset using the token from the email link.

**Request body:**
```json
{
  "email": "student@example.com",
  "token": "abc123resettoken",
  "password": "NewSecurePassword123!",
  "password_confirmation": "NewSecurePassword123!"
}
```

**Success — 200 OK:**
```json
{
  "message": "Password has been reset successfully."
}
```

**Errors:**
- `422` — Invalid/expired token, or validation failure

---

## GET /auth/email/verify/{id}/{hash}

Verify a user's email address using the signed link from the verification email.

**URL parameters:** `id` (user ID), `hash` (SHA1 of email)  
**Note:** URL must be signed (contains `signature` query param from Laravel)

**Success — 200 OK:**
```json
{
  "message": "Email verified successfully."
}
```

**Errors:**
- `403` — Invalid or expired signature
- `404` — User not found

---

## POST /auth/phone/otp/send

Send a 6-digit OTP to a phone number (SMS is stubbed in development — OTP logged to `storage/logs/laravel.log`).

**Headers:** `Authorization: Bearer {token}`  
**Rate limit:** 1/5 minutes per phone number

**Request body:**
```json
{
  "phone": "+2348012345678"
}
```

**Success — 200 OK:**
```json
{
  "message": "OTP sent successfully."
}
```

**Errors:**
- `401` — Unauthenticated
- `422` — Invalid phone format (must be E.164)
- `429` — Rate limit exceeded

---

## POST /auth/phone/otp/verify

Verify the OTP and mark the phone number as verified on the user.

**Headers:** `Authorization: Bearer {token}`  
**Rate limit:** 10/minute per IP

**Request body:**
```json
{
  "phone": "+2348012345678",
  "code": "123456"
}
```

**Success — 200 OK:**
```json
{
  "data": {
    "id": 1,
    "phone": "+2348012345678",
    "phone_verified_at": "2026-04-23T14:10:00.000000Z"
  }
}
```

**Errors:**
- `401` — Unauthenticated
- `422` — Invalid or expired OTP code
- `429` — Rate limit exceeded

---

## GET /auth/me

Return the authenticated user and their profile.

**Headers:** `Authorization: Bearer {token}`

**Success — 200 OK:**
```json
{
  "data": {
    "id": 1,
    "email": "student@example.com",
    "phone": "+2348012345678",
    "display_name": "Chidi Okeke",
    "first_name": "Chidi",
    "last_name": "Okeke",
    "avatar_url": null,
    "timezone": "Africa/Lagos",
    "locale": "en_NG",
    "user_type": "student",
    "email_verified_at": "2026-04-23T14:00:00.000000Z",
    "phone_verified_at": "2026-04-23T14:10:00.000000Z",
    "last_login_at": "2026-04-23T14:05:00.000000Z",
    "student_profile": {
      "target_exam_date": null,
      "target_score": null,
      "daily_goal_minutes": null,
      "school": null,
      "grade_level": null,
      "onboarding_completed_at": null
    },
    "created_at": "2026-04-23T14:00:00.000000Z",
    "updated_at": "2026-04-23T14:10:00.000000Z"
  }
}
```

**Errors:**
- `401` — Unauthenticated

---

## Error Response Format

All errors follow this shape:

```json
{
  "message": "The given data was invalid.",
  "errors": {
    "email": ["The email has already been taken."]
  }
}
```

For non-validation errors:
```json
{
  "message": "Unauthenticated."
}
```

## HTTP Status Codes Used

| Code | Meaning |
|------|---------|
| 200  | OK |
| 201  | Created (register) |
| 401  | Unauthenticated |
| 403  | Forbidden / invalid signature |
| 404  | Not found |
| 422  | Validation error / business rule violation |
| 429  | Rate limit exceeded |
| 500  | Server error |
