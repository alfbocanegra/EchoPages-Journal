# Dynamic Theming & Font Size Guide (Mobile)

EchoPages Journal mobile app supports a fully dynamic, user-configurable theme system. This guide covers how to use the theme context, best practices, and code review checklist for theming and accessibility.

## Theme Context Structure
- The theme context is provided via `ThemeProvider` and accessed with the `useTheme` hook.
- The theme object includes:
  - `colors`: All palette colors, including `primary`, `secondary`, `accent`, `surface`, `error`, `outline`, etc.
  - `typography`: Font families, weights, and font sizes (`body`, `heading`, `caption`, `button`, etc.).
  - `shape`: Border radii (`small`, `medium`, `large`, `full`).
  - `spacing`: Spacing scale (array of pixel values).
  - `elevation`: Shadow/elevation values for surfaces.

## Using the Theme in Components
- Import and call `useTheme` in your component:

```tsx
import { useTheme } from '../../styles/ThemeContext';
...
const theme = useTheme();
<Text style={{ color: theme.colors.onSurface, fontSize: theme.typography.fontSize.body, fontFamily: theme.typography.fontFamily }}>
  Themed text
</Text>
```

- Use theme values for all colors, font sizes, border radii, and spacing.
- For buttons, cards, modals, and inputs, always use the theme for backgrounds, borders, and text.

## Recommended Patterns
- **Never** use hardcoded color or font values in styles.
- Use `theme.colors.accent` for highlights and user-selected accent color.
- Use `theme.typography.fontSize` for all text, and `fontFamily` for consistency.
- Use `theme.shape.borderRadius` for all rounded corners.
- Use `theme.spacing` for padding/margin.
- Allow font scaling for accessibility: `<Text allowFontScaling ... />`.
- Use semantic roles and accessibility labels for all interactive elements.

## Accessibility
- All text and UI elements must respect user font size and color preferences.
- Ensure color contrast meets WCAG 2.2 AA standards.
- Use `allowFontScaling` on all `Text` components.
- Use ARIA/role/label props for accessibility.

## Example: Themed Button
```tsx
import { useTheme } from '../../styles/ThemeContext';
...
const theme = useTheme();
<TouchableOpacity style={{
  backgroundColor: theme.colors.primary,
  borderRadius: theme.shape.borderRadius.medium,
  padding: theme.spacing[3],
}}>
  <Text style={{
    color: theme.colors.onPrimary,
    fontSize: theme.typography.fontSize.button,
    fontFamily: theme.typography.fontFamily,
    fontWeight: theme.typography.fontWeight.medium,
  }} allowFontScaling>
    Button
  </Text>
</TouchableOpacity>
```

## Code Review Checklist: Theming & Accessibility
- [ ] All colors, font sizes, and border radii use theme context values.
- [ ] No hardcoded color or font values in styles.
- [ ] All text uses `allowFontScaling`.
- [ ] All interactive elements have accessibility labels/roles.
- [ ] Color contrast meets accessibility standards.
- [ ] User accent color and font size are respected throughout the UI.

For questions or updates, see the main README or contact the maintainers. 