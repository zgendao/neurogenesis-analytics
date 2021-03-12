import { createContext, useState } from "react";

const DexesContext = createContext();

const DexesProvider = ({ children }) => {
  const [dexes, setDexes] = useState({
    total: { label: "Total", active: true },
    uni: { label: "UniSwap", active: true },
    sushi: { label: "SushiSwap", active: true },
    pancake: { label: "PancakeSwap", active: true },
    mdex: { label: "Mdex", active: true },
    honey: { label: "HoneySwap", active: true },
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
