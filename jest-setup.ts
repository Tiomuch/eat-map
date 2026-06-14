jest.mock('expo-router', () => {
  const React = require('react');
  const Stack = ({ children }: any) => React.createElement(React.Fragment, null, children);
  Stack.Screen = () => null;
  
  return {
    __esModule: true,
    useRouter: jest.fn(() => ({
      push: jest.fn(),
      replace: jest.fn(),
      back: jest.fn(),
    })),
    useLocalSearchParams: jest.fn(() => ({})),
    useFocusEffect: jest.fn((cb) => cb()),
  Stack,
  };
});

jest.mock('expo-image', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    Image: (props: any) => React.createElement(View, { ...props, testID: 'expo-image' })
  };
});

jest.mock('expo-sqlite', () => ({
  openDatabaseSync: jest.fn(() => ({
    execSync: jest.fn(),
    runSync: jest.fn(),
    getFirstSync: jest.fn(),
    getAllSync: jest.fn(),
  })),
}));

jest.mock('react-native-reanimated', () => {
  const { View, Text, ScrollView, Image } = require('react-native');
  const chainableMock = () => {
    const mock: any = jest.fn(() => mock);
    mock.duration = mock;
    mock.delay = mock;
    mock.springify = mock;
    mock.damping = mock;
    mock.stiffness = mock;
    return mock;
  };

  return {
    default: { View, Text, ScrollView, Image, createAnimatedComponent: jest.fn((c) => c), call: () => {} },
    View, Text, ScrollView, Image,
    createAnimatedComponent: jest.fn((c) => c),
    useSharedValue: jest.fn((v) => ({ value: v })),
    useAnimatedStyle: jest.fn((cb) => cb() || {}),
    Easing: { bezier: jest.fn(), linear: jest.fn(), ease: jest.fn(), in: jest.fn(), out: jest.fn(), inOut: jest.fn() },
    withTiming: jest.fn((v) => v),
    withSpring: jest.fn((v) => v),
    withSequence: jest.fn((...args) => args[0]),
    FadeIn: chainableMock(),
    FadeInDown: chainableMock(),
    FadeInUp: chainableMock(),
    FadeOut: chainableMock(),
    FadeOutDown: chainableMock(),
    SlideInDown: chainableMock(),
    SlideOutDown: chainableMock(),
    Layout: chainableMock(),
    LinearTransition: chainableMock(),
    Animated: { View, Text, ScrollView, Image, createAnimatedComponent: jest.fn((c) => c) }
  };
});

jest.mock('react-native-worklets', () => {
  return {
    createSerializable: jest.fn(),
  };
});
const originalConsoleError = console.error;
console.error = (...args: any[]) => {
  if (typeof args[0] === 'string' && args[0].includes('was not wrapped in act(...).')) {
    return;
  }
  originalConsoleError(...args);
};
