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
import { createUserWithEmailAndPassword } from "firebase/auth";
import { setDoc, doc } from "firebase/firestore";
import { auth, firestore } from "../../firebaseConfig";
import { useNavigation } from "@react-navigation/native";
import { ThemedText } from '../components/ThemedText';

export default function SignUpScreen() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [prenom, setPrenom] = useState("");
    const [nom, setNom] = useState("");
    const [error, setError] = useState("");
    const navigation = useNavigation();

    const handleSignUp = async () => {
        try {
            // Création de l'utilisateur avec email/mot de passe
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // Ajout des infos dans Firestore
            await setDoc(doc(firestore, "users", user.uid), {
                prenom,
                nom
            });

            console.log("Compte créé avec succès:", user.uid);

            // Redirection vers la page d'accueil
            navigation.navigate("Home");
        } catch (err) {
            console.error("Erreur Firebase:", err);

            switch (err.code) {
                case "auth/email-already-in-use":
                    setError("Cet email est déjà utilisé.");
                    break;
                case "auth/invalid-email":
                    setError("L'email est invalide.");
                    break;
                case "auth/weak-password":
                    setError("Le mot de passe doit contenir au moins 6 caractères.");
                    break;
                case "auth/network-request-failed":
                    setError("Problème de connexion. Vérifiez votre réseau.");
                    break;
                default:
                    setError("Erreur lors de l'inscription. Veuillez réessayer.");
            }
        }
    };

    return (
        <View style={styles.container}>
            <ThemedText style={styles.title}>Créer un compte</ThemedText>

            {error ? <ThemedText style={styles.error}>{error}</ThemedText> : null}

            <TextInput
                style={styles.input}
                placeholder="Nom"
                placeholderTextColor="#888"
                value={nom}
                onChangeText={setNom}
            />

            <TextInput
                style={styles.input}
                placeholder="Prénom"
                placeholderTextColor="#888"
                value={prenom}
                onChangeText={setPrenom}
            />

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
                <TouchableOpacity style={styles.button} onPress={handleSignUp}>
                    <ThemedText style={styles.buttonText}>S'inscrire</ThemedText>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.button, styles.secondaryButton]}
                    onPress={() => navigation.navigate("Login")}
                >
                    <ThemedText style={[styles.buttonText, styles.secondaryButtonText]}>
                        Retour à la connexion
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
