// Mensaje.js
const Mensaje = ({ text, quienEnvia }) => {
    const esUsuario = quienEnvia === "Tú";
  
    return (
      <li className={`flex flex-col ${esUsuario ? "items-end" : ""}`}>
        <div className={`mb-1 ${esUsuario ? "text-right mr-2" : "ml-2"}`}>
          <span className={`text-sm px-2 rounded-lg ${esUsuario ? "bg-blue-500/70" : "bg-green-500/70"}`}>
            {quienEnvia}
          </span>
        </div>
        <span className={`rounded-lg ${esUsuario ? "text-right" : ""}`}>{text}</span>
      </li>
    );
  };
  
  export default Mensaje;
  