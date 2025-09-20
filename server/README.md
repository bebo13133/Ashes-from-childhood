# Ashes from Childhood - Backend API

A Node.js/Express.js backend API for managing book orders, reviews, and admin functionality for the "Пепел от детството" (Ashes from Childhood) book website.

## 🚀 Features

-   **Authentication System**: Admin login/logout with session management
-   **Order Management**: Create, view, update, and delete book orders
-   **Review System**: Submit, approve, and manage customer reviews
-   **Book Management**: Get and update book pricing
-   **Email System**: Send emails using templates and notifications
-   **Analytics & Reports**: Generate various reports (overview, sales, traffic, reviews)
-   **Notification System**: Real-time notifications for admin actions
-   **Google Analytics Integration**: Track website visitors and traffic

## 📋 Tech Stack

-   **Runtime**: Node.js
-   **Framework**: Express.js
-   **Database**: PostgreSQL with Sequelize ORM
-   **Authentication**: Session-based with bcrypt password hashing
-   **Email**: Zoho Mail integration
-   **Analytics**: Google Analytics 4 API
-   **Security**: Rate limiting, CORS, secure cookies

## 📋 Prerequisites

-   Node.js (v14 or higher)
-   PostgreSQL database
-   Zoho Mail account (for email functionality)
-   Google Analytics 4 property (for analytics)

## 🔧 Installation

1. **Clone the repository**

    ```bash
    git clone <repository-url>
    cd server
    ```

2. **Install dependencies**

    ```bash
    npm install
    ```

3. **Environment Setup**
   Create `.env.development` and `.env.production` files

4. **Database Setup**

    ```bash
    # Run migrations
    npx sequelize-cli db:migrate

    # Seed initial data
    npx sequelize-cli db:seed:all
    ```

5. **Start the server**

    ```bash
    # Development
    npm run start:dev

    # Production
    npm start
    ```

## 📚 API Endpoints

### 🔐 Authentication (`/auth`)

| Method | Endpoint                | Description               | Auth Required |
| ------ | ----------------------- | ------------------------- | ------------- |
| POST   | `/auth/login`           | Admin login               | No            |
| POST   | `/auth/logout`          | Admin logout              | No            |
| POST   | `/auth/forgot-password` | Request password reset    | No            |
| POST   | `/auth/reset-password`  | Reset password with token | No            |
| PUT    | `/auth/change-password` | Change current password   | Yes           |

**Login Request:**

```json
{
    "email": "admin@example.com",
    "password": "password123"
}
```

**Response:**

```json
{
    "message": "Login successful."
}
```

### �� Orders (`/orders`)

| Method | Endpoint                    | Description                   | Auth Required |
| ------ | --------------------------- | ----------------------------- | ------------- |
| POST   | `/orders/create`            | Create new order              | No            |
| GET    | `/orders/all`               | Get all orders (with filters) | Yes           |
| GET    | `/orders/single/:id`        | Get single order              | Yes           |
| PUT    | `/orders/update-status/:id` | Update order status           | Yes           |
| DELETE | `/orders/single/:id`        | Delete order                  | Yes           |

**Create Order Request:**

```json
{
    "firstName": "Иван",
    "lastName": "Петров",
    "email": "ivan@example.com",
    "phone": "+359888123456",
    "address": "ул. Витоша 15",
    "city": "София",
    "quantity": 2,
    "bookTitle": "Пепел от детството",
    "paymentMethod": "cash_on_delivery"
}
```

**Order Status Values:**

-   `pending` - Order received, awaiting processing
-   `completed` - Order fulfilled and delivered
-   `cancelled` - Order cancelled

### 📖 Books (`/books`)

| Method | Endpoint            | Description            | Auth Required |
| ------ | ------------------- | ---------------------- | ------------- |
| GET    | `/books/book-price` | Get current book price | No            |
| PUT    | `/books/book-price` | Update book price      | Yes           |

**Update Price Request:**

```json
{
    "price": 25.0
}
```

### ⭐ Reviews (`/reviews`)

| Method | Endpoint                     | Description                   | Auth Required |
| ------ | ---------------------------- | ----------------------------- | ------------- |
| POST   | `/reviews/create`            | Submit new review             | No            |
| GET    | `/reviews/all`               | Get all reviews (admin)       | No            |
| GET    | `/reviews/approved`          | Get approved reviews (public) | No            |
| PUT    | `/reviews/update-status/:id` | Update review status          | No            |
| PUT    | `/reviews/helpful/:id`       | Mark review as helpful        | No            |
| DELETE | `/reviews/single/:id`        | Delete review                 | No            |

**Submit Review Request:**

```json
{
    "name": "Мария Петрова",
    "isAnonymous": false,
    "rating": 5,
    "comment": "Изключителна книга! Препоръчвам я на всички."
}
```

**Review Status Values:**

-   `pending` - Awaiting admin approval
-   `approved` - Published and visible
-   `rejected` - Rejected by admin

### 📧 Email (`/emails`)

| Method | Endpoint                       | Description               | Auth Required |
| ------ | ------------------------------ | ------------------------- | ------------- |
| POST   | `/emails/send`                 | Send email using template | No            |
| GET    | `/emails/templates`            | Get all email templates   | No            |
| GET    | `/emails/templates/single/:id` | Get single template       | No            |
| POST   | `/emails/templates/create`     | Create new template       | No            |
| PUT    | `/emails/templates/update/:id` | Update template           | No            |
| DELETE | `/emails/templates/single/:id` | Delete template           | No            |

### 🔔 Notifications (`/notifications`)

| Method | Endpoint                       | Description                     | Auth Required |
| ------ | ------------------------------ | ------------------------------- | ------------- |
| GET    | `/notifications/all`           | Get all notifications           | No            |
| PUT    | `/notifications/single/:id`    | Toggle notification read status | No            |
| PUT    | `/notifications/mark-all-read` | Mark all notifications as read  | No            |

### 📊 Dashboard & Reports (`/dashboard`)

| Method | Endpoint                      | Description              | Auth Required |
| ------ | ----------------------------- | ------------------------ | ------------- |
| GET    | `/dashboard/stats`            | Get dashboard statistics | Yes           |
| GET    | `/dashboard/visitors`         | Get visitor statistics   | Yes           |
| GET    | `/dashboard/reviews`          | Get review statistics    | Yes           |
| GET    | `/dashboard/reports/overview` | Generate overview report | Yes           |
| GET    | `/dashboard/reports/sales`    | Generate sales report    | Yes           |
| GET    | `/dashboard/reports/traffic`  | Generate traffic report  | Yes           |
| GET    | `/dashboard/reports/reviews`  | Generate reviews report  | Yes           |

**Report Query Parameters:**

-   `period` - Time period: `7d`, `30d`, `90d`, `1y` (default: `30d`)

## 📚 Data Models

### User

```javascript
{
  id: Integer (Primary Key)
  email: String (Unique)
  password: String (Hashed)
  sessionTokens: JSON Array
  resetToken: String (Nullable)
  tokenExpiration: Date (Nullable)
  createdAt: Date
  updatedAt: Date
}
```

### Order

```javascript
{
  id: Integer (Primary Key)
  bookId: Integer (Foreign Key)
  orderNumber: String (Auto-generated)
  customerName: String
  email: String
  phone: String
  address: Text
  city: String
  quantity: Integer
  bookTitle: String
  paymentMethod: String
  orderDate: Date
  priceAtOrder: Decimal(10,2)
  status: Enum('pending', 'completed', 'cancelled')
  completedAt: Date (Nullable)
  createdAt: Date
  updatedAt: Date
}
```

### Review

```javascript
{
  id: Integer (Primary Key)
  name: String (Nullable)
  isAnonymous: Boolean
  rating: Integer (1-5, Nullable)
  comment: Text (Nullable)
  helpful: Integer (Default: 0)
  status: Enum('pending', 'approved', 'rejected')
  createdAt: Date
  updatedAt: Date
}
```

### Book

```javascript
{
  id: Integer (Primary Key)
  title: String
  price: Decimal(10,2)
  isActive: Boolean
  createdAt: Date
  updatedAt: Date
}
```

### Notification

```javascript
{
  id: Integer (Primary Key)
  type: String
  message: String
  read: Boolean (Default: false)
  related_id: Integer (Nullable)
  created_at: Date
  updated_at: Date
}
```

### EmailTemplate

```javascript
{
  id: Integer (Primary Key)
  name: String
  subject: String
  content: Text
  createdAt: Date
  updatedAt: Date
}
```

## 🔒 Authentication & Security

### Session Management

-   Uses HTTP-only cookies for session tokens
-   Session tokens expire after 7 days
-   Automatic cleanup of expired tokens
-   All sessions cleared on password change

### Password Security

-   Passwords hashed with bcrypt (salt rounds: 10)
-   Password reset tokens expire after 15 minutes
-   Secure cookie settings (httpOnly, secure, sameSite)

### Rate Limiting

-   Applied to all endpoints to prevent abuse
-   Configurable limits per endpoint type

## 📈 Analytics Integration

### Google Analytics 4

-   Real-time visitor tracking
-   Historical visitor data
-   Page view analytics
-   Traffic source analysis

### Available Metrics

-   Total visitors
-   Unique visitors
-   Page views
-   Sessions
-   Bounce rate
-   Average session duration

## 🚨 Error Handling

All endpoints return consistent error responses:

```json
{
    "success": false,
    "message": "Error description",
    "error": "Detailed error information"
}
```

**Common HTTP Status Codes:**

-   `200` - Success
-   `201` - Created
-   `400` - Bad Request
-   `401` - Unauthorized
-   `403` - Forbidden
-   `404` - Not Found
-   `409` - Conflict
-   `500` - Internal Server Error

## 🧪 Development

### Scripts

```bash
npm run start:dev    # Start development server with nodemon
npm start           # Start production server
npm test            # Run tests (not implemented yet)
```

### Database Commands

```bash
# Create migration
npx sequelize-cli migration:generate --name migration-name

# Run migrations
npx sequelize-cli db:migrate

# Rollback migration
npx sequelize-cli db:migrate:undo

# Create seeder
npx sequelize-cli seed:generate --name seeder-name

# Run seeders
npx sequelize-cli db:seed:all

# Undo last seeder
npx sequelize-cli db:seed:undo
```

## 📋 Environment Variables

| Variable              | Description                  | Required | Default       |
| --------------------- | ---------------------------- | -------- | ------------- |
| `NODE_ENV`            | Environment mode             | Yes      | `development` |
| `PORT`                | Server port                  | Yes      | `8080`        |
| `DB_HOST`             | Database host                | Yes      | -             |
| `DB_PORT`             | Database port                | Yes      | `5432`        |
| `DB_NAME`             | Database name                | Yes      | -             |
| `DB_USER`             | Database username            | Yes      | -             |
| `DB_PASSWORD`         | Database password            | Yes      | -             |
| `ZOHO_EMAIL`          | Zoho email address           | Yes      | -             |
| `ZOHO_PASSWORD`       | Zoho app password            | Yes      | -             |
| `ADMIN_EMAIL`         | Admin notification email     | Yes      | -             |
| `GA_PROPERTY_ID`      | Google Analytics property ID | No       | -             |
| `GA_CREDENTIALS_PATH` | Path to GA credentials JSON  | No       | -             |

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the ISC License.

## 🆘 Support

For support and questions, please contact the development team or create an issue in the repository.

---

**Note**: This API is specifically designed for the "Пепел от детството" book website and includes Bulgarian language support throughout the system.
