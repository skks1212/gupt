import { Button, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import React, { useContext } from "react";
import { PageProps } from "../../types/pagetypes";
import { HistoryContext } from "../../contexts/HistoryContext";
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
export default function NavBarButton(props: {
    name: string,
    link: string,
    icon: string
}) {
    const [history, setHistory] = useContext(HistoryContext);
    const { name, link, icon } = props;
    const page = history[history.length - 1];

    return (
        <TouchableOpacity
            style={styles.button}
            onPress={() => {
                setHistory([...history, { page: link }]);
            }}
        >

            <Text
                style={[
                    styles.buttonIcon,
                    {
                        color: page.page === link ? "dodgerblue" : "white"
                    }
                ]}
            >
                {icon === "treasure-chest" ? (
                    <MaterialCommunityIcons name={icon as any} style={{ fontSize: 20 }} />
                ) : (
                    <Ionicons name={(icon + (page.page === link ? "" : "-outline")) as any} style={{ fontSize: 20 }} />
                )}
            </Text>
            <Text
                style={{
                    ...styles.buttonText,
                    height: page.page === link ? "auto" : 0,
                }}
            >
                {name}
            </Text>

        </TouchableOpacity>
    )
}
const styles = StyleSheet.create({
    button: {
        color: "white",
        padding: 10,
        flex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
    },
    buttonIcon: {
        color: "white",
        textAlign: "center",
        fontSize: 20,
    },
    buttonText: {
        fontSize: 11,
        color: "gray",
        marginTop: 5,
        height: 0,
        transition: "0.2s",
    },
});