import { describe, expect, test } from "bun:test"
import packageJson from "../package.json"

describe("package.json dependencies", () => {
  test("react-router-dom and @types/react-router-dom are devDependencies only", () => {
    expect(packageJson.dependencies).not.toHaveProperty("react-router-dom")
    expect(packageJson.dependencies).not.toHaveProperty(
      "@types/react-router-dom",
    )
    expect(packageJson.devDependencies).toHaveProperty("react-router-dom")
    expect(packageJson.devDependencies).toHaveProperty(
      "@types/react-router-dom",
    )
  })
})
