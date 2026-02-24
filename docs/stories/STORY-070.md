# STORY-070 — Pages Auth : Connexion, Inscription, Compte suspendu

**Sprint :** Design Stitch (v10)
**Épique :** auth-ui
**Priorité :** P1
**Complexité :** M (3 points)
**Statut :** pending
**Bloqué par :** STORY-068

---

## Description

Refonte complète des 3 pages d'authentification selon les maquettes Stitch. Le design passe d'une card shadcn/ui classique centrée à un formulaire pleine page épuré avec logo TMC, icônes Material Symbols dans les inputs, et hiérarchie typographique forte.

La **logique fonctionnelle existante est préservée intégralement** : `authClient.signIn.email()`, `authClient.signUp.email()`, `sendWelcomeEmailAction`, `createTrialSubscriptionAction`, redirections, gestion d'erreurs.

---

## Acceptance Criteria

- **AC-1 :** La page Connexion affiche logo TMC (icône wallet dans carré primary/10) + titre "Bon retour !"
- **AC-2 :** Les inputs Connexion ont les icônes `mail` et `lock` à gauche (Material Symbols), icône visibility toggle
- **AC-3 :** La page Inscription affiche 3 champs (nom/email/mot de passe) avec icônes `person`, `mail`, `lock`
- **AC-4 :** La logique `authClient.signIn` / `authClient.signUp` est préservée (pas de régression fonctionnelle)
- **AC-5 :** Les états loading (bouton disabled + spinner) et erreur s'affichent correctement
- **AC-6 :** La page Compte suspendu affiche l'icône `warning` (FILL=1, 64px) + card alerte + 2 étapes + bouton retour
- **AC-7 :** Les pages sont centrées `max-w-[400px] mx-auto` sur fond `bg-background-light`
- **AC-8 :** `npm run build` passe sans erreur TypeScript

---

## Fichiers à créer / modifier

| Fichier | Action | Détail |
|---------|--------|--------|
| `src/app/[locale]/(auth)/connexion/page.tsx` | MODIFIER | Refonte complète UI |
| `src/app/[locale]/(auth)/inscription/page.tsx` | MODIFIER | Refonte complète UI |
| `src/app/[locale]/compte-suspendu/page.tsx` | MODIFIER | Refonte complète UI |

---

## Design Connexion

```tsx
// Structure JSX cible
<div className="min-h-screen bg-background-light flex items-center justify-center p-6">
  <div className="w-full max-w-[400px] flex flex-col gap-8">

    {/* Logo */}
    <div className="flex flex-col items-center gap-3">
      <div className="flex items-center justify-center size-20 rounded-2xl bg-primary/10 text-primary">
        <span className="material-symbols-outlined" style={{fontSize: "48px"}}>account_balance_wallet</span>
      </div>
      <span className="text-primary text-2xl font-bold">TMC</span>
    </div>

    {/* Titre */}
    <div className="text-center">
      <h1 className="text-3xl font-extrabold text-text-main tracking-tight">Bon retour !</h1>
      <p className="text-text-muted text-base mt-1">Connectez-vous pour gérer vos finances</p>
    </div>

    {/* Formulaire */}
    <form className="flex flex-col gap-5">
      {/* Input Email avec icône */}
      <div className="space-y-2 group">
        <label className="text-sm font-semibold text-text-main ml-1">Email</label>
        <div className="relative flex items-center">
          <span className="absolute left-4 material-symbols-outlined text-text-muted group-focus-within:text-primary transition-colors">mail</span>
          <input
            type="email"
            className="w-full rounded-xl border-0 py-4 pl-12 pr-4 bg-white ring-1 ring-slate-200 focus:ring-2 focus:ring-primary text-text-main placeholder:text-text-muted"
            placeholder="votre@email.com"
          />
        </div>
      </div>

      {/* Input Password avec icône + toggle visibility */}
      <div className="space-y-2 group">
        <label className="text-sm font-semibold text-text-main ml-1">Mot de passe</label>
        <div className="relative flex items-center">
          <span className="absolute left-4 material-symbols-outlined text-text-muted group-focus-within:text-primary transition-colors">lock</span>
          <input
            type={showPassword ? "text" : "password"}
            className="w-full rounded-xl border-0 py-4 pl-12 pr-12 bg-white ring-1 ring-slate-200 focus:ring-2 focus:ring-primary"
            placeholder="••••••••"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 material-symbols-outlined text-text-muted hover:text-text-main"
          >
            {showPassword ? "visibility_off" : "visibility"}
          </button>
        </div>
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-4 rounded-xl shadow-lg shadow-primary/20 flex items-center justify-center gap-2 mt-2"
      >
        {loading ? <Spinner /> : <>Se connecter <span className="material-symbols-outlined text-sm">arrow_forward</span></>}
      </button>
    </form>

    {/* Lien inscription */}
    <p className="text-center text-text-muted">
      Pas encore de compte ?{" "}
      <Link href="/inscription" className="font-bold text-primary hover:text-primary/80">Créer un compte</Link>
    </p>
  </div>
</div>
```

## Design Compte suspendu

```tsx
<main className="min-h-screen bg-background-light flex flex-col items-center justify-center p-6">
  <div className="w-full max-w-md flex flex-col items-center text-center gap-8">

    {/* Icône warning */}
    <div className="flex items-center justify-center size-24 rounded-full bg-warning/10">
      <span
        className="material-symbols-outlined text-warning"
        style={{ fontSize: "64px", fontVariationSettings: "'FILL' 1" }}
      >warning</span>
    </div>

    <div className="flex flex-col gap-2">
      <h1 className="text-3xl font-extrabold text-text-main">Compte suspendu</h1>
      <p className="text-text-muted">Votre compte a été marqué pour suppression suite à votre demande.</p>
    </div>

    {/* Card alerte 30j */}
    <div className="w-full bg-warning/10 border border-warning/20 rounded-xl p-5 flex items-start gap-4 text-left">
      <span className="material-symbols-outlined text-warning shrink-0">schedule</span>
      <div>
        <h3 className="font-bold text-text-main text-sm">Action requise sous 30 jours</h3>
        <p className="text-sm text-text-muted mt-1">
          Votre compte sera définitivement supprimé si aucune action n'est entreprise.
          Un email de rappel vous sera envoyé 5 jours avant la suppression.
        </p>
      </div>
    </div>

    {/* Steps réactivation */}
    <div className="w-full flex flex-col gap-4 text-left">
      <p className="text-xs uppercase tracking-wider font-bold text-text-muted">Comment annuler ?</p>
      <div className="flex gap-4">
        <div className="flex-none w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-sm flex items-center justify-center">1</div>
        <div>
          <p className="font-semibold text-text-main">Connectez-vous à votre compte</p>
          <p className="text-sm text-text-muted mt-1">Accédez à la page Paramètres de votre compte.</p>
        </div>
      </div>
      <div className="flex gap-4">
        <div className="flex-none w-8 h-8 rounded-full bg-slate-100 text-text-muted font-bold text-sm flex items-center justify-center">2</div>
        <div>
          <p className="font-semibold text-text-main">Annulez la suppression</p>
          <p className="text-sm text-text-muted mt-1">
            Dans la zone Danger, cliquez sur "Annuler la suppression". Ou contactez-nous :
            <a href="mailto:support@trackmycash.fr" className="text-primary font-medium ml-1">support@trackmycash.fr</a>
          </p>
        </div>
      </div>
    </div>

    {/* Bouton retour */}
    <Link
      href="/"
      className="w-full flex items-center justify-center gap-2 border-2 border-primary text-primary font-bold py-3.5 rounded-xl hover:bg-primary/5 transition-colors"
    >
      <span className="material-symbols-outlined text-[20px]">arrow_back</span>
      Retour à l'accueil
    </Link>
  </div>
</main>
```

---

## Tests unitaires (TU-x)

**Fichier :** `tests/unit/pages/auth-pages.test.tsx`

| ID | Description | Résultat attendu |
|----|-------------|-----------------|
| TU-70-1 | Page Connexion : logo TMC présent | `getByText("TMC")` trouvé |
| TU-70-2 | Page Connexion : titre "Bon retour !" | `getByRole('heading', { name: /bon retour/i })` |
| TU-70-3 | Page Connexion : input email présent | `getByPlaceholderText(/email/i)` |
| TU-70-4 | Page Connexion : bouton submit présent | `getByRole('button', { name: /se connecter/i })` |
| TU-70-5 | Page Inscription : titre "Rejoignez TrackMyCash" | `getByRole('heading', { name: /rejoignez/i })` |
| TU-70-6 | Page Inscription : 3 inputs (nom, email, password) | `getAllByRole('textbox').length >= 2` |
| TU-70-7 | Page Compte suspendu : icône warning présente | `getByText('warning')` dans `.material-symbols-outlined` |
| TU-70-8 | Page Compte suspendu : bouton "Retour à l'accueil" | `getByRole('link', { name: /retour/i })` |

---

## Mapping AC → Tests

| AC | Tests couvrant |
|----|---------------|
| AC-1 | TU-70-1, TU-70-2 |
| AC-2 | TU-70-3 |
| AC-3 | TU-70-5, TU-70-6 |
| AC-4 | Intégration manuelle (authClient) |
| AC-5 | TU-70-4 (bouton présent) |
| AC-6 | TU-70-7, TU-70-8 |
| AC-7, AC-8 | `npm run build` |

---

## Notes d'implémentation

1. **"use client"** : les pages Connexion et Inscription restent `"use client"` (état local, authClient)
2. **Préserver la logique** : ne modifier que le JSX retourné — conserver tous les `useState`, `handleSubmit`, appels `authClient`, `router.refresh()`, fire-and-forget actions
3. **Toggle visibility** : ajouter un `useState<boolean>(false)` pour `showPassword`, basculer `type="text"` / `type="password"`
4. **Compte suspendu** : page Server Component — pas de client state nécessaire
5. **Layout auth** : `src/app/[locale]/(auth)/layout.tsx` — s'assurer qu'il ne force pas de fond conflictuel
