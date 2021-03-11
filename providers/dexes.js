import { createContext, useState } from "react";

const DexesContext = createContext();

const DexesProvider = ({ children }) => {
  const [dexes, setDexes] = useState({
    uni: { label: "UniSwap", color: "rgb(255, 0, 122)", active: true },
    sushi: { label: "SushiSwap", color: "blue", active: true },
    pancake: { label: "PancakeSwap", color: "brown", active: true },
    mdex: { label: "Mdex", color: "red", active: true },
    honey: { label: "HoneySwap", color: "yellow", active: true },
  });

  const toggleDex = (key) => {
    const newDex = dexes[key];
    newDex.active = !newDex.active;
    setDexes({ ...dexes, [key]: newDex });
  };

  return (
    <DexesContext.Provider
      value={{
        dexes,
        toggleDex,
      }}
    >
      {children}
    </DexesContext.Provider>
  );
};

export { DexesContext, DexesProvider };
