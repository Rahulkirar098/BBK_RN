import { View } from 'react-native';
import SplashScreen from './src/pages/auth/SplashScreen';
import RoleSelectionScreen from './src/pages/auth/RoleSelectionScreen';


function App() {

  return (
    <View style={{ flex: 1}}>
      {/* <SplashScreen /> */}
      <RoleSelectionScreen/>
    </View>
  );
}

export default App;
