import { ReactNode } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";

export function Block(props: { children: ReactNode, onPress?: () => void, onLongPress?: () => void }) {
    return (
        <TouchableOpacity style={styles.block} onPress={props.onPress} onLongPress={props.onLongPress}>
            {props.children}
        </TouchableOpacity>
    )
}

const styles = StyleSheet.create({
    block: {
        backgroundColor: "#171717",
        width: "48%",
        borderRadius: 10,
        padding: 10,
        marginBottom: 5,
        borderWidth: 1,
        borderColor: "#1F1F1F",
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-between",
    }
});