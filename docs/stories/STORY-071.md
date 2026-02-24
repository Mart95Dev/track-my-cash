# STORY-071 — Pages Marketing : Landing Page + Tarifs

**Sprint :** Design Stitch (v10)
**Épique :** marketing-ui
**Priorité :** P1
**Complexité :** M (3 points)
**Statut :** pending
**Bloqué par :** STORY-068

---

## Description

Refonte des 2 pages marketing publiques selon les maquettes Stitch. La Landing Page passe d'une mise en page simple à un design moderne avec 6 sections distinctes, une Sticky CTA en bas, et un footer. La page Tarifs intègre un nouveau système de cards plans avec le plan Pro mis visuellement en avant et un tableau comparatif complet.

**Logique préservée :** `PLANS` config Stripe, `<SubscribeButton>`, métadonnées SEO, plan actuel de l'utilisateur.

---

## Acceptance Criteria

- **AC-1 :** La Landing Page affiche 6 sections dans l'ordre : Navbar → Hero → Features → Pricing → Sticky CTA → Footer
- **AC-2 :** Le Hero contient : badge pill "✨", titre 4xl, sous-titre, 2 boutons (S'inscrire bg-primary, En savoir plus border)
- **AC-3 :** Les 6 feature cards utilisent des icônes Material Symbols dans un cercle `bg-indigo-50`
- **AC-4 :** Le plan Pro est visuellement mis en avant : `border-2 border-primary`, badge "Populaire" absolu, `scale-105`
- **AC-5 :** La Sticky CTA bottom est positionnée `sticky bottom-0` et reste visible lors du scroll
- **AC-6 :** La page Tarifs affiche 3 cards plans + tableau comparatif 12 features
- **AC-7 :** Les `<SubscribeButton>` Stripe fonctionnent (logique préservée)
- **AC-8 :** Les métadonnées SEO (title, description, OpenGraph) sont préservées
- **AC-9 :** `npm run build` passe sans erreur

---

## Fichiers à créer / modifier

| Fichier | Action | Détail |
|---------|--------|--------|
| `src/app/[locale]/(marketing)/page.tsx` | MODIFIER | Refonte complète 6 sections |
| `src/app/[locale]/(marketing)/tarifs/page.tsx` | MODIFIER | Cards plans + tableau comparatif |
| `src/app/[locale]/(marketing)/layout.tsx` | VÉRIFIER | Navbar/Footer à adapter si nécessaire |

---

## Structure Landing Page

### Navbar (sticky)
```tsx
<nav className="sticky top-0 z-50 bg-background-light/80 backdrop-blur-md border-b border-slate-200">
  <div className="max-w-5xl mx-auto flex items-center justify-between px-4 h-14">
    <span className="text-text-main text-lg font-bold">Track My Cash</span>
    <Link href="/connexion" className="text-primary font-bold hover:opacity-80">Connexion</Link>
  </div>
</nav>
```

### Hero
```tsx
<header className="px-4 py-10">
  <div className="inline-flex items-center gap-2 rounded-full bg-indigo-50 text-primary px-3 py-1 text-xs font-bold mb-4">
    ✨ Nouvelle version 2.0 disponible
  </div>
  <h1 className="text-4xl font-extrabold text-text-main tracking-tight leading-tight">
    Prenez le contrôle de vos finances
  </h1>
  <p className="text-text-muted text-lg font-medium mt-3 leading-relaxed">
    Suivez vos dépenses, planifiez votre budget et atteignez vos objectifs financiers.
  </p>
  <div className="flex flex-col sm:flex-row gap-3 mt-6">
    <Link href="/inscription" className="flex items-center justify-center h-12 px-6 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/20">
      Commencer gratuitement
    </Link>
    <Link href="/tarifs" className="flex items-center justify-center h-12 px-6 border-2 border-slate-200 text-text-main font-bold rounded-xl hover:border-primary hover:text-primary transition-colors">
      En savoir plus
    </Link>
  </div>
</header>
```

### 6 Feature Cards
```typescript
const FEATURES = [
  { icon: "account_balance_wallet", title: "Multi-comptes", desc: "Centralisez tous vos comptes bancaires." },
  { icon: "file_download",          title: "Import CSV",     desc: "Importez votre historique depuis n'importe quelle banque." },
  { icon: "autorenew",              title: "Paiements récurrents", desc: "Suivez vos abonnements et échéances." },
  { icon: "trending_up",            title: "Tendances",      desc: "Visualisez l'évolution de vos dépenses." },
  { icon: "auto_awesome",           title: "IA intégrée",    desc: "Recevez des conseils personnalisés." },
  { icon: "language",               title: "Multilingue",    desc: "5 langues disponibles." },
];
```

```tsx
<section className="py-10 px-4">
  <h2 className="text-2xl font-bold text-text-main mb-2">Tout ce dont vous avez besoin</h2>
  <p className="text-text-muted mb-8">Gérez votre argent comme un pro.</p>
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
    {FEATURES.map((f) => (
      <div key={f.icon} className="flex flex-col gap-4 rounded-2xl border border-slate-100 bg-white p-5 shadow-soft hover:shadow-md transition-shadow">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-primary">
          <span className="material-symbols-outlined" style={{fontSize: "28px"}}>{f.icon}</span>
        </div>
        <div>
          <h3 className="text-text-main font-bold">{f.title}</h3>
          <p className="text-text-muted text-sm mt-1">{f.desc}</p>
        </div>
      </div>
    ))}
  </div>
</section>
```

### Section Pricing (3 plans)
```tsx
{/* Plan Pro — mis en avant */}
<div className="relative p-6 bg-white rounded-2xl border-2 border-primary shadow-xl shadow-primary/10 lg:scale-105 z-10">
  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-white text-xs font-bold px-3 py-1 rounded-full uppercase">
    Populaire
  </div>
  {/* ... */}
</div>
```

### Sticky CTA Bottom
```tsx
<div className="sticky bottom-0 w-full bg-white border-t border-slate-200 p-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-40">
  <div className="max-w-2xl mx-auto flex items-center justify-between gap-4">
    <p className="hidden sm:block font-bold text-text-main">Prêt à reprendre le contrôle ?</p>
    <Link href="/inscription" className="w-full sm:w-auto h-14 px-8 rounded-xl bg-primary text-white font-bold text-lg shadow-xl shadow-primary/20 flex items-center justify-center">
      Créer mon compte
    </Link>
  </div>
</div>
```

---

## Structure Page Tarifs

### 3 cartes plans
```typescript
const PLANS_DISPLAY = [
  { id: "free",    name: "Gratuit",  price: "0€",     period: "/mois",  popular: false },
  { id: "pro",     name: "Pro",      price: "4,99€",  period: "/mois",  popular: true  },
  { id: "premium", name: "Premium",  price: "9,99€",  period: "/mois",  popular: false },
];
```

### Tableau comparatif (12 features)
```typescript
type FeatureRow = {
  label: string;
  free: string | boolean;
  pro: string | boolean;
  premium: string | boolean;
};

const COMPARISON_FEATURES: FeatureRow[] = [
  { label: "Comptes bancaires",       free: "1",        pro: "∞",         premium: "∞" },
  { label: "Historique",              free: "3 mois",   pro: "∞",         premium: "∞" },
  { label: "Import CSV/XLSX/PDF",     free: "Basique",  pro: "Complet",   premium: "Complet" },
  { label: "Catégorisation auto IA",  free: false,      pro: true,        premium: true },
  { label: "Export CSV",              free: false,      pro: true,        premium: true },
  { label: "Conseiller IA",           free: false,      pro: "10/mois",   premium: "Illimité" },
  { label: "IA multi-modèles",        free: false,      pro: false,       premium: true },
  { label: "Export PDF mensuel",      free: false,      pro: true,        premium: true },
  { label: "Objectifs d'épargne",     free: false,      pro: true,        premium: true },
  { label: "Email récap hebdo",       free: false,      pro: true,        premium: true },
  { label: "Rapport annuel IA",       free: false,      pro: false,       premium: true },
  { label: "Support prioritaire",     free: false,      pro: false,       premium: true },
];
```

Cellule de feature :
```tsx
function FeatureCell({ value }: { value: string | boolean }) {
  if (value === false) return <span className="material-symbols-outlined text-slate-300 text-[20px]">cancel</span>;
  if (value === true) return <span className="material-symbols-outlined text-primary text-[20px]">check_circle</span>;
  return <span className="text-sm font-medium text-text-main">{value}</span>;
}
```

---

## Tests unitaires (TU-x)

**Fichier :** `tests/unit/pages/marketing-pages.test.tsx`

| ID | Description | Résultat attendu |
|----|-------------|-----------------|
| TU-71-1 | Landing Page : titre hero présent | `getByRole('heading', { level: 1 })` présent |
| TU-71-2 | Landing Page : 6 feature cards | `getAllByRole('heading', { level: 3 }).length >= 6` |
| TU-71-3 | Landing Page : bouton "Commencer gratuitement" avec lien `/inscription` | href correct |
| TU-71-4 | Tarifs : titre "Gratuit" présent | `getByText("Gratuit")` |
| TU-71-5 | Tarifs : titre "Pro" présent | `getByText("Pro")` |
| TU-71-6 | Tarifs : titre "Premium" présent | `getByText("Premium")` |
| TU-71-7 | `FeatureCell` avec `true` affiche `check_circle` | rendu `check_circle` dans le DOM |
| TU-71-8 | `FeatureCell` avec `false` affiche `cancel` | rendu `cancel` dans le DOM |
| TU-71-9 | `FeatureCell` avec string affiche la string | `getByText("10/mois")` |

---

## Mapping AC → Tests

| AC | Tests couvrant |
|----|---------------|
| AC-1 | TU-71-1 |
| AC-2 | TU-71-1, TU-71-3 |
| AC-3 | TU-71-2 |
| AC-4 | Inspection visuelle badge "Populaire" |
| AC-5 | Inspection CSS sticky |
| AC-6 | TU-71-4, TU-71-5, TU-71-6 |
| AC-7 | Intégration `<SubscribeButton>` |
| AC-8 | Vérification export generateMetadata |
| AC-9 | `npm run build` |

---

## Notes d'implémentation

1. **Navbar/Footer** : si `(marketing)/layout.tsx` inclut déjà Navbar et Footer, ne pas les dupliquer dans `page.tsx`
2. **`FeatureCell`** : composant pur — peut être un simple helper dans le fichier `tarifs/page.tsx`
3. **Plan actuel** : récupérer le plan via `getUserPlanId(userId)` pour afficher le badge "Plan actuel" et désactiver le bouton correspondant — logique déjà présente à préserver
4. **Sticky CTA** : doit avoir un `mb` sur le footer pour que la CTA sticky ne chevauche pas le footer
5. **Images hero** : ne pas inclure d'images statiques fictives — utiliser uniquement du texte et des icônes
