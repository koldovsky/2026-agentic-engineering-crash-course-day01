import { expect, test } from "vitest";
import { render, screen } from "@testing-library/react";
import Page from "./page";

test("home page renders the Day 01 heading and links to the health route", () => {
  render(<Page />);
  expect(screen.getByRole("heading", { level: 1 }).textContent).toContain("День 01");
  expect(screen.getByRole("link", { name: /api\/health/ }).getAttribute("href")).toBe("/api/health");
});
