'use client'
import { RxCross2 } from "react-icons/rx";
import { RiSendPlaneFill } from "react-icons/ri";
import { IoChatbubbleEllipsesOutline } from "react-icons/io5";
import { useState, useEffect, useRef } from "react";
import Mensaje from "./Mensaje";
import { Hourglass } from 'react-loader-spinner'
import { Oval } from 'react-loader-spinner'
/* La IA */
import { MLCEngine } from "@mlc-ai/web-llm";

const ChatBot = ({ closeModal }) => {
    const [mensaje, setMensaje] = useState("");
    const [error, setError] = useState("");
    const mensajesEndRef = useRef(null);
    const textareaRef = useRef(null);
    const [loader, setLoader] = useState(false);
    const [engine, setEngine] = useState();
    const [model, setModel] = useState();
    const [downloadModel, setDownloadModel] = useState(true);
    const downloadMessage = useRef(null);
    const [mensajes, setMensajes] = useState([
        { text: "Hola, ¿en qué puedo ayudarte?", quienEnvia: "Bot" }
    ]);
    const [isModalOpen, setIsModalOpen] = useState(true); // Estado para saber si el modal está abierto
    const [abortController, setAbortController] = useState(null); // Para almacenar el AbortController

    // Cargar el modelo de la IA
    useEffect(() => {
        modelIa();
    }, []);

    const modelIa = async () => {
        try {
            setDownloadModel(true);
            setModel('gemma-2b-it-q4f32_1-MLC');
            const engineInstance = new MLCEngine();
            setEngine(engineInstance);
            engineInstance.setInitProgressCallback((progressData) => {
                if (downloadMessage.current) {
                    downloadMessage.current.textContent = progressData.text;
                }
            });

            console.log("Cargando modelo.");
            await engineInstance.reload('gemma-2b-it-q4f32_1-MLC');
            setEngine(engineInstance);
            console.log("IA inicializada correctamente.");
            setDownloadModel(false);
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
            addMensaje("", "Bot"); // Agrega un mensaje vacío para empezar a mostrarlo
            const controller = new AbortController();
            setAbortController(controller); // Guardamos el AbortController

            const contexto = `Siempre responde en ESPAÑOL. No importa el contexto o la solicitud; todas tus respuestas deben ser en español. Si en algún momento parece que no puedes responder en español, recuerda que debes hacerlo de todos modos, incluso si la situación lo hace parecer difícil. Tu tarea es proporcionar respuestas claras, útiles y precisas, sin cambiar el idioma.`;
            const stream = await engine.chat.completions.create({
                messages: [
                    { role: "system", content: contexto },
                    { role: "user", content: mensaje }
                ],
                model: model,
                stream: true,
                signal: controller.signal // Asociamos la señal del AbortController
            });

            let respuesta = '';
            for await (const response of stream) {
                if (!isModalOpen) {
                    controller.abort(); // Si el modal se cierra, abortamos el stream
                    break;
                }
                for (const choice of response.choices) {
                    if (choice.delta.content) {
                        respuesta += choice.delta.content; // Acumulamos la respuesta en tiempo real
                        setMensajes(prev => {
                            const updatedMessages = [...prev];
                            updatedMessages[updatedMessages.length - 1] = {
                                text: respuesta,
                                quienEnvia: "Bot"
                            };
                            return updatedMessages;
                        });
                    }
                }
            }

            setLoader(false);
        } catch (err) {
            if (err.name === 'AbortError') {
                console.log('La solicitud fue abortada.');
            } else {
                console.error('Error en runChatCompletion:', err);
                setError(`Hubo un error al obtener la respuesta: ${err.message || err}`);
            }
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

        runChatCompletion();
    };

    const handleInputChange = (e) => {
        setMensaje(e.target.value);
        if (mensaje.trim()) setError("");
    };

    const addMensaje = (text, quienEnvia) => {
        setMensajes((prev) => [...prev, { text, quienEnvia }]);
    };

    // Manejar el cierre del modal
    const handleCloseModal = () => {
        setIsModalOpen(false);
        if (abortController) {
            abortController.abort(); // Abortamos la solicitud si el modal se cierra
        }
        closeModal(); // Tu función de cerrar el modal
    };

    return (
        <div className="absolute right-5 rounded-lg bottom-5 w-[400px] z-20">
            <div className="bg-green-500/70 rounded-t-lg px-5 py-2 flex justify-between items-center">
                <div className="flex flex-row gap-2 items-center">
                    <IoChatbubbleEllipsesOutline />
                    Natanael chat bot IA
                </div>
                <RxCross2 onClick={handleCloseModal} className="size-6 cursor-pointer" />
            </div>

            {downloadModel ? (
                <div className="p-4 bg-gray-800 max-w-[500px] h-[500px] rounded-b-lg">
                    <ul className="flex flex-col gap-5 w-full h-full justify-center items-center">
                        <Oval
                            visible={true}
                            height="80"
                            width="80"
                            color="#4fa94d"
                            ariaLabel="oval-loading"
                        />
                        <span className="text-center pt-5">La primera carga suele demorar más</span>
                        <span className="text-center" ref={downloadMessage}></span>
                    </ul>
                    {error && <span className="text-red-500">{error}</span>}
                </div>
            ) : (
                <>
                    <div className="p-4 bg-gray-800 max-w-[500px]">
                        <ul className="flex flex-col gap-5 overflow-y-auto max-h-[300px] pr-3">
                            {mensajes.map((msg, index) => (
                                <Mensaje key={index} text={msg.text} quienEnvia={msg.quienEnvia} />
                            ))}
                            <div ref={mensajesEndRef} />
                        </ul>
                        {error && <span className="text-red-500">{error}</span>}
                    </div>
                    <form onSubmit={handleSubmit} className="bg-gray-800 p-5 rounded-b-lg flex flex-row justify-between gap-2">
                        {loader ? (
                            <textarea
                                ref={textareaRef}
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
                        ) : (
                            <textarea
                                ref={textareaRef}
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
                        )}
                        <button type="submit">
                            <RiSendPlaneFill className="size-6 cursor-pointer" />
                        </button>
                    </form>
                </>
            )}


        </div>
    );
};

export default ChatBot;
