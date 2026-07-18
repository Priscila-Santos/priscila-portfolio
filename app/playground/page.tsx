"use client";

import { useState } from "react";

import Modal from "./components/ui/Modal";
import Tabs from "./components/ui/Tabs";
import Disclosure from "./components/ui/Disclosure";

export default function PlaygroundPage() {
  const [open, setOpen] = useState(false);

  return (
    <main className="mx-auto max-w-4xl space-y-12 p-8">
      <h1 className="text-3xl font-bold">
        Accessible Components Playground
      </h1>

      {/* Modal Demo */}
      <section>
        <h2 className="mb-4 text-xl font-semibold">
          Modal Dialog
        </h2>

        <button
          onClick={() => setOpen(true)}
          className="rounded bg-blue-600 px-4 py-2 text-white"
        >
          Open Modal
        </button>

        <Modal
          open={open}
          onClose={() => setOpen(false)}
          title="Delete Project"
          description="This action cannot be undone."
        >
          <div className="flex gap-3">
            <button
              onClick={() => setOpen(false)}
              className="rounded bg-gray-300 px-4 py-2"
            >
              Cancel
            </button>

            <button className="rounded bg-red-600 px-4 py-2 text-white">
              Delete
            </button>
          </div>
        </Modal>
      </section>

      {/* Tabs Demo */}
      <section>
        <h2 className="mb-4 text-xl font-semibold">
          Tabs
        </h2>

        <Tabs
          tabs={[
            {
              id: "general",
              label: "General",
              content: <p>General information.</p>,
            },
            {
              id: "projects",
              label: "Projects",
              content: <p>Projects content.</p>,
            },
            {
              id: "contact",
              label: "Contact",
              content: <p>Contact information.</p>,
            },
          ]}
        />
      </section>

      {/* Disclosure Demo */}
      <section>
        <h2 className="mb-4 text-xl font-semibold">
          Disclosure
        </h2>

        <Disclosure title="What technologies do you use?">
          <ul className="list-disc pl-6">
            <li>React</li>
            <li>TypeScript</li>
            <li>Next.js</li>
            <li>Tailwind CSS</li>
          </ul>
        </Disclosure>
      </section>
    </main>
  );
}