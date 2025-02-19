// src/screens/HomeScreen.jsx
import React, { useState, useEffect } from 'react';
import {
    View,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    SafeAreaView,
    FlatList,
    Image,
    Dimensions,
} from 'react-native';
import Constants from 'expo-constants';
import { ThemedText } from '../components/ThemedText';
import { collection, onSnapshot, doc } from 'firebase/firestore';
import { firestore } from '../../firebaseConfig';
import { useAuth } from "../contexts/AuthContext";
import LoginScreen from "../screens/LoginScreen";
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

export default function HomeScreen() {
    const navigation = useNavigation();
    const [products, setProducts] = useState([]);
    const [searchText, setSearchText] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [prenom, setPrenom] = useState('');
    const { user, loading } = useAuth();
    const { width } = Dimensions.get('window');

    // Fonction de mélange (shuffle) avec l'algorithme Fisher-Yates
    const shuffleArray = (array) => {
        const newArray = [...array];
        for (let i = newArray.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
        }
        return newArray;
    };

    useEffect(() => {
        const colRef = collection(firestore, 'products');
        const unsubscribe = onSnapshot(
            colRef,
            (snapshot) => {
                const fetchedProducts = snapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                }));
                setProducts(shuffleArray(fetchedProducts));
            },
            (error) => {
                console.error('Erreur lors de la récupération des produits:', error);
            }
        );
        return () => unsubscribe();
    }, []);

    // Charger le prénom de l'utilisateur
    useEffect(() => {
        if (user) {
            const userRef = doc(firestore, 'users', user.uid);
            const unsubscribe = onSnapshot(
                userRef,
                (docSnap) => {
                    if (docSnap.exists()) {
                        const data = docSnap.data();
                        console.log("Données Firestore récupérées:", data);
                        const prenomFromFirestore = data?.prenom;
                        setPrenom(prenomFromFirestore || '');
                    } else {
                        console.log("Aucune donnée trouvée pour cet utilisateur.");
                    }
                },
                (error) => {
                    console.error("Erreur lors de la récupération du prénom:", error);
                }
            );
            return () => unsubscribe();
        }
    }, [user]);

    // Rediriger si l'utilisateur n'est pas connecté
    if (loading) return <ThemedText style={styles.productPrice}>Chargement...</ThemedText>;
    if (!user) return <LoginScreen />;

    // Filtrer les produits selon la catégorie et la recherche
    const filteredProducts = products.filter((product) => {
        const matchCategory = selectedCategory === 'all' || product.category === selectedCategory;
        const matchSearch = product.name?.toLowerCase().includes(searchText.toLowerCase());
        return matchCategory && matchSearch;
    });

    const handleProfilePress = () => {
        navigation.navigate('Profile');
    };

    const handleCartPress = () => {
        navigation.navigate('Cart');
    };

    const handleProductPress = (product) => {
        console.log("Navigating to ProductDetails with:", product);
        navigation.navigate('ProductDetails', { product });
    };

    const renderProduct = ({ item }) => (
        <TouchableOpacity onPress={() => handleProductPress(item)} style={styles.productCard}>
            {item.imageUrl ? (
                <Image style={styles.productImage} source={{ uri: item.imageUrl }} resizeMode="cover" />
            ) : (
                <View style={[styles.productImage, styles.noImage]}>
                    <ThemedText style={styles.noImageText}>Pas d'image</ThemedText>
                </View>
            )}
            <ThemedText style={styles.productName}>{item.name}</ThemedText>
            {item.price !== undefined && (
                <ThemedText style={styles.productPrice}>{item.price} €</ThemedText>
            )}
            {item.category && (
                <ThemedText style={styles.productCategory}>({item.category})</ThemedText>
            )}
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#121212' }}>
            <View style={styles.mainContainer}>
                <View style={styles.topSection}>
                    {/* Menu en-tête */}
                    <View style={styles.menuHeader}>
                        <TouchableOpacity onPress={handleCartPress} style={styles.iconButton}>
                            <Ionicons name="cart-outline" size={24} color="#121212" />
                        </TouchableOpacity>
                        <ThemedText type="title" style={styles.siteTitle}>
                            TroDraule.fr
                        </ThemedText>
                        <TouchableOpacity onPress={handleProfilePress} style={styles.iconButton}>
                            <Ionicons name="person-outline" size={24} color="#121212" />
                        </TouchableOpacity>
                    </View>
                    {/* Barre de recherche */}
                    <View style={styles.searchContainer}>
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Rechercher un produit..."
                            placeholderTextColor="#888"
                            value={searchText}
                            onChangeText={setSearchText}
                        />
                    </View>
                    {/* Boutons de filtre par catégorie */}
                    <View style={styles.filterContainer}>
                        {['all', ...Array.from(new Set(products.map((p) => p.category)))].map((cat, index) => (
                            <TouchableOpacity
                                key={index}
                                onPress={() => setSelectedCategory(cat)}
                                style={[
                                    styles.filterButton,
                                    selectedCategory === cat && styles.filterButtonActive,
                                ]}
                            >
                                <ThemedText
                                    style={[
                                        styles.filterButtonText,
                                        selectedCategory === cat && styles.filterButtonTextActive,
                                    ]}
                                >
                                    {cat === 'all' ? 'Tous' : cat}
                                </ThemedText>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
                <View style={styles.listContainer}>
                    <FlatList
                        data={filteredProducts}
                        keyExtractor={(item) => item.id}
                        numColumns={2}
                        renderItem={renderProduct}
                        contentContainerStyle={styles.productList}
                        style={{ flex: 1 }}
                    />
                </View>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    mainContainer: {
        flex: 1,
        width: '100%',
        maxWidth: 1200,
        alignSelf: 'center',
        backgroundColor: '#121212',
    },
    topSection: {
        padding: Dimensions.get('window').width < 600 ? 10 : 20,
        paddingTop: Constants.statusBarHeight + 10,
    },
    listContainer: {
        flex: 1,
    },
    menuHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: Dimensions.get('window').width < 600 ? 10 : 20,
        marginBottom: Dimensions.get('window').width < 600 ? 10 : 20,
    },
    siteTitle: {
        fontSize: Dimensions.get('window').width < 600 ? 20 : 28,
        fontWeight: 'bold',
        color: '#BB86FC',
    },
    iconButton: {
        padding: 8,
        backgroundColor: '#03dac6',
        borderRadius: 20,
    },
    searchContainer: {
        marginBottom: 20,
    },
    searchInput: {
        backgroundColor: '#1F1B24',
        color: '#E1E1E1',
        padding: Dimensions.get('window').width < 600 ? 8 : 10,
        borderRadius: 5,
        fontSize: Dimensions.get('window').width < 600 ? 14 : 16,
    },
    filterContainer: {
        flexDirection: 'row',
        marginBottom: Dimensions.get('window').width < 600 ? 10 : 20,
        flexWrap: 'wrap',
    },
    filterButton: {
        backgroundColor: '#121212',
        paddingVertical: Dimensions.get('window').width < 600 ? 3 : 5,
        paddingHorizontal: Dimensions.get('window').width < 600 ? 8 : 10,
        borderRadius: 20,
        marginRight: 10,
        marginBottom: 5,
        borderWidth: 1,
        borderColor: '#888',
    },
    filterButtonActive: {
        backgroundColor: '#03dac6',
        borderColor: '#03dac6',
    },
    filterButtonText: {
        color: '#E1E1E1',
        fontSize: Dimensions.get('window').width < 600 ? 12 : 14,
    },
    filterButtonTextActive: {
        color: '#121212',
        fontWeight: 'bold',
    },
    productList: {
        flexGrow: 1,
        paddingBottom: 220,
    },
    productCard: {
        flex: 1,
        backgroundColor: '#1F1B24',
        margin: 5,
        borderRadius: 10,
        padding: Dimensions.get('window').width < 600 ? 8 : 10,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 3,
    },
    productImage: {
        width: '100%',
        height: Dimensions.get('window').width < 600 ? 100 : 120,
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
    productName: {
        color: '#E1E1E1',
        fontSize: Dimensions.get('window').width < 600 ? 14 : 16,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    productPrice: {
        color: '#BB86FC',
        fontSize: Dimensions.get('window').width < 600 ? 12 : 14,
        marginBottom: 2,
    },
    productCategory: {
        color: '#888',
        fontSize: Dimensions.get('window').width < 600 ? 12 : 14,
        fontStyle: 'italic',
    },
});
