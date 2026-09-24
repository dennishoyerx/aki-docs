# Aki docs agent notes

- Keep the site on the current Fumadocs React Router framework stack: Vite, Bun, and TypeScript.
- Put public documentation in `content/docs`; keep the six navigation groups stable: Introduction, Architecture, Runtime, Extending, Reference, and Development.
- Use the shared `source`, `docsLlms`, and `searchServer` modules for page rendering, LLM responses, search, and MCP so representations cannot drift.
- Keep search local and queryable in production. Do not introduce a hosted search dependency for the default experience.
- Keep `/health`, `/llms.txt`, `/llms-full.txt`, processed page Markdown, and `/mcp` covered by verification.
- Do not add authentication, analytics, AI chat, hosted search, versions, a CMS, or an extra framework unless the product requirements change.
- Do not add private runtime state, credentials, audit material, or task lists to public content.
- Before changing code, run `bun run typecheck`, `bun run lint`, `bun run build`, and the minimal smoke check. For endpoint changes, also run the production server checks documented in `README.md`.
- Never commit generated `build/`, `.react-router/`, `.source/`, or `node_modules/` output.
