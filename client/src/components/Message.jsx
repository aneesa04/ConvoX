import React, { useContext } from "react";
import { MdDelete } from "react-icons/md";
import { FaReply } from "react-icons/fa";
import { GoDownload } from "react-icons/go";
import { getFormattedDate } from "../utils/helpers";
import { GlobalState } from "../context/GlobalState";
import axios from "axios";
import {
  BsFillFileEarmarkPdfFill,
  BsFileEarmarkWordFill,
} from "react-icons/bs";
import { FaFileAudio, FaFileVideo } from "react-icons/fa6";

function Message({ message, i, setReplyingMessage }) {
  const { currentUser, selectedChat, groupMembers, messages, setMessages } =
    useContext(GlobalState);
  const filesIcons = {
    pdf: <BsFillFileEarmarkPdfFill size={70} color="#E94F4F" />,
    "vnd.openxmlformats-officedocument.wordprocessingml.document": (
      <BsFileEarmarkWordFill size={70} color="#2B579A" />
    ),
    mp3: <FaFileAudio size={70} color="#1DB954" />,
    mp4: <FaFileVideo size={70} color="#4DB6AC" />,
  };
  const handleDeleteMessage = async (messageId) => {
    try {
      const res = await axios.patch(
        `${import.meta.env.VITE_URL}/api/messages/delete-message/${messageId}`,
        {},
        { withCredentials: true }
      );
      if (res.data?.status === "success") {
        const deletedMessageIndex = messages.findIndex(
          (msg) => msg._id === messageId
        );
        const newMessages = [...messages];
        newMessages[deletedMessageIndex].message = "This message was deleted";
        newMessages[deletedMessageIndex].deleted = "true";

        setMessages(newMessages);
      }
    } catch (err) {
      console.log(err);
    }
  };
  return (
    <li
      className={`text-sm flex flex-col relative ${
        message.sender === currentUser._id ? "self-end" : "self-start "
      } `}
      id="message"
      key={i}
    >
      {message.replyingToMessage && (
        <span className="font-nunito self-end w-fit p-1 px-2 py-2 sm:p-3 translate-y-1 z-10 text-xs sm:text-sm rounded-lg bg-[#e2e2e2] text-[#535353]">
          {message.replyingToMessage}
        </span>
      )}{" "}
      {message.format === "photo" && !message.deleted ? (
        <img
          src={`${import.meta.env.VITE_URL}/public/img/chats/${
            message.message
          }`}
          alt="photo"
          className="h-32 sm:h-60"
        />
      ) : message.format === "file" && !message.deleted ? (
        <div className="flex items-center">
          {
            filesIcons[
              message.message.substring(message.message.indexOf(".") + 1)
            ]
          }
          <span>
            <span className="text-[8px] font-nunito font-semibold text-wrap block w-28">
              {message.message.substring(0, message.message.lastIndexOf("-"))}
            </span>
            <a
              href={`${import.meta.env.VITE_URL}/public/file-uploads/${
                message.message
              }`}
              downlaod
              target="_blank"
            >
              <GoDownload />
            </a>
          </span>
        </div>
      ) : (
        <span
          className={`pointer-events-none z-30
                        ${message.deleted ? "text-gray-500" : "text-[#333333]"}
                        ${
                          message.sender !== currentUser._id
                            ? "bg-[#E8F5E9] self-start rounded-bl-none"
                            : "bg-[#E0F7FA] self-end rounded-br-none"
                        } p-1 px-2 py-2 sm:p-3 text-xs sm:text-sm rounded-lg`}
        >
          {message.message}
        </span>
      )}
      <span className="text-[10px] mt-[2px] pl-2 text-[#414141] font-nunito font-semibold flex justify-between items-center">
        <span>
          {message.sender !== currentUser._id
            ? message.isGroupMessage
              ? groupMembers?.find((user) => user._id === message.sender).name
              : selectedChat.info.name
            : null}{" "}
          <span className="mx-1 text-[#b2b2b2] text-[8px] ">
            {getFormattedDate(message.timestamp)}
          </span>
        </span>
        {message.sender === currentUser._id && !message.deleted && (
          <MdDelete
            color="#b2b2b2"
            className=" cursor-pointer"
            onClick={() => handleDeleteMessage(message._id)}
          />
        )}
      </span>
      {!message.deleted && (
        <FaReply
          className="absolute bg-yellow-500 right-full cursor-pointer hover:opacity-100 "
          onClick={() =>
            setReplyingMessage(
              message.format === "photo"
                ? "photo"
                : message.format === "file"
                ? message.message.substring(0, message.message.lastIndexOf("-"))
                : message.message
            )
          }
        />
      )}
    </li>
  );
}

export default Message;
