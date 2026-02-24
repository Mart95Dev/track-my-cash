# STORY-077 — Page Conseiller IA : Refonte chat mobile

**Sprint :** Design Stitch (v10)
**Épique :** app-ui
**Priorité :** P3
**Complexité :** M (2 points)
**Statut :** pending
**Bloqué par :** STORY-069

---

## Description

Refonte de la page `/conseiller` pour adopter le design chat mobile de la maquette Stitch. Les messages passent à des bulles gauche (IA, bg-white) / droite (utilisateur, bg-primary). Les chips de suggestions deviennent un scroll horizontal de pills en bas. L'input est positionné juste au-dessus de la BottomNav.

**Logique préservée :** `AiChat` (Vercel AI SDK streaming), `generateChatSuggestions()`, `ToolResultCard`, `canUseAI()`.

---

## Acceptance Criteria

- **AC-1 :** Messages IA : bulle gauche, `bg-white rounded-2xl rounded-tl-sm shadow-soft`
- **AC-2 :** Messages utilisateur : bulle droite, `bg-primary text-white rounded-2xl rounded-tr-sm`
- **AC-3 :** Chips suggestions : scroll horizontal, `bg-indigo-50 text-primary rounded-full px-4 py-2 text-sm font-medium`
- **AC-4 :** Input positionné `fixed bottom-16` (au-dessus de la BottomNav h-16), `rounded-full`
- **AC-5 :** Bouton envoi : `bg-primary rounded-full` avec icône `send`
- **AC-6 :** État vide : icône `smart_toy` centré + texte invite + chips suggestions
- **AC-7 :** `ToolResultCards` s'affichent correctement dans le flux de messages
- **AC-8 :** Le guard `canUseAI()` est préservé (redirection / message d'erreur si plan insuffisant)
- **AC-9 :** `npm run build` passe sans erreur TypeScript

---

## Fichiers à créer / modifier

| Fichier | Action | Détail |
|---------|--------|--------|
| `src/components/ai-chat.tsx` | MODIFIER | Adapter les classes CSS des bulles et input |
| `src/app/[locale]/(app)/conseiller/page.tsx` | MODIFIER | Header + chips suggestions style |

---

## Design bulles messages

```tsx
// Dans ai-chat.tsx — rendu d'un message
function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === "user";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} mb-4`}>
      {!isUser && (
        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary mr-2 shrink-0 self-end">
          <span className="material-symbols-outlined text-[18px]">smart_toy</span>
        </div>
      )}
      <div className={`max-w-[80%] px-4 py-3 ${
        isUser
          ? "bg-primary text-white rounded-2xl rounded-tr-sm shadow-lg shadow-primary/20"
          : "bg-white text-text-main rounded-2xl rounded-tl-sm shadow-soft border border-gray-100"
      }`}>
        <p className="text-sm leading-relaxed">{message.content}</p>
      </div>
    </div>
  );
}
```

## Design input zone

```tsx
{/* Input fixe au-dessus de BottomNav */}
<div className="fixed bottom-16 left-0 right-0 z-40 bg-background-light/80 backdrop-blur-md border-t border-gray-100 p-3">
  <div className="max-w-md mx-auto flex items-center gap-2">
    <input
      type="text"
      value={input}
      onChange={handleInputChange}
      placeholder="Posez votre question..."
      className="flex-1 rounded-full bg-white border border-gray-200 py-3 px-5 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
      onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSubmit(e)}
    />
    <button
      type="submit"
      disabled={isLoading || !input.trim()}
      className="w-11 h-11 rounded-full bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/20 disabled:opacity-50 transition-all"
    >
      <span className="material-symbols-outlined text-[20px]">send</span>
    </button>
  </div>
</div>
```

## Design chips suggestions

```tsx
{/* Chips suggestions — scroll horizontal */}
<div className="flex gap-2 overflow-x-auto no-scrollbar pb-2 px-4">
  {suggestions.map((suggestion, i) => (
    <button
      key={i}
      onClick={() => { setInput(suggestion); }}
      className="shrink-0 bg-indigo-50 text-primary rounded-full px-4 py-2 text-sm font-medium hover:bg-primary hover:text-white transition-colors"
    >
      {suggestion}
    </button>
  ))}
</div>
```

## Design état vide

```tsx
{messages.length === 0 && (
  <div className="flex flex-col items-center justify-center flex-1 px-6 py-12 text-center">
    <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-6">
      <span className="material-symbols-outlined" style={{fontSize: "40px"}}>smart_toy</span>
    </div>
    <h2 className="text-xl font-bold text-text-main mb-2">Conseiller IA</h2>
    <p className="text-text-muted text-sm mb-6">
      Posez vos questions sur vos finances. Je les analyse pour vous donner des conseils personnalisés.
    </p>
    <div className="flex flex-wrap gap-2 justify-center">
      {suggestions.slice(0, 3).map((s, i) => (
        <button key={i} onClick={() => setInput(s)}
          className="bg-indigo-50 text-primary rounded-full px-4 py-2 text-sm font-medium"
        >
          {s}
        </button>
      ))}
    </div>
  </div>
)}
```

## Header page Conseiller

```tsx
<header className="flex items-center justify-between px-4 pt-6 pb-4">
  <div className="flex items-center gap-3">
    <span className="material-symbols-outlined text-primary text-[28px]">smart_toy</span>
    <h1 className="text-xl font-bold text-text-main">Conseiller IA</h1>
  </div>
  <span className={`text-xs font-bold rounded-full px-3 py-1 ${
    isPremium ? "bg-primary text-white" : "bg-indigo-50 text-primary"
  }`}>
    {isPremium ? "Premium" : "Pro"}
  </span>
</header>
```

---

## Tests unitaires (TU-x)

**Fichier :** `tests/unit/components/ai-chat-design.test.tsx`

| ID | Description | Résultat attendu |
|----|-------------|-----------------|
| TU-77-1 | Message utilisateur → classes bg-primary text-white | présentes |
| TU-77-2 | Message IA → classes bg-white text-text-main | présentes |
| TU-77-3 | Chips suggestions rendues | `getAllByRole('button').length >= suggestions.length` |
| TU-77-4 | Clic chip → input pré-rempli | `input.value === suggestion` |
| TU-77-5 | État vide → icône smart_toy affichée | `getByText('smart_toy')` |

---

## Mapping AC → Tests

| AC | Tests couvrant |
|----|---------------|
| AC-1 | TU-77-2 |
| AC-2 | TU-77-1 |
| AC-3 | TU-77-3 |
| AC-4 | Code review position CSS |
| AC-5 | Code review bouton send |
| AC-6 | TU-77-5 |
| AC-7 | Code review ToolResultCard |
| AC-8 | Code review guard canUseAI |
| AC-9 | `npm run build` |

---

## Notes d'implémentation

1. **`pb-36`** sur la zone messages : prévoir espace pour input fixe (h-16 BottomNav + h-16 input zone)
2. **Scroll automatique** : `useEffect` avec `scrollIntoView` sur le dernier message — déjà implémenté, préserver
3. **Streaming** : les messages streamés s'affichent dans la bulle IA avec un curseur animé — préserver le comportement existant de l'AI SDK
4. **Consensus multi-modèles** (Premium) : afficher dans une card `ToolResultCard` ou via `<details>` accordéon — déjà implémenté, préserver
5. **`canUseAI`** : si non autorisé, afficher un état d'upgrade plutôt que de masquer la page entière
