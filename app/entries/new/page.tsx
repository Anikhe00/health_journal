import EntryForm from "@/components/EntryForm";
import { createEntry } from "@/app/entries/actions";
import { todayInputValue } from "@/lib/dates";

export default function NewEntryPage() {
  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold text-slate-900">New entry</h1>
      <div className="card">
        <EntryForm
          action={createEntry}
          initial={{ date: todayInputValue(), title: "", body: "", tags: [] }}
          submitLabel="Save entry"
          cancelHref="/dashboard"
        />
      </div>
    </div>
  );
}
