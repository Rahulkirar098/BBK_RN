import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import MapView, {
  Marker,
  LatLng,
  Region,
  PROVIDER_GOOGLE,
} from 'react-native-maps';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import { colors, horizontalScale, verticalScale } from '../../theme';
import { X } from 'lucide-react-native';

// Google
import { googleApiKey } from '../../config';
import Geocoder from 'react-native-geocoding';
Geocoder.init(googleApiKey);
// Google

type Props = {
  visible: boolean;
  onClose: () => void;
  onSelectLocation: (location: LatLng, googlePlace?: any) => void;
};

const INITIAL_REGION: Region = {
  latitude: 25.0805,
  longitude: 55.14,
  latitudeDelta: 0.05,
  longitudeDelta: 0.05,
};

export default function LocationPickerModal({
  visible,
  onClose,
  onSelectLocation,
}: Props) {
  const [location, setLocation] = useState<LatLng | null>(null);
  const [googlePlace, setGooglePlace] = useState<any>(null);
  const [region, setRegion] = useState<Region>(INITIAL_REGION);
  const mapRef = useRef<MapView | null>(null);

  const googleRef = useRef<any>(null);

  const handlePlaceSelect = (details: any) => {
    const lat = details?.geometry?.location?.lat;
    const lng = details?.geometry?.location?.lng;

    if (typeof lat !== 'number' || typeof lng !== 'number') return;

    const newLocation: LatLng = {
      latitude: lat,
      longitude: lng,
    };

    setLocation(newLocation);

    mapRef.current?.animateToRegion(
      {
        ...newLocation,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      },
      800,
    );
  };

  const buildLocationDetails = async (location: LatLng, googlePlace: any) => {
    try {
      let place = googlePlace;

      // 🔥 If user tapped map → fetch full details
      if (!place || !place.place_id) {
        const geoRes = await Geocoder.from(
          location.latitude,
          location.longitude
        );

        const result = geoRes.results[0];
        const placeId = result.place_id;

        let fullPlace = null;

        if (placeId) {
          const detailsRes = await fetch(
            `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&key=${googleApiKey}`
          );

          const detailsJson = await detailsRes.json();
          fullPlace = detailsJson.result;
        }

        place = fullPlace || result;
      }

      // ✅ Normalize output (THIS is what backend needs)
      return {
        name:
          place?.name ||
          place?.address_components?.[0]?.long_name ||
          '',

        formatted_address:
          place?.formatted_address ||
          place?.description ||
          '',

        vicinity:
          place?.vicinity ||
          place?.formatted_address ||
          '',

        place_id: place?.place_id || '',

        photos: place?.photos ? place?.photos : [],
      };
    } catch (err) {
      console.log('buildLocationDetails error', err);

      // fallback (minimum safe data)
      return {
        name: '',
        formatted_address: '',
        vicinity: '',
        place_id: '',
        photos: '',
      };
    }
  };

  const handleClose = () => {
    setLocation(null);
    setGooglePlace(null);
    onClose();
  };

  const handleConfirm = async () => {
    if (!location) return;

    const locationDetails = await buildLocationDetails(
      location,
      googlePlace
    );

    onSelectLocation(location, locationDetails); // ✅ ALWAYS FULL DATA
    onClose();
  };

  const zoom = (factor: number) => {
    if (!mapRef.current) return;

    const newRegion: Region = {
      ...region,
      latitudeDelta: region.latitudeDelta * factor,
      longitudeDelta: region.longitudeDelta * factor,
    };

    mapRef.current.animateToRegion(newRegion, 300);
  };

  const debounceRef = useRef<any>(null);

  const getAddressDebounced = (lat: number, lng: number) => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      getAddressFromCoords(lat, lng);
    }, 500);
  };

  const getAddressFromCoords = async (lat: number, lng: number) => {
    try {
      const res = await Geocoder.from(lat, lng);
      const address = res.results[0]?.formatted_address;

      // ✅ update state
      setGooglePlace({
        description: address,
        geometry: { location: { lat, lng } },
      });

      // 🔥 update input field
      googleRef.current?.setAddressText(address);
    } catch (err) {
      console.log('Geocode error', err);
    }
  };
  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        {/* Search */}
        <View style={styles.searchContainer}>
          <View style={styles.searchRow}>
            <TouchableOpacity style={styles.closeBtn} onPress={handleClose}>
              <X size={20} color={colors.white} />
            </TouchableOpacity>

            <GooglePlacesAutocomplete
              ref={googleRef}
              placeholder="Search location..."
              fetchDetails
              onPress={(data, details = null) => {
                handlePlaceSelect(details);
                setGooglePlace(details);
              }}
              query={{
                key: googleApiKey,
                language: 'en',
              }}
              styles={{
                container: styles.autoContainer,
                textInput: styles.searchInput,
                listView: styles.listView,
                row: styles.rowItem,
                description: styles.description,
              }}
              textInputProps={{
                placeholderTextColor: colors.gray500,
              }}
              enablePoweredByContainer={false}
            />
          </View>
        </View>

        {/* Map */}
        <MapView
          ref={mapRef}
          provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
          style={styles.map}
          initialRegion={INITIAL_REGION}
          zoomEnabled
          scrollEnabled
          pitchEnabled
          rotateEnabled
          onRegionChangeComplete={reg => setRegion(reg)}

          onPress={e => {
            const coords = e.nativeEvent.coordinate;

            setLocation(coords);

            // ✅ center map on tapped location
            mapRef.current?.animateToRegion({
              latitude: coords.latitude,
              longitude: coords.longitude,
              latitudeDelta: 0.03,
              longitudeDelta: 0.03,
            }, 500);

            // 🔥 Get address
            getAddressDebounced(coords.latitude, coords.longitude);
          }}
        >
          {location && (
            <Marker
              coordinate={location}
              draggable
              onDragEnd={e => {
                const coords = e.nativeEvent.coordinate;
                setLocation(coords);
                getAddressDebounced(coords.latitude, coords.longitude);
              }}
            />
          )}
        </MapView>

        {/* Zoom Buttons */}
        <View style={styles.zoomContainer}>
          <TouchableOpacity style={styles.zoomBtn} onPress={() => zoom(0.5)}>
            <Text style={styles.zoomText}>+</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.zoomBtn} onPress={() => zoom(2)}>
            <Text style={styles.zoomText}>-</Text>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.confirmBtn, !location && styles.disabledBtn]}
            disabled={!location}
            onPress={handleConfirm}
          >
            <Text style={styles.btnText}>Confirm</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
  },

  map: {
    flex: 1,
  },

  footer: {
    flexDirection: 'row',
  },

  confirmBtn: {
    flex: 1,
    padding: 15,
    backgroundColor: colors.primary,
    alignItems: 'center',
  },

  disabledBtn: {
    opacity: 0.5,
  },

  btnText: {
    color: colors.white,
    fontWeight: '600',
  },

  zoomContainer: {
    position: 'absolute',
    right: 15,
    bottom: 120,
    zIndex: 10,
  },

  zoomBtn: {
    backgroundColor: colors.primary,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },

  zoomText: {
    color: colors.white,
    fontSize: 20,
    fontWeight: 'bold',
  },

  searchContainer: {
    position: 'absolute',
    top: verticalScale(50),
    width: '100%',
    zIndex: 10,
    paddingHorizontal: horizontalScale(15),
  },

  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: horizontalScale(5),
  },

  autoContainer: {
    flex: 1,
  },

  searchInput: {
    height: 50,
    borderRadius: 25,
    backgroundColor: '#fff',
    paddingHorizontal: 15,
    fontSize: 14,
    elevation: 3,
  },

  listView: {
    backgroundColor: '#fff',
    borderRadius: 10,
    marginTop: 5,
    elevation: 3,
  },

  rowItem: {
    paddingVertical: 12,
    paddingHorizontal: 15,
  },

  description: {
    fontSize: 14,
    color: '#333',
  },

  closeBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
});