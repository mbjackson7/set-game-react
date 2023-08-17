export default function MessageModal(props: any){
    const message = props.message;
    return(
        <div className="absolute h-screen w-screen flex justify-center items-center z-50">
            <div className={`bg-${message.color}-800 text-3xl text-white border-2 border-black p-5 flex justify-center items-center`}>
                {message.text}
            </div>
        </div>
    )
}