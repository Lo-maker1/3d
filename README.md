# Brand Studio 3D

Prototype d'application web de personnalisation de marque : éditeur 3D pour
concevoir des maquettes de vêtements et accessoires (t-shirt, chemise,
veste, sweat, pull, jean, jogging, short, jupe, chaussure, chaussette,
casquette, bracelet, montre, sacs...).

## Fonctionnalités actuelles

- Visualisation 3D interactive (rotation à la souris/tactile) pour chaque produit
- Personnalisation : couleur, logo (upload), texte imprimé, police
- Mode **Technique** : repères de couture, mesures en cm par produit,
  notes libres, export d'une fiche technique (.txt) pour artisans/couturiers
- Export du mockup visuel en PNG
- Flux d'interface pour un futur **scan 3D d'objet réel** (voir "Roadmap")

## Démarrer en local

\`\`\`bash
npm install
npm run dev
\`\`\`

Puis ouvre l'URL affichée dans le terminal (en général http://localhost:5173).

## Roadmap

- [ ] Vrais modèles 3D (GLTF) pour plus de réalisme (tissu, ombres, plis)
- [ ] Positionnement libre du logo/texte (drag & drop, rotation, échelle)
- [ ] Motifs et textures (rayures, camouflage, textures personnalisées)
- [ ] Comptes utilisateurs + sauvegarde des designs (backend + base de données)
- [ ] Scan 3D réel d'un objet (photogrammétrie ou LiDAR)
- [ ] Catalogue de sacs étendu (cartable, pochette, sac banane...)
- [ ] Export de fiche technique en PDF avec schémas annotés

## Stack

- React 18 + Vite
- Three.js (rendu 3D)
- lucide-react (icônes)
