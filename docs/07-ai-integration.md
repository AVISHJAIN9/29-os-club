# Computer Vision & Hand Landmark Topology

## 21-Landmark Skeletal Map
MediaPipe extracts 21 points:
- Point 0: Wrist anchor
- Points 1-4: Thumb ray
- Points 5-8: Index finger ray
- Points 9-12: Middle finger ray
- Points 13-16: Ring finger ray
- Points 17-20: Pinky finger ray

## Gesture Classification Logic
- **Pointing Gesture**: Distance between Index Tip (8) and Wrist (0) is $> 2.5 \times$ Middle Tip (12) to Wrist (0).
- **Pinch Gesture**: Euclidean distance between Thumb Tip (4) and Index Tip (8) is $< 0.05$ normalized units.
