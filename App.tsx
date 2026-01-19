import { View } from 'react-native';
import SplashScreen from './src/pages/auth/SplashScreen';
import RoleSelectionScreen from './src/pages/auth/RoleSelectionScreen';
import AuthScreen from './src/pages/auth/AuthScreen';


function App() {

  return (
    <View style={{ flex: 1}}>
      {/* <SplashScreen /> */}
      <RoleSelectionScreen/>
      {/* <AuthScreen/> */}
    </View>
  );
}

export default App;
