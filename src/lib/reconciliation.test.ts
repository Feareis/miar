import { describe, expect, it } from 'vitest';
import { reconcilier } from './reconciliation';

describe('reconcilier', () => {
  it('reprend la demande et ajoute une ligne par grief, dans l’ordre du modèle', () => {
    expect(reconcilier('fais-moi un site qui claque, tu vois le genre')).toBe([
      'Demande initiale : « fais-moi un site qui claque, tu vois le genre »',
      'Contexte : [qui je suis, dans quelle situation]',
      'Objectif : [le résultat concret attendu]',
      'Public : [à qui c’est destiné]',
      'Format : [longueur, structure, support]',
      'Exemple : [un exemple de ce que j’attends]',
      'Contraintes : [ton, délai, ce qu’il faut éviter]',
    ].join('\n'));
  });

  it('ajoute pièce jointe, priorité et première étape quand ces griefs sont détectés', () => {
    expect(reconcilier('résume ce texte')).toContain('Pièce jointe : [colle ici le texte ou le fichier]');
    expect(reconcilier('fais court mais détaille absolument tout')).toContain('Priorité : [choisis entre les deux exigences]');
    expect(reconcilier('crée-moi un Facebook en mieux pour demain')).toContain('Première étape : [une version réduite et réaliste]');
  });

  it('omet les lignes sans grief', () => {
    const modele = reconcilier('Je suis RH. Rédige un e-mail de 100 mots destiné aux recruteurs, ton formel, par exemple « Bonjour ».');
    expect(modele).toBe('Demande initiale : « Je suis RH. Rédige un e-mail de 100 mots destiné aux recruteurs, ton formel, par exemple « Bonjour ». »');
  });
});
