import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { FaUserCircle } from "react-icons/fa";
import { MdOutlineGroups } from "react-icons/md";
import { IoCheckmarkDoneCircle } from "react-icons/io5";
import { RxCross1 } from "react-icons/rx";

import { GlobalState } from "../context/GlobalState";
import { showAlert } from "../utils/showAlert";

function SelectUser() {
  const {
    selectUser,
    setAllUsers,
    allUsers,
    currentUser,
    setSelectUser,
    setSelectedUser,
    isGroup,
    setIsGroup,
    socket,
  } = useContext(GlobalState);
  const [groupMembers, setGroupMembers] = useState([]);
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_URL}/api/users`, {
          withCredentials: true,
        });
        if (res.data?.status === "success") {
          setAllUsers(res.data.users);
        }
      } catch (err) {
        console.log(err);
      }
    };
    fetchUser();
  }, []);

  const handleUserSelction = async (selectedUser) => {
    if (isGroup) {
      if (groupMembers.includes(selectedUser)) {
        console.log("user already in group");
        return;
      }
      setGroupMembers((prev) => [...prev, selectedUser]);
    } else {
      const res = await axios.post(
        `${import.meta.env.VITE_URL}/api/users/addUserContact`,
        {
          userContacted: selectedUser._id,
        },
        {
          withCredentials: true,
        }
      );
      if (res.data?.status === "success") {
        setSelectUser(false);
        socket.emit("added-new-user",{selectedUserId: selectedUser._id, userName: currentUser.name} );
        setSelectedUser(selectedUser);
        showAlert("User added successfully", "home");
        setIsGroup(false)
      }
    }
  };

  const handleUsers = async () => {}; //filter users

  const handleGroupCreation = async () => {
    console.log("groupMembers", groupMembers);
    if (groupMembers.length > 1) {
      groupMembers.push(currentUser);
      try {
        const res = await axios({
          url: `${import.meta.env.VITE_URL}/api/groups`,
          data: {
            name: document.getElementById("group-name").value,
            description: document.getElementById("group-description").value,
            groupMembers: groupMembers.map((member) => member._id),
          },
          method: "POST",
          withCredentials: true,
        });
        if (res.data.status === "success") {
          showAlert("Group created successfully", "home");
          socket.emit("group-creation", { user: currentUser, groupMembers });
          setSelectUser(false);
        }
      } catch (err) {
        showAlert("Group creation failed", "home");
      }
    } else showAlert("Group must have atleast 2 members", "home");
  };

  const handleRemoveGroupMember = (i) => {
    const newGroupMembers = [...groupMembers];
    newGroupMembers.splice(i, 1);
    setGroupMembers(newGroupMembers);
  };
  return (
    selectUser && (
      <div className="bg-blue-100 absolute z-40 w-[500px] h-[600px]  rounded-lg -translate-x-1/2 -translate-y-1/2 left-1/2 top-1/2 py-4 px-10 space-y-4">
        <div className=" flex-col pt-6 space-y-3">
          <div className="flex">
            <input
              type="text"
              className="w-[90%] h-8 rounded-s-lg bg-white block text-sm font-lato px-3 outline-none border-0"
              placeholder="search user"
              id="user-name"
            />

            <button
              className="w-14 bg-blue-400 rounded-e-lg text-xs font-lato  text-white hover:bg-blue-500"
              onClick={handleUsers}
            >
              GO
            </button>
            {isGroup ? (
              <IoCheckmarkDoneCircle
                size={30}
                color="white"
                className="cursor-pointer rounded-full w-fit h-fit p-1 bg-blue-400 hover:bg-blue-500 mx-2 "
                onClick={handleGroupCreation}
              />
            ) : (
              <MdOutlineGroups
                size={30}
                color="white"
                className="cursor-pointer rounded-full w-fit h-fit p-1 bg-blue-400 hover:bg-blue-500 mx-2 "
                onClick={() => setIsGroup(true)}
              />
            )}
          </div>
          {isGroup && (
            <>
              <input
                type="text"
                className="w-[60%] h-8 rounded-lg bg-white block text-sm font-lato px-3 outline-none border-0"
                placeholder="group name"
                id="group-name"
              />
              <input
                type="text"
                className="w-[60%] h-8 rounded-lg bg-white block text-sm font-lato px-3 outline-none border-0"
                placeholder="description"
                id="group-description"
              />
              <ul className="  rounded-lg  text-sm flex space-x-2">
                {groupMembers?.map((member, i) => (
                  <li
                    className="font-nunito  font-medium h-fit px-3 py-1 text-sm rounded-full bg-[#e3e3e3]"
                    key={i}
                  >
                    {member.name}{" "}
                    <RxCross1
                      className="inline cursor-pointer"
                      size={10}
                      onClick={() => handleRemoveGroupMember(i)}
                    />
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
        <ul className=" flex flex-col space-y-3">
          {allUsers?.map(
            (user, i) =>
              user._id !== currentUser?._id && (
                <li
                  className={`text-sm flex items-center justify-between font-semibold ${
                    user.active
                      ? "cursor-pointer"
                      : "cursor-not-allowed opacity-50"
                  } hover:bg-[#e2e2e2] py-1 rounded-lg pl-1 px-6 `}
                  onClick={() => handleUserSelction(user)}
                  key={i}
                >
                  <span className="flex items-center">
                    <FaUserCircle size={35} className="mr-3" />
                    {user.name}
                  </span>
                  <span
                    className={`${
                      user.active ? "bg-green-700" : "bg-red-700"
                    } w-2 h-2 rounded-full`}
                  ></span>
                </li>
              )
          )}
        </ul>
      </div>
    )
  );
}

export default SelectUser;
