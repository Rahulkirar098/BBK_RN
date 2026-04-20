import Splash from '../screen/auth/SplashScreen';
import RoleSelectionScreen from '../screen/auth/RoleSelectionScreen';
import AuthScreen from '../screen/auth/AuthScreen';
import Register from '../screen/auth/Register';
import { SessionMapScreen, Explanation, SessionBooking, Ratings, Checkout } from '../screen/main/rider';

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

export const mainNavigation = [
  {
    name: 'explanation',
    component: Explanation,
  },
  {
    name: 'map',
    component: SessionMapScreen,
  },
  {
    name: 'session-booking',
    component: SessionBooking,
  },
  {
    name: 'rating',
    component: Ratings,
  },
  {
    name: 'checkout',
    component: Checkout,
  },
]