import React, { useState } from "react";
import {
    View,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    SafeAreaView,
    FlatList,
    Image,
} from 'react-native';
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../firebaseConfig";
import { useNavigation } from "@react-navigation/native";
import { ThemedText } from '../components/ThemedText';

export default function LoginScreen() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const navigation = useNavigation();
    console.log("Firebase Auth :", auth);

    const handleLogin = async () => {
        console.log("Tentative de connexion avec :", { email, password });

        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            console.log("Connexion réussie :", userCredential.user);

            navigation.navigate("Home");
            console.log("Navigation vers Home...");
        } catch (err) {
            console.error("Erreur de connexion :", err);
            setError("Email ou mot de passe incorrect");
        }
    };

    return (
        <View style={styles.container}>
            <ThemedText style={styles.title}>Connexion</ThemedText>

            {error ? <ThemedText style={styles.error}>{error}</ThemedText> : null}

            <TextInput
                style={styles.input}
                placeholder="Email"
                placeholderTextColor="#888"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
            />

            <TextInput
                style={styles.input}
                placeholder="Mot de passe"
                placeholderTextColor="#888"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
            />

            <View style={styles.buttonContainer}>
                <TouchableOpacity style={styles.button} onPress={handleLogin}>
                    <ThemedText style={styles.buttonText}>Se connecter</ThemedText>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.button, styles.secondaryButton]}
                    onPress={() => navigation.navigate("SignUp")}
                >
                    <ThemedText style={[styles.buttonText, styles.secondaryButtonText]}>
                        Créer un compte
                    </ThemedText>
                </TouchableOpacity>
            </View>
        </View>
    );

}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
        backgroundColor: "#121212",
    },
    title: {
        fontSize: 28,
        fontWeight: "bold",
        color: "#BB86FC",
        marginBottom: 20,
    },
    input: {
        width: "100%",
        backgroundColor: "#1F1B24",
        color: "#E1E1E1",
        padding: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: "#888",
        marginBottom: 15,
    },
    error: {
        color: "#CF6679",
        fontSize: 14,
        marginBottom: 10,
    },
    buttonContainer: {
        width: "100%",
        marginTop: 10,
    },
    button: {
        backgroundColor: "#03dac6",
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: "center",
        marginBottom: 10,
    },
    buttonText: {
        color: "#121212",
        fontWeight: "bold",
        fontSize: 16,
    },
    secondaryButton: {
        backgroundColor: "transparent",
        borderWidth: 1,
        borderColor: "#03dac6",
    },
    secondaryButtonText: {
        color: "#03dac6",
    },
});
