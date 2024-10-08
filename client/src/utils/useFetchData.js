import { useEffect, useContext } from "react";
import axios from "axios";
import { GlobalState } from "../context/GlobalState";

const useFetchData = (setContacts, contacts) => {
  const {
    seTGiveAccess,
    setCurrentUser,
    setFetch,
    setUnreadMessages,
    setShowErr,
    fetchUserChats,
    setFetchUserChats,
    setLastMessage,
    lastMessage,
    giveAccess,
  } = useContext(GlobalState);

  useEffect(() => {
    async function fetchData() {
      setFetch(true)
      try {
        const res = await axios.get(`${import.meta.env.VITE_URL}/api/home`, {
          withCredentials: true,
        });
        if (res.data?.status === "success") {
          setFetchUserChats(true)
          setCurrentUser(res.data.user);
          setFetch(false);
          seTGiveAccess(true);
          setUnreadMessages(res.data.user.unreadMessages);
        }
      } catch (err) {
        setFetch(false);
        setShowErr({ status: true, message: err.response?.data.message });
      }
    }
    fetchData();
  }, []);

  useEffect(() => {
    if (fetchUserChats && giveAccess) {
      (async () => {
        const res = await axios.get(
          `${import.meta.env.VITE_URL}/api/users/userContacts`,
          {
            withCredentials: true,
          }
        );
        if (res.data?.status === "success") {
          const response = await axios.get(
            `${import.meta.env.VITE_URL}/api/messages/last-messages`,
            {
              withCredentials: true,
            }
          );
          if (response.data) {
            setLastMessage(response.data.lastMessages);
          }
          setContacts(res.data.contactUsers);
          setFetchUserChats(false);
        }
      })();
    }
  }, [fetchUserChats, giveAccess]);

  useEffect(() => {
    if (lastMessage?.length > 0) {
      const sortedLastMessages = lastMessage.sort(
        (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
      );
      const orderedContacts = sortedLastMessages.map((item) =>
        contacts?.find((contact) => contact._id === item.contactId)
      );
      setContacts(orderedContacts);
    }
  }, [lastMessage]);
};

export default useFetchData;
