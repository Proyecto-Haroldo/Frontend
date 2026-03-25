import { useEffect, useState } from "react";
import { ICategory } from "../../../../core/models/questionnaire";
import { Search } from "lucide-react";

interface Props {
  name: string;
  categories: ICategory[];
  value: number[]; // ids seleccionados
  onChange: (selected: number[]) => void;
}

const SelectCategories: React.FC<Props> = ({
  name,
  categories,
  value,
  onChange,
}) => {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<number[]>(value);

  useEffect(() => {
    setSelected(value);
  }, [value]);

  const normalize = (str: string) =>
    str
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9\s]/gi, "")
      .trim();

  const handleToggle = (id: number) => {
    const updated = selected.includes(id)
      ? selected.filter((i) => i !== id)
      : [...selected, id];

    setSelected(updated);
    onChange(updated);
  };

  const filtered = categories.filter((cat) => {
    const normalizedTitle = normalize(cat.name);
    const normalizedSearch = normalize(search);

    if (!normalizedSearch) return true;

    const words = normalizedSearch.split(" ");
    return words.every((word) => normalizedTitle.includes(word));
  });

  // seleccionados primero
  filtered.sort((a, b) => {
    const aSel = selected.includes(a.id);
    const bSel = selected.includes(b.id);
    return aSel === bSel ? 0 : aSel ? -1 : 1;
  });

  return (
    <div className="w-full flex flex-col gap-3">
      <div className="relative mb-1">
        <div className="absolute inset-y-0 z-2 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-base-content/50" />
        </div>
        {/* Search */}
        <input
          type="text"
          title={name}
          placeholder="Busca una categoría..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input input-bordered w-full pl-10"
        />
      </div>

      {/* Options */}
      <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto pr-1">
        {filtered.map((cat) => {
          const active = selected.includes(cat.id);

          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => handleToggle(cat.id)}
              className={`
                flex items-center justify-between gap-2
                px-3 py-1 rounded-full text-sm border transition
                min-w-[100px] opacity-70
                ${active
                  ? "bg-primary/60 border-transparent opacity-90"
                  : "border-base-content/50"}
                hover:opacity-100
              `}
            >
              {cat.name}
              <span className="font-normal">
                {active ? "✕" : "+"}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default SelectCategories;