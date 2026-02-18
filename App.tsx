//-----------React Native-----------//
import { View } from 'react-native';

//-----------Navigation-----------//
import { Navigation } from './src/navigation';

//-----------Google Signin-----------//
import { GoogleSignin } from '@react-native-google-signin/google-signin';

//-----------Stripe-----------//
import { StripeProvider } from '@stripe/stripe-react-native';

//-----------Key-----------//
import { googleSignin, stripKey } from './src/config';

function App() {
  GoogleSignin.configure({
    webClientId: googleSignin,
  });
  return (
    <View style={{ flex: 1 }}>
      <StripeProvider
        publishableKey={stripKey}
        // merchantIdentifier="merchant.com.bookbyseat" // iOS only (Apple Pay)
      >
        <Navigation />
      </StripeProvider>
    </View>
  );
}

export default App;
