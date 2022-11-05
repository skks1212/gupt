import { createContext } from "react";
import { KeyStoreHookType } from "../types/keytypes";

export const KeyStoreContext = createContext<KeyStoreHookType>([[], () => { }]);