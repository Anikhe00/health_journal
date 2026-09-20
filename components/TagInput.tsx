"use client";

import { useId, useState } from "react";

type Props = {
  name: string; // the form field that carries the list ("Penicillin, peanuts") when the form is saved
  label: string;
  items: string[];
  onChange: (items: string[]) => void;
  suggestions?: string[]; // offered as the person types; anything else can still be typed
  placeholder?: string;
  maxLength: number; // room for the whole list once joined with ", "
  children?: React.ReactNode; // help text and one-tap suggestions, shown under the pills
};

const MAX_OPTIONS = 6;
const joinItems = (items: string[]) => items.join(", ");
const same = (a: string, b: string) => a.toLowerCase() === b.toLowerCase();

// A field for a list of things: type one, press Enter, and it appears under the box as a pill.
// While typing, matching suggestions are offered. Pills can be removed with their x.
// Whatever is typed but not yet added is still saved.
export default function TagInput({ name, label, items, onChange, suggestions = [], placeholder, maxLength, children }: Props) {
  const id = useId();
  const [draft, setDraft] = useState("");
  const [tooLong, setTooLong] = useState(false);
  const [focused, setFocused] = useState(false);
  const [dismissed, setDismissed] = useState(false); // Escape closes the suggestions until the next keystroke
  const [highlighted, setHighlighted] = useState(-1);

  // Suggestions that match what is typed and are not already added. Ones that start with it come first.
  const query = draft.trim().toLowerCase();
  const options = query
    ? suggestions
        .filter((option) => option.toLowerCase().includes(query) && !items.some((item) => same(item, option)))
        .sort((a, b) => Number(b.toLowerCase().startsWith(query)) - Number(a.toLowerCase().startsWith(query)))
        .slice(0, MAX_OPTIONS)
    : [];
  const listOpen = focused && !dismissed && options.length > 0;

  // Turn text into pills. A comma also separates items, so "a, b" becomes two.
  function commit(text: string) {
    const typed = text.split(",").map((item) => item.trim()).filter(Boolean);
    setHighlighted(-1);
    if (typed.length === 0) {
      setDraft("");
      return;
    }

    const next = [...items];
    let full = false;
    for (const raw of typed) {
      const item = suggestions.find((option) => same(option, raw)) ?? raw; // "penicillin" -> "Penicillin"
      if (next.some((existing) => same(existing, item))) continue; // already there
      if (joinItems([...next, item]).length > maxLength) {
        full = true;
        break;
      }
      next.push(item);
    }
    setTooLong(full);
    if (!full) setDraft("");
    onChange(next);
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.nativeEvent.isComposing) return;

    if (event.key === "ArrowDown" && options.length > 0) {
      event.preventDefault();
      setDismissed(false);
      setHighlighted((current) => (current + 1) % options.length);
    } else if (event.key === "ArrowUp" && options.length > 0) {
      event.preventDefault();
      setHighlighted((current) => (current <= 0 ? options.length - 1 : current - 1));
    } else if (event.key === "Enter" || event.key === ",") {
      event.preventDefault(); // Enter must add the pill, not save the whole form
      commit(listOpen && highlighted >= 0 && event.key === "Enter" ? options[highlighted] : draft);
    } else if (event.key === "Escape" && listOpen) {
      event.preventDefault();
      event.stopPropagation(); // close the suggestions, not the whole drawer
      setDismissed(true);
    } else if (event.key === "Backspace" && draft === "" && items.length > 0) {
      onChange(items.slice(0, -1)); // Backspace in an empty box removes the last pill
    }
  }

  // Anything typed but not added yet is saved too, so it is never lost.
  const pending = draft.split(",").map((item) => item.trim()).filter(Boolean);

  return (
    <div>
      <label htmlFor={id} className="label">{label}</label>
      <input
        id={id}
        type="text"
        role="combobox"
        aria-expanded={listOpen}
        aria-controls={`${id}-list`}
        aria-autocomplete="list"
        aria-activedescendant={listOpen && highlighted >= 0 ? `${id}-option-${highlighted}` : undefined}
        value={draft}
        onChange={(e) => {
          setDraft(e.target.value);
          setTooLong(false);
          setDismissed(false);
          setHighlighted(-1);
        }}
        onKeyDown={handleKeyDown}
        onFocus={() => setFocused(true)}
        onBlur={() => {
          setFocused(false);
          commit(draft);
        }}
        placeholder={placeholder}
        enterKeyHint="enter"
        autoComplete="off"
        className="input"
      />
      <input type="hidden" name={name} value={joinItems([...items, ...pending])} />

      {listOpen && (
        <ul id={`${id}-list`} role="listbox" aria-label={`${label}: suggestions`} className="mt-1 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          {options.map((option, index) => (
            <li
              key={option}
              id={`${id}-option-${index}`}
              role="option"
              aria-selected={index === highlighted}
              // mousedown would move focus out of the box, which would add the half-typed text as a pill first
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => commit(option)}
              className={`cursor-pointer px-3.5 py-2.5 text-base ${index === highlighted ? "bg-teal-50 text-teal-900" : "text-slate-800 hover:bg-slate-50"}`}
            >
              {option}
            </li>
          ))}
        </ul>
      )}

      {tooLong && <p className="mt-1 text-xs text-red-700" role="alert">That&apos;s all that fits here. Remove one to add another.</p>}

      {items.length > 0 && (
        <ul className="mt-2 flex flex-wrap gap-1.5" aria-label={`${label}: added`}>
          {items.map((item) => (
            <li key={item} className="flex items-center gap-1 rounded-full border border-teal-200 bg-teal-50 py-1 pl-3 pr-1 text-sm font-medium text-teal-900">
              {item}
              <button
                type="button"
                onClick={() => onChange(items.filter((existing) => existing !== item))}
                aria-label={`Remove ${item}`}
                className="flex size-5 items-center justify-center rounded-full text-base leading-none text-teal-700 hover:bg-teal-100"
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      )}

      {children}
    </div>
  );
}
