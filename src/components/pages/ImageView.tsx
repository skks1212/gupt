import { useContext, useEffect, useRef, useState } from "react";
import { Image, ScrollView, Text, View } from "react-native";
import { HistoryContext } from "../../contexts/HistoryContext";
import { pageStyles } from "../../styles/Page";
import { txtStyles } from "../../styles/Text";
import { KeyStoreType } from "../../types/keytypes";
import { VFileIndexType, viewFile } from "../../utils/SandookUtils";
import Header from "../navbar/Header";

export default function ImageView(props: {
    file: VFileIndexType,
    keyPair: KeyStoreType
}) {

    const [history, setHistory] = useContext(HistoryContext);
    const [uri, setUri] = useState<string | null>(null);

    const [zoom, setZoom] = useState(1);

    const [s, setS] = useState({
        i: { width: 0, height: 0 },
        v: { width: 0, height: 0 }
    });

    const { file, keyPair } = props;

    const iRatio = s.i.height !== 0 ? s.i.width / s.i.height : 19 / 6;

    useEffect(() => {
        loadImage();
    }, [])

    const loadImage = async () => {
        if (file && keyPair) {
            try {
                const uri = await viewFile(file, keyPair);
                setUri(uri);
            } catch (error) {
                setHistory(history.slice(0, history.length - 1));
            }

        }
    }

    return (
        <View style={[pageStyles.page, { padding: 0, flex: 1 }]}>
            <Header
                title={"Image"}
                leftIcon="arrow-back-outline"
                leftIconPress={() => setHistory(history.slice(0, history.length - 1))}
            />
            {/*<View
                style={{
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    right: 0,
                    backgroundColor: "#1B1B1B",
                    height: 50,
                    zIndex: 100,
                }}
            >

            </View>*/}
            {uri ? (
                <ScrollView
                    style={{
                        width: "100%",
                    }}
                    onLayout={(event) => {
                        const { width, height } = event.nativeEvent.layout;
                        Image.getSize(uri, (w, h) => {
                            setS({ v: { width, height }, i: { width: w, height: h } });
                        });
                    }}
                >
                    <ScrollView
                        horizontal
                        style={{
                            width: "100%",
                        }}
                    >
                        <Image
                            source={{ uri }}
                            style={{
                                display: "flex",
                                height: s.i.height > s.i.width ? s.v.height * zoom : "auto",
                                width: s.i.width > s.i.height ? s.v.width * zoom : "auto",
                                aspectRatio: iRatio,
                            }}
                        />
                    </ScrollView>

                </ScrollView>
            ) : (
                <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                    <Text style={txtStyles.base}>
                        Loading...
                    </Text>
                </View>
            )}
        </View>
    )
}