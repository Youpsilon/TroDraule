// src/screens/ProfileScreen.jsx
import React from 'react';
import { View, SafeAreaView, TouchableOpacity, StyleSheet } from 'react-native';
import { ThemedText } from '../components/ThemedText';

export default function ProfileScreen({ navigation }) {
    return (
        <SafeAreaView style={styles.container}>
            <ThemedText style={styles.title}>Profil</ThemedText>
            <TouchableOpacity style={styles.button} onPress={() => navigation.goBack()}>
                <ThemedText style={styles.buttonText}>Retour</ThemedText>
            </TouchableOpacity>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#121212',
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontSize: 24,
        color: '#E1E1E1',
        marginBottom: 20,
    },
    button: {
        backgroundColor: '#03dac6',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 8,
    },
    buttonText: {
        fontSize: 16,
        color: '#121212',
        fontWeight: 'bold',
    },
});
