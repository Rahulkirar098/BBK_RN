import React, { useRef, useState, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import MapView, { Marker, Circle } from 'react-native-maps';
import { X } from 'lucide-react-native';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import { googleApiKey } from '../../../../config';
import { colors, horizontalScale, verticalScale } from '../../../../theme';
import { useNavigation } from '@react-navigation/native';

// Firebase
import {
  getFirestore,
  onSnapshot,
  query,
  Timestamp,
  collectionGroup,
} from '@react-native-firebase/firestore';
import { getAuth } from '@react-native-firebase/auth';
import { getApp } from '@react-native-firebase/app';

const DUBAI_REGION = {
  latitude: 25.0805,
  longitude: 55.14,
  latitudeDelta: 0.05,
  longitudeDelta: 0.05,
};

const { width } = Dimensions.get('window');

const HORIZONTAL_PADDING = 20;
const CARD_WIDTH = width - HORIZONTAL_PADDING * 2;
const SPACING = 10;

export const SessionMapScreen = () => {
  const app = getApp();
  const auth = getAuth(app);
  const db = getFirestore(app);
  const uid: any = auth.currentUser?.uid;

  const navigation = useNavigation<any>();

  const mapRef = useRef<any>(null);
  const flatListRef = useRef<any>(null);

  const [sessions, setSessions] = useState<any[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [filteredSessions, setFilteredSessions] = useState<any[]>([]);
  const [searchLocation, setSearchLocation] = useState<any>(null);

  const RADIUS_KM = 5;

  const currentData = useMemo(() => {
    return filteredSessions.length > 0 ? filteredSessions : sessions;
  }, [filteredSessions, sessions]);

  const getDistanceInKm = (lat1: any, lon1: any, lat2: any, lon2: any) => {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;

    return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
  };

  // 🔁 Scroll → map
  const handleScroll = (event: any) => {
    const index = Math.round(
      event.nativeEvent.contentOffset.x / (CARD_WIDTH + SPACING),
    );

    const item = currentData[index];
    if (!item) return;

    setSelectedIndex(index);

    mapRef.current?.animateToRegion({
      latitude: item.location.latitude,
      longitude: item.location.longitude,
      latitudeDelta: 0.05,
      longitudeDelta: 0.05,
    });
  };

  // 📍 Marker → card
  const handleMarkerPress = (index: number) => {
    flatListRef.current?.scrollToIndex({ index, animated: true });
  };

  // ❌ Clear search
  const handleClearSearch = () => {
    setFilteredSessions([]);
    setSearchLocation(null);
  };

  // 🔍 Search + filter
  const handleSearch = (details: any) => {
    const location = details?.geometry?.location;
    if (!location) return;

    const lat = location.lat;
    const lng = location.lng;

    const center = { latitude: lat, longitude: lng };

    setSearchLocation(center);

    mapRef.current?.animateToRegion({
      ...center,
      latitudeDelta: 0.05,
      longitudeDelta: 0.05,
    });

    const filtered = sessions.filter((item: any) => {
      if (!item?.location?.latitude || !item?.location?.longitude) {
        return false;
      }

      const distance = getDistanceInKm(
        lat,
        lng,
        item.location.latitude,
        item.location.longitude,
      );

      return distance <= RADIUS_KM;
    });

    setFilteredSessions(filtered);
    setSelectedIndex(0);

    // 📍 Fit markers
    if (filtered.length > 0) {
      const coords = filtered.map((item: any) => ({
        latitude: item.location.latitude,
        longitude: item.location.longitude,
      }));

      mapRef.current?.fitToCoordinates(coords, {
        edgePadding: { top: 100, right: 100, bottom: 200, left: 100 },
        animated: true,
      });
    }
  };

  // 🔥 Firestore
  useEffect(() => {
    const q = query(collectionGroup(db, 'slots'));

    const unsubscribe = onSnapshot(q, snapshot => {
      const data = snapshot.docs.map((docSnap: any) => {
        const docData = docSnap.data();

        let timeStart: Date;

        if (docData.timeStart instanceof Timestamp) {
          timeStart = docData.timeStart.toDate();
        } else {
          timeStart = new Date(docData.timeStart);
        }

        return {
          id: docSnap.id,
          ...docData,
          timeStart,
        };
      });

      setSessions(data);
    });

    return unsubscribe;
  }, []);

  return (
    <View style={{ flex: 1 }}>
      {/* 🔍 Search */}
      <View style={styles.searchContainer}>
        <View style={styles.searchRow}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <X size={20} color="white" />
          </TouchableOpacity>

          <View style={{ flex: 1 }}>
            <GooglePlacesAutocomplete
              placeholder="Search area..."
              fetchDetails
              onPress={(data, details) => handleSearch(details)}
              onNotFound={handleClearSearch}
              query={{ key: googleApiKey, language: 'en' }}
              styles={{ textInput: styles.searchInput }}
              textInputProps={{
                placeholderTextColor: colors.black,
                onChangeText: text => {
                  if (!text) handleClearSearch();
                },
              }}
            />
          </View>
        </View>
      </View>

      {/* 🗺️ Map */}
      <MapView
        ref={mapRef}
        style={StyleSheet.absoluteFillObject}
        initialRegion={DUBAI_REGION}
      >
        {currentData.map((item: any, index: any) => {
          if (!item?.location?.latitude) return null;

          const isSelected = index === selectedIndex;

          return (
            <Marker
              key={item.id}
              coordinate={{
                latitude: item.location.latitude,
                longitude: item.location.longitude,
              }}
              onPress={() => handleMarkerPress(index)}
            >
              <View
                style={[styles.marker, isSelected && styles.selectedMarker]}
              >
                <Text style={styles.markerText}>
                  {item.pricePerSeat} {item.currency}
                </Text>
              </View>
            </Marker>
          );
        })}

        {searchLocation && (
          <Circle
            center={searchLocation}
            radius={RADIUS_KM * 1000}
            strokeColor="rgba(0,0,255,0.5)"
            fillColor="rgba(0,0,255,0.2)"
          />
        )}
      </MapView>

      {/* ❗ No Results */}
      {searchLocation && currentData.length === 0 && (
        <View style={styles.noResult}>
          <Text style={{ color: 'white' }}>No sessions found in this area</Text>
        </View>
      )}

      {/* 📦 Cards */}
      <FlatList
        ref={flatListRef}
        data={currentData}
        keyExtractor={item => item.id}
        horizontal
        pagingEnabled
        snapToInterval={CARD_WIDTH + SPACING}
        decelerationRate="fast"
        showsHorizontalScrollIndicator={false}
        style={styles.flatList}
        contentContainerStyle={{
          paddingHorizontal: HORIZONTAL_PADDING,
          paddingRight: HORIZONTAL_PADDING,
        }}
        onScroll={handleScroll}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.title}>{item.title}</Text>
            <Text>{item.activity}</Text>

            <Text style={styles.price}>
              💰 {item.pricePerSeat} {item.currency}
            </Text>

            <Text>📍 {item.locationDetails?.name}</Text>

            <TouchableOpacity style={styles.button}
              onPress={() => {
                navigation.navigate("session-booking", {
                  session: item,
                  uid: uid,
                })
              }}
            >
              <Text style={{ color: 'white', fontWeight: 'bold' }}>
                Book Slot
              </Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },

  searchContainer: {
    position: 'absolute',
    top: verticalScale(50),
    width: '100%',
    zIndex: 1,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: horizontalScale(10),
  },

  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },

  searchInput: {
    height: 50,
    borderRadius: 10,
    backgroundColor: 'white',
    paddingHorizontal: 10,
    color: colors.black,
  },

  closeBtnWrap: {
    alignItems: 'flex-end',
    marginHorizontal: horizontalScale(10),
    marginTop: 10,
    marginBottom: 5,
  },

  flatList: {
    position: 'absolute',
    bottom: 20,
  },

  card: {
    width: CARD_WIDTH, // ✅ full width card
    marginRight: SPACING,
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    elevation: 5,
  },

  title: {
    fontWeight: 'bold',
    fontSize: 16,
  },

  price: {
    marginTop: 4,
    fontWeight: 'bold',
  },

  button: {
    marginTop: 10,
    backgroundColor: colors.primary,
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
  },

  marker: {
    backgroundColor: colors.orange500,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },

  selectedMarker: {
    backgroundColor: colors.primary,
    transform: [{ scale: 1.2 }],
  },

  markerText: {
    color: 'white',
    fontWeight: 'bold',
  },
  noResult: {
    position: 'absolute',
    top: '50%',
    alignSelf: 'center',
    backgroundColor: 'black',
    padding: 10,
    borderRadius: 10,
  },

  resultBox: {
    position: 'absolute',
    bottom: 140,
    alignSelf: 'center',
    backgroundColor: colors.primary,
    padding: 8,
    borderRadius: 10,
  },
});
