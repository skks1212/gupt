import { Ionicons } from '@expo/vector-icons';
export default function Icon(
    props: {
        name: string,
        style?: any,
    }
) {

    const { name, style } = props;

    return (
        <Ionicons name={name as any} style={[{ fontSize: 18 }, ...style]} />
    )
}