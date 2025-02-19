// src/screens/ProductDetails.jsx
import React, { useState, useEffect } from 'react';
import {
    View,
    StyleSheet,
    TouchableOpacity,
    Image,
    ScrollView,
    SafeAreaView,
} from 'react-native';
import { ThemedText } from '../components/ThemedText';
import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import { useNavigation } from '@react-navigation/native';
import { doc, updateDoc, arrayUnion, arrayRemove, onSnapshot } from 'firebase/firestore';
import { firestore } from '../../firebaseConfig';
import { useAuth } from '../contexts/AuthContext';

export default function ProductDetails({ route }) {
    const navigation = useNavigation();
    const { user } = useAuth();
    const [isFavorite, setIsFavorite] = useState(false);
    const [cartAdded, setCartAdded] = useState(false);

    if (!route.params || !route.params.product) {
        return (
            <SafeAreaView style={styles.container}>
                <ThemedText>Produit non trouvé</ThemedText>
            </SafeAreaView>
        );
    }

    const { product } = route.params;

    // Vérifier dans Firestore si le produit est dans les favoris de l'utilisateur
    useEffect(() => {
        if (user) {
            const userRef = doc(firestore, 'users', user.uid);
            const unsubscribe = onSnapshot(
                userRef,
                (docSnap) => {
                    if (docSnap.exists()) {
                        const data = docSnap.data();
                        const favorites = data.favorites || [];
                        setIsFavorite(favorites.includes(product.id));
                    }
                },
                (error) => {
                    console.error("Erreur lors de la récupération des favoris :", error);
                }
            );
            return () => unsubscribe();
        }
    }, [user, product.id]);

    // Fonction pour ajouter ou retirer le produit des favoris
    const handleToggleFavorite = async () => {
        if (!user) {
            console.log("Utilisateur non connecté.");
            return;
        }
        const userRef = doc(firestore, 'users', user.uid);
        try {
            if (isFavorite) {
                await updateDoc(userRef, {
                    favorites: arrayRemove(product.id),
                });
                setIsFavorite(false);
                console.log(`Produit ${product.name} retiré des favoris.`);
            } else {
                await updateDoc(userRef, {
                    favorites: arrayUnion(product.id),
                });
                setIsFavorite(true);
                console.log(`Produit ${product.name} ajouté aux favoris.`);
            }
        } catch (error) {
            console.error("Erreur lors de la mise à jour des favoris :", error);
        }
    };

    // Fonction pour ajouter le produit au panier dans Firebase
    const handleAddToCart = async () => {
        if (!user) {
            console.log("Utilisateur non connecté.");
            return;
        }
        const userRef = doc(firestore, 'users', user.uid);
        try {
            await updateDoc(userRef, {
                cart: arrayUnion(product.id),
            });
            console.log(`Produit ${product.name} ajouté au panier.`);
            setCartAdded(true);
            setTimeout(() => setCartAdded(false), 2000);
        } catch (error) {
            console.error("Erreur lors de l'ajout au panier :", error);
        }
    };

    const handleCartPress = () => {
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

                {/* Zone de l'image avec icône de favori intégrée dans la carte */}
                <View style={styles.imageContainer}>
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
                    <TouchableOpacity style={styles.favoriteIcon} onPress={handleToggleFavorite}>
                        <Ionicons
                            name={isFavorite ? 'heart' : 'heart-outline'}
                            size={35}
                            color={isFavorite ? 'red' : 'white'}
                        />
                    </TouchableOpacity>
                </View>

                {/* Détails textuels */}
                <View style={styles.card}>
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
                    {cartAdded && (
                        <View style={styles.confirmationContainer}>
                            <ThemedText style={styles.confirmationText}>
                                Produit ajouté au panier !
                            </ThemedText>
                        </View>
                    )}
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
        paddingTop: Constants.statusBarHeight + 10,
    },
    menuHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 10,
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
    imageContainer: {
        position: 'relative',
        width: '100%',
        height: 200,
        marginBottom: 20,
    },
    image: {
        width: '100%',
        height: '100%',
        borderRadius: 8,
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
    favoriteIcon: {
        position: 'absolute',
        top: 10,
        right: 10,
        padding: 4,
        backgroundColor: 'rgba(0,0,0,0.4)',
        borderRadius: 20,
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
    confirmationContainer: {
        marginTop: 15,
        backgroundColor: '#03dac6',
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 20,
    },
    confirmationText: {
        color: '#121212',
        fontWeight: 'bold',
        fontSize: 14,
    },
});
