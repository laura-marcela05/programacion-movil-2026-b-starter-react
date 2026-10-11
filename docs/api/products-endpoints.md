# Endpoint Integration — Products API

- **Feature:** [Product Catalog](../features/productos.md)
- **Resource:** `/api/products` (Express API, `server/app.js`)
- **Auth required:** No
- **Caching / offline:** online-only (see the last section)
- **Client:** every call goes through `request<T>()` in `data/products-api.ts` ([ADR-002](../decisions/ADR-002-consumo-api.md)). Entity: [product-entity.md](./product-entity.md)

All errors use the same body: `{ "error": "message", "details": ["..."] }`. In the app, `getErrorMessage(error)` turns an `ApiError` into the text shown to the user.

**Shared errors (every route with `:id`):** the server first runs `parseId`; if it gives `null` it answers 400, then it looks for the product and answers 404 if it does not exist.

```json
// 400 invalid id
{ "error": "Id inválido", "details": ["El id debe ser un número entero positivo"] }
// 404 not found (N is the requested id)
{ "error": "Producto no encontrado", "details": ["No existe un producto con id N"] }
```

**Validation errors (POST and PUT):** status 400, one message per problem, all problems together.

```json
{
  "error": "Datos inválidos",
  "details": ["name es obligatorio", "price debe ser un número mayor que 0"]
}
```

| Rule                                                                                  | Message                                                  |
| ------------------------------------------------------------------------------------- | -------------------------------------------------------- |
| `name` required (after `trim()`)                                                      | `name es obligatorio`                                    |
| `name` at most 60 characters                                                          | `name debe tener máximo 60 caracteres`                   |
| `price` is a finite number (type number, so the text "100" is invalid) greater than 0 | `price debe ser un número mayor que 0`                   |
| `category` is one of Bebidas, Snacks, Aseo, Hogar                                     | `category debe ser una de: Bebidas, Snacks, Aseo, Hogar` |
| `stock` is an integer greater than or equal to 0                                      | `stock debe ser un entero mayor o igual que 0`           |

---

## 1. GET /api/products — `getProducts`

- **Method + path:** `GET /api/products?search=&category=`
- **Auth required:** No

### Request

| Param      | In    | Type   | Required | Notes                                                                         |
| ---------- | ----- | ------ | -------- | ----------------------------------------------------------------------------- |
| `search`   | query | string | No       | Product name contains the text, case-insensitive (`toLowerCase` + `includes`) |
| `category` | query | string | No       | Exact category. Can be combined with `search`                                 |

**Body:** none.

### Response

**Success (200):** array of products (empty array if none).

```json
[
  {
    "id": 1,
    "name": "Agua mineral 600 ml",
    "price": 1800,
    "category": "Bebidas",
    "stock": 120
  }
]
```

**DTO → domain mapping:** N/A. The JSON already has the shape of `Product` (no DTOs, out of scope).

### Errors

| Status        | Meaning                                  | App behavior                                                       |
| ------------- | ---------------------------------------- | ------------------------------------------------------------------ |
| none          | The route has no expected errors         | —                                                                  |
| Network / 500 | Server not reachable or unexpected error | List shows the Error state with `getErrorMessage` and «Reintentar» |

Note: the app calls `getProducts()` without filters and filters in memory with `filterProducts`; the query params exist in the API contract.

---

## 2. GET /api/products/:id — `getProduct`

- **Method + path:** `GET /api/products/:id`
- **Auth required:** No

### Request

| Param | In   | Type    | Required | Notes            |
| ----- | ---- | ------- | -------- | ---------------- |
| `id`  | path | integer | Yes      | Positive integer |

**Body:** none.

### Response

**Success (200):** the product.

```json
{
  "id": 1,
  "name": "Agua mineral 600 ml",
  "price": 1800,
  "category": "Bebidas",
  "stock": 120
}
```

**DTO → domain mapping:** N/A (same shape as `Product`).

### Errors

| Status        | Meaning                                            | App behavior                                                            |
| ------------- | -------------------------------------------------- | ----------------------------------------------------------------------- |
| 400           | `id` is not a positive integer (`Id inválido`)     | Detail and edit form show the Error state with the server message       |
| 404           | No product with that id (`Producto no encontrado`) | Detail and edit form show the Not found state with the server message   |
| Network / 500 | Server not reachable or unexpected error           | Detail shows Error with «Reintentar»; edit form shows the error message |

---

## 3. POST /api/products — `createProduct`

- **Method + path:** `POST /api/products`
- **Auth required:** No

### Request

| Param      | In   | Type    | Required | Notes                                      |
| ---------- | ---- | ------- | -------- | ------------------------------------------ |
| `name`     | body | string  | Yes      | Trimmed, 1 to 60 characters; saved trimmed |
| `price`    | body | number  | Yes      | Greater than 0                             |
| `category` | body | string  | Yes      | Bebidas, Snacks, Aseo or Hogar             |
| `stock`    | body | integer | Yes      | 0 or more                                  |

**Body:**

```json
{ "name": "Jabón líquido", "price": 8900, "category": "Aseo", "stock": 20 }
```

The `id` is assigned by the server (`nextId`, always increasing, never reused). An `id` sent in the body is ignored.

### Response

**Success (201):** the created product, with its new `id`.

```json
{
  "id": 9,
  "name": "Jabón líquido",
  "price": 8900,
  "category": "Aseo",
  "stock": 20
}
```

**DTO → domain mapping:** N/A (same shape as `Product`).

### Errors

| Status        | Meaning                                                                     | App behavior                                                                                                                                          |
| ------------- | --------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| 400           | Validation failed (`Datos inválidos`, one message per problem in `details`) | Form shows `error` and each item of `details`; typed values are kept. The form already validates the same rules with `validateProduct` before sending |
| 400           | Malformed JSON (central handler)                                            | Form shows the server message                                                                                                                         |
| Network / 500 | Server not reachable or unexpected error                                    | Form shows the message from `getErrorMessage`                                                                                                         |

---

## 4. PUT /api/products/:id — `updateProduct`

- **Method + path:** `PUT /api/products/:id`
- **Auth required:** No

### Request

| Param                                | In   | Type       | Required | Notes              |
| ------------------------------------ | ---- | ---------- | -------- | ------------------ |
| `id`                                 | path | integer    | Yes      | Positive integer   |
| `name`, `price`, `category`, `stock` | body | as in POST | Yes      | Same rules as POST |

**Body:** same as POST. PUT replaces the whole product (all fields are required) and keeps the `id`.

### Response

**Success (200):** the updated product.

```json
{
  "id": 9,
  "name": "Jabón líquido 1 L",
  "price": 9500,
  "category": "Aseo",
  "stock": 18
}
```

**DTO → domain mapping:** N/A (same shape as `Product`).

### Errors

| Status        | Meaning                                                               | App behavior                                  |
| ------------- | --------------------------------------------------------------------- | --------------------------------------------- |
| 400           | Invalid `id` (`Id inválido`) or validation failed (`Datos inválidos`) | Form shows `error` and each item of `details` |
| 404           | No product with that id (`Producto no encontrado`)                    | Form shows the server message                 |
| Network / 500 | Server not reachable or unexpected error                              | Form shows the message from `getErrorMessage` |

Order on the server: `parseId` (400) → product exists (404) → validation (400).

---

## 5. DELETE /api/products/:id — `deleteProduct`

- **Method + path:** `DELETE /api/products/:id`
- **Auth required:** No

### Request

| Param | In   | Type    | Required | Notes            |
| ----- | ---- | ------- | -------- | ---------------- |
| `id`  | path | integer | Yes      | Positive integer |

**Body:** none.

### Response

**Success (204):** no body (`res.status(204).end()`). The client must not try to read JSON from this response.

**DTO → domain mapping:** N/A (no body).

### Errors

| Status        | Meaning                                            | App behavior                                                               |
| ------------- | -------------------------------------------------- | -------------------------------------------------------------------------- |
| 400           | `id` is not a positive integer (`Id inválido`)     | Detail shows the server message under the buttons                          |
| 404           | No product with that id (`Producto no encontrado`) | Detail shows the server message under the buttons                          |
| Network / 500 | Server not reachable or unexpected error           | Detail shows the message from `getErrorMessage`; the product stays visible |

---

## Other responses given by the server (not endpoints)

| Case                               | Status | Body              |
| ---------------------------------- | ------ | ----------------- |
| Unknown route (given handler)      | 404    | Same error format |
| Malformed JSON (central handler)   | 400    | Same error format |
| Unexpected error (central handler) | 500    | Same error format |

---

## Caching / offline

- **Strategy:** online-only.
- **Cached entity:** N/A (see [product-entity.md](./product-entity.md)).
- **TTL / invalidation:** N/A. The list is requested again every time the screen is entered.
