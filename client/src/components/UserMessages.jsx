import React, { useContext } from "react";

import { GlobalState } from "../context/GlobalState";
import { RiPencilFill } from "react-icons/ri";
import { FaUserCircle } from "react-icons/fa";
import { RiGroup2Fill } from "react-icons/ri";

function UserMessages({ contacts, groups }) {
  const { setShowUsers, currentUser, setSelectedChat, setFetchUsers } =
    useContext(GlobalState);
  return (
    <aside className="border-r-2 h-svh  rounded-e-lg pt-3 flex flex-col p-2  ">
      <button
        className="w-full sm:w-[50%] text-xs  px-1 py-2 flex justify-center items-center  rounded-lg bg-[#2c2c2c] hover:bg-black text-white font-lato"
        onClick={() => {
          setFetchUsers(true);
          setShowUsers(true);
        }}
      >
        <RiPencilFill className="inline mr-1" size={19} /> New Message
      </button>
      <div className="text-xs flex items-center  font-semibold cursor-pointer hover:bg-[#e2e2e2] py-1 rounded-lg ">
        <FaUserCircle size={30} className="mx-1" />
        {currentUser?.name}
      </div>
      <div>
        <span className="text-[11px] font-roboto text-[#2c2c2c]">
          Direct messages
        </span>

        <ul>
          {contacts?.map((contact, i) => (
            <li
              className="text-xs flex items-center  font-semibold cursor-pointer hover:bg-[#e2e2e2] py-1 rounded-lg "
              onClick={() =>
                setSelectedChat({ info: contact, type: "individual" })
              }
              key={"contact" + i}
            >
              <FaUserCircle size={30} className="mx-1" />
              {contact?.name}
            </li>
          ))}
          {groups?.map((group, i) => (
            <li
              className="text-xs flex items-center  font-semibold cursor-pointer hover:bg-[#e2e2e2] py-1 rounded-lg "
              key={"group" + i}
              onClick={() => setSelectedChat({ info: group, type: "group" })}
            >
              <RiGroup2Fill size={30} className="mx-1" />
              {group?.name}
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}

export default UserMessages;
