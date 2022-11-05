import { createContext } from "react";

export type HistoryType = {
    page: string,
    meta?: any,
}

export type HistoryHookType = [HistoryType[], (page: HistoryType[]) => void];

export const HistoryContext = createContext<HistoryHookType>([[{ page: "HOME" }], () => { }]);