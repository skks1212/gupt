import { useContext, useEffect, useState } from "react";
import { Alert, Button, ScrollView, SectionList, Text, ToastAndroid, TouchableOpacity, View } from "react-native";
import { HistoryContext } from "../../contexts/HistoryContext";
import { pageStyles } from "../../styles/Page";
import { txtStyles } from "../../styles/Text";
import { deleteFile, exportFile, fileIcons, FileLL, fileTypes, getFileExtension, getFileStructure, getSandookV, makeGupt, s, VFileIndexType, viewFile, VType } from "../../utils/SandookUtils";
import * as FileSystem from 'expo-file-system';
import * as DocumentPicker from 'expo-document-picker';
import { KeyStoreContext } from "../../contexts/KeyStore";
import { FileBlock } from "../FileBlock";
import Header from "../navbar/Header";
import ModalOpen from "../Modal";

export default function SandookIndex() {

    const [keyStore, setKeyStore] = useContext(KeyStoreContext);
    const [history, setHistory] = useContext(HistoryContext);
    const [fileLL, setFileLL] = useState<FileLL | null>(null);
    const [progress, setProgress] = useState<number>(0);
    const [uploadModal, setUploadModal] = useState(false);
    const [v, setV] = useState<VType | null>(null);

    const [modalOpen, setModalOpen] = useState(false);
    const [modalContent, setModalContent] = useState<VFileIndexType | null>(null);
    const page = history[history.length - 1];

    const sandook = page.meta as string;
    const location = FileSystem.documentDirectory + "gupt/" + sandook;
    const chaabi = keyStore.find(key => key.sandook === sandook)?.chaabi || "";
    const keyPair = { sandook, chaabi };
    useEffect(() => {
        if (page.meta == null || !keyStore.find(key => key.sandook == sandook)) {
            setHistory([...history, { page: "SANDOOKS" }])
            ToastAndroid.show("No Sandook Selected", ToastAndroid.SHORT);
        } else {
            loadSandook();
        }
    }, [page]);

    const loadSandook = async () => {
        try {
            const fs = await getFileStructure(location);
            setFileLL({
                name: sandook,
                contents: fs.filter(f => !f.contents && !f.name.includes(".v")),
            });
            const vFile = await getSandookV(keyPair);
            setV(vFile);
        } catch (e) {
            if (typeof e === "string") {
                ToastAndroid.show(e, ToastAndroid.SHORT);
            }
        }
    }

    const uploadFile = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: "*/*",
                copyToCacheDirectory: false,
            });
            if (result.type === "success") {
                const file = result;
                setUploadModal(true);
                await makeGupt(file, keyPair, setProgress);
                setUploadModal(false);
                setProgress(0);
                loadSandook();
            }
        } catch (e) {
            console.log(e);
            setUploadModal(false);
            setProgress(0);
            ToastAndroid.show(e as string, ToastAndroid.SHORT);
        }
    }

    if (!fileLL) {
        return (
            <View style={pageStyles.page}>
                <Text style={txtStyles.title}>Loading...</Text>
            </View>
        )
    }

    return (
        <View style={[pageStyles.page, { padding: 0, flex: 1 }]}>
            <Header
                title={s(sandook)}
                leftIcon="arrow-back-outline"
                leftIconPress={() => setHistory(history.slice(0, history.length - 1))}
                rightIcon="add-circle-outline"
                rightIconPress={uploadFile}
            />
            <ScrollView style={{ padding: 20, flex: 1 }}>
                <Text style={txtStyles.base}>
                    {v?.fileIndex?.length} Files
                </Text>
                <View style={[pageStyles.column_2, { marginBottom: 20, marginTop: 10, alignItems: "stretch" }]}>
                    {
                        v?.fileIndex?.map((f, i) => {
                            return (
                                <FileBlock
                                    key={i}
                                    onPress={async () => {
                                        const extension = getFileExtension(f.originalName);
                                        if (fileTypes.image.find(type => type === extension)) {
                                            setHistory([...history, { page: "IMAGE", meta: { f, keyPair } }]);
                                        } else if (fileTypes.video.find(type => type === extension)) {
                                            setHistory([...history, { page: "VIDEO", meta: { f, keyPair } }]);
                                        } else if (fileTypes.audio.find(type => type === extension)) {
                                            setHistory([...history, { page: "AUDIO", meta: { f, keyPair } }]);
                                        } else if (fileTypes.text.find(type => type === extension)) {
                                            setHistory([...history, { page: "TEXT", meta: { f, keyPair } }]);
                                        } else {
                                            ToastAndroid.show("File type not supported", ToastAndroid.SHORT);
                                        }
                                    }}
                                    onLongPress={() => {
                                        setModalContent(f);
                                        setModalOpen(true);
                                    }}
                                    icon={fileIcons[f.originalName.split(".")[f.originalName.split(".").length - 1] as keyof typeof fileIcons] || fileIcons.default}
                                    name={f.originalName}
                                    file={f}
                                    keyPair={keyPair}
                                />
                            )
                        })
                    }
                </View>
            </ScrollView>
            {modalContent && (
                <FileMenu
                    modal={modalOpen}
                    setModal={setModalOpen}
                    file={modalContent}
                    keyPair={keyPair}
                    onDelete={async () => {
                        Alert.alert('Delete File', 'You will not be able undo this', [
                            {
                                text: 'Cancel',
                                onPress: () => console.log('Cancel Pressed'),
                                style: 'cancel',
                            },
                            {
                                text: 'Confirm', onPress: async () => {
                                    const del = await deleteFile(modalContent, keyPair);
                                    if (del) {
                                        ToastAndroid.show('File Deleted!', ToastAndroid.SHORT);
                                        setModalOpen(false);
                                        loadSandook();
                                    } else {
                                        ToastAndroid.show('Error Deleting File!', ToastAndroid.SHORT);
                                    }
                                }
                            },
                        ]);
                    }}
                />
            )}
            <ModalOpen
                modal={uploadModal}
                setModal={setUploadModal}
            >
                <Text style={[txtStyles.base, { textAlign: "center" }]}>
                    Encrypting... {progress * 100}%
                </Text>
            </ModalOpen>
        </View>
    )
}

export function FileMenu(props: {
    modal: boolean,
    setModal: (modal: boolean) => void,
    file: VFileIndexType,
    keyPair: { sandook: string, chaabi: string },
    onDelete?: () => void,
}) {
    const { modal, setModal, file, keyPair, onDelete } = props;

    return <ModalOpen
        modal={modal}
        setModal={setModal}
    >
        <>
            <Text style={[txtStyles.largeText, txtStyles.base, { marginBottom: 10 }]}>
                {file.originalName}
            </Text>
            <View>
                <Button
                    title={"Export"}
                    onPress={async () => {
                        const exp = await exportFile(file, keyPair);
                        if (exp) {
                            ToastAndroid.show('File exported!', ToastAndroid.SHORT);
                            setModal(false);
                        }
                    }}
                />
                <View style={{ marginTop: 10, marginBottom: 10 }}>
                    <Button
                        title={"Delete File"}
                        color="red"
                        onPress={onDelete}
                    />
                </View>
            </View>
            <View style={[pageStyles.titleFlex, { marginTop: 10, justifyContent: "flex-end" }]}>
                <Button
                    title={"Close"}
                    color="gray"
                    onPress={() => {
                        setModal(false);
                    }}
                />
            </View>
        </>
    </ModalOpen>
}