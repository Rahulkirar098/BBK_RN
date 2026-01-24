import { View } from 'react-native';
import SplashScreen from './src/pages/auth/SplashScreen';
import RoleSelectionScreen from './src/pages/auth/RoleSelectionScreen';
import AuthScreen from './src/pages/auth/AuthScreen';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { Navigation } from './src/navigation';

function App() {
GoogleSignin.configure({
  webClientId: '340512668066-ipm1rhie49a41mpa9bh00pbv4dhcbprs.apps.googleusercontent.com',
});
  return (
    <View style={{ flex: 1}}>
      <Navigation/>
    </View>
  );
}

export default App;
