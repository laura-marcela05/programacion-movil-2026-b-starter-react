# Screen — Product List

- **Route:** `/productos`
- **Feature:** [Product Catalog](../features/productos.md)
- **Design reference:** N/A (no mockup; the layout is described in the tables below)

---

## Purpose

The user sees all products, searches by name, filters by category, opens a product to see its detail, and goes to the create form.

---

## UI regions

| Region          | Component                               | Notes                                                                                                                                       |
| --------------- | --------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| Header          | `IonHeader` + `IonToolbar` + `IonTitle` | Title «Productos»                                                                                                                           |
| Search          | `IonInput`                              | Placeholder «Buscar producto»; accessible label «Buscar producto»; filters by name as the user types                                        |
| Category filter | 5 `IonButton`                           | «Todas», «Bebidas», «Snacks», «Aseo», «Hogar»; the selected one is `solid`, the others `outline`; «Todas» is selected by default            |
| Product list    | `IonList` of `ProductCard`              | Each card shows name, category, `priceLabel` and `stockLabel` (`IonBadge`: danger if out of stock, warning if low stock, success otherwise) |
| CTA             | `IonButton`                             | «Nuevo producto», goes to `/productos/nuevo`                                                                                                |

---

## States

| State      | Trigger                                                        | UI (exact text)                                                                                                                        |
| ---------- | -------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| Loading    | `getProducts()` in flight                                      | `IonSpinner` + «Cargando productos...»                                                                                                 |
| Loaded     | Request ok and at least one product matches the filters        | Search, category buttons and the list of `ProductCard`                                                                                 |
| Empty      | Request ok and the API returns 0 products                      | `EmptyState`: «No hay productos» / «Crea el primero con el botón "Nuevo producto".»                                                    |
| No results | Request ok, there are products, but `filterProducts` returns 0 | `EmptyState`: «Sin resultados» / «Ningún producto coincide con la búsqueda o la categoría.» (search and category buttons stay visible) |
| Error      | Request failed (network or server)                             | Title «No se pudo cargar», the message from `getErrorMessage(error)` and button «Reintentar»                                           |
| Offline    | N/A                                                            | No cache; losing the connection is just the Error state                                                                                |

Transitions: `loading → loaded | empty | no results | error`; `error → loading` with «Reintentar». The list reloads each time the screen is entered (`useIonViewWillEnter`).

---

## Actions

| User action              | Result                                                          | Function / event |
| ------------------------ | --------------------------------------------------------------- | ---------------- |
| Type in the search field | List is filtered in memory by name (case-insensitive)           | `filterProducts` |
| Tap a category button    | List is filtered in memory by exact category                    | `filterProducts` |
| Tap a `ProductCard`      | Go to `/productos/:id`                                          | `history.push`   |
| Tap «Nuevo producto»     | Go to `/productos/nuevo`                                        | `history.push`   |
| Tap «Reintentar»         | State goes back to loading and the products are requested again | `getProducts`    |

---

## Accessibility

- [x] All interactive elements have accessible labels (buttons have visible text; the search field has the label «Buscar producto»).
- [ ] Touch targets ≥ 44×44 pt: not verified (default Ionic sizes, not measured).
- [ ] Text scales with OS font-size setting: not verified.
- [ ] Contrast meets WCAG AA: not verified (default Ionic colors, not measured).
