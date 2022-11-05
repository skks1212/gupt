import { StyleSheet, Text, TouchableOpacity, View } from "react-native"
import { Ionicons } from '@expo/vector-icons';

export default function Header(props: {
    title: string,
    leftIcon?: string,
    rightIcon?: string,
    leftIconPress?: () => void,
    rightIconPress?: () => void
}) {

    const { title, leftIcon, rightIcon, leftIconPress, rightIconPress } = props;

    return (
        <View style={styles.header}>
            <TouchableOpacity onPress={leftIconPress} style={styles.button}>
                {leftIcon && <Ionicons name={leftIcon as any} style={styles.icon} />}
            </TouchableOpacity>
            <Text style={styles.headerText}>

                {title}
            </Text>
            <TouchableOpacity onPress={rightIconPress} style={styles.button}>
                {rightIcon && <Ionicons name={rightIcon as any} style={styles.icon} />}
            </TouchableOpacity>
        </View>
    )
}

const styles = StyleSheet.create({
    header: {
        width: "100%",
        height: 50,
        backgroundColor: "#000",
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    headerText: {
        color: "#fff",
        fontSize: 20,
        fontFamily: "Manrope-Bold",
    },
    icon: {
        color: "#fff",
        fontSize: 25,
    },
    button: {
        height: 45,
        width: 45,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
    }
})