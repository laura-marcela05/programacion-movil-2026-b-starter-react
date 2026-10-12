# Feature — Product Catalog

- **Owner:** Laura Marcela Quintero
- **Status:** In progress
- **Related stories:** N/A (individual midterm, no user stories)

---

## Purpose

Let a user browse, search, filter, create, edit and delete products of a small catalog, using an Ionic React app that talks to our own Express API. The same feature includes a small Kotlin exercise (see the last section).

---

## Screens

| Screen                | Route                   | Purpose                                                                             |
| --------------------- | ----------------------- | ----------------------------------------------------------------------------------- |
| Product list          | `/productos`            | Load all products, search by text, filter by category, open a product, go to create |
| Product detail        | `/productos/:id`        | Show all fields of one product; go to edit; delete with on-screen confirmation      |
| Product form (create) | `/productos/nuevo`      | Create a product with inline validation                                             |
| Product form (edit)   | `/productos/:id/editar` | Edit an existing product (same form screen as create, preloaded)                    |

Specs: [lista-productos.md](../screens/lista-productos.md) · [detalle-producto.md](../screens/detalle-producto.md) · [formulario-producto.md](../screens/formulario-producto.md)

---

## State

- **Pattern:** Local state inside each page with `useState` + `useEffect` (no global store). See [ADR-001](../decisions/ADR-001-estado.md).
- **State object(s):** Each page keeps its own state: data (`products` or one `product`), status (loading / error message), and screen-only values (filters in the list, field values and errors in the form, delete confirmation flag in the detail).
- **Key transitions:**
  - All pages: `loading → ready | error`. In the list, `error → loading` when the user taps «Reintentar».
  - List only: `ready → empty` (the API has no products) or `ready → no results` (the filters match nothing).
  - Detail: `ready → confirming delete → deleted (back to list)`.
  - Form: `editing → saving → back to list`, or `saving → server error shown`.

---

## Data

- **Use cases:** N/A. Pages call `data/products-api.ts` directly (conscious deviation from the framework, see [ADR-002](../decisions/ADR-002-consumo-api.md)).
- **Repositories:** N/A (same reason).
- **Remote sources / endpoints:**

| Function        | Endpoint                              |
| --------------- | ------------------------------------- |
| `getProducts`   | `GET /api/products?search=&category=` |
| `getProduct`    | `GET /api/products/:id`               |
| `createProduct` | `POST /api/products`                  |
| `updateProduct` | `PUT /api/products/:id`               |
| `deleteProduct` | `DELETE /api/products/:id`            |

- **Local persistence:** N/A (in-memory API). The server resets its data on restart.

---

## Edge cases & states

- [x] Loading: spinner while the request is running (list, detail, and form in edit mode).
- [x] Empty: the API has no products (list).
- [x] No results: search or category filter matches nothing (list).
- [x] Error / retry: network or server error, with a «Reintentar» button (list and detail); error message (form).
- [x] Not found: the id does not exist (detail and edit form), shown with the server message.
- [ ] Offline: N/A. There is no local cache; without network the request fails and the normal error state is shown.
- [ ] Permission denied: N/A. The app has no authentication.

---

## Decisions

- [ADR-001 — State management](../decisions/ADR-001-estado.md)
- [ADR-002 — API consumption](../decisions/ADR-002-consumo-api.md)

---

## Tests

- **Unit** (`src/features/products/__tests__/product.test.ts`):
  - `validateProduct_whenFieldsInvalid_returnsOneErrorPerField`
  - `validateProduct_whenInputValid_returnsIsValid`
  - `toProductView_whenStockVaries_returnsLabelAndPrice`
  - `filterProducts_whenSearchAndCategory_returnsMatches`
- **API** (`src/features/products/__tests__/products-api.test.ts`, with `startTestServer()`):
  - `postProduct_whenInvalid_returns400WithDetails`
  - `getProduct_whenIdDoesNotExist_returns404`
  - `getProduct_whenIdNotNumeric_returns400`
  - `unknownRoute_whenRequested_returns404FromGivenHandler` (Part 2: explained in the README)
- **Widget/UI, Integration/E2E:** N/A (not required by the midterm).

---

## Related deliverable: Kotlin exercise

File: `kotlin/Product.kt`. It must compile and run in the Kotlin Playground. No Android project is needed.

- `class Product(val id: Int, val name: String, var price: Double, val category: String, var stock: Int?)`
- `fun stockLabel(stock: Int?): String`: «Sin dato» if `null`; otherwise the same labels as the app («Agotado», «Pocas unidades», «Disponible»).
- `fun applyDiscount(price: Double, percent: Int): Double`
- `main()`: creates 3 products (one with `stock` null, one out of stock) and prints name, stock label and price with 10 % discount.
