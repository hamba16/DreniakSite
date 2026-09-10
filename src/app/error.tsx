"use client";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <main id="main" className="not-found">
      <h1>
        Something interrupted
        <br />
        this page.
      </h1>
      <p>Please try again or contact info@dreniak.com.</p>
      <button className="button" onClick={reset}>
        Try again
      </button>
    </main>
  );
}
