import CardProps from "../models/card";

export default function Card(props: CardProps) {
    const { shape, color, number, shading } = props;

    const renderShapes = () => {
        let iterator = [];
        let colorFill = `stroke-${color}-600 stroke-2`
        switch (shading) {
            case "fill":
                colorFill += ` fill-${color}-600`
                break;
            case "striped":
                colorFill += ` fill-${color}-300`
                break;
        }

        const style = `w-40 h-16 ${colorFill}`
        console.log(style)
        for (let i = 0; i < number; i++) {
            if (shape === "oval") {
                iterator.push(<svg key={i} className={style} viewBox="0 0 120 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="0" y="10" rx="30" ry="30" width="120" height="60"/>
                </svg>
                )
            } else if (shape === "diamond") {
                iterator.push(<svg key={i} className={style} viewBox="0 0 100 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M50 10L100 40L50 70L0 40L50 10Z"/>
                </svg>)
            } else if (shape === "squiggle") {
                iterator.push(<svg key={i} className={style} viewBox="0 0 100 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M0 40C0 0 100 0 100 40C100 80 0 80 0 40Z"/>
                </svg>)
            }
        }
        console.log(iterator)
        return iterator;
    }

        return (
            <div className="bg-white h-60 w-40 flex flex-col items-center justify-center">
                {renderShapes()}
            </div>
        )
    }