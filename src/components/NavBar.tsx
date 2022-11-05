import { StyleSheet, Text, View } from "react-native";
import React, { useContext } from "react";
import NavBarButton from "./navbar/Buttons";
import { PageProps } from "../types/pagetypes";
import { HistoryContext } from "../contexts/HistoryContext";
export default function NavBar() {

    const [history, setHistory] = useContext(HistoryContext);

    const buttons = [
        //{ name: "Home", link: "HOME", icon: "home" },
        { name: "Sandooks", link: "SANDOOKS", icon: "treasure-chest" },
        { name: "Settings", link: "SETTINGS", icon: "settings" },
        //{ name: "About", link: "ABOUT", icon: "👤" }
    ]

    return (
        <View style={styles.navBar}>
            {buttons.map((button, index) =>
                <NavBarButton key={index} {...button} />
            )}
        </View>
    )
}

const styles = StyleSheet.create({
    navBar: {
        flexShrink: 0,
        width: "100%",
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-between",

    },
});