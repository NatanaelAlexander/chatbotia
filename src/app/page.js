'use client'
import ChatBot from "@/components/ChatBot";
import { IoChatbubbleEllipsesOutline } from "react-icons/io5";
import { useState } from "react";

export default function Home() {

  const [modal, setModal] = useState(false);

  const changeModal = () => {
    setModal(!modal);
    return;
  }

  return (
    <div className="flex h-screen relative">
      <div className="flex w-full justify-center items-center">
        <h1>Abre el chat para empezar la conversación</h1>
      </div>
      {modal ? (
        <ChatBot closeModal={changeModal} />
      ) : (
        <div onClick={changeModal} className="h-12 w-12 flex items-center justify-center bg-green-500/70 absolute right-5 bottom-5 rounded-full cursor-pointer hover:scale-105 transition-all duration-200">
          <IoChatbubbleEllipsesOutline className="size-6" />
        </div>
      )}

    </div>
  );
}
