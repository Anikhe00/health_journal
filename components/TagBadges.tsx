import { TAG_STYLES, type Tag } from "@/lib/tags";

export default function TagBadges({ tags }: { tags: Tag[] }) {
  if (tags.length === 0) return null;

  return (
    <ul className="flex flex-wrap gap-1.5">
      {tags.map((tag) => (
        <li key={tag} className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${TAG_STYLES[tag]}`}>
          {tag}
        </li>
      ))}
    </ul>
  );
}
