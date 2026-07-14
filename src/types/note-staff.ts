export type NotaStaff = {
  id: string;
  autore: string;
  data: string;
  contenuto: string;
};

export type NoteStaff = {
  note: NotaStaff[];
};
