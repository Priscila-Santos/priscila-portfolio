type Todo = {
  userId: number;
  id: number;
  title: string;
  completed: boolean;
};

export const dynamic = "force-dynamic";

async function getHealthData(): Promise<Todo> {
  const response = await fetch("https://jsonplaceholder.typicode.com/todos/1", {
    cache: "no-store"
  });

  if (!response.ok) {
    throw new Error(`Health check failed with status ${response.status}.`);
  }

  return response.json();
}

export default async function HealthPage() {
  try {
    const todo = await getHealthData();

    return (
      <section className="px-page-x py-section">
        <h1 className="text-display text-primary">Health</h1>
        <p>The public API responded successfully.</p>
        <dl>
          <div>
            <dt>Todo ID</dt>
            <dd>{todo.id}</dd>
          </div>
          <div>
            <dt>Title</dt>
            <dd>{todo.title}</dd>
          </div>
          <div>
            <dt>Completed</dt>
            <dd>{todo.completed ? "Yes" : "No"}</dd>
          </div>
        </dl>
      </section>
    );
  } catch {
    return (
      <section className="px-page-x py-section">
        <h1 className="text-display text-primary">Health</h1>
        <p role="alert">Unable to retrieve the health data. Please try again later.</p>
      </section>
    );
  }
}
