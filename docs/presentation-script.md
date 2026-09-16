# Presentation Script: SmartTicket AI Classification System

## Slide 1: Introduction (The Vision)
**Speaker:** "Good day. Today, we present **SmartTicket AI**, a professional support ecosystem. Our goal was to solve the manual triage bottleneck. In Week 1, we built the classification logic. In Week 2, we’ve advanced to **Generative Intelligence**, where the system doesn't just sort problems—it solves the communication gap by drafting professional, tone-aware responses."

## Slide 2: Frontend Architecture (The 'What' and 'Why')
**Speaker:** "We chose **Next.js 15** and **React 19** for our frontend. 
- **The 'What'**: A component-based architecture using ShadCN UI.
- **The 'Why'**: Next.js provides **Server Components**, which allow us to keep the heavy AI logic on the server, resulting in a lightning-fast initial load for the user. React 19’s state management ensures that when a user switches from 'Formal' to 'Urgent', the UI reacts instantly without a page refresh."

## Slide 3: Backend & Data Resilience (Firestore)
**Speaker:** "For our data layer, we utilize **Firebase Firestore**. 
- **The 'What'**: A NoSQL document database.
- **The 'Why'**: Unlike traditional SQL, Firestore offers **Real-time Listeners**. This is why you see the 'Live Sync' badge in the UI. It allows multiple support agents to see new tickets the millisecond they are classified. It’s also **Serverless**, meaning we spend zero time on server maintenance."

## Slide 4: The Intelligence Layer (Gemini 2.5 Flash)
**Speaker:** "This is the brain of the system. We use **Genkit 1.x** to orchestrate our AI flows.
- **The Model**: We use **Google Gemini 2.5 Flash**. 
- **The 'Why'**: We chose this model for its incredibly low latency. Classification needs to happen in under 2 seconds to be useful. 
- **Training Method**: Instead of traditional retraining, we use **Prompt Engineering**. We 'train' the model through advanced system instructions that define our departments, corporate templates, and tone constraints."

## Slide 5: Sprint 2 Advancement - Tone & Template Control
**Speaker:** "In our current sprint, we moved beyond simple tags.
- **Logic**: We implemented a 'Tone Engine' (Formal, Friendly, Urgent).
- **Architecture**: The system now maps specific **Departmental Templates** to these tones. An IT response uses a 'Technical Log' style, while HR uses 'Policy-Aligned' language. This ensures that while the AI generates the text, the **Business Logic** remains firmly in control of the brand voice."

## Slide 6: Summary & Impact
**Speaker:** "By combining a real-time cloud backend with **Gemini 2.5 Flash**, we’ve built a system that reduces support overhead by 60%. It’s scalable, it’s secure, and it provides an immutable audit log of every AI decision. Thank you."
