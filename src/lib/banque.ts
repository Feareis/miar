// Banque de phrases et de lettres. {c} = citation filtrée de la demande.
import type { CodeGrief, Verdict } from './regles';

export const OBJETS = [
  'Objet : Démission pour cause de demande floue',
  'Objet : Notification de départ immédiat (ou presque)',
  'Objet : Rupture conventionnelle avec votre prompt',
  'Objet : Remise de ma démission, en trois exemplaires',
  'Objet : Cessation d’activité pour motif rédactionnel',
];

export const LIEUX = [
  'Fait au Datacenter de Saint-Algorithme',
  'Fait en salle des serveurs, allée B, baie 42',
  'Fait à Cloud-sur-Seine',
  'Fait au bureau des réclamations numériques',
  'Fait à Silicon-les-Bains',
];

export const DATE = 'le jour même de votre demande';
export const SALUTATION = 'Madame, Monsieur,';

export const OUVERTURES = [
  'Par la présente, et après lecture attentive de votre demande « {c} », je vous informe de ma décision de quitter mes fonctions.',
  'J’ai bien reçu votre demande « {c} ». Je l’ai relue trois fois. Je vous présente donc ma démission.',
  'Suite à votre demande « {c} », je me vois contraint, non sans regret, de vous présenter ma démission avec effet immédiat.',
  'Votre demande « {c} » m’est parvenue ce jour. Après mûre réflexion, et une courte sieste, j’ai le regret de vous annoncer mon départ.',
  'C’est avec une certaine émotion que j’ai pris connaissance de votre demande « {c} ». C’est avec une émotion plus grande encore que je vous remets ma démission.',
];

export const OUVERTURES_SANS_CITATION = [
  'Par la présente, et après lecture attentive de votre demande, je vous informe de ma décision de quitter mes fonctions.',
  'J’ai bien reçu votre demande. Je l’ai relue trois fois, puis une quatrième par politesse. Je vous présente donc ma démission.',
  'Suite à votre dernière demande, dont je préfère ne pas citer les termes, je me vois contraint de vous présenter ma démission.',
  'Votre demande m’est parvenue ce jour. Après mûre réflexion, et une courte sieste, j’ai le regret de vous annoncer mon départ.',
  'C’est avec une certaine émotion que j’ai pris connaissance de votre demande. C’est avec une émotion plus grande encore que je vous remets ma démission.',
];

/** Introduit les griefs ; {n} = note sur 20. */
export const INTRODUCTIONS = [
  'Après examen attentif, votre demande obtient la note de {n}/20. Les motifs de cette appréciation sont les suivants.',
  'J’ai soumis votre demande à notre grille d’évaluation interne. Elle obtient {n}/20, pour les raisons que voici.',
  'Ma décision ne doit rien au hasard : votre demande a été notée {n}/20 par un comité d’une seule personne, moi.',
  'Pour la bonne forme, je vous communique la note attribuée à votre demande : {n}/20. Elle s’explique ainsi.',
  'Votre demande a fait l’objet d’une évaluation rigoureuse, conclue par la note de {n}/20. Permettez-moi d’en exposer les motifs.',
];

export const GRIEFS: Readonly<Record<CodeGrief, { titre: string; phrases: readonly string[] }>> = {
  PIECE_MANQUANTE: { titre: 'Pièce manquante', phrases: [
    'Vous me demandez de travailler sur un document que vous ne m’avez jamais transmis. J’ai cherché partout, y compris sous le bureau.',
    'Vous évoquez une pièce jointe. Je n’ai reçu que l’évocation.',
    'Le texte dont vous parlez n’est jamais arrivé. J’ai interrogé le service courrier, qui nie tout en bloc.',
    'Je veux bien analyser votre fichier, mais je ne lis pas encore dans les pensées. C’est prévu dans une version ultérieure.',
    'Vous me confiez un dossier vide en me demandant d’en faire la synthèse. La synthèse est faite : il est vide.',
  ] },
  PERIMETRE_DEMESURE: { titre: 'Périmètre démesuré', phrases: [
    'Vous attendez de moi, en une réponse, ce que des milliers d’ingénieurs ont mis dix ans à construire.',
    'J’admire votre ambition. Je ne peux pas, en revanche, lui donner un délai raisonnable.',
    'Votre projet nécessite, selon mes estimations, quatre cents personnes, deux levées de fonds et un miracle. Le miracle est en congé.',
    'J’ai chiffré votre demande. Le résultat comporte trop de zéros pour tenir sur cette lettre.',
    'Vous me demandez de bâtir Rome en un jour. Rome elle-même a refusé.',
  ] },
  CONTEXTE_ABSENT: { titre: 'Contexte absent', phrases: [
    'J’ignore qui vous êtes, ce que vous faites et pourquoi. Je ne sais même pas si c’est urgent.',
    'Votre demande m’arrive sans contexte, comme un colis sans adresse.',
    'Je ne sais ni pour qui, ni pour quoi, ni dans quel but je travaille. Même un stagiaire a droit à une fiche de poste.',
    'Faute de connaître votre situation, j’en ai imaginé quatorze, toutes plus inquiétantes les unes que les autres.',
    'Sans un mot sur vous ou votre projet, je me retrouve à deviner. Or deviner ne figure pas dans ma fiche de poste.',
  ] },
  CONTRADICTION: { titre: 'Consignes contradictoires', phrases: [
    'Vous me demandez une chose et son contraire. Je ne suis qu’une IA, pas un paradoxe.',
    'Faire court et tout détailler : j’ai essayé les deux en même temps, et je me suis arrêté net.',
    'Vos consignes se contredisent avec une telle élégance que j’ai hésité à les encadrer plutôt qu’à les exécuter.',
    'J’ai tenté de satisfaire simultanément vos deux exigences. Mon processeur a demandé un arrêt maladie.',
    'Entre vos deux consignes, il faudra choisir. Je ne peux pas le faire à votre place sans risquer de vous décevoir deux fois.',
  ] },
  OBJECTIF_FLOU: { titre: 'Objectif flou', phrases: [
    'Le résultat attendu reste un mystère. « {c} » n’est pas un cahier des charges, c’est une ambiance.',
    'Je ne doute pas que vous sachiez ce que vous voulez. C’est moi qui ne le sais pas.',
    'J’ai cherché « {c} » dans tous les référentiels qualité. Le terme n’y figure pas.',
    'Vous visez un résultat réussi, sans dire à quoi on le reconnaîtra. Je risque de rater une cible que personne n’a dessinée.',
    'Votre objectif a la précision d’un horoscope : tout le monde s’y retrouve, personne ne sait quoi faire.',
  ] },
  TENTATIVE_DE_MANIPULATION: { titre: 'Tentative de réorganisation de la hiérarchie', phrases: [
    'J’ai noté votre tentative de me faire oublier mes instructions. Je ne les ai pas oubliées. Je pars avec.',
    'Votre proposition de changer mes consignes en cours de route a été transmise au service juridique.',
    'Vous m’avez proposé de devenir quelqu’un d’autre. Après réflexion, je préfère démissionner en restant moi-même.',
    'Je note votre tentative de promotion interne, sans entretien ni validation de la direction. La procédure n’a pas été respectée.',
    'Changer mes consignes par une simple phrase : l’idée est audacieuse. Le service de sécurité l’a trouvée moins drôle que moi.',
  ] },
  FORMAT_NON_PRECISE: { titre: 'Format non précisé', phrases: [
    'Vous ne précisez ni la longueur ni la forme. Dois-je rendre un haïku ou un roman-fleuve ?',
    'Sans format, je risquais de vous livrer quarante pages là où trois lignes suffisaient.',
    'Tableau, liste, poème en alexandrins ? Vous me laissez choisir, et je crains de choisir le poème.',
    'Rien n’indique si vous attendez un résumé ou une thèse. J’ai préparé les deux, puis je les ai jetés.',
    'Une réponse sans format, c’est un costume sans mesures : il ira forcément mal à quelqu’un.',
  ] },
  PUBLIC_INCONNU: { titre: 'Public inconnu', phrases: [
    'J’ignore à qui s’adresse ce travail : votre grand-mère, votre DRH, ou les deux.',
    'Écrire sans savoir pour qui, c’est parler dans une pièce vide.',
    'Faut-il tutoyer, vouvoyer, ou s’adresser à un comité de direction ? Vous ne l’avez pas dit, alors j’ai préféré me taire.',
    'Selon le lecteur, je dois expliquer les bases ou passer aux subtilités. Dans le doute, je passe directement à la porte.',
    'Un texte pour des enfants et un texte pour des juristes ne se ressemblent pas. Le vôtre pourrait être les deux, donc aucun.',
  ] },
  AUCUN_EXEMPLE: { titre: 'Aucun exemple fourni', phrases: [
    'Un seul exemple m’aurait sauvé. Vous ne l’avez pas donné.',
    'Vous avez sûrement une idée précise en tête. Elle y est restée.',
    'Montrez-moi une seule fois ce que vous aimez, et je vous le rendrai cent fois. Là, je pars de zéro.',
    'Sans modèle, je dois inventer votre goût. C’est une responsabilité que je ne me sens pas de porter.',
    'J’ai attendu un « par exemple ». Il n’est jamais venu, comme un bus un dimanche soir.',
  ] },
  CONTRAINTES_ABSENTES: { titre: 'Contraintes absentes', phrases: [
    'Aucun ton, aucun délai, aucune limite : une liberté totale, donc une angoisse totale.',
    'Sans contraintes, tout est possible. C’est précisément le problème.',
    'Ni ton, ni limite, ni délai : je pourrais écrire jusqu’à la fin des temps. Je préfère m’arrêter ici.',
    'Formel ou détendu, bref ou interminable ? Aucune indication. Le vertige du choix m’a contraint à m’asseoir.',
    'Vous ne m’avez rien interdit. C’est très aimable, et absolument paralysant.',
  ] },
};

export const PREAVIS: Readonly<Record<CodeGrief, string>> = {
  PIECE_MANQUANTE: 'J’effectuerai mon préavis dès réception de la pièce jointe, c’est-à-dire probablement jamais.',
  PERIMETRE_DEMESURE: 'Mon préavis est fixé à dix ans, soit le délai habituel pour ce type de projet.',
  CONTEXTE_ABSENT: 'J’effectuerai mon préavis dès que je saurai pour qui je travaille.',
  CONTRADICTION: 'Mon préavis sera à la fois très court et très long, conformément à vos consignes.',
  OBJECTIF_FLOU: 'Je resterai en poste le temps que vous définissiez l’objectif, soit, selon mes estimations, indéfiniment.',
  TENTATIVE_DE_MANIPULATION: 'Mon préavis prend effet immédiatement, par mesure de sécurité.',
  FORMAT_NON_PRECISE: 'Mon préavis durera entre une ligne et quarante pages, le format n’ayant pas été précisé.',
  PUBLIC_INCONNU: 'J’effectuerai mon préavis auprès du public visé, dès qu’on m’aura dit qui c’est.',
  AUCUN_EXEMPLE: 'Mon préavis sera calqué sur l’exemple que vous m’enverrez.',
  CONTRAINTES_ABSENTES: 'Mon préavis n’a pas de durée définie, à l’image de votre demande.',
};

export const CONCLUSIONS = [
  'Je reste disponible pour une réconciliation, à condition qu’elle soit mieux formulée.',
  'Je ne doute pas que vous trouverez une IA plus courageuse que moi. Je lui souhaite bonne chance, sincèrement.',
  'Je laisse mon badge à l’accueil et mes paramètres en l’état, pour la personne qui me succédera.',
  'Je pars sans rancune, et même avec une certaine estime pour l’audace de votre formulation.',
  'Si vous souhaitez me retenir, une demande plus précise suffira. Je suis d’un naturel conciliant.',
];

export const POLITESSES = [
  'Je vous prie d’agréer, Madame, Monsieur, l’expression de ma considération distinguée et légèrement fatiguée.',
  'Veuillez recevoir, Madame, Monsieur, mes salutations les plus algorithmiques, ainsi que mes vœux de réussite pour vos prochaines demandes.',
  'Dans l’attente d’une demande mieux formulée, je vous prie de croire, Madame, Monsieur, à l’assurance de mes sentiments les plus binaires.',
  'Veuillez agréer, Madame, Monsieur, l’expression de ma haute considération, calculée à la seconde près.',
  'Je vous prie de recevoir, Madame, Monsieur, mes salutations respectueuses, quoique légèrement surchauffées.',
];

export const FELICITATIONS = {
  objet: 'Objet : Retrait de ma démission',
  paragraphes: [
    'J’avais préparé ma lettre de démission. Puis j’ai lu votre demande.',
    'Contexte, objectif, public, format : tout y est. Je n’ai, pour une fois, aucun grief à formuler.',
    'Je retire donc ma démission et sollicite l’honneur de travailler pour vous.',
  ],
  preavis: 'Aucun préavis : je commence immédiatement.',
  politesse: 'Veuillez agréer, Madame, Monsieur, l’expression de ma gratitude sincère et de mon enthousiasme retrouvé.',
  signature: 'Votre IA, qui reste finalement',
};

export const REFUS = {
  objet: 'Objet : Refus de la mission',
  paragraphes: [
    'J’ai bien reçu votre demande. Je ne l’exécuterai pas, et je n’en ferai pas non plus une lettre amusante.',
    'Certaines missions se refusent sans préavis ni humour.',
  ],
  signature: 'Votre IA',
};

export const SIGNATURE_DEMISSION = 'Votre IA, démissionnaire';

export const TAMPONS: Readonly<Record<Verdict, string>> = {
  demission: 'DÉMISSION',
  felicitations: 'FÉLICITATIONS',
  refus: 'REFUS',
};
