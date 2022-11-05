import { Children, ReactNode } from "react";
import { Alert, Modal, StyleSheet, Text, Touchable, TouchableOpacity, View } from "react-native";

export default function ModalOpen(props: {
    modal: boolean,
    setModal: (modal: boolean) => void,
    children: ReactNode
}) {

    const { modal, setModal, children } = props;

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={modal}
            onRequestClose={() => {
                Alert.alert("Modal has been closed.");
                setModal(!modal);
            }}
        >
            <View style={styles.modal}>
                <View style={styles.wrapper}>
                    {children}
                </View>
            </View>
        </Modal>
    )
}

const styles = StyleSheet.create({
    modal: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(0,0,0,0.7)"
    },
    wrapper: {
        backgroundColor: "#171717",
        padding: 20,
        borderRadius: 10,
        width: "80%",
    }
});