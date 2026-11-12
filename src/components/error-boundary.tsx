import React, { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends React.Component<{ children: ReactNode }, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <Text style={styles.title}>Something went wrong</Text>
          <Text style={styles.subtitle}>Close and reopen the screen to continue.</Text>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F2027',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32
  },
  title: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8
  },
  subtitle: {
    color: '#8A95A5',
    fontSize: 13,
    textAlign: 'center'
  }
});
