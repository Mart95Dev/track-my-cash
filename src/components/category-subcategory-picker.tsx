"use client";

import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface Rule {
  pattern: string;
  category: string;
}

export function CategorySubcategoryPicker({
  rules,
  defaultCategory,
  defaultSubcategory,
  idPrefix = "cat",
}: {
  rules: Rule[];
  defaultCategory?: string;
  defaultSubcategory?: string;
  idPrefix?: string;
}) {
  const broadCategories = [...new Set(rules.map((r) => r.category))].sort();

  const initial = defaultCategory && broadCategories.includes(defaultCategory)
    ? defaultCategory
    : broadCategories[0] ?? "Autre";

  const [selectedCategory, setSelectedCategory] = useState(initial);
  const [subcategory, setSubcategory] = useState(defaultSubcategory ?? "");

  const patternsForCategory = rules
    .filter((r) => r.category === selectedCategory)
    .map((r) => r.pattern)
    .sort();

  const datalistId = `${idPrefix}-subcategory-options`;

  function handleCategoryChange(cat: string) {
    setSelectedCategory(cat);
    // Réinitialiser la sous-catégorie si elle n'appartient plus à la nouvelle catégorie
    const stillValid = rules.some((r) => r.category === cat && r.pattern === subcategory);
    if (!stillValid) setSubcategory("");
  }

  return (
    <div className="grid grid-cols-2 gap-3">
      <div className="space-y-2">
        <Label htmlFor={`${idPrefix}-category`}>Catégorie</Label>
        <select
          id={`${idPrefix}-category`}
          name="category"
          value={selectedCategory}
          onChange={(e) => handleCategoryChange(e.target.value)}
          className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm"
        >
          {broadCategories.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
          {!broadCategories.includes("Autre") && (
            <option value="Autre">Autre</option>
          )}
        </select>
      </div>

      <div className="space-y-2">
        <Label htmlFor={`${idPrefix}-subcategory`}>
          Sous-catégorie <span className="text-xs text-muted-foreground">(optionnel)</span>
        </Label>
        {patternsForCategory.length > 0 && (
          <datalist id={datalistId}>
            {patternsForCategory.map((p) => (
              <option key={p} value={p} />
            ))}
          </datalist>
        )}
        <Input
          id={`${idPrefix}-subcategory`}
          name="subcategory"
          list={patternsForCategory.length > 0 ? datalistId : undefined}
          value={subcategory}
          onChange={(e) => setSubcategory(e.target.value)}
          placeholder={patternsForCategory.length > 0 ? "Choisir ou saisir…" : "Saisir librement…"}
          autoComplete="off"
        />
      </div>
    </div>
  );
}
