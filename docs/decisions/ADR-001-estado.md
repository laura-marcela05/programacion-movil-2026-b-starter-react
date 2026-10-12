# ADR-001 — State management in the product pages

- **ID:** ADR-001
- **Date:** 2026-10-10
- **Status:** Accepted
- **Authors:** Laura Marcela Quintero

---

## Context

The product catalog has four screens: list, detail, and one form for create and edit. Each page needs its own state: the list needs the products, the loading and error status, the search text and the selected category; the detail needs one product, the status and the delete confirmation; the form needs the field values, the validation errors and the server error. We must choose now where this state lives, because every page is written on top of that choice.

**Known constraints:**

- Small scope: one feature, four screens, one resource.
- The midterm only allows what was seen in class: React 18 with `useState` and `useEffect`. No new dependencies.
- The data comes from our own API and is reloaded each time the user enters a screen. No data is shared between screens at the same time.

---

## Decision

Each page keeps its own state with `useState` and `useEffect`.

**We decided:** State lives inside each page component with `useState`. Data is requested in `useEffect`, and the list is also reloaded when the user comes back to it with `useIonViewWillEnter`. There is no global store.

**Justification:**
No state is shared between pages: the list reloads from the API when it is shown again, and the detail and the form load their own product by id. So a global store would only add code. Local state is the simplest option that meets the midterm, and it is easy to explain.

---

## Evaluated alternatives

| Alternative                                    | Pros                                                                                               | Cons                                                                                   | Reason for discarding                    |
| ---------------------------------------------- | -------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- | ---------------------------------------- |
| `useState` + `useEffect` in each page (chosen) | Simple; only what was seen in class; no new dependencies; state is next to the screen that uses it | Loading and error logic is repeated in each page                                       | — (chosen)                               |
| State holder (MVVM example of the framework)   | Separates UI from logic; easy to test                                                              | More files and concepts for 4 screens; the example is not for React; not seen in class | Too much structure for this scope        |
| Global store (Redux, Zustand or Context API)   | Shared state; one source of truth                                                                  | Needs a new dependency or concept; no state is shared between pages; more code         | Not needed, and not allowed by the scope |
| Custom hook (for example `useProducts`)        | Removes repeated loading and error code                                                            | An extra abstraction not asked by the midterm                                          | Not needed; the repetition is small      |

---

## Consequences

**Positive:**

- Few files and little code; each page can be read from top to bottom.
- Easy to follow and to explain.
- No new dependencies.
- The list always shows fresh data when the user comes back to it.

**Negative / Trade-offs:**

- Loading and error handling is repeated in the list, the detail and the form.
- Each time the list is shown, it asks the API again, so there is no cache.
- If two screens ever needed the same data at the same time, this would not be enough.

**If the app grew:**

- Extract the repeated loading and error logic into a custom hook.
- If many screens shared data, move to a store (for example Context or Zustand) with the products as shared state.

**Impact on the system:**

- Affected features/screens: product list, product detail, product form.
- Documents to update: `features/productos.md` (State section, already consistent); README section «State management decision».

---

## References

- Related to: [ADR-002 — API consumption](./ADR-002-consumo-api.md)
- Feature: [Product Catalog](../features/productos.md)
