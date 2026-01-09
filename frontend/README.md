# Dolce Pizza Marseille - Web App

Application web de commande pour Dolce Pizza Marseille, pizzeria artisanale au feu de bois.

## 🚀 Installation

**Note importante:** Ce projet nécessite Node.js et npm. Si vous ne les avez pas installés, téléchargez-les depuis [nodejs.org](https://nodejs.org/).

```bash
# Installer les dépendances
npm install

# Lancer le serveur de développement
npm run dev

# Builder pour la production
npm run build

# Prévisualiser le build de production
npm run preview
```

## 📁 Structure du projet

```
dolce-pizza-app/
├── src/
│   ├── components/          # Composants réutilisables
│   │   ├── Layout.tsx       # Layout global (Header + Footer)
│   │   ├── Button.tsx       # Composant bouton
│   │   └── ProductCard.tsx  # Carte produit
│   ├── pages/               # Pages de l'application
│   │   ├── Home.tsx         # Page d'accueil (/)
│   │   ├── Menu.tsx         # Carte des produits (/menu)
│   │   ├── Cart.tsx         # Panier (/panier)
│   │   ├── OrderInfos.tsx   # Infos commande (/commande/infos)
│   │   ├── OrderRecap.tsx   # Récapitulatif (/commande/recap)
│   │   └── Infos.tsx        # Infos pratiques (/infos)
│   ├── store/               # État global (Zustand)
│   │   └── useStore.ts      # Stores cart et order
│   ├── types/               # Types TypeScript
│   │   └── index.ts         # Interfaces Product, CartItem, Order
│   ├── data/                # Données
│   │   └── products.json    # SOURCE DE VÉRITÉ - Tous les produits
│   ├── App.tsx              # Composant principal + routing
│   ├── main.tsx             # Point d'entrée
│   └── index.css            # Styles globaux
├── public/                  # Assets statiques
├── index.html               # HTML de base
├── package.json             # Dépendances
├── tailwind.config.js       # Configuration Tailwind (couleurs, typos)
├── vite.config.ts           # Configuration Vite
└── tsconfig.json            # Configuration TypeScript
```

## 🎨 Personnalisation

### Modifier les produits

**Fichier:** `src/data/products.json`

Ce fichier contient tous les produits (pizzas, boissons, desserts) et les catégories.

**Structure:**
\`\`\`json
{
  "categories": [
    {
      "id": "identifiant-unique",
      "name": "Nom affiché",
      "description": "Description de la catégorie"
    }
  ],
  "products": [
    {
      "id": "identifiant-unique",
      "name": "Nom du produit",
      "description": "Ingrédients ou description",
      "price": 12.50,
      "category": "identifiant-categorie",
      "imageUrl": "/images/nom-image.jpg"
    }
  ]
}
\`\`\`

### Modifier les prix

Dans `src/data/products.json`, changez simplement la propriété `price` du produit concerné.

### Modifier les catégories

1. Ajoutez ou modifiez une catégorie dans `categories`
2. Assurez-vous que les produits ont le bon `category` correspondant à l'`id` de la catégorie

### Modifier les couleurs

**Fichier:** `tailwind.config.js`

\`\`\`javascript
theme: {
  extend: {
    colors: {
      cream: '#FFF8E7',        // Crème
      brick: '#C1440E',         // Rouge brique
      brickLight: '#E85D0D',    // Rouge brique clair
      basilGreen: '#2D5016',    // Vert basilic
      basilLight: '#4A7C2B',    // Vert basilic clair
    },
  },
}
\`\`\`

### Modifier les typographies

**Fichier:** `tailwind.config.js`

\`\`\`javascript
theme: {
  extend: {
    fontFamily: {
      display: ['Playfair Display', 'serif'],  // Titres
      sans: ['Inter', 'system-ui', 'sans-serif'], // Texte
    },
  },
}
\`\`\`

Pour utiliser d'autres polices:
1. Importez-les dans `index.html` (Google Fonts)
2. Modifiez `tailwind.config.js`

### Modifier les images

Les images des produits sont référencées dans `src/data/products.json` via la propriété `imageUrl`.

**Pour ajouter de vraies images:**
1. Placez vos images dans le dossier `public/images/`
2. Mettez à jour `imageUrl` dans `products.json`
   - Exemple: `"/images/pizza-margherita.jpg"`

**Note:** Actuellement, les images utilisent des placeholders. Remplacez-les par vos vraies photos.

## 🛒 Fonctionnement du state global

Le projet utilise **Zustand** pour la gestion d'état, avec 2 stores séparés:

### Cart Store (`useCartStore`)
Gère le panier:
- `items`: Liste des produits dans le panier
- `addItem()`: Ajouter un produit
- `updateQuantity()`: Modifier la quantité
- `removeItem()`: Supprimer un produit
- `clearCart()`: Vider le panier
- `getTotal()`: Calculer le total

### Order Store (`useOrderStore`)
Gère les informations de commande:
- `mode`: 'emporter' ou 'livraison'
- `customerInfo`: Nom, téléphone, adresse
- `setMode()`: Définir le mode
- `setCustomerInfo()`: Définir les infos client
- `reset()`: Réinitialiser

**Persistance:** Les données sont sauvegardées dans le localStorage du navigateur.

## 🎯 Workflow de commande

1. **Menu** (`/menu`) → L'utilisateur parcourt la carte et ajoute des produits
2. **Panier** (`/panier`) → Modification des quantités, vérification
3. **Infos** (`/commande/infos`) → Choix emporter/livraison + formulaire
4. **Récapitulatif** (`/commande/recap`) → Validation finale
5. **Confirmation** → Message de succès

## 📱 Responsive Design

L'application est **mobile-first** et optimisée pour:
- 📱 Mobile (375px, 414px, 430px)
- 💻 Tablet (768px+)
- 🖥️ Desktop (1024px+)

## 🎨 Palette de couleurs

- **Crème** (`#FFF8E7`): Fond principal
- **Rouge brique** (`#C1440E`): Couleur principale (boutons, prix)
- **Vert basilic** (`#2D5016`): Couleur secondaire
- **Blanc** (`#FFFFFF`): Cartes et sections

## ⚙️ Technologies utilisées

- **React 18** - Framework UI
- **TypeScript** - Typage statique
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **React Router** - Navigation
- **Zustand** - State management
- **Lucide React** - Icônes

## 📝 Informations de contact (dans le code)

Pour modifier les informations de contact affichées:
- **Footer:** `src/components/Layout.tsx`
- **Page Infos:** `src/pages/Infos.tsx`

---

**Développé pour Dolce Pizza Marseille**
24 boulevard Notre Dame, 13006 Marseille
