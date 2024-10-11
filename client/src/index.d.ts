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


interface IInfo {
  title: string;
  en: string;
  id: number | null;
  parent: number | null;
  emoji: string;
  names: Array<string>;
  leaf: number;
}
