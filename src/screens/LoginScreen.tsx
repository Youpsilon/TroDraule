import React, { useState } from "react";
import { View, TextInput, Button, StyleSheet } from "react-native";
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

            {/* Affichage de l'erreur si besoin */}
            {error ? <ThemedText style={styles.error}>{error}</ThemedText> : null}

            <TextInput
                style={styles.input}
                placeholder="Email"
                value={email}
                onChangeText={(text) => {
                    setEmail(text);
                }}
            />

            <TextInput
                style={styles.input}
                placeholder="Mot de passe"
                value={password}
                onChangeText={(text) => {
                    setPassword(text);
                }}
                secureTextEntry
            />

            <Button title="Se connecter" onPress={handleLogin} />
            <Button
                title="Créer un compte"
                onPress={() => navigation.navigate("SignUp")}
            />

        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: "center", padding: 20 },
    title: { fontSize: 24, fontWeight: "bold", marginBottom: 20 },
    input: { borderBottomWidth: 1, marginBottom: 20, padding: 8 },
    error: { color: "red", marginBottom: 10 },
});
