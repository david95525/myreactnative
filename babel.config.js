module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    [
      'module-resolver',
      {
        root: ['./src'],
        alias: {
          '@components': './src/components',
          '@pages': './src/pages',
          '@services': './src/services',
          '@utils': './src/utils',
          '@constants': './src/constants',
          '@types/*': './src/types',
          "@types": ["types/index"]
        },
        extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
      },
    ],
    ['module:react-native-dotenv'],
    'react-native-reanimated/plugin',
  ],
};

