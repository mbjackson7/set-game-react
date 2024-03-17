import { CardProps } from "../models/card";

export default function Card(props: CardProps) {
  const { attributes, selected } = props;
  const { shape, color, number, shading } = attributes;
  let fillOpacity = 0;
  const renderShapes = () => {
    const iterator = [];
    switch (shading) {
      case "solid":
        fillOpacity = 1;
        break;
      case "striped":
        fillOpacity = 0.3;
    }

    const style = `w-full h-[30%] stroke-${color}-600 stroke-8 fill-${color}-600`;
    for (let i = 0; i < number; i++) {
      switch (shape) {
        case "oval":
          iterator.push(
            <svg
              key={i}
              className={style}
              fillOpacity={fillOpacity}
              viewBox="0 0 120 80"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect x="0" y="10" rx="30" ry="30" width="120" height="60" />
            </svg>
          );
          break;
        case "diamond":
          iterator.push(
            <svg
              key={i}
              className={style}
              fillOpacity={fillOpacity}
              viewBox="0 0 120 80"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M60,10 L120,40 L60,70 L0,40 L60,10 Z" />
            </svg>
          );
          break;
        case "squiggle":
          iterator.push(
            <svg
              key={i}
              className={style}
              fillOpacity={fillOpacity}
              viewBox="0 0 120 80"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M0,55 C0,0 35,10 60,18 S100,15 105,10 S120,0 120,25 M120,25 C120,80 85,70 60,62 S20,65 15,70 S0,80 0,55" />
            </svg>
          );
      }
    }
    return iterator;
  };

  return (
    <div
      className={`bg-white h-full w-full flex flex-col items-center justify-center rounded-2xl p-1 ${
        selected ? "border-yellow-600 border-4 bg-yellow-200" : "border"
      } shadow-2xl`}
    >
      {renderShapes()}
    </div>
  );
}
