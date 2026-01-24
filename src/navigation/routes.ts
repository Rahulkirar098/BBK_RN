import Splash from '../pages/auth/SplashScreen';
import RoleSelectionScreen from '../pages/auth/RoleSelectionScreen';
import AuthScreen from '../pages/auth/AuthScreen';

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
];
