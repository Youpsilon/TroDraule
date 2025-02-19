// src/screens/ProfileScreen.jsx
import React, { useState, useEffect } from 'react';
import {
    View,
    SafeAreaView,
    TouchableOpacity,
    StyleSheet,
    FlatList,
    Image,
} from 'react-native';
import Constants from 'expo-constants';
import { ThemedText } from '../components/ThemedText';
import { firestore } from '../firebaseConfig';
import { collection, onSnapshot } from 'firebase/firestore';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

export default function ProfileScreen() {
    const navigation = useNavigation();

    // Exemple d'infos utilisateur (à relier ultérieurement)
    const userInfo = {
        name: 'John Doe',
        email: 'john.doe@example.com',
    };

    const [products, setProducts] = useState([]);

    useEffect(() => {
        const colRef = collection(firestore, 'products');
        const unsubscribe = onSnapshot(
            colRef,
            (snapshot) => {
                const fetchedProducts = snapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                }));
                setProducts(fetchedProducts);
            },
            (error) => {
                console.error('Erreur lors de la récupération des produits:', error);
            }
        );
        return () => unsubscribe();
    }, []);

    // Filtrer les produits favoris (on suppose que le champ "favorite" existe)
    const favoriteProducts = products.filter((product) => product.favorite);

    const handleCartPress = () => {
        navigation.navigate('Cart');
    };

    const handleBackPress = () => {
        navigation.goBack();
    };

    const renderFavoriteItem = ({ item }) => (
        <View style={styles.favoriteItem}>
            {item.imageUrl ? (
                <Image
                    style={styles.favoriteImage}
                    source={{ uri: item.imageUrl }}
                    resizeMode="cover"
                />
            ) : (
                <View style={[styles.favoriteImage, styles.noImage]}>
                    <ThemedText style={styles.noImageText}>Pas d'image</ThemedText>
                </View>
            )}
            <ThemedText style={styles.favoriteName}>{item.name}</ThemedText>
            {item.price !== undefined && (
                <ThemedText style={styles.favoritePrice}>{item.price} €</ThemedText>
            )}
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            {/* Header/Menu */}
            <View style={styles.menuHeader}>
                <TouchableOpacity onPress={handleBackPress} style={styles.iconButton}>
                    <Ionicons name="arrow-back-outline" size={24} color="#121212" />
                </TouchableOpacity>
                <ThemedText type="title" style={styles.siteTitle}>
                    TroDraule.fr
                </ThemedText>
                <TouchableOpacity onPress={handleCartPress} style={styles.iconButton}>
                    <Ionicons name="cart-outline" size={24} color="#121212" />
                </TouchableOpacity>
            </View>

            {/* Contenu du profil */}
            <View style={styles.profileContent}>
                <ThemedText style={styles.title}>Profil</ThemedText>
                <View style={styles.infoContainer}>
                    <ThemedText style={styles.infoText}>Nom : {userInfo.name}</ThemedText>
                    <ThemedText style={styles.infoText}>Email : {userInfo.email}</ThemedText>
                </View>
                <ThemedText style={styles.sectionTitle}>Produits favoris</ThemedText>
                <FlatList
                    data={favoriteProducts}
                    keyExtractor={(item) => item.id}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.favoritesList}
                    renderItem={renderFavoriteItem}
                />
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#121212',
        paddingTop: Constants.statusBarHeight + 10, // Espace pour la barre d'état
    },
    menuHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
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
    },
    profileContent: {
        flex: 1,
        paddingHorizontal: 20,
        alignItems: 'center',
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#E1E1E1',
        marginBottom: 20,
    },
    infoContainer: {
        marginBottom: 30,
        alignItems: 'center',
    },
    infoText: {
        fontSize: 16,
        color: '#E1E1E1',
        marginBottom: 5,
    },
    sectionTitle: {
        fontSize: 20,
        color: '#BB86FC',
        marginBottom: 10,
        alignSelf: 'flex-start',
    },
    favoritesList: {
        paddingVertical: 10,
    },
    favoriteItem: {
        backgroundColor: '#1F1B24',
        borderRadius: 10,
        padding: 10,
        marginRight: 10,
        alignItems: 'center',
        width: 140,
    },
    favoriteImage: {
        width: 120,
        height: 120,
        borderRadius: 8,
        marginBottom: 10,
    },
    noImage: {
        backgroundColor: '#333',
        justifyContent: 'center',
        alignItems: 'center',
    },
    noImageText: {
        color: '#bbb',
        fontSize: 12,
    },
    favoriteName: {
        fontSize: 16,
        color: '#E1E1E1',
        marginBottom: 5,
        textAlign: 'center',
    },
    favoritePrice: {
        fontSize: 14,
        color: '#BB86FC',
    },
    button: {
        backgroundColor: '#03dac6',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 8,
        marginTop: 30,
    },
    buttonText: {
        fontSize: 16,
        color: '#121212',
        fontWeight: 'bold',
    },
});
