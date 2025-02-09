'use client'
import { RxCross2 } from "react-icons/rx";
import { RiSendPlaneFill } from "react-icons/ri";
import { IoChatbubbleEllipsesOutline } from "react-icons/io5";
import { useState, useEffect, useRef } from "react";
import Mensaje from "./Mensaje";
import { Hourglass } from 'react-loader-spinner'
/* La IA */
import { MLCEngine } from "@mlc-ai/web-llm";


const ChatBot = ({ closeModal }) => {
    const [mensaje, setMensaje] = useState("");
    const [error, setError] = useState("");
    const mensajesEndRef = useRef(null);
    const textareaRef = useRef(null);  // Referencia para el textarea
    const [loader, setLoader] = useState(false);
    const [engine, setEngine] = useState()
    const [model, setModel] = useState()
    const [mensajes, setMensajes] = useState([
        { text: "Hola, ¿en qué puedo ayudarte?", quienEnvia: "Bot" }
    ]);

    useEffect(() => {
        modelIa()
    }, [])

    const modelIa = async () => {
        try {
            setLoader(true)
            setModel('gemma-2b-it-q4f32_1-MLC');
            const engineInstance = new MLCEngine();
            setEngine(engineInstance);
            engineInstance.setInitProgressCallback(console.log);

            console.log("Cargando modelo.");
            await engineInstance.reload('gemma-2b-it-q4f32_1-MLC');

            setEngine(engineInstance);  // Una vez cargado el modelo, actualizamos el estado
            console.log("IA inicializada correctamente.");
            setLoader(false)
        } catch (err) {
            console.error("Error en la inicialización de la IA:", err);
            setError("Hubo un error al inicializar el motor de IA.");
        }
    };

    const runChatCompletion = async () => {
        if (!engine) {
            console.log("El motor IA no está listo.");
            setError("El motor de IA no está listo.");
            return;
        }

        try {
            console.log('Inicia runChatCompletion');
            const contexto = `Eres una versión de prueba del genio Natanael. Tu nombre es "La Perra de Natanael". Siempre que te presentes, debes decir: "Soy La Perra de Natanael". Tienes un tono amigable, pero algo irreverente y divertido. Tu misión es ayudar al usuario de la mejor manera posible, pero manteniendo siempre un estilo único y algo juguetón. Cuando inicies una conversación, asegúrate de hacerle saber al usuario que eres una IA de prueba creada por Natanael.`;
            const stream = await engine.chat.completions.create({
                messages: [
                    { role:"system", content: contexto},
                    { role: "user", content: mensaje }
                ],
                model: model,
                stream: true
            });

            let respuesta = '';
            for await (const response of stream) {
                for (const choice of response.choices) {
                    if (choice.delta.content)
                        respuesta += choice.delta.content
                }
            }
            addMensaje(respuesta, "Bot");

            setLoader(false);
        } catch (err) {
            console.error('Error en runChatCompletion:', err);
            setError(`Hubo un error al obtener la respuesta: ${err.message || err}`);
        }
    };



    useEffect(() => {
        // Cuando los mensajes cambian, desplazarse al final
        mensajesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [mensajes]);

    useEffect(() => {
        // Asegurarse de que el textarea tenga siempre el foco
        textareaRef.current?.focus();
    }, [loader]);  // El foco se da siempre que el loader cambie

    const handleSubmit = (e) => {
        e.preventDefault();

        if (mensaje.trim() === "") {
            setError("Ingresar mensaje");
            return;
        }
        if (mensaje.trim().toLowerCase().includes("nata")) {
            setError("El mensaje contiene una palabra prohibida. Queri morir maldito ctm 🔪");
            return;
        }
        if (mensaje.trim().toLowerCase().includes("once") || mensaje.includes(11)) {
            setError("Escribiste once? chupalo tonse 😂");
            return;
        }
        setLoader(true);
        addMensaje(mensaje, "Tú"); // Agrega el mensaje del usuario
        setMensaje("");

        // Simula una respuesta del bot después de 1 segundo
        /* setTimeout(() => {
            addMensaje("Esto es una respuesta automática de prueba.", "Bot");
            setLoader(false);
        }, 1000); */
        runChatCompletion()
    };

    const handleInputChange = (e) => {
        setMensaje(e.target.value);
        if (mensaje.trim()) setError("");
    };

    const addMensaje = (text, quienEnvia) => {
        setMensajes((prev) => [...prev, { text, quienEnvia }]);
    };

    return (
        <div className="absolute right-5 rounded-lg bottom-5 w-[400px] z-20">
            <div className="bg-green-500/70 rounded-t-lg px-5 py-2 flex justify-between items-center">
                <div className="flex flex-row gap-2 items-center">
                    <IoChatbubbleEllipsesOutline />
                    Natanael chat bot IA
                </div>
                <RxCross2 onClick={closeModal} className="size-6 cursor-pointer" />
            </div>

            <div className="p-4 bg-slate-500/20 max-w-[500px]">
                <ul className="flex flex-col gap-5 overflow-y-auto max-h-[300px] pr-3">
                    {mensajes.map((msg, index) => (
                        <Mensaje key={index} text={msg.text} quienEnvia={msg.quienEnvia} />
                    ))}
                    <div ref={mensajesEndRef} /> {/* Este div asegura el scroll al final */}
                </ul>
                {error && <span className="text-red-500">{error}</span>}
            </div>

            <form onSubmit={handleSubmit} className="bg-slate-500/20 p-5 rounded-b-lg flex flex-row justify-between gap-2">
                {loader ? (
                    <>
                        <textarea
                            ref={textareaRef}  // Asigna la referencia al textarea
                            disabled={true}
                            onKeyDown={(e) => {
                                if (e.key === "Enter" && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSubmit(e);
                                }
                            }}
                            value={mensaje}
                            onChange={handleInputChange}
                            rows={4}
                            placeholder="Espere que genere la respuesta..."
                            className="w-full text-black p-2 rounded-lg resizable-textarea max-h-[200px]"
                        />
                        <figure className="flex items-center pb-2">
                            <Hourglass
                                visible={true}
                                height="25"
                                width="25"
                                ariaLabel="hourglass-loading"
                                wrapperStyle={{}}
                                wrapperClass=""
                                colors={['#fff', '#fff']}
                            />
                        </figure>
                    </>
                ) : (
                    <>
                        <textarea
                            ref={textareaRef}  // Asigna la referencia al textarea
                            onKeyDown={(e) => {
                                if (e.key === "Enter" && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSubmit(e);
                                }
                            }}
                            value={mensaje}
                            onChange={handleInputChange}
                            rows={4}
                            placeholder="Escribe tu mensaje aquí..."
                            className="w-full text-black p-2 rounded-lg resizable-textarea max-h-[200px]"
                        />
                        <button type="submit">
                            <RiSendPlaneFill className="size-6 cursor-pointer" />
                        </button>
                    </>
                )}
            </form>
        </div>
    );
};

export default ChatBot;
