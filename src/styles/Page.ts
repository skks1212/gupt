import { StatusBar, StyleSheet } from "react-native";

export const pageStyles = StyleSheet.create({
    page: {
        padding: 20,
        marginTop: StatusBar.currentHeight
    },
    column_2: {
        display: "flex",
        flexDirection: "row",
        flexWrap: "wrap",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 10
    },
    input: {
        backgroundColor: "#1B1B1B",
        color: "white",
        padding: 10,
        borderRadius: 5,
        fontSize: 16,
        width: "100%"
    },
    titleFlex: {
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    button: {
        backgroundColor: "dodgerblue",
        padding: 10,
        borderRadius: 5,
    },
    singleButton: {
        display: "flex",
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        fontSize: 20,
        padding: 0,
        width: 40,
        height: 40,
        borderRadius: 20,
    },
});