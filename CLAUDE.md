# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a personal portfolio website for Luca Lit, featuring:
- Professional background, work experience, and education
- Project showcase with links to external projects
- Interactive chatbot powered by AWS Lambda and OpenAI API
- Static HTML/CSS/JavaScript website hosted on GitHub Pages

The site is live at: https://lucalit888.github.io/me/

## Repository Structure

- `index.html` - Main HTML file containing all page content (single-page application)
- `assets/` - Static assets directory
  - `css/` - Stylesheets including main.css (custom styles) and fontawesome
  - `js/` - JavaScript files for interactivity
    - `chatbot_script.js` - Resume chatbot functionality with AWS Lambda integration
    - `main.js`, `util.js` - UI interaction handlers
    - `jquery.min.js`, `jquery.scrolly.min.js` - jQuery dependencies
  - `webfonts/` - Font files
- `files/` - Content files including resume PDFs, images, and project screenshots
- `images/` - Additional image assets

## Architecture

### Single-Page HTML Structure
The entire website is contained in `index.html` with multiple sections:
- Header section with intro
- About section (#one)
- Skills/Coursework section (#two)
- Resume/Timeline section (#resume)
- Projects section (#three)
- Contact section (#four)
- Footer section (#footer)

Uses smooth scrolling navigation with anchor links to different sections.

### Chatbot System
The Resume Bot is a key interactive feature:

**Frontend** (`assets/js/chatbot_script.js`):
- Loads resume text from `files/Luca_Lit_Resume_Mar2024.txt`
- Implements rate limiting (5 requests per minute)
- Draggable chat window interface
- Toggleable visibility with chat icon

**Backend Integration**:
- AWS API Gateway endpoint: `https://selssv957e.execute-api.us-east-1.amazonaws.com/Production//ask`
- Sends question + resume context to Lambda function
- Lambda processes via OpenAI API
- Returns AI-generated responses about resume/background

**Rate Limiting**: Client-side enforcement prevents abuse (max 5 questions per minute)

### Styling
Based on "Photon" HTML5 UP template (CCA 3.0 license). Custom modifications in `assets/css/main.css` for:
- Timeline components for work experience
- Chatbot styling and positioning
- Responsive layout for mobile/tablet
- Project card hover effects

## Development Workflow

### Local Development
Since this is a static site:
1. Open `index.html` directly in a browser, or
2. Use a local server: `python -m http.server 8000`
3. Navigate to `http://localhost:8000`

### Deployment
The site is deployed via GitHub Pages:
- Hosted from the root of the `main` branch
- Any push to `main` automatically updates the live site
- No build process required

### Testing the Chatbot
The chatbot requires the AWS Lambda backend to be running. When testing:
- Check browser console for API errors
- Verify CORS headers if making changes to the endpoint
- Rate limiting is client-side only (can be bypassed via console)

## Key Files to Update

**Content Updates**:
- `index.html` - All text content, work experience, projects
- `files/` - Add new resume PDFs, project screenshots

**Chatbot Updates**:
- `assets/js/chatbot_script.js` - Modify rate limits, UI behavior
- `files/Luca_Lit_Resume_Mar2024.txt` - Update resume context for chatbot

**Styling**:
- `assets/css/main.css` - Custom styles and overrides

## Important Notes

- The chatbot API endpoint is hardcoded in `chatbot_script.js:103`
- Resume text file path is hardcoded in `chatbot_script.js:43`
- All external project links are hardcoded in `index.html`
- Font Awesome is used for icons (loaded via `fontawesome-all.min.css`)
- jQuery is required for scrolling animations and some UI interactions
