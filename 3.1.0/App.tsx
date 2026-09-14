/**
 * Sample app for @basis-theory/react-native-elements 3.1.0.
 *
 * Shows the autofill and keyboard properties added in 3.1.0 alongside
 * tokenization. The form advances Card number -> Next -> Expiry -> Next -> CVC
 * -> Done, and offers device autofill. Card data never reaches this component:
 * the refs handed to tokens.create are opaque handles, and the element events
 * carry only metadata such as brand, bin and last4.
 */
import React, { useRef, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {
  CardExpirationDateElement,
  CardNumberElement,
  CardVerificationCodeElement,
  useBasisTheory,
} from '@basis-theory/react-native-elements';
import type {
  BTDateRef,
  BTRef,
  ElementEvent,
  Token,
} from '@basis-theory/react-native-elements';

// A public key (btpub_...). Public keys can only create tokens, never read
// them, which is what makes it safe to ship one inside an app.
const API_KEY = '<YOUR_PUBLIC_API_KEY>';

type FieldName = 'cardNumber' | 'expiration' | 'cvc';

const App = () => {
  const { bt, error } = useBasisTheory(API_KEY);

  const cardNumberRef = useRef<BTRef>(null);
  const expirationRef = useRef<BTDateRef>(null);
  const cvcRef = useRef<BTRef>(null);

  const [events, setEvents] = useState<
    Partial<Record<FieldName, ElementEvent>>
  >({});
  const [cvcLength, setCvcLength] = useState<number>();
  const [token, setToken] = useState<Token>();
  const [submitting, setSubmitting] = useState(false);
  const [failure, setFailure] = useState<string>();

  const onFieldChange = (field: FieldName) => (event: ElementEvent) => {
    // The card number element reports how long the CVC should be for the
    // detected brand, so the CVC element can size itself.
    if (event.cvcLength) {
      setCvcLength(event.cvcLength);
    }

    setEvents((previous) => ({ ...previous, [field]: event }));
  };

  const ready =
    Boolean(events.cardNumber?.complete) &&
    Boolean(events.expiration?.complete) &&
    Boolean(events.cvc?.complete);

  const createToken = async () => {
    setSubmitting(true);
    setFailure(undefined);

    try {
      const created = await bt?.tokens.create({
        type: 'card',
        data: {
          number: cardNumberRef.current,
          expiration_month: expirationRef.current?.month(),
          expiration_year: expirationRef.current?.year(),
          cvc: cvcRef.current,
        },
      });

      setToken(created);
    } catch (tokenError) {
      setFailure(
        tokenError instanceof Error ? tokenError.message : String(tokenError)
      );
    } finally {
      setSubmitting(false);
    }
  };

  const reset = () => {
    cardNumberRef.current?.clear();
    expirationRef.current?.clear();
    cvcRef.current?.clear();
    setEvents({});
    setToken(undefined);
    setFailure(undefined);
  };

  return (
    <SafeAreaView style={styles.screen}>
      <StatusBar backgroundColor="#070a1b" barStyle="light-content" />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Card details</Text>
        <Text style={styles.caption}>
          react-native-elements 3.1.0 — autofill, keyboard hints, focus advance
        </Text>

        {error ? (
          <Text style={styles.error}>
            SDK failed to initialize: {String(error)}
          </Text>
        ) : null}

        <Text style={styles.label}>Card number</Text>
        <CardNumberElement
          autoComplete="cc-number"
          btRef={cardNumberRef}
          enterKeyHint="next"
          keyboardType="numeric"
          onChange={onFieldChange('cardNumber')}
          onSubmitEditing={() => expirationRef.current?.focus()}
          placeholder="4242 4242 4242 4242"
          placeholderTextColor="#5b6180"
          returnKeyType="next"
          style={styles.input}
          textContentType="creditCardNumber"
        />

        <View style={styles.row}>
          <View style={styles.rowItem}>
            <Text style={styles.label}>Expiration</Text>
            <CardExpirationDateElement
              autoComplete="cc-exp"
              btRef={expirationRef}
              enterKeyHint="next"
              keyboardType="numeric"
              onChange={onFieldChange('expiration')}
              onSubmitEditing={() => cvcRef.current?.focus()}
              placeholder="MM/YY"
              placeholderTextColor="#5b6180"
              returnKeyType="next"
              style={styles.input}
              textContentType="creditCardExpiration"
            />
          </View>

          <View style={styles.rowItem}>
            <Text style={styles.label}>CVC</Text>
            <CardVerificationCodeElement
              autoComplete="cc-csc"
              btRef={cvcRef}
              cvcLength={cvcLength}
              enterKeyHint="done"
              keyboardType="numeric"
              onChange={onFieldChange('cvc')}
              placeholder="123"
              placeholderTextColor="#5b6180"
              returnKeyType="done"
              style={styles.input}
              textContentType="creditCardSecurityCode"
            />
          </View>
        </View>

        <Pressable
          disabled={!ready || submitting || !bt}
          onPress={createToken}
          style={[styles.button, (!ready || submitting) && styles.buttonOff]}
        >
          {submitting ? (
            <ActivityIndicator color="#070a1b" />
          ) : (
            <Text style={styles.buttonText}>Create token</Text>
          )}
        </Pressable>

        {token ? (
          <View style={styles.result}>
            <Text style={styles.resultLabel}>Token created</Text>
            <Text style={styles.resultValue}>{token.id}</Text>
            <Pressable onPress={reset} style={styles.link}>
              <Text style={styles.linkText}>Start over</Text>
            </Pressable>
          </View>
        ) : null}

        {failure ? <Text style={styles.error}>{failure}</Text> : null}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    backgroundColor: '#5cf2c0',
    borderRadius: 8,
    marginTop: 28,
    padding: 16,
  },
  buttonOff: { opacity: 0.4 },
  buttonText: { color: '#070a1b', fontSize: 16, fontWeight: '700' },
  caption: { color: '#7c839f', marginBottom: 8 },
  content: { padding: 24 },
  error: { color: '#ff6b6b', marginTop: 16 },
  input: {
    backgroundColor: '#121324',
    borderColor: '#232544',
    borderRadius: 8,
    borderWidth: 1,
    color: '#ffffff',
    fontSize: 16,
    padding: 14,
  },
  label: { color: '#99a0bf', fontSize: 13, marginBottom: 6, marginTop: 12 },
  link: { marginTop: 8 },
  linkText: { color: '#99a0bf', textDecorationLine: 'underline' },
  result: {
    backgroundColor: '#121324',
    borderRadius: 8,
    marginTop: 24,
    padding: 16,
  },
  resultLabel: { color: '#99a0bf', fontSize: 13 },
  resultValue: { color: '#5cf2c0', fontSize: 14, marginVertical: 6 },
  row: { flexDirection: 'row', gap: 12 },
  rowItem: { flex: 1 },
  screen: { backgroundColor: '#070a1b', flex: 1 },
  title: { color: '#ffffff', fontSize: 24, fontWeight: '700' },
});

export default App;
