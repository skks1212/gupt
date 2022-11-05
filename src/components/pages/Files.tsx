import { Alert, Button, Text, TextInput, ToastAndroid, TouchableOpacity, View } from "react-native";
import { pageStyles } from "../../styles/Page";
import { txtStyles } from "../../styles/Text";
import { PageProps } from "../../types/pagetypes";
import * as FileSystem from 'expo-file-system';
import { useContext, useEffect, useState } from "react";
import ModalOpen from "../Modal";
import { KeyStoreType } from "../../types/keytypes";
import { KeyStoreContext } from "../../contexts/KeyStore";
import { Block } from "../Block";
import { deleteSandook, displayFileStructure, FileLL, getFileStructure, s, verifySandookKey, VType } from "../../utils/SandookUtils";
import CryptoES from "crypto-es";
import { Ionicons } from '@expo/vector-icons';
import { HistoryContext } from "../../contexts/HistoryContext";
import Icon from "../Icon";

export default function Files() {

    const [history, setHistory] = useContext(HistoryContext);

    const [keyStore, setKeyStore] = useContext(KeyStoreContext);

    const [sandooks, setSandooks] = useState<FileLL[]>([]);
    const [newDirectory, setNewDirectory] = useState<KeyStoreType>({
        chaabi: "",
        sandook: ""
    });
    const [chaabiCreds, setChaabiCreds] = useState<KeyStoreType>({
        chaabi: "",
        sandook: ""
    })

    const [createModal, setCreateModal] = useState<boolean>(false);
    const [chaabiModal, setChaabiModal] = useState<boolean>(false);
    const [sandookModal, setSandookModal] = useState<boolean>(false);

    const [sandook, setSandook] = useState<string>("");

    const [chaabiError, setChaabiError] = useState<string>("");
    const folderName = "gupt";

    useEffect(() => {
        getFiles();
    }, []);

    const getFiles = async () => {
        const res = await FileSystem.readDirectoryAsync(FileSystem.documentDirectory || "");
        if (res.includes(folderName)) {
            const fStructure = await getFileStructure(FileSystem.documentDirectory + folderName + "/");
            setSandooks(fStructure);
        } else {
            await FileSystem.makeDirectoryAsync(FileSystem.documentDirectory + folderName + "/");
            setSandooks([]);
        }
    }

    const createSandook = async (sandookName: string) => {
        try {
            const sandookUrl = FileSystem.documentDirectory + folderName + "/" + sandookName
            await FileSystem.makeDirectoryAsync(sandookUrl);
            const content: VType = { version: "0.0.1", sandook: sandookName, chaabi: newDirectory.chaabi };
            const crypt = CryptoES.RC4.encrypt(JSON.stringify(content), newDirectory.chaabi).toString();
            await FileSystem.writeAsStringAsync(sandookUrl + "/.v", crypt);
            setKeyStore([...keyStore, newDirectory]);
            ToastAndroid.show('Sandook Created!', ToastAndroid.SHORT);
            getFiles();
        } catch (error) {
            ToastAndroid.show('Error: Name already Exists!', ToastAndroid.SHORT);
            console.log(error);
        }
    }

    const openSandook = (sandook: string) => {
        //check if sandook exists in keystore
        const sandookExists = keyStore.find(sandookObj => sandookObj.sandook === sandook);
        if (!sandookExists) {
            setChaabiModal(true);
            setChaabiCreds({
                chaabi: "",
                sandook
            })
        } else {
            setHistory([...history, { page: "SANDOOK", meta: sandook }]);
        }
    }

    return (
        <View style={pageStyles.page}>
            <View style={pageStyles.titleFlex}>
                <Text style={txtStyles.title}>Sandooks</Text>
                <TouchableOpacity style={{}} onPress={() => setCreateModal(true)}>
                    <Text>
                        <Icon
                            name="add-circle"
                            style={[txtStyles.base, txtStyles.largeText, { fontSize: 30, color: "dodgerblue" }]}
                        />
                    </Text>
                </TouchableOpacity>

            </View>

            <View style={[pageStyles.column_2, { marginBottom: 10, marginTop: 30 }]}>
                {
                    sandooks.map((ll, i) => {
                        return (
                            <Block key={i} onPress={() => openSandook(ll.name)} onLongPress={() => { setSandook(ll.name); setSandookModal(true); }}>
                                <Text style={txtStyles.base}>
                                    {s(ll.name)}
                                </Text>
                                <Text>
                                    <Ionicons
                                        name={keyStore.find(sandook => sandook.sandook === ll.name) ? "lock-open-outline" : "lock-closed-outline"}
                                        style={{ fontSize: 16, color: keyStore.find(sandook => sandook.sandook === ll.name) ? "dodgerblue" : "white" }}
                                    />
                                </Text>
                            </Block>
                        )
                    })
                }
            </View>
            {/*<Button onPress={() => deleteAll()} title="Delete All" />*/}
            <ModalOpen
                modal={createModal}
                setModal={setCreateModal}
            >
                <>
                    <Text style={[txtStyles.largeText, txtStyles.base, { marginBottom: 10 }]}>
                        Create new Sandook
                    </Text>
                    <TextInput
                        style={pageStyles.input}
                        placeholderTextColor="gray"
                        placeholder="Enter sandook name"
                        onChangeText={newText => setNewDirectory({ ...newDirectory, sandook: newText })}
                        defaultValue={newDirectory.sandook}
                    />
                    <TextInput
                        secureTextEntry={true}
                        style={[pageStyles.input, { marginTop: 10 }]}
                        placeholderTextColor="gray"
                        placeholder="Enter Chaabi"
                        onChangeText={newText => setNewDirectory({ ...newDirectory, chaabi: newText })}
                        defaultValue={newDirectory.chaabi}
                    />
                    <Text style={[txtStyles.base, { marginTop: 10 }]}>
                        Note : A Sandook cannot be opened without it's Chaabi. Make sure you remember it.
                    </Text>
                    <View style={[pageStyles.titleFlex, { marginTop: 10 }]}>
                        <Button
                            title={"Create"}
                            onPress={() => {
                                try {
                                    createSandook(newDirectory.sandook + "_sandook")
                                    setCreateModal(false)
                                    setNewDirectory({ sandook: "", chaabi: "" });
                                } catch (error) {

                                }
                            }}
                        />
                        <Button
                            title={"Cancel"}
                            color="red"
                            onPress={() => {
                                setCreateModal(false);
                                setNewDirectory({ sandook: "", chaabi: "" });
                            }}
                        />
                    </View>
                </>
            </ModalOpen>
            <ModalOpen
                modal={chaabiModal}
                setModal={setChaabiModal}
            >
                <>
                    <Text style={[txtStyles.largeText, txtStyles.base, { marginBottom: 10 }]}>
                        Open "{s(chaabiCreds.sandook)}"
                    </Text>
                    <TextInput
                        secureTextEntry={true}
                        style={pageStyles.input}
                        placeholderTextColor="gray"
                        placeholder="Enter Chaabi"
                        onChangeText={newText => setChaabiCreds({ ...chaabiCreds, chaabi: newText })}
                        defaultValue={chaabiCreds.chaabi}
                    />
                    <Text style={[txtStyles.base, { marginTop: 10, color: "red" }]}>
                        {chaabiError}
                    </Text>
                    <View style={[pageStyles.titleFlex, { marginTop: 10 }]}>
                        <Button
                            title={"Open"}
                            onPress={async () => {
                                try {
                                    const check = await verifySandookKey(chaabiCreds);
                                    if (check) {
                                        setChaabiModal(false);
                                        setChaabiCreds({ chaabi: "", sandook: "" });
                                        setChaabiError("");
                                        setKeyStore([...keyStore, { sandook: chaabiCreds.sandook, chaabi: chaabiCreds.chaabi }]);
                                        setHistory([...history, { page: "SANDOOK", meta: chaabiCreds.sandook }]);
                                        ToastAndroid.show('Sandook Opened!', ToastAndroid.SHORT);
                                    }
                                } catch (error) {
                                    if (typeof error === "string") {
                                        setChaabiError(error);
                                    } else {
                                        console.log(error);
                                    }
                                }
                            }}
                        />
                        <Button
                            title={"Cancel"}
                            color="red"
                            onPress={() => {
                                setChaabiModal(false);
                                setChaabiCreds({ sandook: "", chaabi: "" });
                            }}
                        />
                    </View>
                </>
            </ModalOpen>

            {/* SANDOOK MENU */}
            <ModalOpen
                modal={sandookModal}
                setModal={setSandookModal}
            >
                <>
                    <Text style={[txtStyles.largeText, txtStyles.base, { marginBottom: 10 }]}>
                        {sandook}
                    </Text>
                    <View>
                        {keyStore.find(k => k.sandook === sandook) && (
                            <Button
                                title={"Lock"}
                                onPress={() => {
                                    setKeyStore(keyStore.filter(k => k.sandook !== sandook));
                                    ToastAndroid.show('Sandook Locked!', ToastAndroid.SHORT);
                                    setSandookModal(false);
                                }}
                            />
                        )}
                        <View style={{ marginTop: 10, marginBottom: 10 }}>
                            <Button
                                title={"Clear Contents"}
                                color="red"
                                onPress={() => {
                                    setKeyStore(keyStore.filter(k => k.sandook !== sandook));
                                    setSandookModal(false);
                                }}
                            />
                        </View>

                        <Button
                            title={"Delete"}
                            color="red"
                            onPress={async () => {
                                Alert.alert('Delete Sandook', 'You will not be able undo this', [
                                    {
                                        text: 'Cancel',
                                        onPress: () => console.log('Cancel Pressed'),
                                        style: 'cancel',
                                    },
                                    {
                                        text: 'Confirm', onPress: async () => {
                                            const a = await deleteSandook(sandook);
                                            a && setSandookModal(false);
                                            a && ToastAndroid.show('Sandook Deleted!', ToastAndroid.SHORT);
                                            a && setKeyStore(keyStore.filter(k => k.sandook !== sandook));
                                            a && getFiles();
                                        }
                                    },
                                ]);

                            }}
                        />

                    </View>
                    <View style={[pageStyles.titleFlex, { marginTop: 10, justifyContent: "flex-end" }]}>
                        <Button
                            title={"Close"}
                            color="gray"
                            onPress={() => {
                                setSandook("");
                                setSandookModal(false);
                            }}
                        />
                    </View>
                </>
            </ModalOpen>
        </View>
    )
}