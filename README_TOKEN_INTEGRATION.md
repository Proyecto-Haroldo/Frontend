# Token Integration for API Requests

## Overview
This document describes the changes made to ensure that authentication tokens are automatically sent with every API request in the frontend application.

## Changes Made

### 1. Centralized API Client (`src/api/apiClient.ts`)
- Created a centralized API client using Axios
- Implements automatic token injection in request headers
- Handles token expiration and automatic logout
- Provides a singleton instance for consistent token management

### 2. Updated Authentication Context (`src/context/AuthContext.tsx`)
- Added integration with the centralized API client
- Automatically updates the API client when token changes
- Maintains backward compatibility with existing token storage

### 3. Updated API Services
- **`src/api/authApi.ts`**: Updated to use the centralized API client
- **`src/api/questionnaireApi.ts`**: Updated to use the centralized API client and added questionnaire submission function

### 4. Backend AI Integration
- The backend handles AI microservice integration internally
- Frontend sends questionnaire data to `/api/respuestas` endpoint
- Backend processes the data and calls the AI microservice
- AI recommendation is returned to the frontend

### 5. New Pages
- **`src/pages/AIRecommendation.tsx`**: Page to display AI recommendations
- Updated routing in `App.tsx` to include the new AI recommendation page

## How It Works

### Automatic Token Injection
1. The `AuthContext` manages the authentication token
2. When the token changes, it automatically updates the centralized API client
3. All API requests through the centralized client automatically include the token in the Authorization header
4. If a request returns a 401 status, the user is automatically logged out and redirected to login

### Backend AI Integration
1. When a questionnaire is completed, the data is sent to the backend `/api/respuestas` endpoint
2. The backend processes the data and calls the AI microservice internally
3. The AI recommendation is returned to the frontend and stored in localStorage
4. The diagnostic review page displays the AI recommendation
5. A test page is available to demonstrate the AI functionality

## Usage

### Making API Calls
```typescript
import { apiClient } from './api/apiClient';

// GET request with automatic token
const response = await apiClient.get('/endpoint');

// POST request with automatic token
const response = await apiClient.post('/endpoint', data);
```

### Questionnaire Submission
```typescript
import { submitQuestionnaireAnswers } from './api/questionnaireApi';

const response = await submitQuestionnaireAnswers(questionnaireData);
```

## Environment Variables
Make sure to set the following environment variables:
- `VITE_API_URL`: Backend API URL (default: http://localhost:8080/api)
- `VITE_AI_API_URL`: AI microservice URL (default: http://localhost:8081)

## Testing
1. Login to the application
2. Complete a questionnaire
3. View the AI recommendation in the diagnostic review
4. Test the AI functionality from the home page

## Security Features
- Automatic token injection in all requests
- Automatic logout on token expiration
- Secure token storage in localStorage
- Error handling for authentication failures 