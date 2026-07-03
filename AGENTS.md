## Behavior

- Do not edit `schema.sql` directly. use `dbmate`'s `dump` command to generate it.

## Backend rules

- Features (`./src/features/`) are encapsulated. Do not import from a feature directly in other features, or in shared code. Rather, hoist the code to `./src/lib` when you need it.

## React rules

- No hardcoded text in the user interface. Instead, use `react-i18next` and a translation label in `./locales/en.json`.
- No inline styles. Valid exceptions: dynamic CSS variables.
