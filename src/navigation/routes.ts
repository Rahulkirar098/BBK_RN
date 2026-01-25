import Splash from '../screen/auth/SplashScreen';
import RoleSelectionScreen from '../screen/auth/RoleSelectionScreen';
import AuthScreen from '../screen/auth/AuthScreen';
import Register from '../screen/auth/Register';

export const authNavigation = [
  {
    name: 'splash',
    component: Splash,
  },
  {
    name: 'role-selection',
    component: RoleSelectionScreen,
  },
  {
    name: 'auth',
    component: AuthScreen,
  },
  {
    name: 'register',
    component: Register,
  },
];
