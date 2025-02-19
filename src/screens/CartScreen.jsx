// src/screens/CartScreen.jsx
import React, { useState, useEffect } from 'react';
import {
    View,
    SafeAreaView,
    TouchableOpacity,
    TouchableWithoutFeedback,
    StyleSheet,
    FlatList,
    Image,
    Modal,
    ActivityIndicator,
} from 'react-native';
import Constants from 'expo-constants';
import { ThemedText } from '../components/ThemedText';
import { firestore } from '../../firebaseConfig';
import { collection, onSnapshot, doc, updateDoc, arrayRemove, setDoc } from 'firebase/firestore';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';

export default function CartScreen() {
    const navigation = useNavigation();
    const { user } = useAuth();
    const [cartProducts, setCartProducts] = useState([]);
    const [userData, setUserData] = useState(null);
    const [showPaymentForm, setShowPaymentForm] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [paymentConfirmed, setPaymentConfirmed] = useState(false);

    // Charger les informations de l'utilisateur pour récupérer le panier
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

    // Charger tous les produits et filtrer ceux dont l'ID figure dans le champ cart de l'utilisateur
    useEffect(() => {
        if (!userData || !userData.cart) {
            setCartProducts([]);
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
                // On ne garde que les produits dont l'ID est présent dans userData.cart
                const productsInCart = fetchedProducts.filter((product) =>
                    userData.cart.includes(product.id)
                );
                setCartProducts(productsInCart);
            },
            (error) => {
                console.error('Erreur lors de la récupération des produits:', error);
            }
        );
        return () => unsubscribe();
    }, [userData]);

    // Calcul du total
    const total = cartProducts.reduce((sum, product) => sum + (product.price || 0), 0);

    // Supprimer un produit du panier dans Firebase
    const handleRemoveItem = async (id) => {
        if (!user) return;
        try {
            const userRef = doc(firestore, 'users', user.uid);
            await updateDoc(userRef, {
                cart: arrayRemove(id),
            });
            // La mise à jour se fera automatiquement via l'onSnapshot sur le document utilisateur
            console.log(`Produit ${id} retiré du panier.`);
        } catch (error) {
            console.error("Erreur lors de la suppression de l'article :", error);
        }
    };

    // Lorsqu'on clique sur un article, naviguer vers la page des détails du produit
    const handleProductPress = (product) => {
        navigation.navigate('ProductDetails', { product });
    };

    const renderCartItem = ({ item }) => (
        <TouchableOpacity
            style={styles.cartItem}
            onPress={() => handleProductPress(item)}
        >
            {item.imageUrl ? (
                <Image
                    style={styles.cartItemImage}
                    source={{ uri: item.imageUrl }}
                    resizeMode="cover"
                />
            ) : (
                <View style={[styles.cartItemImage, styles.noImage]}>
                    <ThemedText style={styles.noImageText}>Pas d'image</ThemedText>
                </View>
            )}
            <View style={styles.cartItemDetails}>
                <ThemedText style={styles.cartItemName}>{item.name}</ThemedText>
                {item.price !== undefined && (
                    <ThemedText style={styles.cartItemPrice}>{item.price} €</ThemedText>
                )}
            </View>
            <TouchableOpacity onPress={() => handleRemoveItem(item.id)} style={styles.removeButton}>
                <Ionicons name="trash-outline" size={20} color="#BB86FC" />
            </TouchableOpacity>
        </TouchableOpacity>
    );

    // Simuler le paiement et vider le panier (mise à jour du champ cart dans Firestore)
    const handlePayment = async () => {
        setIsProcessing(true);
        setTimeout(async () => {
            setIsProcessing(false);
            setPaymentConfirmed(true);
            try {
                const userRef = doc(firestore, 'users', user.uid);
                // Vider le panier
                await updateDoc(userRef, { cart: [] });
                console.log("Panier vidé après paiement.");
            } catch (error) {
                console.error("Erreur lors du vidage du panier :", error);
            }
            // Fermer le formulaire après 2 secondes
            setTimeout(() => {
                setShowPaymentForm(false);
                setPaymentConfirmed(false);
            }, 2000);
        }, 2000);
    };

    const handleOrder = () => {
        setShowPaymentForm(true);
    };

    const handleBackPress = () => {
        navigation.goBack();
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Header/Menu */}
            <View style={styles.menuHeader}>
                <TouchableOpacity onPress={handleBackPress} style={styles.iconButton}>
                    <Ionicons name="arrow-back-outline" size={24} color="#121212" />
                </TouchableOpacity>
                <ThemedText type="title" style={styles.siteTitle}>
                    Mon Panier
                </ThemedText>
                {/* Bouton panier masqué pour équilibrer le layout */}
                <View style={{ width: 40 }} />
            </View>

            {/* Contenu du panier */}
            <View style={styles.cartContent}>
                <FlatList
                    data={cartProducts}
                    keyExtractor={(item) => item.id}
                    renderItem={renderCartItem}
                    contentContainerStyle={styles.cartList}
                />
                <View style={styles.totalContainer}>
                    <ThemedText style={styles.totalText}>
                        Total : {total.toFixed(2)} €
                    </ThemedText>
                </View>
                <TouchableOpacity style={styles.orderButton} onPress={handleOrder}>
                    <ThemedText style={styles.orderButtonText}>Commander</ThemedText>
                </TouchableOpacity>
            </View>

            {/* Modal du faux formulaire de paiement */}
            <Modal
                visible={showPaymentForm}
                transparent
                animationType="slide"
                onRequestClose={() => setShowPaymentForm(false)}
            >
                <TouchableWithoutFeedback onPress={() => setShowPaymentForm(false)}>
                    <View style={styles.modalOverlay}>
                        <TouchableWithoutFeedback onPress={() => {}}>
                            <View style={styles.paymentForm}>
                                {!isProcessing && !paymentConfirmed && (
                                    <>
                                        <ThemedText style={styles.paymentTitle}>
                                            Paiement par la pensée !
                                        </ThemedText>
                                        <TouchableOpacity style={styles.paymentButton} onPress={handlePayment}>
                                            <ThemedText style={styles.paymentButtonText}>Payer</ThemedText>
                                        </TouchableOpacity>
                                    </>
                                )}
                                {isProcessing && (
                                    <View style={styles.processingContainer}>
                                        <ActivityIndicator size="large" color="#03dac6" />
                                        <ThemedText style={styles.processingText}>Traitement...</ThemedText>
                                    </View>
                                )}
                                {paymentConfirmed && (
                                    <ThemedText style={styles.confirmationText}>Paiement confirmé !</ThemedText>
                                )}
                            </View>
                        </TouchableWithoutFeedback>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>
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
    cartContent: {
        flex: 1,
        paddingHorizontal: 20,
    },
    cartList: {
        paddingBottom: 20,
    },
    cartItem: {
        flexDirection: 'row',
        backgroundColor: '#1F1B24',
        borderRadius: 10,
        padding: 10,
        marginBottom: 10,
        alignItems: 'center',
    },
    cartItemImage: {
        width: 80,
        height: 80,
        borderRadius: 8,
        marginRight: 10,
    },
    cartItemDetails: {
        flex: 1,
    },
    cartItemName: {
        fontSize: 16,
        color: '#E1E1E1',
        fontWeight: 'bold',
        marginBottom: 5,
    },
    cartItemPrice: {
        fontSize: 14,
        color: '#BB86FC',
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
    removeButton: {
        padding: 4,
        marginLeft: 10,
    },
    totalContainer: {
        marginTop: 20,
        alignItems: 'flex-end',
    },
    totalText: {
        fontSize: 20,
        color: '#E1E1E1',
        fontWeight: 'bold',
    },
    orderButton: {
        backgroundColor: '#03dac6',
        paddingVertical: 15,
        borderRadius: 30,
        alignItems: 'center',
        marginTop: 20,
        marginBottom: 20,
    },
    orderButtonText: {
        fontSize: 16,
        color: '#121212',
        fontWeight: 'bold',
    },
    // Styles du modal de paiement
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    paymentForm: {
        width: '80%',
        backgroundColor: '#1F1B24',
        padding: 20,
        borderRadius: 10,
        alignItems: 'center',
    },
    paymentTitle: {
        fontSize: 20,
        color: '#E1E1E1',
        marginBottom: 20,
    },
    paymentButton: {
        backgroundColor: '#03dac6',
        paddingVertical: 12,
        paddingHorizontal: 30,
        borderRadius: 30,
    },
    paymentButtonText: {
        fontSize: 16,
        color: '#121212',
        fontWeight: 'bold',
    },
    processingContainer: {
        alignItems: 'center',
    },
    processingText: {
        marginTop: 10,
        fontSize: 16,
        color: '#E1E1E1',
    },
    confirmationText: {
        fontSize: 20,
        color: '#03dac6',
        fontWeight: 'bold',
    },
});
