import type {PropsWithChildren} from 'react';
import React from 'react';
import {
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from 'react-native';
type SectionProps = PropsWithChildren<{
  title: string;
}>;
const Colors = {
  light: {
    background: '#FFFFFF',
    text: '#1C1C1E',
    tint: '#0A84FF',
    border: '#C7C7CC',
  },
  dark: {
    background: '#000000',
    text: '#FFFFFF',
    tint: '#0A84FF',
    border: '#3A3A3C',
  },
};
function Section({children, title}: SectionProps): React.JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';
  return (
    <View style={styles.sectionContainer}>
      <Text
        style={[
          styles.sectionTitle,
          {
            color: isDarkMode
              ? Colors.dark.background
              : Colors.light.background,
          },
        ]}>
        {title}
      </Text>
      <Text
        style={[
          styles.sectionDescription,
          {
            color: isDarkMode ? Colors.dark.text : Colors.light.text,
          },
        ]}>
        {children}
      </Text>
    </View>
  );
}

export function Home() {
  const isDarkMode = useColorScheme() === 'dark';

  const backgroundStyle = {
    backgroundColor: isDarkMode
      ? Colors.dark.background
      : Colors.light.background,
  };

  const safePadding = '5%';
  return (
    <View style={backgroundStyle}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={backgroundStyle.backgroundColor}
      />
      <ScrollView style={backgroundStyle}>
        <View
          style={{
            backgroundColor: isDarkMode
              ? Colors.dark.background
              : Colors.light.background,
            paddingHorizontal: safePadding,
            paddingBottom: safePadding,
          }}>
          <Section title="Step One">
            Edit <Text style={styles.highlight}>App.tsx</Text> to change this
            screen and then come back to see your edits.
          </Section>
          <Section title="Learn More">
            <Text> Read the docs to discover what to do next:</Text>
          </Section>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  sectionContainer: {
    marginTop: 32,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
  },
  sectionDescription: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '400',
  },
  highlight: {
    fontWeight: '700',
  },
});
