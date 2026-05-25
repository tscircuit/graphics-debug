# graphics-debug Commands and Guidelines

## Build & Testing Commands
- Build: `bun run build`
- Format code: `bun run format`
- Check formatting: `bun run format:check`
- Run tests: `bun test`
- Run single test: `bun test tests/path/to/test.ts --test-name="test name pattern"`
- Run site: `bun run start`
- Run landing page: `bun run start:landing`

## Code Style Guidelines
- Use [Biome](https://biomejs.dev/) for formatting (2-space indentation)
- Filename convention: kebab-case (enforced via biome linting)
- TypeScript with strict mode enabled
- JSX: Use double quotes, prefer arrow functions with explicit parentheses
- Imports: Use ESM imports, organize imports (enabled in biome)
- Graphics objects should always be JSON.stringified in debug logs
- Prefer functional components and hooks for React
- Write comprehensive tests with snapshot testing for SVG output
- Follow existing patterns in similar files when adding new features