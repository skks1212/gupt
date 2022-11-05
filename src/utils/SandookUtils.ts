import { KeyStoreType } from "../types/keytypes";
import * as FileSystem from 'expo-file-system';
import CryptoES from "crypto-es";
import { Alert, View } from "react-native";
import * as DocumentPicker from 'expo-document-picker';
import { StorageAccessFramework } from "expo-file-system";
import * as ImageManipulator from 'expo-image-manipulator';

export type FileLL = {
    name: string,
    contents?: FileLL[]
}

export type VFileIndexType = {
    uri: string,
    name: string,
    originalName: string,
    originalUri: string,
    encoding?: "UTF-8" | "base64",
    thumbnail?: string,
}

export type VType = {
    version: string,
    sandook: string,
    chaabi: string,
    fileIndex?: VFileIndexType[]
}

export const verifySandookKey = async (keypair: KeyStoreType) => {
    if (!FileSystem.documentDirectory) {
        throw "No document directory";
    }

    const sandookUrl = FileSystem.documentDirectory + "gupt/" + keypair.sandook;

    const getSandook = await FileSystem.readDirectoryAsync(sandookUrl);
    if (getSandook.length === 0) {
        throw "No sandook file";
    }

    const checkVFile = getSandook.find((file) => file === ".v");
    if (!checkVFile) {
        throw "No .v file";
    }

    const getVcontents = await FileSystem.readAsStringAsync(sandookUrl + "/.v");

    try {
        const decrypt = CryptoES.RC4.decrypt(getVcontents, keypair.chaabi).toString(CryptoES.enc.Utf8);
        const parsed = JSON.parse(decrypt);
        if (parsed.sandook === keypair.sandook && parsed.chaabi === keypair.chaabi) {
            return true;
        } else {
            throw "Invalid chaabi";
        }
    } catch (e) {
        throw "Invalid chaabi";
    }

}

export const deleteSandook = async (sandook: string) => {
    if (!FileSystem.documentDirectory) {
        throw "No document directory";
    }

    const sandookUrl = FileSystem.documentDirectory + "gupt/" + sandook;
    try {
        await FileSystem.deleteAsync(sandookUrl, { idempotent: true });
        return true;
    } catch (e) {
        throw "Error deleting sandook";
    }
}

export const getFileStructure = async (url: string) => {
    try {
        const files = await FileSystem.readDirectoryAsync(url);
        const fileLL: FileLL[] = [];
        for (const file of files) {
            const fileUrl = url + "/" + file;
            const stat = await FileSystem.getInfoAsync(fileUrl);
            if (stat.isDirectory) {
                const fileLLContents = await getFileStructure(fileUrl);
                fileLL.push({ name: file, contents: fileLLContents });
            } else {
                fileLL.push({ name: file });
            }
        }
        return fileLL;
    } catch {
        throw "Error getting file structure";
    }

}

export const displayFileStructure: (f: FileLL, g: number) => string = (fileLL: FileLL, gap: number) => {
    return Array(gap * 2).join(" ") +
        fileLL.contents?.map((file) =>
            file.contents ?
                displayFileStructure(file, gap + 1) :
                ("|- " + file.name)
        ).join("\n");
}

export const s = (sandook: string) => {
    return sandook.split("_sandook").slice(0, -1).join("_sandook");
}

export const getSandookV: (keyPair: KeyStoreType) => Promise<VType> = async (keyPair: KeyStoreType) => {
    try {
        const vData = await FileSystem.readAsStringAsync(FileSystem.documentDirectory + "gupt/" + keyPair.sandook + "/.v");
        const decryptedV = CryptoES.RC4.decrypt(vData, keyPair.chaabi).toString(CryptoES.enc.Utf8);
        return JSON.parse(decryptedV);
    } catch (error) {
        console.log(error);
        throw "Unable to get sandook v";
    }
}

export const saveSandookV = async (keyPair: KeyStoreType, v: VType) => {
    try {
        const encryptedV = CryptoES.RC4.encrypt(JSON.stringify(v), keyPair.chaabi).toString();
        await FileSystem.writeAsStringAsync(FileSystem.documentDirectory + "gupt/" + keyPair.sandook + "/.v", encryptedV);
        return true;
    } catch (error) {
        console.log(error);
        throw "Unable to save sandook v";
    }
}

export const randomFileName: (s: string, l?: number) => Promise<string> = async (sandook: string, l?: number,) => {
    const chars = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
    let length = l || 10;
    let result = "";
    for (let i = length; i > 0; --i) { result += chars[Math.floor(Math.random() * chars.length)] };
    result += ".gupt";
    try {
        const f = await FileSystem.getInfoAsync(FileSystem.documentDirectory + "gupt/" + sandook + "/" + result);
        if (f.exists) {
            return await randomFileName(sandook);
        } else {
            return result;
        }
    } catch {
        throw "Error getting random file name";
    }
}

export const makeGupt = async (file: DocumentPicker.DocumentResult, keyPair: KeyStoreType, setProgress?: (p: number) => void) => {
    if (file.type === "cancel") throw "Cancelled";
    try {
        if (!FileSystem.documentDirectory) throw "No document directory";
        if (!FileSystem.cacheDirectory) throw "No cache directory";

        console.log("Encryption started");
        const fileExtension = file.name.split(".")[file.name.split(".").length - 1];
        const tempFile = FileSystem.cacheDirectory + new Date().getTime() + "." + fileExtension;

        console.log("Creating Temp file...");
        await FileSystem.copyAsync({
            from: file.uri,
            to: tempFile
        });
        console.log("Temp file created");

        //check if file is image
        let thumbnailData: string | undefined;
        try {
            console.log("Testing if thumbnail can be created...");
            const thumbnail = await ImageManipulator.manipulateAsync(tempFile, [{ resize: { width: 200 } }], { compress: 0.5 });
            thumbnailData = await FileSystem.readAsStringAsync(thumbnail.uri, { encoding: FileSystem.EncodingType.Base64 });
            console.log("Thumbnail created", thumbnailData.slice(0, 20) + "...");
        } catch (e) {
            console.log("Thumbnail could not be generated");
        }

        console.log("Reading temp file...");
        const filedata = await FileSystem.readAsStringAsync(tempFile, { encoding: FileSystem.EncodingType.Base64 });
        await console.log("Temp file read");

        // now a little workaround for encrypting huge files is to divide the file into chunks and encrypting each chunk
        console.log("Creating chunks...");
        const chunks = filedata.match(/.{1,1000000}/g); //16102892 for 15.5 mb
        if (!chunks) throw "Error getting file chunks";
        console.log("Chunks created");

        console.log("Encrypting chunks...");
        let chunkCount = 0;
        const encrypt = chunks.map((chunk) => {
            chunkCount++;
            setProgress && setProgress(chunkCount / chunks.length);
            return CryptoES.RC4.encrypt(chunk, keyPair.chaabi).toString()
        });
        console.log("Chunks encrypted");

        console.log("Verifying encryption...");
        const decrypted = encrypt.map(chunk => CryptoES.RC4.decrypt(chunk, keyPair.chaabi).toString(CryptoES.enc.Utf8));

        if (JSON.stringify(chunks) !== JSON.stringify(decrypted)) {
            throw "File encryption failed";
        }
        console.log("Encryption verified");

        const sandookV = await getSandookV(keyPair);
        //console.log("V", sandookV);

        const fileIndex = sandookV.fileIndex ? sandookV.fileIndex : [];
        const cryptedName = await randomFileName(keyPair.sandook);
        const cryptedUri = FileSystem.documentDirectory + "gupt/" + keyPair.sandook + "/" + cryptedName;
        const fileIndexEntry: VFileIndexType = {
            uri: cryptedUri,
            name: cryptedName,
            originalName: file.name,
            originalUri: file.uri,
            thumbnail: thumbnailData,
        }
        //console.log("File index entry", fileIndexEntry);
        fileIndex.push(fileIndexEntry);

        sandookV.fileIndex = fileIndex;
        //console.log("New V", sandookV);
        await saveSandookV(keyPair, sandookV);
        await FileSystem.writeAsStringAsync(cryptedUri, JSON.stringify(encrypt));

        /*
        // Commented out because Expo doesn't support deletion of external files. Bummer.
        Alert.alert("Delete original?", "Do you want to delete the original file?", [
            { text: "Yes", onPress: async () => { await FileSystem.deleteAsync(file.uri); } },
            { text: "No", onPress: () => { } }
        ]);
        */

    } catch (e) {
        console.log(e);
        throw "Error Making Gupt";
    }
}

export const fileTypes = {
    "image": ["jpg", "jpeg", "png", "gif", "bmp", "webp", "tiff", "psd", "raw", "heif", "indd", "svg", "ai", "eps"],
    "video": ["mp4", "mov", "wmv", "avi", "flv", "webm", "mkv", "3gp", "3g2", "m4v", "mpeg", "mpg", "m2v", "m4p", "m4v", "mp2", "mpe", "mpv", "mpg", "mp2", "mpeg", "mpe", "mpv", "m2v", "m4v", "svi", "3gp", "3g2", "mxf", "roq", "nsv", "f4v", "f4p", "f4a", "f4b"],
    "audio": ["mp3", "wav", "aac", "flac", "ogg", "wma", "m4a", "aiff", "alac", "amr", "ape", "au", "awb", "dct", "dss", "dvf", "gsm", "iklax", "ivs", "m4p", "mmf", "mpc", "msv", "nmf", "nsf", "oga", "mogg", "opus", "ra", "rm", "raw", "sln", "tta", "vox", "wv", "webm", "8svx"],
    "text": ["txt"]
}

export const fileIcons = {
    "png": "🏕️",
    "jpg": "🏕️",
    "jpeg": "🏕️",
    "pdf": "📄",
    "doc": "📄",
    "docx": "📄",
    "txt": "📄",
    "mp3": "🎵",
    "mp4": "🎥",
    "mov": "🎥",
    "avi": "🎥",
    "mkv": "🎥",
    "zip": "🗜️",
    "rar": "🗜️",
    "7z": "🗜️",
    "tar": "🗜️",
    "gz": "🗜️",
    "xz": "🗜️",
    "bz2": "🗜️",
    "default": "📄",
}



export const viewFile = async (file: VFileIndexType, keyPair: KeyStoreType) => {
    try {
        const fileData = await FileSystem.readAsStringAsync(file.uri);
        const chunks = JSON.parse(fileData);
        const decrypted = chunks.map((chunk: string) => CryptoES.RC4.decrypt(chunk, keyPair.chaabi).toString(CryptoES.enc.Utf8)).join("");
        const fileUri = FileSystem.cacheDirectory + keyPair.sandook + "/" + file.originalName;
        //check if sandook folder exists
        const sandookFolder = await FileSystem.getInfoAsync(FileSystem.cacheDirectory + keyPair.sandook);
        if (!sandookFolder.exists) {
            await FileSystem.makeDirectoryAsync(FileSystem.cacheDirectory + keyPair.sandook);
        }
        await FileSystem.writeAsStringAsync(fileUri, decrypted, { encoding: FileSystem.EncodingType.Base64 });

        return fileUri;
        // await DocumentPicker.getDocumentAsync({ type: "*/*", copyToCacheDirectory: false, multiple: false });
        // await FileSystem.deleteAsync(fileUri);
    } catch (error) {
        console.log(error);
        throw "Error viewing file";
    }
}

export const exportFile = async (file: VFileIndexType, keyPair: KeyStoreType) => {
    try {
        const permissions = await StorageAccessFramework.requestDirectoryPermissionsAsync();
        if (!permissions.granted) {
            throw "Permissions not granted";
        }

        const downloadUri = await StorageAccessFramework.createFileAsync(permissions.directoryUri, file.originalName, "*/*");

        const fileData = await FileSystem.readAsStringAsync(file.uri, { encoding: FileSystem.EncodingType.Base64 });
        const decrypted = CryptoES.RC4.decrypt(fileData, keyPair.chaabi).toString(CryptoES.enc.Utf8);
        await FileSystem.writeAsStringAsync(downloadUri, decrypted, { encoding: FileSystem.EncodingType.Base64 });
        return true;
    } catch (error) {
        console.log(error);
        throw "Error exporting file";
    }
}

export const deleteFile = async (file: VFileIndexType, keyPair: KeyStoreType) => {
    try {
        const sandookV = await getSandookV(keyPair);
        const fileIndex = sandookV.fileIndex ? sandookV.fileIndex : [];
        const newFileIndex = fileIndex.filter(f => f.uri !== file.uri);
        sandookV.fileIndex = newFileIndex;
        await saveSandookV(keyPair, sandookV);
        await FileSystem.deleteAsync(file.uri);
        return true;
    } catch (error) {
        console.log(error);
        throw "Error deleting file";
    }
}

export const getFileExtension = (fileName: string) => {
    const parts = fileName.split(".");
    if (parts.length > 1) {
        return parts[parts.length - 1].toLowerCase();
    }
    return fileName;
}