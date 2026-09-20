"use client";

import { useActionState, useEffect, useId, useRef, useState } from "react";
import Photo from "@/components/Photo";
import { ACCEPTED_IMAGE_TYPES, MAX_IMAGES_PER_ENTRY, MAX_UPLOAD_BYTES } from "@/lib/attachments";
import { shrinkImage } from "@/lib/shrink-image";
import { TAGS, type Tag } from "@/lib/tags";
import type { EntryFormState } from "@/app/entries/actions";

type ExistingImage = { id: string; fileName: string };
type NewImage = { key: string; file: File; url: string };

type Props = {
  action: (prev: EntryFormState, formData: FormData) => Promise<EntryFormState>;
  initial: { date: string; title: string; body: string; tags: Tag[] };
  // Images the entry already has (edit only).
  existingImages?: ExistingImage[];
  submitLabel: string;
  onCancel: () => void; // closes the drawer
};

// Used by both "New entry" and "Edit entry", inside the slide-in drawer.
// Fields are controlled (kept in state) so nothing is lost if the server sends back an error.
export default function EntryForm({
  action,
  initial,
  existingImages = [],
  submitLabel,
  onCancel,
}: Props) {
  const [state, formAction, pending] = useActionState(action, undefined);
  const id = useId(); // keeps field ids unique when two entry forms are on the page
  const [date, setDate] = useState(initial.date);
  const [title, setTitle] = useState(initial.title);
  const [body, setBody] = useState(initial.body);
  const [tags, setTags] = useState<Tag[]>(initial.tags);
  const [removedIds, setRemovedIds] = useState<string[]>([]);
  const [newImages, setNewImages] = useState<NewImage[]>([]);
  const [imageError, setImageError] = useState("");

  // Free the browser's preview URLs when the form goes away.
  const previewUrls = useRef<string[]>([]);
  useEffect(() => {
    const urls = previewUrls.current;
    return () => urls.forEach((url) => URL.revokeObjectURL(url));
  }, []);

  const keptImages = existingImages.filter((image) => !removedIds.includes(image.id));
  const imageCount = keptImages.length + newImages.length;

  function toggleTag(tag: Tag) {
    setTags((current) => (current.includes(tag) ? current.filter((t) => t !== tag) : [...current, tag]));
  }

  async function handleImagesChosen(event: React.ChangeEvent<HTMLInputElement>) {
    const chosen = Array.from(event.target.files ?? []);
    event.target.value = ""; // so choosing the same photo again still works
    if (chosen.length === 0) return;

    setImageError("");
    const supported = chosen.filter((file) => ACCEPTED_IMAGE_TYPES.includes(file.type));
    const room = MAX_IMAGES_PER_ENTRY - imageCount;
    const accepted = supported.slice(0, Math.max(room, 0));

    if (supported.length < chosen.length) setImageError("Only JPG, PNG or WebP photos can be added.");
    else if (accepted.length < supported.length) setImageError(`You can add up to ${MAX_IMAGES_PER_ENTRY} images to one entry.`);

    // All the photos in one save must fit under the upload limit (checked again on the server).
    let total = newImages.reduce((sum, image) => sum + image.file.size, 0);
    const fits: File[] = [];
    for (const file of await Promise.all(accepted.map(shrinkImage))) {
      if (total + file.size > MAX_UPLOAD_BYTES) {
        setImageError("That is more than 4 MB of photos for one save. Try fewer or smaller photos.");
        continue;
      }
      total += file.size;
      fits.push(file);
    }
    const added = fits.map((file, index) => {
      const url = URL.createObjectURL(file);
      previewUrls.current.push(url);
      return { key: `${Date.now()}-${index}-${file.name}`, file, url };
    });
    setNewImages((current) => [...current, ...added]);
  }

  function removeNewImage(image: NewImage) {
    URL.revokeObjectURL(image.url);
    setNewImages((current) => current.filter((i) => i.key !== image.key));
    setImageError("");
  }

  // The chosen photos are kept in state (already shrunk), so add them to the form data here.
  function submit(formData: FormData) {
    newImages.forEach(({ file }) => formData.append("images", file));
    return formAction(formData);
  }

  const errorMessage = state?.error && <p className="form-error" role="alert">{state.error}</p>;

  const removeButton = (label: string, onClick: () => void) => (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="absolute right-1 top-1 flex size-7 items-center justify-center rounded-full bg-slate-900/70 text-lg leading-none text-white hover:bg-slate-900"
    >
      ×
    </button>
  );

  return (
    <form action={submit} className="flex min-h-0 flex-1 flex-col">
      {/* Only the fields scroll; the buttons below stay fixed in view. */}
      <div className="flex-1 space-y-5 overflow-y-auto p-4">
        <div>
          <label htmlFor={`${id}-date`} className="label">Date</label>
          <input
            id={`${id}-date`}
            name="date"
            type="date"
            required
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="input"
          />
        </div>

        <div>
          <label htmlFor={`${id}-title`} className="label">Title</label>
          <input
            id={`${id}-title`}
            name="title"
            type="text"
            required
            maxLength={150}
            placeholder="e.g. Malaria test at General Hospital"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="input"
          />
        </div>

        <fieldset>
          <legend className="label">What kind of note is this? (pick any)</legend>
          <div className="flex flex-wrap gap-2">
            {TAGS.map((tag) => {
              const selected = tags.includes(tag);
              return (
                <label
                  key={tag}
                  className={`cursor-pointer select-none rounded-full border px-3.5 py-2 text-sm font-medium has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-teal-600/40 ${
                    selected
                      ? "border-teal-700 bg-teal-700 text-white"
                      : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <input
                    type="checkbox"
                    name="tags"
                    value={tag}
                    checked={selected}
                    onChange={() => toggleTag(tag)}
                    className="sr-only"
                  />
                  {tag}
                </label>
              );
            })}
          </div>
        </fieldset>

        <div>
          <label htmlFor={`${id}-body`} className="label">Details</label>
          <textarea
            id={`${id}-body`}
            name="body"
            rows={5}
            placeholder="What happened? Doctor's advice, medicines, how you felt…"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            className="input"
          />
          <p className="mt-1.5 text-xs text-slate-500">
            Tip: use **bold**, *italic*, or start lines with - to make a list.
          </p>
        </div>

        <div>
          <p className="label">Supporting images (optional)</p>
          <p className="mb-2 text-xs text-slate-500">
            Photos of a lab result, prescription or doctor&apos;s note. Up to {MAX_IMAGES_PER_ENTRY}, 4 MB in total each time you save.
          </p>
          {imageError && <p className="form-error mb-2" role="alert">{imageError}</p>}

          {/* Tells the server which existing images to delete. */}
          {removedIds.map((id) => (
            <input key={id} type="hidden" name="removeAttachment" value={id} />
          ))}

          <ul className="grid grid-cols-3 gap-2">
            {keptImages.map((image) => (
              <li key={image.id} className="relative aspect-square overflow-hidden rounded-xl border border-slate-200 bg-white">
                <Photo src={`/api/attachments/${image.id}`} alt={image.fileName} className="size-full object-cover" />
                {removeButton(`Remove ${image.fileName}`, () => setRemovedIds((current) => [...current, image.id]))}
              </li>
            ))}
            {newImages.map((image) => (
              <li key={image.key} className="relative aspect-square overflow-hidden rounded-xl border border-slate-200 bg-white">
                <Photo src={image.url} alt={image.file.name} className="size-full object-cover" />
                {removeButton(`Remove ${image.file.name}`, () => removeNewImage(image))}
              </li>
            ))}
            {imageCount < MAX_IMAGES_PER_ENTRY && (
              <li>
                <label className="flex aspect-square cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-slate-300 bg-white text-sm font-medium text-slate-600 hover:bg-slate-50 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-teal-600/40">
                  <span className="text-2xl leading-none">+</span>
                  Add photo
                  <input
                    type="file"
                    accept={ACCEPTED_IMAGE_TYPES.join(",")}
                    multiple
                    onChange={handleImagesChosen}
                    className="sr-only"
                  />
                </label>
              </li>
            )}
          </ul>
        </div>
      </div>

      <div className="space-y-3 border-t border-slate-200 bg-white p-4">
        {errorMessage}
        <div className="flex justify-end gap-3">
          <button type="button" onClick={onCancel} className="btn-secondary">Cancel</button>
          <button type="submit" disabled={pending} className="btn-primary">
            {pending ? "Saving…" : submitLabel}
          </button>
        </div>
      </div>
    </form>
  );
}
