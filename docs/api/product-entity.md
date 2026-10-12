# Entity — Product

- **Store:** In-memory array (`server/app.js`). It starts as a copy of `server/data/products.json` (8 products) and is lost when the server restarts.
- **Table/collection:** N/A (in-memory storage). The array is called `products` in the server code.
- **Schema version introduced:** N/A (in-memory storage)

---

## Fields

| Column     | Type    | Null | Notes                                                                                                                                                                                 |
| ---------- | ------- | ---- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `id`       | integer | No   | Assigned by the server. Starts at (highest seed id) + 1 and grows by 1 on every POST. An id is never reused, even after a DELETE (it is not `length + 1`). Cannot be changed with PUT |
| `name`     | string  | No   | Required. Saved trimmed. 1 to 60 characters (`NAME_MAX_LENGTH`)                                                                                                                       |
| `price`    | number  | No   | Finite number greater than 0, in Colombian pesos (shown with `formatCOP`). A text like "100" is invalid                                                                               |
| `category` | string  | No   | One of `Bebidas`, `Snacks`, `Aseo`, `Hogar` (`CATEGORIES`)                                                                                                                            |
| `stock`    | integer | No   | Integer greater than or equal to 0. Stock label in the app: «Agotado» if 0, «Pocas unidades» if less than 5 (`LOW_STOCK_THRESHOLD`), «Disponible» otherwise                           |

There are no `created_at` or `updated_at` columns: the API does not store dates (not required by the midterm).

The app shape is the TypeScript type `Product` (`domain/product.ts`) and `ProductInput` (the same fields without `id`). The Kotlin class `Product` in `kotlin/Product.kt` has the same fields, but `stock` can be `null` there.

---

## Indexes

N/A (in-memory storage). Products are found by `id` with a search in the array.

---

## Relationships

N/A. Product has no related entities.

---

## Sync

- **Synced?** N/A (in-memory storage). The server is the only source of data; the app does not keep a local copy.
- **Conflict policy:** N/A. The last request received wins.

---

## Migration notes

N/A (in-memory storage). There is no database, so there are no migrations. On every server restart the data goes back to the seed file.
