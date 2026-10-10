# Screen — Product Form

- **Route:** `/productos/nuevo` (create mode) and `/productos/:id/editar` (edit mode). One single component serves both routes.
- **Feature:** [Product Catalog](../features/productos.md)
- **Design reference:** N/A (no mockup; the layout is described in the tables below)

---

## Purpose

The user creates a new product or edits an existing one. Fields are validated inline with `validateProduct`, and errors sent by the server are also shown.

---

## UI regions

| Region       | Component                                                                | Notes                                                                                                                                               |
| ------------ | ------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| Header       | `IonHeader` + `IonToolbar` + `IonButtons` + `IonBackButton` + `IonTitle` | Back button to `/productos`; title «Nuevo producto» (create) or «Editar producto» (edit)                                                            |
| name         | `IonInput`                                                               | Label «Nombre»; error text under the field                                                                                                          |
| price        | `IonInput` (type number)                                                 | Label «Precio»; error text under the field                                                                                                          |
| category     | 4 `IonButton`                                                            | «Bebidas», «Snacks», «Aseo», «Hogar»; the selected one is `solid`, the others `outline`; none selected in create mode; error text under the buttons |
| stock        | `IonInput` (type number)                                                 | Label «Stock»; error text under the field                                                                                                           |
| Server error | `IonText` (color danger)                                                 | Shows `error` and each item of `details` when the server answers 400                                                                                |
| CTA          | `IonButton`                                                              | «Guardar» (create or save changes) and «Cancelar» (back to `/productos`)                                                                            |

---

## Modes

| Mode   | Route                   | Behavior                                                                                                                                       |
| ------ | ----------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| Create | `/productos/nuevo`      | Empty fields. Save calls `createProduct`                                                                                                       |
| Edit   | `/productos/:id/editar` | Loads the product with `getProduct(id)` and fills the fields. Save calls `updateProduct(id, input)` (replaces the whole product, keeps the id) |

---

## Validation messages

Same text in `validateProduct` (app) and in the API. One message per problem; all problems are shown together.

| Field    | Rule                                | Message                                                  |
| -------- | ----------------------------------- | -------------------------------------------------------- |
| name     | Required (after `trim()`)           | `name es obligatorio`                                    |
| name     | Maximum 60 characters               | `name debe tener máximo 60 caracteres`                   |
| price    | Number greater than 0               | `price debe ser un número mayor que 0`                   |
| category | One of Bebidas, Snacks, Aseo, Hogar | `category debe ser una de: Bebidas, Snacks, Aseo, Hogar` |
| stock    | Integer greater than or equal to 0  | `stock debe ser un entero mayor o igual que 0`           |

Inline behavior: the message appears under its field when the user taps «Guardar» with invalid data, and the request is not sent. After that, messages update as the user edits the fields.

---

## States

| State        | Trigger                               | UI (exact text)                                                                                                             |
| ------------ | ------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| Loading      | Edit mode: `getProduct(id)` in flight | `IonSpinner` + «Cargando producto...»                                                                                       |
| Editing      | Data ready (create mode starts here)  | Form with its fields                                                                                                        |
| Invalid      | «Guardar» with invalid data           | Validation messages under each wrong field; no request                                                                      |
| Saving       | Valid data sent                       | «Guardar» disabled while the request runs                                                                                   |
| Server error | Server answers 400 (or another error) | Message from `getErrorMessage(error)` and, if the error has `details`, one line per detail; the form keeps the typed values |
| Not found    | Edit mode and the server answers 404  | Message from `getErrorMessage(error)` («Producto no encontrado») instead of the form                                        |
| Offline      | N/A                                   | No cache; losing the connection is just a Server error with the network message                                             |

---

## Actions

| User action                            | Result                                              | Function / event                 |
| -------------------------------------- | --------------------------------------------------- | -------------------------------- |
| Type in a field                        | Field value is updated                              | local `useState`                 |
| Tap a category button                  | That category is selected                           | local `useState`                 |
| Tap «Guardar» with invalid data        | Messages are shown under the fields                 | `validateProduct`                |
| Tap «Guardar» with valid data (create) | Product is created and the app goes to `/productos` | `createProduct` + `history.push` |
| Tap «Guardar» with valid data (edit)   | Product is updated and the app goes to `/productos` | `updateProduct` + `history.push` |
| Tap «Cancelar» or the back button      | Go to `/productos` without saving                   | `history.push`                   |

---

## Accessibility

- [x] All interactive elements have accessible labels (inputs have visible labels; buttons have visible text).
- [ ] Touch targets ≥ 44×44 pt: not verified (default Ionic sizes, not measured).
- [ ] Text scales with OS font-size setting: not verified.
- [ ]
