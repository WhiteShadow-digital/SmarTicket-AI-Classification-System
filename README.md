# SmartTicket AI: Intelligent Support Classification

SmartTicket AI is a professional-grade ticket triage and automated response system. It leverages generative AI to eliminate manual support bottlenecks by classifying incoming complaints and generating department-specific, tone-aware responses.

## Technical Specifications

### Core Stack
- **Frontend**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS & ShadCN UI
- **Icons**: Lucide React
- **Charts**: Recharts (Advanced Analytics)

### Backend & Infrastructure
- **Platform**: Firebase
- **Database**: Firestore (Real-time NoSQL)
- **Authentication**: Anonymous Demo Access
- **Security**: Granular Firestore Security Rules

### Generative AI (Genkit)
- **Engine**: Genkit 1.x
- **Model**: **Google Gemini 2.5 Flash**
- **Methodology**: Prompt Engineering (Zero-shot classification and structured template generation)
- **Features**: 
    - **Smart Classifier**: Routes tickets to HR, IT, Operations, or Finance.
    - **Tone Engine**: Generates responses in Formal, Friendly, or Urgent tones.
    - **Template Mapping**: Associates professional corporate templates with specific departments.

## Project Structure
- `src/app`: Next.js App Router pages and layouts.
- `src/components`: Reusable UI components (ShadCN).
- `src/firebase`: Firebase configuration and custom hooks (`useCollection`, `useDoc`).
- `src/ai`: Genkit flows for AI-powered features.
- `src/lib`: Shared utilities, types, and translation providers.
