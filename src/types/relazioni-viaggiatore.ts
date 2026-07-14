export type RelazionePersona = {
  id: string;
  nome: string;
  viaggiInsieme: number;
};

export type RelazioniViaggiatore = {
  tourLeader: RelazionePersona;
  guidaLocale: RelazionePersona;
  driver: RelazionePersona;
  compagnoCamera: RelazionePersona;
  haViaggiatoCon: RelazionePersona[];
};
