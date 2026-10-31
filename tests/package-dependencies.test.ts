import { expect, test } from "bun:test"
import pkg from "../package.json"

test("react-router-dom and @types/react-router-dom are devDependencies, not runtime dependencies", () => {
  expect(pkg.dependencies).not.toHaveProperty("react-router-dom")
  expect(pkg.dependencies).not.toHaveProperty("@types/react-router-dom")

  expect(pkg.devDependencies).toHaveProperty("react-router-dom")
  expect(pkg.devDependencies).toHaveProperty("@types/react-router-dom")
})
