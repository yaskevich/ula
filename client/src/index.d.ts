interface IBibItem {
  title: string;
  link: string;
  district: string;
  region: string;
  meta: string;
  type: string;
}

interface ICascadeChild {
  name: string;
  level: number;
  parent?: boolean;
  label: string;
}

interface ICascadeItem {
  name: string;
  level: number;
  label: string;
  children: Array<ICascadeChild>;
}

interface ICounter {
  [key: string]: number,
}

interface keyable {
  [key: string]: any;
}

interface IStreetInfo {
  name: string;
  freq: number;
  regions: keyable;
}

interface IStreet {
  CECHA: string;
  NAZWA_1: string;
  NAZWA_2?: string;
  qty?: number;
  ord: number;
  ttl: number;
  rank: number;
}


interface IWord {
  words: number;
  qty: number;
}
interface IInfo {
  title: string;
  en: string;
  id: number | null;
  parent: number | null;
  emoji: string;
  names: Array<string>;
  leaf: number;
  num: number | null;
}
