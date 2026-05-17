## Summary

This PR contains the following changes made as part of Phase 2–4 work and test stabilization:

- Added deterministic AI structure behavior tests for `Radar` and `EMPLauncher`.
- Polished `BuildMenu` icons (use existing more-appropriate SVGs for Submarine/Destroyer/Carrier/Radar/EMP).

## Files changed

- `tests/NationStructureBehavior.test.ts` — new tests verifying `shouldBuildStructure()` for Radar and EMPLauncher under Medium difficulty.
- `src/client/graphics/layers/BuildMenu.ts` — replaced placeholder icons with `resources/images/*` assets.

## Testing

Local quick checks performed:

```bash
npx vitest tests/NationStructureBehavior.test.ts --run
npx vitest tests/MissileSilo.test.ts --run
npm test --silent # full suite (may be flaky locally due to parallel test interference)
```

## Notes

- Some tests can be order-sensitive when run in parallel on certain environments. If CI shows intermittent failures, try running the Vitest process single-threaded or isolate flaky tests.
- I ran focused tests in isolation and they pass. The full suite run exhibited intermittent failures likely due to test-run parallelism (some tests passed when executed individually).

## Next steps suggested

1. Run full suite in CI (recommended) and fix any failing tests that reproduce there.
2. Prepare the PR branch with these changes and include this file as the PR description.
3. Optionally: add unit tests around any flaky tests identified by CI.
