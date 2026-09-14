# react-native-elements 3.1.0

A demo of [`@basis-theory/react-native-elements`](https://www.npmjs.com/package/@basis-theory/react-native-elements) `3.1.0`, showing the autofill and keyboard properties added in that release alongside card tokenization.

![The demo running on iOS and Android](docs/demo-ios-android.png)

The same screen on both platforms. The keyboard's action key reads **Next** on iOS and appears as **→|** on Android. Pressing it moves focus to the next field instead of dismissing the keyboard.

`3.1.0` targets **React Native 0.79 and React 18.3+**. Applications that cannot take the React Native 0.86 and React 19 upgrade that 4.x requires can still adopt these properties from here. The release changes JavaScript only: no new dependencies and no native code, so it can reach devices over the air.

The 3.x line is published under its own dist-tag, leaving `latest` on the current major:

```bash
npm install @basis-theory/react-native-elements@^3.1.0
# or
npm install @basis-theory/react-native-elements@v3-lts
```

## What the demo covers

`App.tsx` is a single card form that wires every property the release added.

| Property                                                                                                                            | What it does                                                                                     | Platform      |
| ----------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ | ------------- |
| [`autoComplete`](https://developers.basistheory.com/docs/sdks/mobile/react-native/components#autofill)                              | Declares what the field holds (`cc-number`, `cc-exp`, `cc-csc`) so the OS can offer a saved card | iOS + Android |
| [`textContentType`](https://developers.basistheory.com/docs/sdks/mobile/react-native/components#autofill)                           | The iOS name for the same hint, and takes precedence where both are set                          | iOS           |
| [`enterKeyHint`](https://developers.basistheory.com/docs/sdks/mobile/react-native/components#keyboard-navigation)                   | Relabels the keyboard's action key: `next`, `next`, `done`                                       | iOS + Android |
| [`returnKeyType`](https://developers.basistheory.com/docs/sdks/mobile/react-native/components#what-to-expect-from-each-prop)        | The older name for the same relabelling, superseded by `enterKeyHint`                            | iOS + Android |
| [`onSubmitEditing`](https://developers.basistheory.com/docs/sdks/mobile/react-native/components#keyboard-navigation)                | Fires when the action key is pressed, moving focus to the next field                             | iOS + Android |
| [`inputAccessoryViewID`](https://developers.basistheory.com/docs/sdks/mobile/react-native/components#what-to-expect-from-each-prop) | Attaches a keyboard toolbar; available, though the demo leaves it unused                         | iOS           |

Tokenization runs through [`bt.tokens.create`](https://developers.basistheory.com/docs/sdks/mobile/react-native/services), which receives the element refs rather than card data.

## How the keyboard properties interact

Each one is a hint passed to the underlying [TextInput](https://reactnative.dev/docs/textinput). The operating system decides what to do with it, so a correctly configured element can still show nothing.

The demo sets `keyboardType="numeric"` on all three fields. A number pad (`number-pad`) has no return key, so `enterKeyHint`, `returnKeyType` and `onSubmitEditing` have nothing to attach to and none of them take effect. [What to expect from each prop](https://developers.basistheory.com/docs/sdks/mobile/react-native/components#what-to-expect-from-each-prop) covers the rest of these interactions.

`onSubmitEditing` receives the same sanitized [ChangeEvent](https://developers.basistheory.com/docs/sdks/mobile/react-native/components#changeevent) that `onChange` does, carrying state such as `complete` and `empty` along with metadata like brand and last four digits. It does not receive React Native's native event, whose payload would include the value the user typed.

## Autofill across platforms

Two of the properties are iOS-only, and each has a different answer on Android:

| iOS-only property      | On Android                                                                                                                |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| `textContentType`      | Ignored. `autoComplete` carries the same hint, mapping to `autofillHints`, which is why the demo sets both on every field |
| `inputAccessoryViewID` | No counterpart, since React Native's [InputAccessoryView](https://reactnative.dev/docs/inputaccessoryview) is iOS-only    |

Accepting a suggestion behaves the same as typing: the element applies its mask, emits `onChange`, and tokenizes to the same value, with the data passing from the OS into the element without reaching application code.

## Running it

`API_KEY` at the top of `App.tsx` holds a public key.

```bash
npm install
npm run ios      # or: npm run android
```

## Reference

- [Components](https://developers.basistheory.com/docs/sdks/mobile/react-native/components) — every element, property and event
- [Autofill](https://developers.basistheory.com/docs/sdks/mobile/react-native/components#autofill)
- [Keyboard navigation](https://developers.basistheory.com/docs/sdks/mobile/react-native/components#keyboard-navigation)
- [React Native SDK](https://developers.basistheory.com/docs/sdks/mobile/react-native/)
