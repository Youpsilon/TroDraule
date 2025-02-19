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
import { firestore } from '../../firebaseConfig';
import {
    collection,
    onSnapshot,
    doc,
    query,
    where,
} from 'firebase/firestore';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';

export default function ProfileScreen() {
    const navigation = useNavigation();
    const { user, logout } = useAuth();
    const [userData, setUserData] = useState(null);
    const [favoriteProducts, setFavoriteProducts] = useState([]);
    const [orders, setOrders] = useState([]);

    // Charger les informations de l'utilisateur
    useEffect(() => {
        if (!user) return;
        const userRef = doc(firestore, 'users', user.uid);
        const unsubscribe = onSnapshot(
            userRef,
            (docSnap) => {
                if (docSnap.exists()) {
                    setUserData(docSnap.data());
                } else {
                    console.log("Aucune donnée trouvée pour cet utilisateur.");
                }
            },
            (error) => {
                console.error("Erreur lors de la récupération des données utilisateur:", error);
            }
        );
        return () => unsubscribe();
    }, [user]);

    // Charger les produits favoris (basé sur userData.favorites, qui est un tableau d'IDs)
    useEffect(() => {
        if (!userData) {
            setFavoriteProducts([]);
            return;
        }
        const colRef = collection(firestore, 'products');
        const unsubscribe = onSnapshot(
            colRef,
            (snapshot) => {
                const fetchedProducts = snapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                }));
                const userFavorites = userData.favorites || [];
                const favorites = fetchedProducts.filter((product) =>
                    userFavorites.includes(product.id)
                );
                setFavoriteProducts(favorites);
            },
            (error) => {
                console.error('Erreur lors de la récupération des produits:', error);
            }
        );
        return () => unsubscribe();
    }, [userData]);

    // Charger les commandes de l'utilisateur depuis la collection "orders"
    useEffect(() => {
        if (!user) return;
        const ordersRef = collection(firestore, 'orders');
        const q = query(ordersRef, where('userId', '==', user.uid));
        const unsubscribe = onSnapshot(
            q,
            (snapshot) => {
                const fetchedOrders = snapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                }));
                setOrders(fetchedOrders);
            },
            (error) => {
                console.error("Erreur lors de la récupération des commandes :", error);
            }
        );
        return () => unsubscribe();
    }, [user]);

    const handleLogout = async () => {
        try {
            await logout();
            navigation.navigate('Login');
        } catch (error) {
            console.error("Erreur lors de la déconnexion :", error);
        }
    };

    const handleBackPress = () => {
        navigation.goBack();
    };

    const handleCartPress = () => {
        navigation.navigate('Cart');
    };

    // Lorsqu'on clique sur une carte produit, naviguer vers ProductDetails avec le produit
    const handleFavoritePress = (product) => {
        navigation.navigate('ProductDetails', { product });
    };

    const renderFavoriteItem = ({ item }) => (
        <TouchableOpacity
            style={styles.favoriteItem}
            onPress={() => handleFavoritePress(item)}
        >
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
        </TouchableOpacity>
    );

    // Rendu d'une commande dans l'historique
    const renderOrderItem = ({ item }) => {
        // Formater la date (si createdAt est un Timestamp Firestore)
        const date = item.createdAt?.toDate
            ? item.createdAt.toDate().toLocaleDateString()
            : "Date inconnue";
        return (
            <View style={styles.orderItem}>
                <ThemedText style={styles.orderText}>Commande n°: {item.id}</ThemedText>
                <ThemedText style={styles.orderText}>Total: {item.total?.toFixed(2)} €</ThemedText>
                <ThemedText style={styles.orderText}>Statut: {item.status}</ThemedText>
                <ThemedText style={styles.orderText}>Date: {date}</ThemedText>
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Header personnalisé */}
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

            <View style={styles.profileContent}>
                <ThemedText style={styles.title}>Profil</ThemedText>
                {userData && (
                    <View style={styles.infoContainer}>
                        <ThemedText style={styles.infoText}>
                            Nom : {userData.nom || 'Non défini'}
                        </ThemedText>
                        <ThemedText style={styles.infoText}>
                            Prénom : {userData.prenom || 'Non défini'}
                        </ThemedText>
                        <ThemedText style={styles.infoText}>
                            Email : {userData.email || user?.email || 'Non défini'}
                        </ThemedText>
                    </View>
                )}

                {/* Section Favoris */}
                <ThemedText style={styles.sectionTitle}>Produits favoris</ThemedText>
                <FlatList
                    data={favoriteProducts}
                    keyExtractor={(item) => item.id}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.favoritesList}
                    renderItem={renderFavoriteItem}
                />

                {/* Section Commandes */}
                <ThemedText style={styles.sectionTitle}>Historique des commandes</ThemedText>
                {orders.length > 0 ? (
                    <FlatList
                        data={orders}
                        keyExtractor={(item) => item.id}
                        contentContainerStyle={styles.ordersList}
                        renderItem={renderOrderItem}
                    />
                ) : (
                    <ThemedText style={styles.noOrderText}>Aucune commande passée</ThemedText>
                )}

                {/* Bouton de déconnexion */}
                <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                    <ThemedText style={styles.logoutButtonText}>Se déconnecter</ThemedText>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#121212',
        paddingTop: Constants.statusBarHeight + 10,
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
    // Styles pour les cartes des produits favoris
    favoriteItem: {
        backgroundColor: '#1F1B24',
        borderRadius: 10,
        padding: 10,
        marginRight: 10,
        alignItems: 'center',
        width: 150,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 3,
        elevation: 5,
    },
    favoriteImage: {
        width: 130,
        height: 130,
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
    // Styles pour la section commandes
    ordersList: {
        paddingBottom: 10,
    },
    orderItem: {
        backgroundColor: '#1F1B24',
        borderRadius: 10,
        padding: 15,
        marginBottom: 10,
        width: '100%',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 3,
        elevation: 5,
    },
    orderText: {
        fontSize: 14,
        color: '#E1E1E1',
        marginBottom: 3,
    },
    noOrderText: {
        fontSize: 16,
        color: '#bbb',
        fontStyle: 'italic',
        marginBottom: 20,
    },
    logoutButton: {
        backgroundColor: '#03dac6',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 8,
        marginTop: 30,
    },
    logoutButtonText: {
        fontSize: 16,
        color: '#121212',
        fontWeight: 'bold',
    },
});
