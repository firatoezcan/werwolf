import Peer from "peerjs";
import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";

type PeerContextType = {
  id: string;
  peer: Peer;
  connect: (id: string, options?: Peer.PeerConnectOption) => Promise<void>;
  connections: Peer.DataConnection[];
};
const PeerContext = createContext<PeerContextType>({} as PeerContextType);

export const PeerContextProvider = ({ children }) => {
  const lastPeerId = useRef<string>("");

  // const [events, setEvents] = useState([]);

  const [id, setId] = useState("");
  const initializePeer = () => {
    const peer = new Peer(undefined, {
      debug: 2,
    });
    peer.on("open", (id) => {
      // Workaround for peer.reconnect deleting previous id
      if (peer.id === null) {
        console.log("Received null id from peer open");
        peer.id = lastPeerId.current;
      } else {
        lastPeerId.current = peer.id;
      }
      setId(peer.id);
    });
    peer.on("connection", (connection) => {
      // Workaround for peer.reconnect deleting previous id
      console.log(connection.peer);
      setConnections((prev) => [...prev, connection]);
    });
    peer.on("close", () => {
      console.log("Closed");
    });
    peer.on("disconnected", () => {
      // Workaround for peer.reconnect deleting previous id
      console.log("Disconnected");
    });
    return peer;
  };
  const peer = useMemo(initializePeer, []);
  const [connections, setConnections] = useState<Peer.DataConnection[]>([]);
  useEffect(() => {
    const timeout = setTimeout(() => {
      const connections = Object.values(peer.connections)
        .filter((peer: any) => peer.length)
        .flat() as Peer.DataConnection[];
      setConnections(connections);
    }, 2000);
    return () => {
      clearTimeout(timeout);
    };
  });
  const connect = (id: string, options?: Peer.PeerConnectOption) =>
    new Promise<void>((resolve, reject) => {
      const existingConnection = peer.connections[id];
      if (existingConnection) return resolve();
      const connection = peer.connect(id, options);
      connection.on("open", () => {
        console.log("Connected to: " + connection.peer);
        resolve();
      });

      const handleData = (data) => {
        console.log(data);
      };
      // Handle incoming data (messages only since this is the signal sender)
      connection.on("data", handleData);

      const handleError = (err) => {
        console.log("ERROR");
        connection.off("data", handleData);
        connection.off("error", handleError);
        peer.off("error", handleError);
        connection.close();
        reject(err.message);
      };
      peer.on("error", handleError);
      connection.on("error", handleError);
      connection.on("close", () => {
        resolve();
        console.log("Closed connection", connection.peer);
      });
    });
  return <PeerContext.Provider value={{ id, peer, connect, connections }}>{children}</PeerContext.Provider>;
};

export const usePeer = () => {
  const context = useContext(PeerContext);
  if (!context) throw new Error("PeerContext must be used with PeerContextProvider!");
  return context;
};
