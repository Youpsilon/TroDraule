// src/screens/ProductDetails.jsx
import React from 'react';
import { View, StyleSheet, TouchableOpacity, Image, ScrollView, SafeAreaView } from 'react-native';
import { ThemedText } from '../components/ThemedText';
import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import { useNavigation } from '@react-navigation/native';

export default function ProductDetails({ route }) {
    const navigation = useNavigation();

    // Vérification des paramètres envoyés
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

    const handleCartPress = () => {
        // Ajoute ici la navigation vers l'écran du panier ou autre logique
        navigation.navigate('Cart');
    };

    const handleProfilePress = () => {
        navigation.navigate('Profile');
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#121212' }}>
            <ScrollView contentContainerStyle={styles.container}>
                {/* Header/Menu */}
                <View style={styles.menuHeader}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconButton}>
                        <Ionicons name="arrow-back-outline" size={24} color="#121212" />
                    </TouchableOpacity>
                    <ThemedText type="title" style={styles.siteTitle}>
                        TroDraule.fr
                    </ThemedText>
                    <View style={styles.rightIcons}>
                        <TouchableOpacity onPress={handleCartPress} style={styles.iconButton}>
                            <Ionicons name="cart-outline" size={24} color="#121212" />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={handleProfilePress} style={styles.iconButton}>
                            <Ionicons name="person-outline" size={24} color="#121212" />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Carte de détails du produit */}
                <View style={styles.card}>
                    {product.imageUrl ? (
                        <Image
                            style={styles.image}
                            source={{ uri: product.imageUrl }}
                            resizeMode="contain"
                        />
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
        paddingTop: Constants.statusBarHeight + 10, // Espace pour la barre d'état
    },
    menuHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    siteTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#BB86FC',
    },
    iconButton: {
        padding: 8,
        backgroundColor: '#03dac6',
        borderRadius: 20,
        marginRight: 5,
    },
    rightIcons: {
        flexDirection: 'row',
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
