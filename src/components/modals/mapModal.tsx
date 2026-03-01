import React, { useRef, useState } from "react";
import {
    View,
    Text,
    Modal,
    TouchableOpacity,
    StyleSheet,
} from "react-native";
import MapView, { Marker, LatLng, Region } from "react-native-maps";
import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";
import { colors, horizontalScale, verticalScale } from "../../theme";

type Props = {
    visible: boolean;
    onClose: () => void;
    onSelectLocation: (location: LatLng, googlePlace?: any) => void;
};

const INITIAL_REGION: Region = {
    latitude: 37.78825,
    longitude: -122.4324,
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
    const mapRef = useRef<MapView | null>(null);

    const handlePlaceSelect = (details: any) => {
        const lat = details?.geometry?.location?.lat;
        const lng = details?.geometry?.location?.lng;

        if (typeof lat !== "number" || typeof lng !== "number") return;

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
            800
        );
    };

    const handleConfirm = () => {
        if (location) {
            onSelectLocation(location, googlePlace);
            onClose();
        }
    };

    const zoom = (factor: number) => {
        if (!location) return;

        mapRef.current?.animateToRegion(
            {
                latitude: location.latitude,
                longitude: location.longitude,
                latitudeDelta: INITIAL_REGION.latitudeDelta * factor,
                longitudeDelta: INITIAL_REGION.longitudeDelta * factor,
            },
            800
        );
    };

    return (
        <Modal visible={visible} animationType="slide" transparent>
            <View style={styles.overlay}>
                <View style={styles.modal}>

                    {/* Search */}
                    <GooglePlacesAutocomplete
                        placeholder="Search location"
                        fetchDetails
                        onPress={(data, details = null) => {
                            handlePlaceSelect(details)
                            setGooglePlace(details)
                        }}
                        query={{
                            key: "AIzaSyCZ_Bqreka0SYy151W4udjWKQHOs93K66c",
                            language: "en",
                        }}
                        styles={{
                            container: { flex: 0 },
                            listView: { backgroundColor: "#000" },
                        }}
                    />

                    {/* Map */}
                    <MapView
                        ref={mapRef}
                        style={styles.map}
                        initialRegion={INITIAL_REGION}
                        zoomEnabled={true}
                        zoomControlEnabled={true}   // ✅ Android only
                        scrollEnabled={true}
                        pitchEnabled={true}
                        rotateEnabled={true}
                    >
                        {location && (
                            <Marker
                                coordinate={location}
                                draggable
                                onDragEnd={(e) =>
                                    setLocation(e.nativeEvent.coordinate)
                                }
                            />
                        )}
                    </MapView>

                    <View style={styles.zoomContainer}>
                        <TouchableOpacity
                            style={styles.zoomBtn}
                            onPress={() => zoom(0.5)} // Zoom In
                        >
                            <Text style={styles.zoomText}>+</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.zoomBtn}
                            onPress={() => zoom(2)} // Zoom Out
                        >
                            <Text style={styles.zoomText}>-</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Buttons */}
                    <View style={styles.footer}>
                        <TouchableOpacity
                            style={styles.cancelBtn}
                            onPress={onClose}
                        >
                            <Text style={styles.btnText}>Cancel</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.confirmBtn}
                            onPress={handleConfirm}
                        >
                            <Text style={styles.btnText}>Confirm</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'center',
        padding: 16,
    },

    modal: {
        backgroundColor: colors.white,
        borderRadius: horizontalScale(10),
        height: verticalScale(600),
        maxHeight: verticalScale(600),
    },
    map: {
        flex: 1,
    },
    footer: {
        flexDirection: "row",
    },
    cancelBtn: {
        flex: 1,
        padding: 15,
        backgroundColor: "#aaa",
        alignItems: "center",
    },
    confirmBtn: {
        flex: 1,
        padding: 15,
        backgroundColor: "#0891B2",
        alignItems: "center",
    },
    btnText: {
        color: "#fff",
        fontWeight: "600",
    },
    ///////
    zoomContainer: {
        position: "absolute",
        right: 15,
        bottom: 120,
        zIndex: 10,
    },

    zoomBtn: {
        backgroundColor: "#0891B2",
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 10,
    },

    zoomText: {
        color: "#fff",
        fontSize: 20,
        fontWeight: "bold",
    },
});
