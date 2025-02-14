// index.jsx
import React, { useState, useEffect } from 'react';
import {
    View,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    SafeAreaView,
    FlatList,
    Image,
} from 'react-native';
import { ThemedText } from '../components/ThemedText';
import { HelloWave } from '../components/HelloWave';
import { firestore } from '../firebaseConfig';

import { collection, onSnapshot } from 'firebase/firestore';
import { useNavigation } from '@react-navigation/native';

export default function HomeScreen() {
    const navigation = useNavigation();
    const [products, setProducts] = useState([]);
    const [searchText, setSearchText] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');

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

    const filteredProducts = products.filter((product) => {
        const matchCategory = selectedCategory === 'all' || product.category === selectedCategory;
        const matchSearch = product.name?.toLowerCase().includes(searchText.toLowerCase());
        return matchCategory && matchSearch;
    });

    const handleProfilePress = () => {
        navigation.navigate('Profile');
    };

    const handleProductPress = (product) => {
        console.log("Navigating to ProductDetails with:", product);
        navigation.navigate('ProductDetails', { product });
    };

    const renderProduct = ({ item }) => (
        <TouchableOpacity
            onPress={() => handleProductPress(item)}
            style={styles.productCard}
        >
            {item.imageUrl ? (
                <Image
                    style={styles.productImage}
                    source={{ uri: item.imageUrl }}
                    resizeMode="cover"
                />
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
                <ThemedText style={styles.productCategory}>
                    ({item.category})
                </ThemedText>
            )}
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={{ flex: 1 }}>
            <View style={styles.container}>
                {/* En-tête avec Welcome et bouton Profil */}
                <View style={styles.header}>
                    <ThemedText type="title" style={styles.title}>
                        Welcome!
                    </ThemedText>
                    <TouchableOpacity onPress={handleProfilePress} style={styles.profileButton}>
                        <ThemedText style={styles.profileButtonText}>Profil</ThemedText>
                    </TouchableOpacity>
                </View>
                <HelloWave />

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

                {/* Grille des produits filtrés avec padding en bas */}
                <FlatList
                    data={filteredProducts}
                    keyExtractor={(item) => item.id}
                    numColumns={2}
                    contentContainerStyle={[styles.productList, { paddingBottom: 220 }]}
                    renderItem={renderProduct}
                />
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        padding: 20,
        backgroundColor: '#121212',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#BB86FC',
    },
    profileButton: {
        backgroundColor: '#03dac6',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
    },
    profileButtonText: {
        color: '#121212',
        fontWeight: 'bold',
        fontSize: 16,
    },
    searchContainer: {
        marginBottom: 20,
    },
    searchInput: {
        backgroundColor: '#1F1B24',
        color: '#E1E1E1',
        padding: 10,
        borderRadius: 5,
    },
    filterContainer: {
        flexDirection: 'row',
        marginBottom: 20,
        flexWrap: 'wrap',
    },
    filterButton: {
        backgroundColor: '#121212',
        paddingVertical: 5,
        paddingHorizontal: 10,
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
    },
    filterButtonTextActive: {
        color: '#121212',
        fontWeight: 'bold',
    },
    productList: {
        paddingBottom: 220,
    },
    productCard: {
        flex: 1,
        backgroundColor: '#1F1B24',
        margin: 5,
        borderRadius: 10,
        padding: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 3,
        alignItems: 'center',
    },
    productImage: {
        width: '100%',
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
    productName: {
        color: '#E1E1E1',
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    productPrice: {
        color: '#BB86FC',
        fontSize: 14,
        marginBottom: 2,
    },
    productCategory: {
        color: '#888',
        fontSize: 14,
        fontStyle: 'italic',
    },
});
