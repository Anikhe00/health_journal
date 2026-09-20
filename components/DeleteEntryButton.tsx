"use client";

export default function DeleteEntryButton({ action }: { action: () => Promise<void> }) {
  return (
    <form
      action={action}
      onSubmit={(event) => {
        if (!window.confirm("Delete this entry? This cannot be undone.")) event.preventDefault();
      }}
    >
      <button type="submit" className="btn-danger w-full sm:w-auto">Delete entry</button>
    </form>
  );
}
