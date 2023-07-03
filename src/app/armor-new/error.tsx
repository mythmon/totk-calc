"use client";

import type { Component } from "@/components/component";

const ErrorPage: Component<{ error: Error; reset: () => void }> = ({
  error,
  reset,
}) => {
  let errorString = error.message ?? JSON.stringify(error);
  try {
    let { detail, ...rest } = JSON.parse(errorString);
    try {
      detail = JSON.parse(detail);
    } catch {}
    errorString = JSON.stringify({ ...rest, detail }, null, 2);
  } catch {}

  return (
    <>
      <p>Something went wrong</p>
      <pre>
        <code>{errorString}</code>
      </pre>
    </>
  );
};

export default ErrorPage;
