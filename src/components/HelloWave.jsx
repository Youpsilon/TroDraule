// src/components/HelloWave.jsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export function HelloWave() {
    return (
        <View style={styles.container}>
            <Text style={styles.text}>👋 Hello, welcome!</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        marginBottom: 20,
    },
    text: {
        color: '#BB86FC',
        fontSize: 18,
    },
});
