# Definition of Done (DoD) — Product Catalog midterm

The midterm is **done only when all of these are true**:

- [ ] All parts of the midterm statement are met (docs, API, app, Kotlin, quality, Git, English).
- [ ] The 7 documents in `docs/` are filled in from their templates, and the documentation commit is earlier than the first code commit.
- [ ] A Pull Request to the `main` of my own fork is open, with a description. It is not merged and not squashed, so the commits stay as evidence of my work.
- [ ] The work has at least 6 commits in Conventional Commits format, on a `feature/` branch.
- [ ] At least 4 new tests are added and pass with `npm test` (2 or more unit tests and 2 or more API tests with `startTestServer()`).
- [ ] `npm run lint` and `npm run build` finish without errors.
- [ ] The list handles the loading, empty, no results and error (with «Reintentar») states; the detail and the form handle loading and error (including «no encontrado»).
- [ ] The app works in the browser against the API (`npm run server` and `npm run dev`): list, search, category filter, detail, create, edit and delete.
- [ ] The API returns the exact status codes, messages and error format described in `docs/api/products-endpoints.md`.
- [ ] `kotlin/Product.kt` compiles and runs in the Kotlin Playground.
- [ ] The README explains how to run the project and has the two English sections («State management decision» and «API error handling»).
- [ ] Documentation is up to date with the code (feature doc, screens, ADRs, endpoints, entity).
- [ ] No secrets in the repository: `.env` is ignored, `.env.example` is present.

**Not applicable in this project:**

- Runs on both native platforms: N/A. The app is Ionic React and is checked in the browser; no native project is required.
- Strings localized: N/A. The interface is only in Spanish and i18n is out of scope.
- Analytics / crash reporting events: N/A. Out of scope for the midterm.
- Offline state: N/A. The app is online-only and has no local cache.
- Code merged to `main` via an approved PR: N/A. The PR goes to my own fork and is delivered open, not merged.
- Widget/UI and integration tests: N/A. The midterm only asks for unit and API tests.

> If one applicable criterion is not met, the work is **not done**.
