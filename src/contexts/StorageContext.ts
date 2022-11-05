import { createContext } from "react";

export type StorageType = {
    settings: {
        allowScreenCapture: boolean;
        showThumbnails: boolean;
    }
}

export type StorageHookType = [StorageType | null, (store: StorageType) => void];

export const StorageContext = createContext<StorageHookType>([null, () => { }]);