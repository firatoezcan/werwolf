import React, { FC, useState } from "react";
import "./App.css";
import { Input } from "./components/Input";
import { Button } from "./components/Button";
import { usePeer } from "./contexts/PeerContext";

type CheckboxProps = {
  name: string;
  label: string;
  hint?: string;
};
const Checkbox: FC<CheckboxProps> = ({ name, label, hint }) => {
  return (
    <div className="flex items-start">
      <div className="flex items-center h-5">
        <input id={name} name={name} type="checkbox" className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500" />
      </div>
      <div className="ml-3 text-sm">
        <label htmlFor={name} className="font-medium text-gray-700">
          {label}
        </label>
        {hint && <p className="text-gray-500">{hint}</p>}
      </div>
    </div>
  );
};

const CreateOrJoin = () => {
  const { peer, connect, connections } = usePeer();
  console.log(peer);
  const connectionId = peer.id;
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const { connectionId, name } = Object.fromEntries(new FormData(e.currentTarget));
    setIsLoading(true);
    try {
      await connect(connectionId as string, { metadata: { name } });
    } catch (e) {
      setError(e);
    }
    setIsLoading(false);
  };
  const playerCount = connections.length;
  const hasConnections = playerCount > 0;

  return (
    <div className="flex items-center justify-center min-h-full my-auto">
      <div className="flex">
        <div className="flex-shrink-0 mt-8 sm:w-full sm:max-w-lg">
          <div className="px-4 py-8 bg-white shadow sm:rounded-lg sm:px-10">
            <div className="flex items-center sm:mx-auto sm:w-full sm:max-w-md">
              <img className="w-auto h-12 mr-4" src="/Werwölfe.jpeg" alt="Werwölfe von Düsterwald" height="48" width="48" />{" "}
              <span className="text-3xl font-medium font-horror">Werwoelfe von Duesterwald</span>
            </div>
            <form className="mt-8 space-y-6" onSubmit={onSubmit}>
              <p className="mb-3 text-lg">
                Deine Connection ID ist: <span className="font-medium">{connectionId}</span>
              </p>
              {!hasConnections ? (
                <>
                  <div className="relative mt-6">
                    <div className="absolute inset-0 flex items-center" aria-hidden="true">
                      <div className="w-full border-t border-gray-300"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 text-gray-500 bg-white">oder tritt einer bestehenden Lobby bei</span>
                    </div>
                  </div>
                  <Input label="Connection ID eingeben" required name="connectionId" type="text" placeholder="Connection ID" />
                  <Input label="Nickname" required name="name" type="text" placeholder="xX_W33dLord-420" />
                  <Button type="submit" scheme="primary" size="2" className="flex justify-center w-full">
                    {isLoading ? <div className="w-8 h-8 ease-linear border-2 border-t-2 border-gray-200 rounded-full loader"></div> : <>Lobby beitreten</>}
                  </Button>
                  {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
                </>
              ) : (
                <>
                  <fieldset>
                    <legend className="text-base font-medium text-gray-900">Spezielle Rollen</legend>
                    <div className="mt-4 space-y-4">
                      <Checkbox name="seher" label="Seher" hint="Der kann deine Unterhose sehen" />
                      <Checkbox name="raeuber" label="Räuber" hint="Bla bla whatever" />
                      <Checkbox name="hauptmann" label="Hauptmann" hint="Hat legit den dicksten Cock, booya" />
                    </div>
                  </fieldset>
                  <Button type="submit" scheme="primary" size="2" className="flex justify-center w-full">
                    Game starten
                  </Button>
                </>
              )}
            </form>
          </div>
        </div>
        <div className="mt-8 sm:w-full sm:max-w-lg">
          <div className="px-4 sm:px-10">
            <div className="flex items-center sm:mx-auto sm:w-full sm:max-w-md">
              <span className="text-2xl font-medium">Mitspieler ({playerCount}):</span>
            </div>
            {connections.map((conn) => {
              return <p className="mb-3 text-3xl font-horror">{conn.metadata.name}</p>;
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

function App() {
  return (
    <div className="h-screen font-sans bg-gray-300">
      <div className="container h-full px-4 mx-auto sm:px-6 lg:px-8">
        <CreateOrJoin />
      </div>
    </div>
  );
}

export default App;
