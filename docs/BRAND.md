# CES Brand Guidelines

## Colors
| Token        | OKLCH                  | Hex       | Usage                    |
|-------------|------------------------|-----------|--------------------------|
| Brand Gold  | oklch(0.75 0.12 85)   | #D4A843   | Primary, CTAs, accents   |
| Brand Black | oklch(0 0 0)          | #000000   | Text, backgrounds        |
| White       | oklch(1 0 0)          | #FFFFFF   | Backgrounds, text on dark|

## Typography
- Self-hosted via next/font (GDPR)
- Font files: apps/web/src/app/fonts/

## Logo
- SVG source: packages/ui/src/assets/ces-logo.svg
- Exported as React component from @repo/ui

## Design Tokens
- Source of truth: apps/web/src/app/globals.css
- Follows shadcn/ui token naming convention
- Uses OKLCH color space (Tailwind v4 default)