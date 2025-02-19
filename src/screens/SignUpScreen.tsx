import React, { useState } from "react";
import { View, TextInput, Button, StyleSheet } from "react-native";
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
                value={nom}
                onChangeText={setNom}
            />

            <TextInput
                style={styles.input}
                placeholder="Prénom"
                value={prenom}
                onChangeText={setPrenom}
            />

            <TextInput
                style={styles.input}
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
            />

            <TextInput
                style={styles.input}
                placeholder="Mot de passe"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
            />

            <Button title="S'inscrire" onPress={handleSignUp} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: "center", padding: 20 },
    title: { fontSize: 24, fontWeight: "bold", marginBottom: 20 },
    input: { borderBottomWidth: 1, marginBottom: 20, padding: 8 },
    error: { color: "red", marginBottom: 10 },
});
