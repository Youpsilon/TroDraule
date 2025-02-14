// src/components/ThemedText.jsx
import React from 'react';
import { Text, StyleSheet } from 'react-native';

export function ThemedText({ children, style, type }) {
    const defaultStyle = type === 'title' ? styles.title : styles.text;
    return <Text style={[defaultStyle, style]}>{children}</Text>;
}

const styles = StyleSheet.create({
    text: {
        color: '#E1E1E1',
        fontSize: 16,
    },
    title: {
        color: '#E1E1E1',
        fontSize: 24,
        fontWeight: 'bold',
    },
});
