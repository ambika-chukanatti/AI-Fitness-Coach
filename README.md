# AI Fitness Coach App

Achieve your health goals with a personalized touch. **AI Fitness Coach** generates custom workout plans and diet advice tailored specifically to your fitness level and objectives.

This web application leverages the power of AI to act as your virtual personal trainer. Simply input your preferences, and the system curates a regimen just for you. It is built using Next.js and integrates modern AI APIs to deliver real-time fitness guidance.

Checkout Live - [ai-fitness-coach-mauve-three.vercel.app](https://ai-fitness-coach-mauve-three.vercel.app/)


## Tech Stack

* **Frontend:** Next.js, TypeScript, Tailwind CSS, Shadcn
* **Backend:** Next.js (API Routes), MongoDB
* **AI Service:** gemini-2.5-flash
* **Image Generation:** Pollinations.ai (for visualizing exercises/meals)
* **Database:** MongoDB
* **Deployment:** Vercel


## Features

* **Personalized Planning:** Uses the Gemini AI to generate custom, week-long workout and diet plans based on the user's goals, location, and fitness level.
* **Visual Aids:** Integrates Stability AI for on-demand generation of photorealistic images of exercises or meals.
* **Interactive Interface:** Plan details are presented in collapsible cards for a clean, focused user experience.
* **Text-to-Speech:** Allows users to listen to their workout or diet plan details using browser speech synthesis.
* **PDF Export:** Users can download their complete personalized plan as a PDF document for offline use.
* **Responsive Design:** Optimized for seamless usage across all devices (desktop, tablet, and mobile).


## Setup

First, clone the repository:

```bash
git clone www.github.com/ambika-chukanatti/AI-Fitness-Coach.git
cd ai-fitness-coach-app
```

Then, install the dependencies:
```bash
npm install
```

Run the project
```bash
npm run dev
```

## Deployment

Go to https://vercel.com. Create a new project, connect your github account, import the project, add environment variables, and built the deployment.


## License

[![Apache-2.0 License](https://img.shields.io/badge/License-Apache--2.0-orange.svg)](https://www.apache.org/licenses/LICENSE-2.0)

