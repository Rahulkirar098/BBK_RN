import React, { useRef, useState } from "react";
import {
    View,
    Text,
    Modal,
    TouchableOpacity,
    StyleSheet,
    Platform
} from "react-native";
import MapView, { Marker, LatLng, Region, PROVIDER_GOOGLE } from "react-native-maps";
import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";
import { colors, horizontalScale, platform, verticalScale } from "../../theme";

type Props = {
    visible: boolean;
    onClose: () => void;
    onSelectLocation: (location: LatLng, googlePlace?: any) => void;
};

const INITIAL_REGION: Region = {
    latitude: 25.0805,
    longitude: 55.1400,
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
        if (!mapRef.current) return;

        const newRegion: Region = {
            ...region,
            latitudeDelta: region.latitudeDelta * factor,
            longitudeDelta: region.longitudeDelta * factor,
        };

        mapRef.current.animateToRegion(newRegion, 300);
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
                            container: { flex: 0, zIndex: 99 },
                            listView: { backgroundColor: "#000" },
                        }}
                    />

                    {/* Map */}
                    <MapView
                        ref={mapRef}
                        provider={Platform.OS === "android" ? PROVIDER_GOOGLE : undefined}
                        style={styles.map}
                        initialRegion={INITIAL_REGION}
                        zoomEnabled={true}
                        zoomControlEnabled={false}
                        scrollEnabled={true}
                        pitchEnabled={true}
                        rotateEnabled={true}
                        onRegionChangeComplete={(reg) => setRegion(reg)}
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
        overflow: "hidden"
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
        backgroundColor: colors.gray400,
        alignItems: "center",
    },
    confirmBtn: {
        flex: 1,
        padding: 15,
        backgroundColor: colors.primary,
        alignItems: "center",
    },
    btnText: {
        color: colors.white,
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
        backgroundColor: colors.primary,
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 10,
    },

    zoomText: {
        color: colors.white,
        fontSize: 20,
        fontWeight: "bold",
    },
});
