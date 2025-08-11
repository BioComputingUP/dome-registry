# DOME Registry Styling System

This directory contains the SCSS files that make up the styling system for the DOME Registry application. The system is designed to provide consistent styling across the application while making it easy to maintain and extend.

## File Structure

- **_animations.scss**: Contains animation-related styles and keyframes.
- **_base.scss**: Contains base styles for the application.
- **_cursor.scss**: Custom cursor styles.
- **_flip.scss**: Styles for flip animations or effects.
- **_mixins.scss**: SCSS mixins for reusable style patterns.
- **_overflow.scss**: Styles for handling overflow content.
- **_scrollbar.scss**: Custom scrollbar styles.
- **_theme.scss**: Theme-related styles.
- **_validation.scss**: Styles for form validation.
- **_variables.scss**: SCSS variables for consistent styling.
- **main.scss**: Main stylesheet that can be used to import other stylesheets.

## How to Use

### Importing Styles

The main entry point for styles is the `styles.scss` file in the `src` directory. This file imports the necessary style files from this directory. If you need to add a new style file, you should import it in `styles.scss`:

```scss
@import "styles/your-new-file";
```

### Variables

The `_variables.scss` file contains various SCSS variables used throughout the application:
- Color variables (primary, secondary, white, blue, etc.)
- Transparent white color variations
- Navigation dimensions
- Breakpoint variables for responsive design
- Font definitions

Example usage:
```scss
.my-element {
  color: $primary;
  font-family: $font-primary;
}
```

### Mixins

The `_mixins.scss` file contains reusable style patterns:
- `responsive-width`: Adjusts width based on screen size
- `responsive-padding`: Adjusts padding based on screen size
- `flex`: Shorthand for flex properties
- `font`: Shorthand for font properties
- `position-absolute`: Shorthand for absolute positioning
- `size`: Sets width and height
- `transition`: Shorthand for transitions
- Media query mixins (`for-desktop`, `for-mobile`, etc.)
- `page-background-with-gradient`: Creates a gradient background

Example usage:
```scss
.my-element {
  @include flex(column, flex-start, center, 10px);
  @include responsive-padding(20px, 15px, 10px, 5px);
}
```

### Adding New Styles

When adding new styles, consider the following:
1. Use variables from `_variables.scss` for consistent styling
2. Use mixins from `_mixins.scss` for reusable patterns
3. Follow the naming convention of prefixing partial files with an underscore
4. Import your new file in `styles.scss`

## Best Practices

1. **Maintain Consistency**: Use the variables and mixins provided to maintain a consistent look and feel.
2. **Mobile-First Approach**: Design for mobile first, then use media queries to adjust for larger screens.
3. **Component-Specific Styles**: Keep component-specific styles in the component's SCSS file.
4. **Global Styles**: Use the files in this directory for global styles that apply across the application.
5. **Documentation**: Document any new variables or mixins you add to make them easier to use by other developers.
