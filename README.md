# Event Management API

A REST API for managing events and user registrations built with Node.js, Express, and Prisma with PostgreSQL.

## Features

- Create, read, and manage events
- User registration and management
- Event registration system with capacity limits
- View upcoming events
- Event statistics and analytics
- Input validation and error handling

## Tech Stack

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **Prisma** - Database ORM
- **PostgreSQL** - Database
- **dotenv** - Environment variable management

## Project Structure

```
even-management-api/
├── prisma/
│   ├── schema.prisma          # Database schema
│   ├── prisma_connection.js   # Database connection
│   └── migrations/            # Database migrations
├── routes/
│   ├── events.js             # Event-related routes
│   └── users.js              # User-related routes
├── generated/                # Prisma generated client
├── app.js                    # Main application file
├── package.json              # Dependencies and scripts
├── .env                      # Environment variables
└── README.md                 # This file
```

## Setup Instructions

### Prerequisites

- Node.js (v18 or higher)
- PostgreSQL database
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Ubed-pathan/event_management_api
   cd even-management-api
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   
   Create a `.env` file in the root directory:
   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/eventdb?schema=public"
   PORT=5000
   NODE_ENV=development
   ```

4. **Database Setup**
   
   Generate Prisma client:
   ```bash
   npm run generate
   ```
   
   Run database migrations:
   ```bash
   npm run migrate
   ```

5. **Start the server**
   ```bash
   # Development mode (with auto-restart)
   npm run dev
   
   # Production mode
   npm start
   ```

The server will be running at `http://localhost:5000`

## API Documentation

### Base URL
```
http://localhost:5000
```

### Endpoints

#### Health Check
- **GET** `/`
  - Description: Check if the API is running
  - Response: `🎉 Event Management API is running`

---

### Users API

#### Create User
- **POST** `/users`
- **Description**: Create a new user
- **Request Body**:
  ```json
  {
    "name": "John Doe",
    "email": "john.doe@example.com"
  }
  ```
- **Response**:
  ```json
  {
    "user": {
      "id": 1,
      "name": "John Doe",
      "email": "john.doe@example.com",
    }
  }
  ```

  ![user create image](./sample-images/i03.png)

---

### Events API

#### Create Event
- **POST** `/events`
- **Description**: Create a new event
- **Request Body**:
  ```json
  {
    "title": "Tech Conference 2025",
    "dateTime": "2025-08-15T09:00:00.000Z",
    "location": "Convention Center",
    "capacity": 100
  }
  ```
- **Response**:
  ```json
  {
    "eventId": 1
  }
  ```

  ![user create image](./sample-images/i01.png)

#### Get Event Details
- **GET** `/events/{id}`
- **Description**: Get details of a specific event including registered users
- **Response**:
  ```json
  {
    "id": 1,
    "title": "Tech Conference 2025",
    "dateTime": "2025-08-15T09:00:00.000Z",
    "location": "Convention Center",
    "capacity": 100,
    "registrations": [...],
    "registeredUsers": [
      {
        "id": 1,
        "name": "John Doe",
        "email": "john.doe@example.com"
      }
    ]
  }
  ```

  ![user create image](./sample-images/i02.png)

#### Get Upcoming Events
- **GET** `/events/upcoming`
- **Description**: Get all upcoming events (events with future dates)
- **Response**:
  ```json
  {
    "upcomingEvents": [
      {
        "id": 1,
        "title": "Tech Conference 2025",
        "dateTime": "2025-08-15T09:00:00.000Z",
        "location": "Convention Center",
        "capacity": 100,
      }
    ]
  }
  ```

  ![user create image](./sample-images/i06.png)

#### Register for Event
- **POST** `/events/{id}/register`
- **Description**: Register a user for an event
- **Request Body**:
  ```json
  {
    "userId": 1
  }
  ```
- **Response**:
  ```json
  {
    "message": "User registered successfully"
  }
  ```

  ![user create image](./sample-images/i04.png)

#### Cancel Registration
- **DELETE** `/events/{id}/register/{userId}`
- **Description**: Cancel a user's registration for an event
- **Response**:
  ```json
  {
    "message": "Registration cancelled successfully"
  }
  ```

  ![user create image](./sample-images/i05.png)

#### Get Event Statistics
- **GET** `/events/{id}/stats`
- **Description**: Get registration statistics for an event
- **Response**:
  ```json
  {
    "eventId": 1,
    "title": "Tech Conference 2025",
    "totalRegistrations": 0,
    "remainingCapacity": 100,
    "percentageUsed": "0.00%"
  }
  ```
  ![user create image](./sample-images/i07.png)

## Error Responses

The API returns appropriate HTTP status codes and error messages:

### Common Error Responses

- **400 Bad Request**
  ```json
  {
    "message": "Invalid event input"
  }
  ```

- **404 Not Found**
  ```json
  {
    "message": "Event not found"
  }
  ```

- **409 Conflict**
  ```json
  {
    "message": "Email already exists"
  }
  ```

- **500 Internal Server Error**
  ```json
  {
    "message": "Something went wrong"
  }
  ```

## Business Logic

### Event Registration Rules
- Users cannot register for past events
- Users cannot register twice for the same event
- Registration is blocked when event reaches capacity
- Capacity must be between 1 and 1000

### Validation Rules
- All required fields must be provided
- Email addresses must be unique
- Event capacity must be a positive number ≤ 1000
- DateTime must be in valid ISO format

## Database Schema

### User Table
```sql
model User {
  id            Int            @id @default(autoincrement())
  name          String
  email         String         @unique
  registrations Registration[]
  createdAt     DateTime       @default(now())
  updatedAt     DateTime       @updatedAt
}
```

### Event Table
```sql
model Event {
  id            Int            @id @default(autoincrement())
  title         String
  dateTime      DateTime
  location      String
  capacity      Int
  registrations Registration[]
  createdAt     DateTime       @default(now())
  updatedAt     DateTime       @updatedAt
}
```

### Registration Table
```sql
model Registration {
  id      Int   @id @default(autoincrement())
  userId  Int
  eventId Int
  user    User  @relation(fields: [userId], references: [id])
  event   Event @relation(fields: [eventId], references: [id])

  @@unique([userId, eventId])
}
```

## Available Scripts

```bash
# Start development server with auto-restart
npm run dev

# Start production server
npm start

# Generate Prisma client
npm run generate

# Run database migrations
npm run migrate

# Open Prisma Studio (database GUI)
npm run studio
```

## Example Usage Flow

1. **Create a user**:
   ```bash
   curl -X POST http://localhost:5000/users \
     -H "Content-Type: application/json" \
     -d '{"name":"John Doe","email":"john@example.com"}'
   ```

2. **Create an event**:
   ```bash
   curl -X POST http://localhost:5000/events \
     -H "Content-Type: application/json" \
     -d '{"title":"Tech Meetup","dateTime":"2025-08-20T18:00:00.000Z","location":"Tech Hub","capacity":50}'
   ```

3. **Register user for event**:
   ```bash
   curl -X POST http://localhost:5000/events/1/register \
     -H "Content-Type: application/json" \
     -d '{"userId":1}'
   ```

4. **Get upcoming events**:
   ```bash
   curl http://localhost:5000/events/upcoming
   ```

5. **Get event statistics**:
   ```bash
   curl http://localhost:5000/events/1/stats
   ```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

