# ADR-002 — How the app consumes the API

- **ID:** ADR-002
- **Date:** 2026-10-10
- **Status:** Accepted
- **Authors:** Laura Marcela Quintero

---

## Context

The app needs to talk to our own Express API (`/api/products`) to list, read, create, update and delete products. We must decide how the HTTP calls are made, how errors are told apart, and who calls the data layer. The API also has its own rules for errors, so the app and the server must agree on the error format.

**Known constraints:**

- Only what was seen in class: `fetch` and TypeScript. No new dependencies.
- The API always answers errors with `{ "error": "message", "details": ["..."] }`.
- Midterm scope: no retries, no timeouts, no offline mode.

---

## Decision

One single HTTP client with `fetch`, and pages call the data layer directly.

**We decided:** All requests go through one function, `request<T>()`, in `data/products-api.ts`. The base URL is `API_URL`, read from `VITE_API_URL` in `data/config.ts`. Pages call `getProducts`, `getProduct`, `createProduct`, `updateProduct` and `deleteProduct` directly. There are no use cases and no repositories.

**Justification:**
`request<T>()` is the only place that knows how to build the URL, send JSON and read errors, so the five functions stay short. Calling the data layer from the pages is a conscious deviation from the framework (use cases and repositories): with one resource and no business rules beyond validation, those layers would only forward calls. It is the simplest option that meets the midterm.

**Error handling in the client:**

- `ApiError` (in `data/api-error.ts`) has `status`, `details` and `isNetworkError`.
- Network error (the server did not answer): `status` is `null` and `isNetworkError` is `true`.
- Response that is not successful (400, 404, 500): `status` has the HTTP code and `details` has the messages sent by the server.
- `getErrorMessage(error)` turns any error into a text for the user. Pages use it to show the message, and use `status` to tell «not found» (404) from other errors.

**What the server does (`server/app.js`):**

- `express.json()` reads JSON request bodies.
- `cors()` lets the app (another port) call the API.
- `parseId()` converts the `:id` to a positive integer, or `null` if it is not valid; the routes then answer 400.
- Unknown route: a given handler answers 404 in the same error format.
- Central error handler: 400 for malformed JSON, 500 for any other unexpected error.
- No retries and no timeouts: out of scope.

---

## Evaluated alternatives

| Alternative                                                                     | Pros                                                                  | Cons                                                                            | Reason for discarding               |
| ------------------------------------------------------------------------------- | --------------------------------------------------------------------- | ------------------------------------------------------------------------------- | ----------------------------------- |
| One `request<T>()` with `fetch` in `data/products-api.ts` + `ApiError` (chosen) | No dependencies; one place for URL, JSON and errors; errors are typed | We write the small client ourselves                                             | — (chosen)                          |
| `axios`                                                                         | Less code for errors and JSON                                         | New dependency, not allowed; not seen in class                                  | Not allowed by the scope            |
| `fetch` written directly in each page                                           | No extra layer                                                        | Repeated code; each page handles errors in a different way                      | Duplication and inconsistent errors |
| Repository + use cases (framework)                                              | Clean separation; easy to replace the data source                     | More files and concepts for one resource; no business rules to put in use cases | Too much structure for this scope   |

---

## Consequences

**Positive:**

- One place to change the base URL or the way errors are read.
- The app can tell a network error from a server error, and show the server `details` in the form.
- Pages stay simple: call a function, show the result or the message.

**Negative / Trade-offs:**

- Pages depend directly on the data layer, so changing the data source would touch the pages.
- No retries and no timeouts: a slow or lost request ends as an error and the user taps «Reintentar» in the list.
- No cache: each screen asks the API again.

**Impact on the system:**

- Affected features/screens: product list, detail and form.
- Documents to update: `api/products-endpoints.md` (error behavior of the app); README section «API error handling».

---

## References

- Related to: [ADR-001 — State management](./ADR-001-estado.md)
- Endpoints: [products-endpoints.md](../api/products-endpoints.md)
- Feature: [Product Catalog](../features/productos.md)
