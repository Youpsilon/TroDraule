import React from 'react';
import { View, StyleSheet, TouchableOpacity, Image, ScrollView, SafeAreaView } from 'react-native';
import { ThemedText } from '@/components/ThemedText';

export default function ProductDetails({ route, navigation }) {
    // ✅ Vérification des paramètres envoyés
    if (!route.params || !route.params.product) {
        return (
            <SafeAreaView style={styles.container}>
                <ThemedText>Produit non trouvé</ThemedText>
            </SafeAreaView>
        );
    }

    // Récupération des détails du produit depuis la navigation
    const { product } = route.params;

    // Fonction pour ajouter au panier (logique à implémenter)
    const handleAddToCart = () => {
        console.log(`Produit ${product.name} ajouté au panier.`);
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#121212' }}>
            <ScrollView contentContainerStyle={styles.container}>
                <View style={styles.card}>
                    {product.imageUrl ? (
                        <Image style={styles.image} source={{ uri: product.imageUrl }} resizeMode="cover" />
                    ) : (
                        <View style={[styles.image, styles.noImage]}>
                            <ThemedText style={styles.noImageText}>Pas d'image</ThemedText>
                        </View>
                    )}
                    <ThemedText style={styles.name}>{product.name}</ThemedText>
                    {product.price !== undefined && (
                        <ThemedText style={styles.price}>{product.price} €</ThemedText>
                    )}
                    {product.category && (
                        <ThemedText style={styles.category}>
                            ({product.category})
                        </ThemedText>
                    )}
                    <ThemedText style={styles.description}>
                        {product.description || 'Pas de description disponible.'}
                    </ThemedText>
                    <TouchableOpacity style={styles.cartButton} onPress={handleAddToCart}>
                        <ThemedText style={styles.cartButtonText}>Ajouter au panier</ThemedText>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 20,
        backgroundColor: '#121212',
        flexGrow: 1,
    },
    card: {
        backgroundColor: '#1F1B24',
        borderRadius: 10,
        padding: 20,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 3,
    },
    image: {
        width: '100%',
        height: 200,
        borderRadius: 8,
        marginBottom: 20,
    },
    noImage: {
        backgroundColor: '#333',
        justifyContent: 'center',
        alignItems: 'center',
    },
    noImageText: {
        color: '#bbb',
        fontSize: 14,
    },
    name: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#E1E1E1',
        marginBottom: 10,
    },
    price: {
        fontSize: 20,
        color: '#BB86FC',
        marginBottom: 10,
    },
    category: {
        fontSize: 16,
        fontStyle: 'italic',
        color: '#888',
        marginBottom: 20,
    },
    description: {
        fontSize: 16,
        color: '#E1E1E1',
        marginBottom: 20,
    },
    cartButton: {
        backgroundColor: '#03dac6',
        paddingVertical: 15,
        paddingHorizontal: 30,
        borderRadius: 30,
    },
    cartButtonText: {
        color: '#121212',
        fontWeight: 'bold',
        fontSize: 16,
    },
});
