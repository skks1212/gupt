import { useContext } from "react";
import { StyleSheet, Switch, Text, TouchableOpacity, View } from "react-native";
import { KeyStoreContext } from "../../contexts/KeyStore";
import { HistoryContext } from "../../contexts/HistoryContext";
import { pageStyles } from "../../styles/Page";
import { txtStyles } from "../../styles/Text";
import { PageProps } from "../../types/pagetypes";
import { StorageContext } from "../../contexts/StorageContext";

export default function Settings() {

    const [storage, setStorage] = useContext(StorageContext);
    const [history, setHistory] = useContext(HistoryContext);
    const [keyStore, setKeyStore] = useContext(KeyStoreContext);
    const settings = [
        {
            name: "Enable Screen Capture",
            value: storage?.settings.allowScreenCapture,
            action: () => {
                if (storage) {
                    setStorage({
                        ...storage,
                        settings: {
                            ...storage.settings,
                            allowScreenCapture: !storage.settings.allowScreenCapture
                        }
                    })
                }
            }
        },
        {
            name: "Show Thumbnails",
            value: storage?.settings.showThumbnails,
            action: () => {
                if (storage) {
                    setStorage({
                        ...storage,
                        settings: {
                            ...storage.settings,
                            showThumbnails: !storage.settings.showThumbnails
                        }
                    })
                }
            }
        }
    ]

    return (
        <View style={pageStyles.page}>
            <Text style={txtStyles.title}>Settings</Text>
            <View style={{ marginTop: 30 }}>
                {settings.map((setting, index) =>
                    <View key={index} style={styles.settingBlock}>
                        <Text style={txtStyles.base}>{setting.name}</Text>
                        <Switch
                            trackColor={{ false: "gray", true: "blue" }}
                            thumbColor={setting.value ? "dodgerblue" : "gray"}
                            ios_backgroundColor="#3e3e3e"
                            onValueChange={setting.action}
                            value={setting.value}
                        />
                    </View>
                )}
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    settingBlock: {
        borderRadius: 10,
        backgroundColor: "#171717",
        borderWidth: 1,
        borderColor: "#1F1F1F",
        display: "flex",
        flexDirection: "row",
        paddingHorizontal: 30,
        paddingVertical: 10,
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 10
    },
});