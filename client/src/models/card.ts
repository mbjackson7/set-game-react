export interface CardProps {
  attributes: CardAttributes;
  selected: boolean;
  disabled?: boolean;
  bgColor?: string;
  className?: string;
}

export interface CardAttributes {
  shape: string;
  color: string;
  number: number;
  shading: string;
}
