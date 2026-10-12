# Screen — Product Detail

- **Route:** `/productos/:id`
- **Feature:** [Product Catalog](../features/productos.md)
- **Design reference:** N/A (no mockup; the layout is described in the tables below)

---

## Purpose

The user sees all the fields of one product, can go to the edit form, and can delete the product after an on-screen confirmation.

---

## UI regions

| Region       | Component                                                                | Notes                                                                                                                                                      |
| ------------ | ------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Header       | `IonHeader` + `IonToolbar` + `IonButtons` + `IonBackButton` + `IonTitle` | Back button to `/productos`; title «Detalle del producto»                                                                                                  |
| Body         | `IonList` + `IonItem` + `IonLabel`                                       | Fields from `toProductView`: id, name, price (`priceLabel`), category, stock (number and `stockLabel` in an `IonBadge`)                                    |
| Actions      | `IonButton`                                                              | «Editar» (goes to edit form) and «Eliminar» (opens the confirmation)                                                                                       |
| Confirmation | `IonText` + 2 `IonButton`                                                | Only visible after tapping «Eliminar»: «¿Eliminar este producto?» with «Confirmar» and «Cancelar». It is a boolean in the page state, not a modal or alert |

---

## States

| State        | Trigger                            | UI (exact text)                                                                                                |
| ------------ | ---------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| Loading      | `getProduct(id)` in flight         | `IonSpinner` + «Cargando producto...»                                                                          |
| Loaded       | Request ok                         | All fields, «Editar» and «Eliminar»                                                                            |
| Confirming   | User taps «Eliminar»               | Question «¿Eliminar este producto?» with «Confirmar» and «Cancelar»; the fields stay visible                   |
| Deleting     | User taps «Confirmar»              | `deleteProduct(id)` in flight; confirmation buttons disabled                                                   |
| Error        | Request failed (network or server) | Message from `getErrorMessage(error)` + button «Reintentar»                                                    |
| Not found    | Server answers 404                 | Message from `getErrorMessage(error)` («No encontramos ese producto.»); no «Reintentar», only the back button  |
| Delete error | `deleteProduct` fails              | Message from `getErrorMessage(error)` under the buttons; the confirmation closes and the product stays visible |
| Offline      | N/A                                | No cache; losing the connection is just the Error state                                                        |

Transitions: `loading → loaded | error | not found`; `loaded → confirming → deleting → back to /productos`; `confirming → loaded` with «Cancelar»; `deleting → delete error` if it fails. If the id in the route is not a valid number, the server answers 400 and the Error state is shown with its message.

The product is requested again each time the screen is entered (`useIonViewWillEnter`), so it shows fresh data after an edit.

---

## Actions

| User action         | Result                                                   | Function / event                 |
| ------------------- | -------------------------------------------------------- | -------------------------------- |
| Tap «Editar»        | Go to `/productos/:id/editar`                            | `history.push`                   |
| Tap «Eliminar»      | Show the confirmation on screen                          | local boolean `confirmingDelete` |
| Tap «Cancelar»      | Hide the confirmation                                    | local boolean `confirmingDelete` |
| Tap «Confirmar»     | Product is deleted and the app goes back to `/productos` | `deleteProduct` + `history.push` |
| Tap «Reintentar»    | Product is requested again                               | `getProduct`                     |
| Tap the back button | Go to `/productos`                                       | `IonBackButton`                  |

---

## Accessibility

- [x] All interactive elements have accessible labels (buttons have visible text; the back button has a default label from Ionic).
- [ ] Touch targets ≥ 44×44 pt: not verified (default Ionic sizes, not measured).
- [ ] Text scales with OS font-size setting: not verified.
- [ ] Contrast meets WCAG AA: not verified (default Ionic colors, not measured).
