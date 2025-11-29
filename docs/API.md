# My Expense API Documentation

A RESTful API for personal expense tracking with multi-currency support.

## Base URL

```
http://localhost:3000/api
```

## Table of Contents

- [Authentication](#authentication)
- [Response Format](#response-format)
- [Error Handling](#error-handling)
- [Endpoints](#endpoints)
  - [Auth](#auth)
  - [Categories](#categories)
  - [Currencies](#currencies)
  - [Expenses](#expenses)

---

## Authentication

The API uses JWT (JSON Web Token) for authentication. Include the token in the `Authorization` header for protected endpoints:

```
Authorization: Bearer <your_jwt_token>
```

Tokens are valid for 7 days by default.

---

## Response Format

All API responses follow a consistent format:

### Success Response

```json
{
  "success": true,
  "message": "Operation successful",
  "data": {
    // Response data here
  }
}
```

### Error Response

```json
{
  "success": false,
  "message": "Error description",
  "errors": [
    {
      "field": "fieldName",
      "message": "Validation error message"
    }
  ]
}
```

---

## Error Handling

| Status Code | Description                             |
| ----------- | --------------------------------------- |
| 200         | Success                                 |
| 201         | Created                                 |
| 400         | Bad Request - Validation errors         |
| 401         | Unauthorized - Missing or invalid token |
| 404         | Not Found - Resource doesn't exist      |
| 409         | Conflict - Resource already exists      |
| 500         | Internal Server Error                   |

---

## Endpoints

### Auth

#### Sign Up

Create a new user account.

**Endpoint:** `POST /auth/signup`

**Authentication:** Not required

**Request Body:**

| Field    | Type   | Required | Description                            |
| -------- | ------ | -------- | -------------------------------------- |
| email    | string | Yes      | Valid email address                    |
| password | string | Yes      | 6-100 characters                       |
| name     | string | No       | User's display name (1-100 characters) |

**Example Request:**

```bash
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "securePassword123",
    "name": "John Doe"
  }'
```

**Example Response (201 Created):**

```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": 1,
      "email": "john@example.com",
      "name": "John Doe",
      "createdAt": "2025-11-29T10:00:00.000Z",
      "updatedAt": "2025-11-29T10:00:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Error Response (409 Conflict):**

```json
{
  "success": false,
  "message": "User with this email already exists"
}
```

---

#### Sign In

Authenticate an existing user.

**Endpoint:** `POST /auth/signin`

**Authentication:** Not required

**Request Body:**

| Field    | Type   | Required | Description              |
| -------- | ------ | -------- | ------------------------ |
| email    | string | Yes      | Registered email address |
| password | string | Yes      | User's password          |

**Example Request:**

```bash
curl -X POST http://localhost:3000/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "securePassword123"
  }'
```

**Example Response (200 OK):**

```json
{
  "success": true,
  "message": "Signed in successfully",
  "data": {
    "user": {
      "id": 1,
      "email": "john@example.com",
      "name": "John Doe",
      "createdAt": "2025-11-29T10:00:00.000Z",
      "updatedAt": "2025-11-29T10:00:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Error Response (401 Unauthorized):**

```json
{
  "success": false,
  "message": "Invalid email or password"
}
```

---

#### Get Profile

Get the authenticated user's profile.

**Endpoint:** `GET /auth/profile`

**Authentication:** Required

**Example Request:**

```bash
curl -X GET http://localhost:3000/api/auth/profile \
  -H "Authorization: Bearer <your_token>"
```

**Example Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "email": "john@example.com",
      "name": "John Doe",
      "createdAt": "2025-11-29T10:00:00.000Z",
      "updatedAt": "2025-11-29T10:00:00.000Z"
    }
  }
}
```

---

### Categories

All category endpoints require authentication.

#### Create Category

**Endpoint:** `POST /categories`

**Request Body:**

| Field       | Type   | Required | Description                      |
| ----------- | ------ | -------- | -------------------------------- |
| name        | string | Yes      | Category name (1-100 characters) |
| description | string | No       | Description (max 500 characters) |
| color       | string | No       | Hex color code (e.g., #FF5733)   |

**Example Request:**

```bash
curl -X POST http://localhost:3000/api/categories \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your_token>" \
  -d '{
    "name": "Food & Dining",
    "description": "Restaurants, groceries, and food delivery",
    "color": "#FF5733"
  }'
```

**Example Response (201 Created):**

```json
{
  "success": true,
  "message": "Category created successfully",
  "data": {
    "category": {
      "id": 1,
      "name": "Food & Dining",
      "description": "Restaurants, groceries, and food delivery",
      "color": "#FF5733",
      "userId": 1,
      "createdAt": "2025-11-29T10:00:00.000Z",
      "updatedAt": "2025-11-29T10:00:00.000Z"
    }
  }
}
```

---

#### Get All Categories

**Endpoint:** `GET /categories`

**Example Request:**

```bash
curl -X GET http://localhost:3000/api/categories \
  -H "Authorization: Bearer <your_token>"
```

**Example Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "categories": [
      {
        "id": 1,
        "name": "Food & Dining",
        "description": "Restaurants, groceries, and food delivery",
        "color": "#FF5733",
        "userId": 1,
        "createdAt": "2025-11-29T10:00:00.000Z",
        "updatedAt": "2025-11-29T10:00:00.000Z",
        "_count": {
          "expenses": 5
        }
      },
      {
        "id": 2,
        "name": "Transportation",
        "description": "Gas, public transit, ride shares",
        "color": "#3498DB",
        "userId": 1,
        "createdAt": "2025-11-29T10:00:00.000Z",
        "updatedAt": "2025-11-29T10:00:00.000Z",
        "_count": {
          "expenses": 3
        }
      }
    ]
  }
}
```

---

#### Get Category by ID

**Endpoint:** `GET /categories/:id`

**Example Request:**

```bash
curl -X GET http://localhost:3000/api/categories/1 \
  -H "Authorization: Bearer <your_token>"
```

**Example Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "category": {
      "id": 1,
      "name": "Food & Dining",
      "description": "Restaurants, groceries, and food delivery",
      "color": "#FF5733",
      "userId": 1,
      "createdAt": "2025-11-29T10:00:00.000Z",
      "updatedAt": "2025-11-29T10:00:00.000Z",
      "_count": {
        "expenses": 5
      }
    }
  }
}
```

---

#### Update Category

**Endpoint:** `PUT /categories/:id`

**Request Body (all fields optional):**

| Field       | Type           | Description        |
| ----------- | -------------- | ------------------ |
| name        | string         | New category name  |
| description | string or null | New description    |
| color       | string or null | New hex color code |

**Example Request:**

```bash
curl -X PUT http://localhost:3000/api/categories/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your_token>" \
  -d '{
    "name": "Food",
    "color": "#E74C3C"
  }'
```

**Example Response (200 OK):**

```json
{
  "success": true,
  "message": "Category updated successfully",
  "data": {
    "category": {
      "id": 1,
      "name": "Food",
      "description": "Restaurants, groceries, and food delivery",
      "color": "#E74C3C",
      "userId": 1,
      "createdAt": "2025-11-29T10:00:00.000Z",
      "updatedAt": "2025-11-29T10:30:00.000Z"
    }
  }
}
```

---

#### Delete Category

**Endpoint:** `DELETE /categories/:id`

⚠️ **Warning:** Deleting a category will also delete all associated expenses.

**Example Request:**

```bash
curl -X DELETE http://localhost:3000/api/categories/1 \
  -H "Authorization: Bearer <your_token>"
```

**Example Response (200 OK):**

```json
{
  "success": true,
  "message": "Category deleted successfully"
}
```

---

### Currencies

All currency endpoints require authentication.

#### Create Currency

**Endpoint:** `POST /currencies`

**Request Body:**

| Field           | Type   | Required | Description                                              |
| --------------- | ------ | -------- | -------------------------------------------------------- |
| name            | string | Yes      | Currency name/code (1-50 characters), e.g., "USD", "EUR" |
| usdExchangeRate | number | Yes      | Exchange rate to USD (positive number)                   |

**Example Request:**

```bash
curl -X POST http://localhost:3000/api/currencies \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your_token>" \
  -d '{
    "name": "USD",
    "usdExchangeRate": 1.0
  }'
```

**Example Response (201 Created):**

```json
{
  "success": true,
  "message": "Currency created successfully",
  "data": {
    "currency": {
      "id": 1,
      "name": "USD",
      "usdExchangeRate": "1.00000000",
      "userId": 1,
      "createdAt": "2025-11-29T10:00:00.000Z",
      "updatedAt": "2025-11-29T10:00:00.000Z"
    }
  }
}
```

**Example (Non-USD Currency):**

```bash
curl -X POST http://localhost:3000/api/currencies \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your_token>" \
  -d '{
    "name": "MMK",
    "usdExchangeRate": 0.00047
  }'
```

---

#### Get All Currencies

**Endpoint:** `GET /currencies`

**Example Request:**

```bash
curl -X GET http://localhost:3000/api/currencies \
  -H "Authorization: Bearer <your_token>"
```

**Example Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "currencies": [
      {
        "id": 1,
        "name": "USD",
        "usdExchangeRate": "1.00000000",
        "userId": 1,
        "createdAt": "2025-11-29T10:00:00.000Z",
        "updatedAt": "2025-11-29T10:00:00.000Z"
      },
      {
        "id": 2,
        "name": "EUR",
        "usdExchangeRate": "1.08500000",
        "userId": 1,
        "createdAt": "2025-11-29T10:00:00.000Z",
        "updatedAt": "2025-11-29T10:00:00.000Z"
      }
    ]
  }
}
```

---

#### Get Currency by ID

**Endpoint:** `GET /currencies/:id`

**Example Request:**

```bash
curl -X GET http://localhost:3000/api/currencies/1 \
  -H "Authorization: Bearer <your_token>"
```

**Example Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "currency": {
      "id": 1,
      "name": "USD",
      "usdExchangeRate": "1.00000000",
      "userId": 1,
      "createdAt": "2025-11-29T10:00:00.000Z",
      "updatedAt": "2025-11-29T10:00:00.000Z"
    }
  }
}
```

---

#### Update Currency

**Endpoint:** `PUT /currencies/:id`

**Request Body (all fields optional):**

| Field           | Type   | Description       |
| --------------- | ------ | ----------------- |
| name            | string | New currency name |
| usdExchangeRate | number | New exchange rate |

**Example Request:**

```bash
curl -X PUT http://localhost:3000/api/currencies/2 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your_token>" \
  -d '{
    "usdExchangeRate": 1.09
  }'
```

**Example Response (200 OK):**

```json
{
  "success": true,
  "message": "Currency updated successfully",
  "data": {
    "currency": {
      "id": 2,
      "name": "EUR",
      "usdExchangeRate": "1.09000000",
      "userId": 1,
      "createdAt": "2025-11-29T10:00:00.000Z",
      "updatedAt": "2025-11-29T10:30:00.000Z"
    }
  }
}
```

---

#### Delete Currency

**Endpoint:** `DELETE /currencies/:id`

⚠️ **Warning:** Deleting a currency will also delete all associated expenses.

**Example Request:**

```bash
curl -X DELETE http://localhost:3000/api/currencies/1 \
  -H "Authorization: Bearer <your_token>"
```

**Example Response (200 OK):**

```json
{
  "success": true,
  "message": "Currency deleted successfully"
}
```

---

### Expenses

All expense endpoints require authentication.

#### Create Expense

**Endpoint:** `POST /expenses`

**Request Body:**

| Field       | Type   | Required | Description                                                  |
| ----------- | ------ | -------- | ------------------------------------------------------------ |
| amount      | number | Yes      | Expense amount (positive, max 99999999.99)                   |
| description | string | No       | Description (max 500 characters)                             |
| date        | string | No       | ISO 8601 date or YYYY-MM-DD format. Defaults to current date |
| categoryId  | number | Yes      | ID of an existing category                                   |
| currencyId  | number | Yes      | ID of an existing currency                                   |

**Example Request:**

```bash
curl -X POST http://localhost:3000/api/expenses \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your_token>" \
  -d '{
    "amount": 25.50,
    "description": "Lunch at restaurant",
    "date": "2025-11-29",
    "categoryId": 1,
    "currencyId": 1
  }'
```

**Example Response (201 Created):**

```json
{
  "success": true,
  "message": "Expense created successfully",
  "data": {
    "expense": {
      "id": 1,
      "amount": "25.50",
      "description": "Lunch at restaurant",
      "date": "2025-11-29T00:00:00.000Z",
      "categoryId": 1,
      "currencyId": 1,
      "userId": 1,
      "createdAt": "2025-11-29T10:00:00.000Z",
      "updatedAt": "2025-11-29T10:00:00.000Z",
      "category": {
        "id": 1,
        "name": "Food & Dining",
        "color": "#FF5733"
      },
      "currency": {
        "id": 1,
        "name": "USD",
        "usdExchangeRate": "1.00000000"
      }
    }
  }
}
```

---

#### Get All Expenses

**Endpoint:** `GET /expenses`

**Query Parameters:**

| Parameter  | Type   | Required | Description                                              |
| ---------- | ------ | -------- | -------------------------------------------------------- |
| categoryId | number | No       | Filter by category ID                                    |
| startDate  | string | No       | Filter expenses from this date (ISO 8601 or YYYY-MM-DD)  |
| endDate    | string | No       | Filter expenses until this date (ISO 8601 or YYYY-MM-DD) |
| page       | number | No       | Page number (default: 1)                                 |
| limit      | number | No       | Results per page (default: 10)                           |

**Example Request:**

```bash
curl -X GET "http://localhost:3000/api/expenses?page=1&limit=10&categoryId=1&startDate=2025-11-01&endDate=2025-11-30" \
  -H "Authorization: Bearer <your_token>"
```

**Example Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "expenses": [
      {
        "id": 1,
        "amount": "25.50",
        "description": "Lunch at restaurant",
        "date": "2025-11-29T00:00:00.000Z",
        "categoryId": 1,
        "currencyId": 1,
        "userId": 1,
        "createdAt": "2025-11-29T10:00:00.000Z",
        "updatedAt": "2025-11-29T10:00:00.000Z",
        "category": {
          "id": 1,
          "name": "Food & Dining",
          "color": "#FF5733"
        },
        "currency": {
          "id": 1,
          "name": "USD",
          "usdExchangeRate": "1.00000000"
        }
      }
    ],
    "totalsByCurrency": [
      {
        "currency": {
          "id": 1,
          "name": "USD",
          "usdExchangeRate": "1.00000000"
        },
        "totalAmount": "150.75"
      },
      {
        "currency": {
          "id": 2,
          "name": "EUR",
          "usdExchangeRate": "1.08500000"
        },
        "totalAmount": "45.00"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 15,
      "totalPages": 2
    }
  }
}
```

---

#### Get Expense by ID

**Endpoint:** `GET /expenses/:id`

**Example Request:**

```bash
curl -X GET http://localhost:3000/api/expenses/1 \
  -H "Authorization: Bearer <your_token>"
```

**Example Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "expense": {
      "id": 1,
      "amount": "25.50",
      "description": "Lunch at restaurant",
      "date": "2025-11-29T00:00:00.000Z",
      "categoryId": 1,
      "currencyId": 1,
      "userId": 1,
      "createdAt": "2025-11-29T10:00:00.000Z",
      "updatedAt": "2025-11-29T10:00:00.000Z",
      "category": {
        "id": 1,
        "name": "Food & Dining",
        "color": "#FF5733"
      },
      "currency": {
        "id": 1,
        "name": "USD",
        "usdExchangeRate": "1.00000000"
      }
    }
  }
}
```

---

#### Update Expense

**Endpoint:** `PUT /expenses/:id`

**Request Body (all fields optional):**

| Field       | Type           | Description     |
| ----------- | -------------- | --------------- |
| amount      | number         | New amount      |
| description | string or null | New description |
| date        | string         | New date        |
| categoryId  | number         | New category ID |
| currencyId  | number         | New currency ID |

**Example Request:**

```bash
curl -X PUT http://localhost:3000/api/expenses/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your_token>" \
  -d '{
    "amount": 30.00,
    "description": "Updated - Dinner at restaurant"
  }'
```

**Example Response (200 OK):**

```json
{
  "success": true,
  "message": "Expense updated successfully",
  "data": {
    "expense": {
      "id": 1,
      "amount": "30.00",
      "description": "Updated - Dinner at restaurant",
      "date": "2025-11-29T00:00:00.000Z",
      "categoryId": 1,
      "currencyId": 1,
      "userId": 1,
      "createdAt": "2025-11-29T10:00:00.000Z",
      "updatedAt": "2025-11-29T10:30:00.000Z",
      "category": {
        "id": 1,
        "name": "Food & Dining",
        "color": "#FF5733"
      },
      "currency": {
        "id": 1,
        "name": "USD",
        "usdExchangeRate": "1.00000000"
      }
    }
  }
}
```

---

#### Delete Expense

**Endpoint:** `DELETE /expenses/:id`

**Example Request:**

```bash
curl -X DELETE http://localhost:3000/api/expenses/1 \
  -H "Authorization: Bearer <your_token>"
```

**Example Response (200 OK):**

```json
{
  "success": true,
  "message": "Expense deleted successfully"
}
```

---

#### Get Expense Summary

Get aggregated expense statistics.

**Endpoint:** `GET /expenses/summary`

**Query Parameters:**

| Parameter | Type   | Required | Description                     |
| --------- | ------ | -------- | ------------------------------- |
| startDate | string | No       | Filter expenses from this date  |
| endDate   | string | No       | Filter expenses until this date |

**Example Request:**

```bash
curl -X GET "http://localhost:3000/api/expenses/summary?startDate=2025-11-01&endDate=2025-11-30" \
  -H "Authorization: Bearer <your_token>"
```

**Example Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "summary": {
      "totalCount": 25,
      "totalsByCurrency": [
        {
          "currency": {
            "id": 1,
            "name": "USD",
            "usdExchangeRate": "1.00000000"
          },
          "totalAmount": "1250.75",
          "count": 20
        },
        {
          "currency": {
            "id": 2,
            "name": "EUR",
            "usdExchangeRate": "1.08500000"
          },
          "totalAmount": "340.00",
          "count": 5
        }
      ],
      "totalByCategory": [
        {
          "category": {
            "id": 1,
            "name": "Food & Dining",
            "color": "#FF5733"
          },
          "totalCount": 12,
          "byCurrency": [
            {
              "currency": {
                "id": 1,
                "name": "USD",
                "usdExchangeRate": "1.00000000"
              },
              "totalAmount": "350.50",
              "count": 10
            },
            {
              "currency": {
                "id": 2,
                "name": "EUR",
                "usdExchangeRate": "1.08500000"
              },
              "totalAmount": "100.00",
              "count": 2
            }
          ]
        },
        {
          "category": {
            "id": 2,
            "name": "Transportation",
            "color": "#3498DB"
          },
          "totalCount": 8,
          "byCurrency": [
            {
              "currency": {
                "id": 1,
                "name": "USD",
                "usdExchangeRate": "1.00000000"
              },
              "totalAmount": "200.25",
              "count": 8
            }
          ]
        },
        {
          "category": {
            "id": 3,
            "name": "Entertainment",
            "color": "#9B59B6"
          },
          "totalCount": 5,
          "byCurrency": [
            {
              "currency": {
                "id": 1,
                "name": "USD",
                "usdExchangeRate": "1.00000000"
              },
              "totalAmount": "700.00",
              "count": 2
            },
            {
              "currency": {
                "id": 2,
                "name": "EUR",
                "usdExchangeRate": "1.08500000"
              },
              "totalAmount": "240.00",
              "count": 3
            }
          ]
        }
      ]
    }
  }
}
```

---

## Data Models

### User

| Field     | Type     | Description                   |
| --------- | -------- | ----------------------------- |
| id        | integer  | Unique identifier             |
| email     | string   | User's email address (unique) |
| name      | string   | User's display name           |
| createdAt | datetime | Account creation timestamp    |
| updatedAt | datetime | Last update timestamp         |

### Category

| Field       | Type     | Description                     |
| ----------- | -------- | ------------------------------- |
| id          | integer  | Unique identifier               |
| name        | string   | Category name (unique per user) |
| description | string   | Optional description            |
| color       | string   | Hex color code (e.g., #FF5733)  |
| userId      | integer  | Owner's user ID                 |
| createdAt   | datetime | Creation timestamp              |
| updatedAt   | datetime | Last update timestamp           |

### Currency

| Field           | Type     | Description                          |
| --------------- | -------- | ------------------------------------ |
| id              | integer  | Unique identifier                    |
| name            | string   | Currency name/code (unique per user) |
| usdExchangeRate | decimal  | Exchange rate relative to USD        |
| userId          | integer  | Owner's user ID                      |
| createdAt       | datetime | Creation timestamp                   |
| updatedAt       | datetime | Last update timestamp                |

### Expense

| Field       | Type     | Description                                      |
| ----------- | -------- | ------------------------------------------------ |
| id          | integer  | Unique identifier                                |
| amount      | decimal  | Expense amount (max 10 digits, 2 decimal places) |
| description | string   | Optional description                             |
| date        | datetime | Expense date                                     |
| categoryId  | integer  | Associated category ID                           |
| currencyId  | integer  | Associated currency ID                           |
| userId      | integer  | Owner's user ID                                  |
| createdAt   | datetime | Creation timestamp                               |
| updatedAt   | datetime | Last update timestamp                            |

---

## Frontend Integration Examples

### JavaScript/TypeScript (Fetch API)

```typescript
const API_BASE_URL = "http://localhost:3000/api";

// Store token after login
let authToken: string | null = null;

// Helper function for API calls
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(authToken && { Authorization: `Bearer ${authToken}` }),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Request failed");
  }

  return data;
}

// Auth functions
async function signUp(email: string, password: string, name?: string) {
  const response = await apiRequest<{
    success: boolean;
    data: { user: any; token: string };
  }>("/auth/signup", {
    method: "POST",
    body: JSON.stringify({ email, password, name }),
  });
  authToken = response.data.token;
  return response.data.user;
}

async function signIn(email: string, password: string) {
  const response = await apiRequest<{
    success: boolean;
    data: { user: any; token: string };
  }>("/auth/signin", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  authToken = response.data.token;
  return response.data.user;
}

// Category functions
async function getCategories() {
  const response = await apiRequest<{
    success: boolean;
    data: { categories: any[] };
  }>("/categories");
  return response.data.categories;
}

async function createCategory(
  name: string,
  description?: string,
  color?: string
) {
  const response = await apiRequest<{
    success: boolean;
    data: { category: any };
  }>("/categories", {
    method: "POST",
    body: JSON.stringify({ name, description, color }),
  });
  return response.data.category;
}

// Expense functions
async function getExpenses(params?: {
  categoryId?: number;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}) {
  const searchParams = new URLSearchParams();
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, String(value));
      }
    });
  }
  const query = searchParams.toString() ? `?${searchParams.toString()}` : "";

  const response = await apiRequest<{
    success: boolean;
    data: { expenses: any[]; pagination: any; totalsByCurrency: any[] };
  }>(`/expenses${query}`);
  return response.data;
}

async function createExpense(data: {
  amount: number;
  categoryId: number;
  currencyId: number;
  description?: string;
  date?: string;
}) {
  const response = await apiRequest<{
    success: boolean;
    data: { expense: any };
  }>("/expenses", {
    method: "POST",
    body: JSON.stringify(data),
  });
  return response.data.expense;
}
```

### React Hook Example

```typescript
import { useState, useEffect } from "react";

interface Expense {
  id: number;
  amount: string;
  description: string | null;
  date: string;
  category: { id: number; name: string; color: string | null };
  currency: { id: number; name: string; usdExchangeRate: string };
}

function useExpenses(token: string) {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchExpenses() {
      try {
        const response = await fetch("http://localhost:3000/api/expenses", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await response.json();

        if (data.success) {
          setExpenses(data.data.expenses);
        } else {
          setError(data.message);
        }
      } catch (err) {
        setError("Failed to fetch expenses");
      } finally {
        setLoading(false);
      }
    }

    fetchExpenses();
  }, [token]);

  return { expenses, loading, error };
}
```

### Axios Example

```typescript
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3000/api",
});

// Add auth token to all requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  signUp: (data: { email: string; password: string; name?: string }) =>
    api.post("/auth/signup", data),
  signIn: (data: { email: string; password: string }) =>
    api.post("/auth/signin", data),
  getProfile: () => api.get("/auth/profile"),
};

export const categoriesAPI = {
  getAll: () => api.get("/categories"),
  getById: (id: number) => api.get(`/categories/${id}`),
  create: (data: { name: string; description?: string; color?: string }) =>
    api.post("/categories", data),
  update: (
    id: number,
    data: { name?: string; description?: string; color?: string }
  ) => api.put(`/categories/${id}`, data),
  delete: (id: number) => api.delete(`/categories/${id}`),
};

export const currenciesAPI = {
  getAll: () => api.get("/currencies"),
  getById: (id: number) => api.get(`/currencies/${id}`),
  create: (data: { name: string; usdExchangeRate: number }) =>
    api.post("/currencies", data),
  update: (id: number, data: { name?: string; usdExchangeRate?: number }) =>
    api.put(`/currencies/${id}`, data),
  delete: (id: number) => api.delete(`/currencies/${id}`),
};

export const expensesAPI = {
  getAll: (params?: {
    categoryId?: number;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
  }) => api.get("/expenses", { params }),
  getById: (id: number) => api.get(`/expenses/${id}`),
  getSummary: (params?: { startDate?: string; endDate?: string }) =>
    api.get("/expenses/summary", { params }),
  create: (data: {
    amount: number;
    categoryId: number;
    currencyId: number;
    description?: string;
    date?: string;
  }) => api.post("/expenses", data),
  update: (
    id: number,
    data: {
      amount?: number;
      categoryId?: number;
      currencyId?: number;
      description?: string;
      date?: string;
    }
  ) => api.put(`/expenses/${id}`, data),
  delete: (id: number) => api.delete(`/expenses/${id}`),
};
```

---

## Rate Limiting

Currently, no rate limiting is implemented. For production use, consider implementing rate limiting to prevent abuse.

---

## CORS

The API has CORS enabled for all origins. For production, configure specific allowed origins.

---

## Environment Variables

| Variable       | Description                  | Default  |
| -------------- | ---------------------------- | -------- |
| PORT           | Server port                  | 3000     |
| JWT_SECRET     | Secret key for JWT signing   | Required |
| JWT_EXPIRES_IN | Token expiration time        | 7d       |
| DATABASE_URL   | PostgreSQL connection string | Required |
