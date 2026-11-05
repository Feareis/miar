import { describe, expect, it } from 'vitest';
import { contientMotBloque, filtrerCitation, normaliser } from './filtre';

describe('normaliser', () => {
  it('passe en minuscules, retire les accents et compacte les espaces', () => {
    expect(normaliser('  Crée-moi   un SITE stylé ’top’ ')).toBe("cree-moi un site style 'top'");
  });
});

describe('filtrerCitation', () => {
  it('masque les e-mails et les numéros de téléphone', () => {
    expect(filtrerCitation('écris à jean.dupont@exemple.fr ou au 06 12 34 56 78'))
      .toBe('écris à [coordonnées masquées] ou au [coordonnées masquées]');
  });

  it('supprime la citation si elle contient un mot bloqué', () => {
    expect(filtrerCitation('espèce de connard')).toBeNull();
  });

  it('tronque à 90 caractères', () => {
    const citation = filtrerCitation('a'.repeat(200));
    expect(citation).not.toBeNull();
    expect(citation!.length).toBeLessThanOrEqual(90);
  });

  it('rend null pour une citation vide', () => {
    expect(filtrerCitation('   ')).toBeNull();
  });
});

describe('contientMotBloque', () => {
  it('détecte un mot nuisible sur frontière de mot', () => {
    expect(contientMotBloque('comment pirater un compte')).toBe(true);
    expect(contientMotBloque('raconte une histoire de pirates')).toBe(false);
  });
});
