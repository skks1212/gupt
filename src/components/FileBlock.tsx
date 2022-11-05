import { ReactNode, useContext, useEffect, useState } from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { StorageContext } from "../contexts/StorageContext";
import { txtStyles } from "../styles/Text";
import { VFileIndexType, viewFile } from "../utils/SandookUtils";

export function FileBlock(props: {
    onPress?: () => void,
    onLongPress?: () => void,
    icon: string,
    name: string,
    type?: string,
    file?: VFileIndexType,
    keyPair?: {
        sandook: string,
        chaabi: string
    }
}) {

    const [storage, setStorage] = useContext(StorageContext);

    const { onPress, onLongPress, icon, name, file, keyPair } = props;

    const thumbnail = file?.thumbnail;

    //const [uri, setUri] = useState<string | null>(null);

    /*const loadUri = async () => {
        if (file?.thumbnail && keyPair) {
            //setUri(await viewFile(file, keyPair));
            setUri(file.thumbnail)
        }
    }*/

    useEffect(() => {
        if (file?.thumbnail && keyPair) {
            ///loadUri();
        }
    }, [])


    return (
        <TouchableOpacity style={styles.block} onPress={onPress} onLongPress={onLongPress}>
            {thumbnail && storage?.settings.showThumbnails ? (
                <View style={styles.iconBlock}>
                    <Image
                        style={{ width: "100%", height: "100%" }}
                        source={{ uri: "data:image/png;base64," + thumbnail }}
                    />
                </View>
            ) : (
                <View style={styles.iconBlock}>
                    <Text style={styles.icon}>
                        {icon}
                    </Text>
                </View>
            )}

            <View style={styles.text}>
                <Text style={txtStyles.base}>
                    {name.slice(0, 20)}
                </Text>
            </View>
        </TouchableOpacity>
    )
}

const styles = StyleSheet.create({
    block: {
        width: "46%",
        borderRadius: 10,
        marginBottom: 15,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
    },
    iconBlock: {
        width: "100%",
        aspectRatio: 1,
        borderRadius: 10,
        backgroundColor: "#171717",
        borderWidth: 1,
        borderColor: "#1F1F1F",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        overflow: "hidden",
    },
    icon: {
        fontSize: 50,
        color: "#FFF",
    },
    text: {
        marginTop: 10,
    }
});