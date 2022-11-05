export type KeyStoreType = {
    chaabi: string,
    sandook: string,
}

export type KeyStoreHookType = [KeyStoreType[], (keyStore: KeyStoreType[]) => void];