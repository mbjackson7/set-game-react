export interface CardProps {
  attributes: CardAttributes;
  selected: boolean;
}

export interface CardAttributes {
  shape: string;
  color: string;
  number: number;
  shading: string;
}
