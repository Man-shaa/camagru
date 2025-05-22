# Camagru

Camagru is a full-stack web application that allows users to capture or upload photos, apply overlay images (such as stickers or frames), and share them publicly. Users can comment on and like shared images. The project emphasizes user authentication, image processing, and secure web practices, and serves as an introduction to real-world web development.

## 🧠 Project Goal

The primary objective of Camagru is to develop a complete web application from scratch, focusing on:

- Frontend and backend integration
- Image processing and compositing
- User authentication and security
- Database interaction and session management
- Containerized deployment with `docker-compose`

---

## 🚀 Features

### ✅ Mandatory Features

#### 1. Common
- Structured layout (header, main, footer)
- Responsive design for mobile compatibility
- Form validation and secure input handling
- Secure architecture to avoid:
  - XSS
  - SQL injection
  - Plaintext password storage
  - Unauthorized content manipulation

#### 2. User Management
- Sign up with email, username, and secure password
- Email confirmation for account activation
- Secure login and logout
- Password reset via email
- Profile management: update email, username, and password
- .env configuration for credentials (ignored in Git)

#### 3. Gallery
- Public gallery of all user-edited images
- Pagination (min 5 images per page)
- Authenticated users can:
  - Like images
  - Comment on images
- Email notifications on new comments (enabled by default, can be disabled)

#### 4. Editing
- Authenticated access only
- Live webcam preview or image upload
- Select overlay image (with alpha channel)
- Server-side image composition
- Thumbnail preview of user’s previous captures
- User can delete **only** their own images

---

## 🧪 Bonus Ideas (Optional)

> Bonuses will only be evaluated if the mandatory part is 100% complete and functional.

- AJAX-powered interactions (e.g. image likes, comments, deletion)
- Live preview of overlays directly on webcam stream
- Infinite scroll/pagination for gallery
- Social media sharing
- Animated GIF rendering

---

## 🛠️ Technologies & Tools

### Languages
- **Frontend:** HTML5, CSS3, JavaScript (Vanilla, no JS frameworks)
- **Backend:** PHP (Standard Library only)
- **Database:** MySQL (or MariaDB)
- **Image Processing:** GD or Imagick (PHP libraries)

### Tools
- Docker / Docker Compose
- Apache or Nginx (or PHP built-in webserver)
- Mail server or external SMTP for notifications
- Git

### Framework Restrictions
- ✅ CSS frameworks allowed (as long as they don’t include forbidden JS)
- ❌ JS frameworks (React, Vue, jQuery, etc.) not allowed
- ❌ External server-side libraries without a native PHP equivalent

---

## 🧷 Security Considerations

- Passwords must be hashed (e.g. with `password_hash`)
- CSRF protection for form submissions
- Proper input sanitization and validation
- Server-side restrictions for image ownership and actions
- No client-stored or hardcoded credentials
- All credentials and sensitive data should be placed in a `.env` file (excluded from Git)

---

## 🧪 Deployment

The project must support deployment using containers. A `docker-compose.yml` file is required for setting up:

- Web server (Apache/Nginx)
- PHP backend
- Database service

With a single command, the full environment should be launchable.

```bash
docker-compose up --build
