export interface NationalLanguage {
  code: string;
  nom: string;
  description: string;
  exemple: string;
  speechCode: string;
}

export const NATIONAL_LANGUAGES: NationalLanguage[] = [
  {
    code: "ln",
    nom: "Lingala",
    description: "Langue nationale (Kinshasa, Équateur, Mai-Ndombe, etc.)",
    exemple: "Mwana na ngai azali na fievre makasi mpe azali kokosola na mpasi...",
    speechCode: "fr-FR", // Web Speech API fallback
  },
  {
    code: "sw",
    nom: "Swahili",
    description: "Langue nationale (Nord-Kivu, Sud-Kivu, Katanga, Maniema)",
    exemple: "Mtoto ana homa kali sana na anashindwa kupumua vizuri...",
    speechCode: "sw",
  },
  {
    code: "kg",
    nom: "Kikongo",
    description: "Langue nationale (Kongo-Central, Kwango, Kwilu)",
    exemple: "Mwana kele na fiere ya ngolo mpi ke pema na mpasi...",
    speechCode: "fr-FR",
  },
  {
    code: "lua",
    nom: "Tshiluba",
    description: "Langue nationale (Kasaï, Kasaï-Central, Kasaï-Oriental)",
    exemple: "Muana udi ne mudilu mukole ne kadi ukolola bikole...",
    speechCode: "fr-FR",
  },
  {
    code: "fr",
    nom: "Français",
    description: "Langue officielle",
    exemple: "Patiente enceinte avec contractions très rapprochées et saignements...",
    speechCode: "fr-FR",
  },
];
