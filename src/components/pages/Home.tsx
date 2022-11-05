import { useContext } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { KeyStoreContext } from "../../contexts/KeyStore";
import { HistoryContext } from "../../contexts/HistoryContext";
import { pageStyles } from "../../styles/Page";
import { txtStyles } from "../../styles/Text";
import { PageProps } from "../../types/pagetypes";

export default function Home() {

    const [history, setHistory] = useContext(HistoryContext);
    const [keyStore, setKeyStore] = useContext(KeyStoreContext);

    const heroButtons = [
        { name: "Access Sandook", link: "SANDOOKS", icon: "📦" },
    ]

    return (
        <View style={pageStyles.page}>
            <Text style={[txtStyles.title, { textAlign: "center" }]}>Gupt</Text>
            <View style={pageStyles.column_2}>
                {heroButtons.map((button, index) =>
                    <TouchableOpacity key={index} style={styles.heroBtn} onPress={() => setHistory([...history, { page: button.link }])}>
                        <Text style={txtStyles.base}>{button.icon} {button.name}</Text>
                    </TouchableOpacity>
                )}
            </View>
            <Text style={[txtStyles.largeText, txtStyles.base]}>
                {keyStore.length} Open Sandooks
            </Text>
            {
                keyStore.map((key, index) => (
                    <View key={index}>
                        <Text style={txtStyles.base}>{key.sandook} : {key.chaabi}</Text>
                    </View>
                ))
            }
        </View>
    )
}

const styles = StyleSheet.create({
    heroBtn: {
        borderRadius: 10,
        backgroundColor: "#1B1B1B",
        padding: 10,
        flex: 1,
        width: "50%",
        flexShrink: 0,
        margin: 5,
    }
});