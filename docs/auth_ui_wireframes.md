# Auth UI Wireframes

ASCII wireframes for the Next.js 16 auth flows: **Login**, **Signup**, **Password Reset**.
No code — layout reference only. Each screen lists fields, buttons, error states, and nav links.

Legend:
- `[ ... ]` input field
- `( ... )` button
- `[x]` checkbox
- `<- link ->` navigation link
- `!! ... !!` inline error / banner

---

## 1. Login

### 1a. Default state

```
+--------------------------------------------------------------+
|  MyApp                                          <- Help ->   |
+--------------------------------------------------------------+
|                                                              |
|                       Sign in to MyApp                       |
|                                                              |
|     Email                                                    |
|     [ you@example.com                                  ]     |
|                                                              |
|     Password                              <- Forgot? ->      |
|     [ ************                                     ]     |
|                                                              |
|     [x] Remember me on this device                           |
|                                                              |
|                  (         Sign in         )                 |
|                                                              |
|     ------------------- or -------------------               |
|                                                              |
|                  ( Continue with Google  )                   |
|                                                              |
|              New here?  <- Create an account ->              |
|                                                              |
+--------------------------------------------------------------+
|  (c) MyApp     <- Terms ->   <- Privacy ->                   |
+--------------------------------------------------------------+
```

### 1b. Field-level error (invalid email)

```
     Email
     [ you@example                                        ]
     !! Enter a valid email address. !!

     Password                              <- Forgot? ->
     [ ************                                       ]
```

### 1c. Form-level error (wrong credentials)

```
     +--------------------------------------------------+
     | !! Email or password is incorrect. Try again. !! |
     +--------------------------------------------------+

     Email
     [ you@example.com                                  ]

     Password                              <- Forgot? ->
     [                                                  ]
```

### 1d. Loading / submitting

```
                  ( Signing in...  ⏳ )       <- disabled
```

### 1e. Rate-limited / locked

```
     +-----------------------------------------------------+
     | !! Too many attempts. Try again in 5 min, or       |
     |    <- reset your password -> .                      !!|
     +-----------------------------------------------------+
```

---

## 2. Signup

### 2a. Default state

```
+--------------------------------------------------------------+
|  MyApp                                          <- Help ->   |
+--------------------------------------------------------------+
|                                                              |
|                      Create your account                     |
|                                                              |
|     Full name                                                |
|     [ Ada Lovelace                                     ]     |
|                                                              |
|     Email                                                    |
|     [ you@example.com                                  ]     |
|                                                              |
|     Password                                                 |
|     [ ************                                     ]     |
|     Strength:  [####------]  Fair                            |
|     - Min 8 chars   - 1 number   - 1 symbol                  |
|                                                              |
|     Confirm password                                         |
|     [ ************                                     ]     |
|                                                              |
|     [x] I agree to the <- Terms -> and <- Privacy ->         |
|                                                              |
|                  (      Create account     )                 |
|                                                              |
|     ------------------- or -------------------               |
|                                                              |
|                  ( Continue with Google  )                   |
|                                                              |
|         Already have an account?  <- Sign in ->              |
|                                                              |
+--------------------------------------------------------------+
```

### 2b. Field-level errors

```
     Email
     [ ada@example.com                                   ]
     !! This email is already registered.
        <- Sign in instead -> !!

     Password
     [ abc                                               ]
     Strength:  [#---------]  Too weak
     !! Password must be at least 8 characters. !!

     Confirm password
     [ abcd                                              ]
     !! Passwords do not match. !!

     [ ] I agree to the <- Terms -> and <- Privacy ->
     !! You must accept the terms to continue. !!
```

### 2c. Submission success → check email

```
+--------------------------------------------------------------+
|                                                              |
|                          ✓ Almost there                      |
|                                                              |
|     We sent a verification link to                           |
|     **you@example.com**.                                     |
|                                                              |
|     Click the link to activate your account. The link        |
|     expires in 24 hours.                                     |
|                                                              |
|             ( Resend email )    <- Use another address ->    |
|                                                              |
|                       <- Back to sign in ->                  |
|                                                              |
+--------------------------------------------------------------+
```

---

## 3. Password Reset

Three sub-screens: **Request → Sent → Set new password**.

### 3a. Request reset

```
+--------------------------------------------------------------+
|  MyApp                                          <- Help ->   |
+--------------------------------------------------------------+
|                                                              |
|                      Reset your password                     |
|                                                              |
|   Enter the email associated with your account and we'll     |
|   send you a link to reset your password.                    |
|                                                              |
|     Email                                                    |
|     [ you@example.com                                  ]     |
|                                                              |
|                  (    Send reset link     )                  |
|                                                              |
|     <- Back to sign in ->     <- Create an account ->        |
|                                                              |
+--------------------------------------------------------------+
```

Errors:

```
     Email
     [ not-an-email                                      ]
     !! Enter a valid email address. !!

     +-------------------------------------------------+
     | !! Too many requests. Try again in 10 minutes. !|
     +-------------------------------------------------+
```

### 3b. Reset link sent (always-on confirmation, no email enumeration)

```
+--------------------------------------------------------------+
|                                                              |
|                       ✓ Check your inbox                     |
|                                                              |
|   If an account exists for **you@example.com**, we've sent   |
|   a password reset link. It expires in 30 minutes.           |
|                                                              |
|     Didn't get it?                                           |
|        - Check spam / junk                                   |
|        - ( Resend link )                                     |
|        - <- Try a different email ->                         |
|                                                              |
|                       <- Back to sign in ->                  |
|                                                              |
+--------------------------------------------------------------+
```

### 3c. Set new password (deep-linked from email token)

```
+--------------------------------------------------------------+
|                                                              |
|                       Choose a new password                  |
|                                                              |
|   Resetting password for **you@example.com**.                |
|                                                              |
|     New password                                             |
|     [ ************                                     ]     |
|     Strength:  [#######---]  Strong                          |
|     - Min 8 chars   - 1 number   - 1 symbol                  |
|                                                              |
|     Confirm new password                                     |
|     [ ************                                     ]     |
|                                                              |
|                  (    Update password     )                  |
|                                                              |
|                       <- Back to sign in ->                  |
|                                                              |
+--------------------------------------------------------------+
```

Errors:

```
     +--------------------------------------------------+
     | !! This reset link is invalid or has expired.    |
     |    <- Request a new link -> .                   !!|
     +--------------------------------------------------+

     Confirm new password
     [ ************                                     ]
     !! Passwords do not match. !!
```

Success:

```
+--------------------------------------------------------------+
|                                                              |
|                     ✓ Password updated                       |
|                                                              |
|   Your password has been reset. You can now sign in with     |
|   your new password.                                         |
|                                                              |
|                  (   Continue to sign in   )                 |
|                                                              |
+--------------------------------------------------------------+
```

---

## Navigation map

```
  Login  <----------------->  Signup
    |  \                       /
    |   \                     /
    |    v                   v
    |   Forgot? --> Reset Request --> "Check inbox"
    |                                      |
    |                                      v
    |                              Set new password
    |                                      |
    +<------- Back to sign in -------------+
```

## Shared elements (apply to all three flows)

- Top bar: app logo (links home), `Help` link.
- Footer: copyright, `Terms`, `Privacy`.
- Inline errors live directly under the offending field.
- Banner errors live at the top of the form card.
- Primary button is full-width; spinner + disabled state during submit.
- All forms are keyboard-navigable; Enter submits the focused form.
