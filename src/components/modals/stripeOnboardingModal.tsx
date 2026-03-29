import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  StyleSheet,
  Alert,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors } from '../../theme';

const RETURN_URL = 'https://bbk-be-1smn.vercel.app/success';
const REFRESH_URL = 'https://bbk-be-1smn.vercel.app/reauth';

interface Props {
  visible: boolean;
  url: string;
  onClose: () => void;
  onSuccess?: () => void;
}

export const StripeOnboardingModal: React.FC<Props> = ({
  visible,
  url,
  onClose,
  onSuccess,
}) => {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="fullScreen">
      <SafeAreaView style={styles.container}>
        {/* ✅ CLOSE BUTTON */}
        <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
          <Text style={styles.closeText}>Close</Text>
        </TouchableOpacity>

        {/* 🔥 PROGRESS BAR */}
        {progress < 1 && (
          <View
            style={[
              styles.progressBar,
              { width: `${progress * 100}%` },
            ]}
          />
        )}

        {/* ✅ WEBVIEW */}
        <WebView
          source={{ uri: url }}
          style={{ flex: 1 }}
          onLoadStart={() => {
            setLoading(true);
            setProgress(0);
          }}
          onLoadEnd={() => setLoading(false)}
          onLoadProgress={({ nativeEvent }) =>
            setProgress(nativeEvent.progress)
          }
          onNavigationStateChange={navState => {
            const currentUrl = navState.url;

            console.log('Stripe URL:', currentUrl);

            // ✅ SUCCESS
            if (currentUrl.startsWith(RETURN_URL)) {
              onClose();
              Alert.alert('Success', 'Stripe onboarding completed');
              onSuccess && onSuccess();
            }

            // ❌ FAILED
            if (currentUrl.startsWith(REFRESH_URL)) {
              onClose();
              Alert.alert(
                'Incomplete',
                'Onboarding not completed. Please try again.',
              );
            }
          }}
        />

        {/* 🔥 LOADER */}
        {loading && (
          <View style={styles.loader}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        )}
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },

  closeBtn: {
    position: 'absolute',
    top: 20,
    right: 20,
    zIndex: 10,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },

  closeText: {
    color: 'white',
    fontWeight: '600',
  },

  progressBar: {
    height: 3,
    backgroundColor: colors.primary,
  },

  loader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.7)',
  },
});