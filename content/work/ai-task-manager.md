---
title: "AI Task Manager"
stack: ["React", "Vite", "GitHub Copilot"]
aiRole: "AI-assisted development"
link:
  label: "View repository"
  href: "https://github.com/Priscila-Santos/AI-task-manager"
order: 4
---

## Problem

A homework assignment built specifically to show how AI can be used as a development assistant throughout a project's lifecycle, not just as a code generator.

## What I Did

- Used Copilot for architecture planning first (folder structure, state management, data model) before writing any code.
- Implemented CRUD, search, filters, and Local Storage persistence with custom hooks (useLocalStorage, useTasks).
- Had Copilot perform a structured code review afterward — accessibility, performance, code smells — and used it to recommend the most valuable Vitest/RTL tests, not just any tests.
- Manually fixed a missing stylesheet import Copilot's review missed, and redesigned the task-statistics section into cards myself.

## Outcome

Full prompt history and reflection are documented in the repo. My role was to guide the AI, validate its output, and take responsibility for the final implementation.