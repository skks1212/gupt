import { useContext } from "react";
import { StyleSheet, View } from "react-native";
import { HistoryContext } from "../contexts/HistoryContext";
import { KeyStoreType } from "../types/keytypes";
import { PageProps } from "../types/pagetypes";
import { VFileIndexType } from "../utils/SandookUtils";
import Files from "./pages/Files";
import Home from "./pages/Home";
import ImageView from "./pages/ImageView";
import SandookIndex from "./pages/SandookIndex";
import Settings from "./pages/Settings";
import VideoView from "./pages/VideoView";

export default function AppView() {

    const [history, setHistory] = useContext(HistoryContext);

    const page = history[history.length - 1];

    const pages = {
        "HOME": <Home />,
        "SANDOOKS": <Files />,
        "SANDOOK": <SandookIndex />,
        "IMAGE": <ImageView file={page?.meta?.f as VFileIndexType} keyPair={page?.meta?.keyPair as KeyStoreType} />,
        "VIDEO": <VideoView file={page?.meta?.f as VFileIndexType} keyPair={page?.meta?.keyPair as KeyStoreType} />,
        "SETTINGS": <Settings />
    }

    return (
        <View style={styles.page}>
            {pages[page.page as keyof typeof pages]}
        </View>
    )
}

const styles = StyleSheet.create({
    page: {
        flex: 1,
    },
});