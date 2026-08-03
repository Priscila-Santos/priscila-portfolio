import "@testing-library/jest-dom/vitest";
import { vi } from "vitest";

// jsdom não implementa scrollIntoView; o efeito de auto-scroll do
// ChatInterface chama isso a cada render, então precisamos de um stub.
Element.prototype.scrollIntoView = vi.fn();