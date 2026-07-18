"use client";

import { useRef, useState } from "react";

interface Tab {
  id: string;
  label: string;
  content: React.ReactNode;
}

interface TabsProps {
  tabs: Tab[];
}

export default function Tabs({ tabs }: TabsProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  // NEW: Store references to every tab button
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  function handleKeyDown(
    event: React.KeyboardEvent<HTMLButtonElement>,
    index: number
  ) {
    let newIndex = index;

    switch (event.key) {
      case "ArrowRight":
        event.preventDefault();
        newIndex = (index + 1) % tabs.length;
        break;

      case "ArrowLeft":
        event.preventDefault();
        newIndex = (index - 1 + tabs.length) % tabs.length;
        break;

      case "Home":
        event.preventDefault();
        newIndex = 0;
        break;

      case "End":
        event.preventDefault();
        newIndex = tabs.length - 1;
        break;

      default:
        return;
    }

    // Update selected tab
    setActiveIndex(newIndex);

    // Move keyboard focus
    tabRefs.current[newIndex]?.focus();
  }

  return (
    <div>
      <div
        role="tablist"
        aria-label="Sample Tabs"
        className="flex gap-2"
      >
        {tabs.map((tab, index) => (
          <button
            key={tab.id}
            ref={(element) => {
              tabRefs.current[index] = element;
            }}
            role="tab"
            id={`tab-${tab.id}`}
            aria-selected={activeIndex === index}
            aria-controls={`panel-${tab.id}`}
            tabIndex={activeIndex === index ? 0 : -1}
            onClick={() => setActiveIndex(index)}
            onKeyDown={(event) => handleKeyDown(event, index)}
            className={`rounded px-4 py-2 ${
              activeIndex === index
                ? "bg-blue-500 text-white"
                : "bg-gray-200"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {tabs.map((tab, index) => (
        <div
          key={tab.id}
          role="tabpanel"
          id={`panel-${tab.id}`}
          aria-labelledby={`tab-${tab.id}`}
          hidden={activeIndex !== index}
          className="mt-4"
        >
          {tab.content}
        </div>
      ))}
    </div>
  );
}