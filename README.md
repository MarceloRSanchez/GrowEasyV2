# GrowEasy - Urban Garden App

A beautiful React Native app built with Expo for urban gardening enthusiasts. Track your plants, get AI-powered care recommendations, and connect with a community of gardeners.

## Features

- 🌱 **Plant Management**: Track your plants' growth and care schedules
- 🤖 **AI Diagnosis**: Get smart plant health analysis and recommendations  
- 👥 **Community**: Connect with fellow gardeners and share your progress
- 📊 **Eco Impact**: Monitor your environmental impact and achievements
- 🛒 **Shop & Pro**: Access premium features and gardening supplies
- 📈 **Analytics**: Real-time charts showing plant growth and care history

## Tech Stack

- **Framework**: Expo SDK 53 with Expo Router 5
- **Database**: Supabase with PostgreSQL
- **Authentication**: Supabase Auth
- **State Management**: TanStack Query (React Query)
- **Charts**: react-native-svg-charts with D3
- **Styling**: React Native StyleSheet
- **Icons**: Lucide React Native
- **Testing**: Jest + React Testing Library
- **Storybook**: Component development and testing

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Expo CLI

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd groweasy-urban-garden
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
```bash
cp .env.example .env
```

Update `.env` with your Supabase credentials:
```
EXPO_PUBLIC_SUPABASE_URL=your-supabase-url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

4. Start the development server
```bash
npm run dev
```

## Scripts

- `npm run dev` - Start Expo development server
- `npm test` - Run Jest tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Run tests with coverage report
- `npm run storybook` - Start Storybook server
- `npm run build:web` - Build for web
- `npm run lint` - Run ESLint

## Project Structure

```
app/                    # Expo Router pages
├── (tabs)/            # Tab navigation screens
├── plant/             # Plant detail screens
├── auth.tsx           # Authentication screen
├── onboarding.tsx     # Onboarding flow
└── _layout.tsx        # Root layout

components/            # Reusable components
├── home/             # Home screen components
├── ui/               # UI components (Button, Card, etc.)
├── charts/           # Chart components
└── skeletons/        # Loading skeleton components

hooks/                # Custom React hooks
├── useAuth.ts        # Authentication hook
├── useHomeSnapshot.ts # Home data fetching
├── usePlantDetail.ts # Plant detail fetching
├── useLogWatering.ts # Water logging mutation
├── useLogFertilizing.ts # Fertilize logging mutation
├── useLogHarvest.ts  # Harvest logging mutation
└── useToast.ts       # Toast notifications

lib/                  # Utilities and configurations
└── supabase.ts       # Supabase client setup

constants/            # App constants
└── Colors.ts         # Design system tokens

__tests__/            # Test files
├── components/       # Component tests
├── hooks/           # Hook tests
└── screens/         # Screen tests

stories/             # Storybook stories
└── PlantDetail.stories.tsx

supabase/            # Database migrations
└── migrations/      # SQL migration files
```

## Analytics

The app features comprehensive analytics with real-time charts:

### Chart Components

#### WaterHistoryChart
- **Type**: Bar chart
- **Data**: Daily watering amounts in ml
- **Features**: Smooth animations, total volume calculation
- **States**: Loading skeleton, error fallback, empty state

#### SunExposureChart  
- **Type**: Line chart
- **Data**: Daily sun exposure hours
- **Features**: Average calculation, trend visualization
- **States**: Loading skeleton, error fallback, empty state

#### SoilHumidityDial
- **Type**: Radial gauge
- **Data**: Current soil humidity percentage
- **Features**: Color-coded status (optimal/dry/wet), shows "—" for null values
- **States**: Loading skeleton, error fallback, no data state

### Data Format

```typescript
// Water History
{
  date: "2024-01-20",  // ISO date string
  ml: 250              // Amount in milliliters
}

// Sun Exposure  
{
  date: "2024-01-20",  // ISO date string
  hours: 6.5           // Hours of sunlight
}

// Soil Humidity
humidity: 45 | null    // Percentage or null for no data
```

### Performance

- Charts are memoized with `useMemo` for optimal performance
- Render time consistently <16ms for smooth 60fps animations
- Lazy loading for chart data to reduce initial bundle size

## Plant States

### Active Plants
- Full functionality with care actions enabled
- Real-time analytics and progress tracking
- Interactive care timeline and voice guidance

### Archived Plants
- Semi-transparent overlay with "Archived Plant" badge
- Care action buttons disabled
- Read-only view of historical data and analytics
- Archive/unarchive functionality in danger zone

### Edge States
- **Loading**: Comprehensive skeleton placeholders
- **Error**: User-friendly error messages with retry options
- **Empty Data**: Helpful messaging for missing analytics
- **No Plants**: Onboarding hero to guide first plant addition

## Add Plant Wizard

The Add Plant Wizard provides a 3-step flow for users to add new plants to their garden:

### Step 1: Search Plants
- **Full-text search** powered by Supabase with PostgreSQL FTS
- **Debounced input** (300ms) for optimal performance
- **Infinite scroll** pagination (20 plants per page)
- **Real-time filtering** on plant name and scientific name
- **Loading states** with skeleton placeholders
- **Error handling** with retry functionality

### Step 2: Configure Care
- **Pre-filled defaults** from selected plant's care schedule
- **Real-time validation** with inline error messages
- **Customizable intervals** (1-30 days) with intuitive picker controls
- **Plant nickname** input with 2-24 character validation
- **Plant-specific tips** and care recommendations
- **Form state management** with React Context
- **Keyboard handling** and accessibility support

### Validation Rules

**Plant Nickname:**
- Required field
- Minimum 2 characters
- Maximum 24 characters
- Auto-focused on screen load

**Care Intervals:**
- Watering: 1-30 days
- Fertilizing: 1-30 days
- Real-time validation with error messages
- Haptic feedback on value changes (mobile)

**Form Behavior:**
- Next button disabled until all fields valid
- Errors clear automatically when user corrects input
- Keyboard navigation support
- Auto-scroll to keep inputs visible

### State Management

The wizard uses React Context (`AddWizardContext`) to manage state across steps:

```typescript
interface PlantConfiguration {
  nickname: string;
  wateringDays: number;
  fertilizingDays: number;
}

// Context persists through navigation
const { selectedPlant, configuration, updateConfiguration } = useAddWizard();
```

**Features:**
- Persistent state across navigation
- Pre-population from plant defaults
- Partial updates without losing other fields
- Reset functionality for wizard completion

### Step 3: Review & Confirm
- Summary of all plant configuration
- Preview of care schedule
- Database insertion with optimistic updates
- Success feedback with confetti animation
- Real-time mutation with loading states
- Error handling with retry functionality
- Automatic navigation to plant detail

### Search Implementation

The search functionality uses Supabase's full-text search capabilities:

```sql
-- Full-text search function
CREATE OR REPLACE FUNCTION public.search_plants(
  q text,
  search_limit int DEFAULT 20,
  search_offset int DEFAULT 0
)
RETURNS TABLE (
  id uuid,
  name text,
  scientific_name text,
  image_url text,
  category text,
  difficulty text,
  care_schedule jsonb,
  growth_time integer,
  sunlight text,
  water_needs text,
  tips text[],
  created_at timestamptz,
  relevance_score real
)
```

**Performance Features:**
- GIN indexes for fast full-text search
- pg_trgm extension for fuzzy matching
- Similarity scoring for result ranking
- Request cancellation for rapid typing
- Debounced queries to reduce server load

**Search Behavior:**
- Searches both `name` and `scientific_name` columns
- Supports partial matches and typos
- Results ranked by relevance score
- Pagination with infinite scroll
- Empty states and error handling

### Database Integration

The wizard integrates with Supabase using a dedicated RPC function:

```sql
CREATE OR REPLACE FUNCTION public.create_user_plant(
  p_user_id uuid,
  p_plant_id uuid,
  p_nickname text,
  p_water_days int,
  p_fertilize_days int
)
RETURNS uuid
```

**Function Features:**
- Input validation for all parameters
- Automatic care schedule calculation
- User stats initialization and updates
- Secure user ID validation
- Comprehensive error handling

**Example Usage:**
```bash
curl -X POST 'https://your-project.supabase.co/rest/v1/rpc/create_user_plant' \
  -H "apikey: YOUR_ANON_KEY" \
  -H "Authorization: Bearer USER_JWT" \
  -H "Content-Type: application/json" \
  -d '{
    "p_user_id": "user-uuid-here",
    "p_plant_id": "plant-uuid-here", 
    "p_nickname": "My Sweet Basil",
    "p_water_days": 2,
    "p_fertilize_days": 14
  }'
```

**Mutation Flow:**
1. User submits form in review step
2. `useCreateUserPlant` hook validates authentication
3. RPC function creates database records
4. Success triggers confetti and navigation
5. Home snapshot and plant detail queries invalidated
6. User sees new plant in their garden

### Edge States & Error Handling

The wizard handles all edge cases gracefully:

**Loading States:**
- Global loading overlay during search and plant creation
- Skeleton placeholders for search results
- Disabled buttons during mutations
- Loading indicators for pagination

**Empty States:**
- Search prompt when no query entered
- Illustrated empty state with retry option
- Popular search suggestions
- Helpful messaging for no results

**Error States:**
- Toast notifications with retry functionality
- Inline form validation with real-time feedback
- Network error handling with user-friendly messages
- Graceful degradation for API failures

**Cancel Flow:**
- Confirmation dialogs for unsaved changes
- Context cleanup on wizard exit
- Analytics tracking for cancellation events
- Smart detection of user progress

**Deep Link Safety:**
- Automatic redirect to search if accessing later steps without context
- State validation before allowing navigation
- Graceful handling of direct URL access
- Context restoration where possible

**Accessibility:**
- VoiceOver support with descriptive labels
- Keyboard navigation for all interactive elements
- High contrast support for visual elements
- Screen reader announcements for state changes
- Proper focus management throughout the flow

### State Management Table

| State | Search Step | Reminders Step | Review Step |
|-------|-------------|----------------|-------------|
| **Loading** | Global overlay + skeleton | Form disabled | Global overlay |
| **Empty** | Illustrated empty state | N/A | N/A |
| **Error** | Toast with retry | Inline validation | Toast with retry |
| **Cancel** | Confirm if query exists | Confirm if changes made | Always confirm |
| **Success** | Navigate to reminders | Navigate to review | Confetti + navigate |

### Testing Coverage

**Unit Tests (≥80% coverage):**
- All hook functionality with mocked dependencies
- Component rendering and interaction
- Form validation logic
- Error boundary behavior

**Integration Tests:**
- Complete wizard flow from search to creation
- Context state management across steps
- API integration with MSW mocking
- Navigation and deep linking scenarios

**Edge Case Tests:**
- Network failures and retry mechanisms
- Invalid input handling and validation
- Cancellation flows and cleanup
- Accessibility compliance verification

The Quick Actions Sheet provides instant access to plant care actions directly from the home screen, enabling users to log care activities in under 3 taps without leaving the main interface.

### Features

**Gesture Triggers:**
- **Swipe-left** on any PlantCard to open Quick Actions
- **Long-press** on PlantCard (500ms delay) for alternative access
- Smooth spring animations with haptic feedback (mobile)

**Action Buttons:**
- **Water** (blue) - Logs watering with default 250ml amount
- **Fertilize** (orange) - Logs fertilizing with default 10g amount  
- **Harvest** (green) - Logs harvest and marks plant as complete
- **Archive** (red) - Archives plant with confirmation dialog

**Real-time Feedback:**
- Confetti celebration on successful actions
- Optimistic UI updates for instant feedback
- Toast notifications with contextual messages
- Auto-close sheet after successful actions (1.5s delay)

### Edge States & Error Handling

**Global Loading Overlay:**
- Prevents multiple simultaneous actions
- Shows during any mutation with "Logging action…" message
- Disables all action buttons during loading
- Accessible with proper ARIA attributes

**Error Banner (Persistent):**
- Appears after 2 consecutive failures of the same action
- Shows "Multiple failures detected. Try again later or check your connection."
- Includes Retry and Dismiss buttons
- Focuses automatically for screen reader accessibility
- Resets when sheet is reopened

**Archive Confirmation:**
- Native Alert dialog with "Archive plant?" title
- "It will disappear from your garden." message
- Cancel/Archive buttons with destructive styling
- No action taken on cancel

### Accessibility Features

**Screen Reader Support:**
- All buttons have descriptive `accessibilityLabel` and `accessibilityHint`
- Loading states update labels to "Action in progress"
- Error banner uses `accessibilityRole="alert"` with `assertive` live region
- Disabled states provide clear feedback about unavailability

**Keyboard Navigation:**
- All interactive elements are focusable
- Proper tab order through action buttons
- Enter/Space key activation support
- Focus management during state changes

**Visual Accessibility:**
- High contrast colors for all action states
- Clear visual hierarchy with proper spacing
- Loading spinners with sufficient size (24px minimum)
- Error states use red color with icon reinforcement

### Analytics Events

**Action Completion:**
```javascript
// Fired on successful care action
Analytics.track('quick_action_done', {
  plantId: 'uuid',
  actionType: 'water' | 'fertilize' | 'harvest'
});
```

**Archive Action:**
```javascript
// Fired on successful archive
Analytics.track('quick_action_archive', {
  plantId: 'uuid'
});
```

**Error Tracking:**
```javascript
// Fired on action failure (internal logging)
Analytics.track('quick_action_error', {
  plantId: 'uuid',
  actionType: string,
  errorMessage: string,
  attemptCount: number
});
```

### Performance Optimizations

**Optimistic Updates:**
- Home snapshot immediately reflects action results
- Plant detail cache updated with new growth percentage
- Rollback mechanism for failed mutations
- Cache invalidation on success for data consistency

**Gesture Handling:**
- Debounced swipe detection (50px threshold)
- Smooth spring animations (tension: 100, friction: 8)
- Visual feedback during swipe with shadow enhancement
- Automatic reset to original position

**Memory Management:**
- Sheet content unmounted when closed
- Mutation state cleanup on sheet close
- Error state reset between sessions
- Proper cleanup of animation timers

### Implementation Details

**Bottom Sheet Configuration:**
- Single snap point at 40% screen height
- Pan-down-to-close gesture enabled
- Custom background with rounded corners and shadow
- Handle indicator for visual affordance

**State Management:**
- React Query for mutation handling and cache management
- Local state for UI-specific concerns (loading, errors)
- Context-free design for maximum reusability
- Proper cleanup and reset mechanisms

**Error Recovery:**
- Exponential backoff for repeated failures
- Network error detection and user guidance
- Graceful degradation for offline scenarios
- Clear recovery paths for all error states

### Testing Coverage

**Unit Tests (≥80% coverage):**
- All component rendering and interaction scenarios
- Error state handling and recovery mechanisms
- Accessibility attribute verification
- Snapshot testing for visual regression detection

**Integration Tests:**
- Complete user flows from gesture to completion
- Mutation integration with optimistic updates
- Error banner display and interaction
- Analytics event firing verification

**Edge Case Tests:**
- Rapid gesture triggering and debouncing
- Network failure scenarios and recovery
- Accessibility compliance with screen readers
- Memory leak prevention during repeated use

### Screenshot

![Quick Actions Error Banner](docs/quick-actions-error-banner.png)

*Error banner shown after multiple consecutive failures, providing clear recovery options and maintaining user confidence in the system.*

## Care History

The app tracks all plant care activities in the `care_history` table:

```sql
CREATE TABLE care_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_plant_id uuid REFERENCES user_plants(id) ON DELETE CASCADE,
  action_type text CHECK (action_type IN ('water', 'fertilize', 'prune', 'harvest')),
  amount_ml integer,
  performed_at timestamptz DEFAULT now(),
  notes text,
  created_at timestamptz DEFAULT now()
);
```

### Mutation Example

```bash
curl -X POST 'https://your-project.supabase.co/rest/v1/care_history' \
  -H "apikey: YOUR_ANON_KEY" \
  -H "Authorization: Bearer USER_JWT" \
  -H "Content-Type: application/json" \
  -d '{
    "user_plant_id": "uuid-here",
    "action_type": "water", 
    "amount_ml": 250
  }'
```

## Testing

Run the test suite:
```bash
npm test
```

Coverage requirements:
- Chart components: ≥80% coverage
- Plant detail screen: ≥80% coverage  
- Critical user flows: 100% coverage
- Edge cases and error states: Fully tested

### Test Structure
- **Unit tests**: Individual component behavior
- **Integration tests**: Hook and API interactions
- **Snapshot tests**: UI consistency verification
- **Edge case tests**: Error states and boundary conditions

## Storybook

View component stories:
```bash
npm run storybook
```

Available stories:
- **PlantDetail**: Default, Loading, Archived, EmptyDatasets, Error variants
- **Charts**: Individual chart components with various data states
- **Interactive demos**: Mutation triggers and confetti effects

## Database Schema

The app uses Supabase with the following main tables:

- `plants` - Plant catalog with care information
- `user_plants` - User's plant instances with growth tracking
- `user_stats` - Eco score and achievement tracking
- `care_history` - Plant care action logs
- `plant_notes` - Photo notes and observations
- `sensor_logs` - IoT sensor data for analytics

Key functions:
- `get_home_snapshot(user_id)` - Fetches home screen data efficiently
- `get_plant_detail(user_plant_id, user_id)` - Comprehensive plant details with analytics

## Contributing

1. Fork the repository
2. Create a feature branch
3. Write tests for new functionality
4. Ensure all tests pass and coverage requirements are met
5. Submit a pull request

## License

MIT License - see LICENSE file for details