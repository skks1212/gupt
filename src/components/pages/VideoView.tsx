import { Video } from "expo-av";
import { useContext, useEffect, useRef, useState } from "react";
import { Button, Image, ScrollView, Text, View } from "react-native";
import { HistoryContext } from "../../contexts/HistoryContext";
import { pageStyles } from "../../styles/Page";
import { txtStyles } from "../../styles/Text";
import { KeyStoreType } from "../../types/keytypes";
import { VFileIndexType, viewFile } from "../../utils/SandookUtils";
import Header from "../navbar/Header";

export default function VideoView(props: {
    file: VFileIndexType,
    keyPair: KeyStoreType
}) {

    const [history, setHistory] = useContext(HistoryContext);
    const [uri, setUri] = useState<string | null>(null);
    const video = useRef<Video>(null);
    const [videoStatus, setVideoStatus] = useState({
        isPlaying: false,
        positionMillis: 0,
        durationMillis: 0
    });

    const { file, keyPair } = props;

    useEffect(() => {
        loadVideo();
    }, [])

    const loadVideo = async () => {
        if (file && keyPair) {
            try {
                const uri = await viewFile(file, keyPair);
                setUri(uri);
            } catch (error) {
                setHistory(history.slice(0, history.length - 1));
            }

        }
    }

    useEffect(() => {
        if (video.current) {
            if (videoStatus.isPlaying) {
                video.current.playAsync();
            } else {
                video.current.pauseAsync();
            }
        }
    }, [videoStatus])

    return (
        <View style={[pageStyles.page, { padding: 0, flex: 1 }]}>
            <Header
                title={"Video"}
                leftIcon="arrow-back-outline"
                leftIconPress={() => setHistory(history.slice(0, history.length - 1))}
            />
            {uri ? (
                <View
                    style={{
                        flex: 1,
                        overflow: "hidden",
                    }}
                >
                    {/*<View
                        style={{
                            position: "absolute",
                            bottom: 0,
                            left: 0,
                            right: 0,
                            backgroundColor: "rgba(0,0,0,0.5)",
                            height: 50,
                            zIndex: 100,
                        }}
                    >
                        <Button
                            title={videoStatus.isPlaying ? "Pause" : "Play"}
                            onPress={() => {
                                if (videoStatus.isPlaying) {
                                    setVideoStatus({ ...videoStatus, isPlaying: false });

                                } else {
                                    setVideoStatus({ ...videoStatus, isPlaying: true });
                                }
                            }}
                        />
                    </View>*/}
                    <Video
                        ref={video}
                        style={{
                            flex: 1,
                        }}
                        source={{
                            uri,
                        }}
                        useNativeControls
                    />
                </View>
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