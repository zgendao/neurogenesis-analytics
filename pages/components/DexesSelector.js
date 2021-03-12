import { DexesContext } from "../../providers/dexes";
import { useContext } from "react";
import { Button, ButtonGroup } from "@chakra-ui/button";
import { CheckIcon } from "@chakra-ui/icons";
import { ScaleFade } from "@chakra-ui/transition";
import theme from "../../theme";
import { useColorModeValue } from "@chakra-ui/color-mode";

export default function DexesSelector() {
  const { dexes } = useContext(DexesContext);

  return (
    <ButtonGroup spacing={2} pb={8}>
      {Object.keys(dexes).map((key, i) => (
        <SelectorButton key={key} actDex={key} />
      ))}
    </ButtonGroup>
  );
}

function SelectorButton({ actDex: key }) {
  const { dexes, toggleDex } = useContext(DexesContext);

  const bg = useColorModeValue(theme.colors[key][100], theme.colors[key][700]);
  const color = useColorModeValue(
    theme.colors[key][600],
    theme.colors[key][100]
  );
  const hoverBg = useColorModeValue(
    theme.colors[key][200],
    theme.colors[key][600]
  );
  const activeBg = useColorModeValue(
    theme.colors[key][300],
    theme.colors[key][700]
  );

  return (
    <Button
      bg={dexes[key].active ? bg : "transparent"}
      border="1px"
      borderColor={bg}
      borderWidth="2px"
      color={color}
      _hover={{
        background: hoverBg,
        borderColor: hoverBg,
      }}
      _active={{
        background: activeBg,
        borderColor: activeBg,
      }}
      leftIcon={<SelectedCheck isOpen={dexes[key].active} />}
      onClick={() => toggleDex(key)}
      pl={dexes[key].active ? 4 : 3}
    >
      {dexes[key].label}
    </Button>
  );
}

function SelectedCheck({ isOpen }) {
  return (
    <ScaleFade
      initialScale={0.1}
      in={isOpen}
      style={{
        width: isOpen ? "16px" : "0",
        transition: "width .2s",
      }}
    >
      <CheckIcon />
    </ScaleFade>
  );
}
