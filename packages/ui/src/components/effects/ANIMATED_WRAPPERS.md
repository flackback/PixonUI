# Animated wrappers

Use the smallest wrapper that matches the surface you are animating.

## Primitive

`Animotion`

Use when you want full control over a single element or a custom React tree.

```tsx
<Animotion tracks={tracks} durationMs={4000} autoplay>
  <MyLogo />
</Animotion>
```

## Card / logo

`AnimatedCard`
`AnimatedLogo`

Use these for common UI surfaces without building your own wrapper every time.

```tsx
<AnimatedCard tracks={cardTracks} durationMs={4000} autoplay animateOnView>
  <Card />
</AnimatedCard>
```

```tsx
<AnimatedLogo tracks={logoTracks} durationMs={2000} autoplay yoyo>
  <BrandMark />
</AnimatedLogo>
```

## Section

`AnimatedSection`

Use for full page sections exported from the Animation Studio.

```tsx
<AnimatedSection elements={elements} durationMs={4000} autoplay animateOnView yoyo />
```

## Rule

- `Animotion` for one node
- `AnimatedLogo` for small identity blocks
- `AnimatedCard` for cards and callouts
- `AnimatedSection` for the Studio export and page sections
