# ColourMash - Pattern Therapy Game

## Overview
**ColourMash** is an interactive web application designed to help individuals with Alzheimer’s and dementia improve memory and cognitive skills through pattern recognition. The game involves users following color sequences and confirming their responses using physical cards detected through their device’s camera.

The app provides engaging memory training in a playful, therapeutic format, helping users practice focus, attention, and pattern recognition in a fun and interactive way.

🔗 Live Demo:


---

## Features
- **Memory Sequence Game**: Users follow sequences of colors (`red`, `green`, `blue`) that flash on the screen.  
- **Multiple Game Modes**:
  - `Mix`: Standard gameplay
  - `Speed`: Faster-paced sequences
  - `Length`: Longer sequences for higher difficulty
- **Camera-Based Color Detection**: Detects user’s physical card colors in real time.  
- **Progress Tracking**: Stars and levels display success and improvement.  
- **Responsive UI**: Accessible on desktop and mobile devices.  
- **Feedback Modal**: Displays success or retry prompts after each round.

---

## Technologies Used
- **Next.js**: React framework for server-side rendering and frontend development.  
- **TypeScript**: Strongly typed language for safer, more maintainable code.  
- **React Hooks**: `useState`, `useEffect`, and `useRef` for state and DOM handling.  
- **HTML5 & CSS3**: Styling, layout, and animations.  
- **Camera API**: `navigator.mediaDevices.getUserMedia` for real-time video capture.  
- **Canvas API**: Detects dominant color of user cards using image data processing.  
- **Tailwind CSS (optional)**: Utility-first styling for responsive and interactive components.  

---

## How It Works
1. The user starts the game and chooses a mode.  
2. A sequence of colors is generated and flashed on screen.  
3. The user holds colored cards up to the camera to repeat the sequence.  
4. The app detects the colors via the camera, verifies the sequence, and updates the score.  
5. Feedback is displayed in a modal for success (`win`) or retry (`lose`).  

---

## Installation
1. Clone the repository:
   ```bash
   git clone <repo-url>
   cd colourmash
