"use client";

import { useActionState, useEffect, useState } from "react";
import { savePassport } from "@/app/passport/actions";
import { useCloseDrawer } from "@/components/Drawer";
import DrawerFormLayout from "@/components/DrawerFormLayout";
import { EmergencyContactFields, HealthBasics, type HealthValues } from "@/components/HealthFields";
import TagInput from "@/components/TagInput";
import { ALLERGY_SUGGESTIONS, CHRONIC_CONDITION_SUGGESTIONS, MEDICATION_SUGGESTIONS } from "@/lib/medical-suggestions";
import { MAX_PASSPORT_TEXT, SEXES, sexLabel } from "@/lib/passport";

// "Penicillin, peanuts" -> ["Penicillin", "peanuts"]
const splitList = (text: string) => text.split(",").map((item) => item.trim()).filter(Boolean);

type Props = {
  today: string;
  initial: HealthValues & { sex: string; allergies: string; chronicConditions: string; currentMedications: string };
  // Titles of the person's own Diagnosis and Medication entries, offered as one-tap suggestions.
  suggestions: { diagnoses: string[]; medications: string[] };
  hasPassport: boolean;
};

// The one form for everything on the health passport. It lives in a drawer and closes itself once saved.
export default function PassportForm({ today, initial, suggestions, hasPassport }: Props) {
  const [state, formAction, pending] = useActionState(savePassport, undefined);
  const close = useCloseDrawer();
  const [values, setValues] = useState(initial);
  // Allergies, conditions and medicines are lists, shown as pills. They are saved as "one, two, three".
  const [lists, setLists] = useState({
    allergies: splitList(initial.allergies),
    chronicConditions: splitList(initial.chronicConditions),
    currentMedications: splitList(initial.currentMedications),
  });

  // After saving: close the drawer and scroll up so the new or updated card is in view.
  useEffect(() => {
    if (!state?.saved) return;
    close();
    document.getElementById("app-scroll")?.scrollTo({ top: 0, behavior: "smooth" });
  }, [state, close]);

  const set = (key: keyof typeof initial, value: string) => setValues((current) => ({ ...current, [key]: value }));

  type ListKey = keyof typeof lists;
  const setList = (key: ListKey) => (items: string[]) => setLists((current) => ({ ...current, [key]: items }));

  // Add one of the person's own journal titles as a pill, unless it is already there.
  function addFromJournal(key: ListKey, text: string) {
    if (lists[key].some((item) => item.toLowerCase() === text.toLowerCase())) return;
    setList(key)([...lists[key], text]);
  }

  // The one-tap "from your journal" buttons under a field.
  const journalChips = (key: ListKey, titles: string[]) =>
    titles.length > 0 && (
      <div className="mt-2">
        <p className="mb-1 text-xs text-slate-500">Add from your journal:</p>
        <ul className="flex flex-wrap gap-1.5">
          {titles.map((title) => (
            <li key={title}>
              <button
                type="button"
                onClick={() => addFromJournal(key, title)}
                className="rounded-full border border-slate-300 bg-white px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50"
              >
                + {title.length > 40 ? `${title.slice(0, 40)}…` : title}
              </button>
            </li>
          ))}
        </ul>
      </div>
    );

  // What is offered while typing: the common answers plus the person's own journal titles.
  const withJournal = (common: string[], titles: string[]) => [...new Set([...common, ...titles])];

  return (
    <DrawerFormLayout
      action={formAction}
      pending={pending}
      error={state?.error}
      submitLabel={hasPassport ? "Save changes" : "Create passport"}
      pendingLabel="Saving…"
    >
      <fieldset>
        <legend className="label">Sex</legend>
        <div className="flex gap-2">
          {SEXES.map((sex) => (
            <label
              key={sex}
              className={`cursor-pointer select-none rounded-full border px-4 py-2 text-sm font-medium has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-teal-600/40 ${
                values.sex === sex ? "border-teal-700 bg-teal-700 text-white" : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
              }`}
            >
              <input
                type="radio"
                name="sex"
                value={sex}
                checked={values.sex === sex}
                onChange={() => set("sex", sex)}
                required
                className="sr-only"
              />
              {sexLabel(sex)}
            </label>
          ))}
        </div>
      </fieldset>

      <HealthBasics values={values} onChange={set} today={today} dobRequired />

      <TagInput
        name="allergies"
        label="Allergies (optional)"
        items={lists.allergies}
        onChange={setList("allergies")}
        suggestions={ALLERGY_SUGGESTIONS}
        placeholder="Type an allergy, then press Enter"
        maxLength={MAX_PASSPORT_TEXT}
      >
        <p className="mt-2 text-xs text-slate-500">Emergency staff look at this first. If you have none, add &quot;None known&quot;. If you&apos;re not sure, leave it empty: the card will say &quot;not provided&quot;, never &quot;none&quot;.</p>
      </TagInput>

      <TagInput
        name="chronicConditions"
        label="Ongoing conditions (optional)"
        items={lists.chronicConditions}
        onChange={setList("chronicConditions")}
        suggestions={withJournal(CHRONIC_CONDITION_SUGGESTIONS, suggestions.diagnoses)}
        placeholder="Type a condition, then press Enter"
        maxLength={MAX_PASSPORT_TEXT}
      >
        <p className="mt-2 text-xs text-slate-500">Nothing to add? Add &quot;None&quot;. You don&apos;t need any journal entries to fill this in.</p>
        {journalChips("chronicConditions", suggestions.diagnoses)}
      </TagInput>

      <TagInput
        name="currentMedications"
        label="Medicines you take regularly (optional)"
        items={lists.currentMedications}
        onChange={setList("currentMedications")}
        suggestions={withJournal(MEDICATION_SUGGESTIONS, suggestions.medications)}
        placeholder="Type a medicine, then press Enter"
        maxLength={MAX_PASSPORT_TEXT}
      >
        <p className="mt-2 text-xs text-slate-500">Nothing regular? Add &quot;None&quot;.</p>
        {journalChips("currentMedications", suggestions.medications)}
      </TagInput>

      <EmergencyContactFields values={values} onChange={set} />
    </DrawerFormLayout>
  );
}
