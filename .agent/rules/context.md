---
trigger: always_on
---

Project Specification: Lingo Bridge(Daily Life Edition)

1. Vision & Goal
   Lingo Bridge is an AI-powered English learning application designed to bridge the gap between A2 and B1 proficiency. The primary objective is to help the user learn vocabulary through practical, daily-life contexts (e.g., ordering food, navigating an airport, workplace conversations, or casual socializing) rather than academic or niche interest topics.

2. Core Functional Requirements
   Dynamic Word Cards: For every English word added, the Gemini 2.5 API must provide its Turkish meaning and generate a sample sentence rooted in a common daily-life scenario.

Weekly Context Evolution: To prevent memorization by rote, the AI will generate a different daily-life sentence for each word every 7 days (e.g., a word used in a "shopping" context this week might appear in a "doctor's appointment" context next week).

The B1 Bridge: An AI feature that converts simple A2-level daily phrases into more professional or nuanced B1-level equivalents used in real-world environments.

Interactive Testing:

Contextual Gap-Fill: Identifying words within real-world sentences.

Scenario Roleplay: AI-led simulations of daily interactions (e.g., "Checking into a hotel" or "Asking for directions").
