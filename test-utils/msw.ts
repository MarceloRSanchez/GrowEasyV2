import { setupServer } from 'msw/node';
import { rest } from 'msw';

// Mock handlers for different scenarios
const handlers = [
  // Successful search
  rest.post('*/rest/v1/rpc/search_plants', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json([
        {
          id: '1',
          name: 'Basil',
          scientific_name: 'Ocimum basilicum',
          image_url: 'https://images.pexels.com/photos/4750270/pexels-photo-4750270.jpeg?auto=compress&cs=tinysrgb&w=800',
          category: 'herb',
          difficulty: 'beginner',
          care_schedule: { watering: 2, fertilizing: 14 },
          growth_time: 60,
          sunlight: 'high',
          water_needs: 'medium',
          tips: ['Pinch flowers'],
          created_at: '2024-01-01',
          relevance_score: 0.9,
        },
      ])
    );
  }),

  // Empty search results
  rest.post('*/rest/v1/rpc/search_plants_empty', (req, res, ctx) => {
    return res(ctx.status(200), ctx.json([]));
  }),

  // Search error
  rest.post('*/rest/v1/rpc/search_plants_error', (req, res, ctx) => {
    return res(
      ctx.status(500),
      ctx.json({
        error: {
          message: 'Something went wrong. Pull to retry?',
        },
      })
    );
  }),

  // Successful plant creation
  rest.post('*/rest/v1/rpc/create_user_plant', (req, res, ctx) => {
    return res(ctx.status(200), ctx.json('new-plant-123'));
  }),

  // Plant creation error
  rest.post('*/rest/v1/rpc/create_user_plant_error', (req, res, ctx) => {
    return res(
      ctx.status(400),
      ctx.json({
        error: {
          message: 'Nickname must be between 2 and 24 characters',
        },
      })
    );
  }),
];

export const server = setupServer(...handlers);

export function setupMSW() {
  // Start server before all tests
  beforeAll(() => server.listen());
  
  // Reset handlers after each test
  afterEach(() => server.resetHandlers());
  
  // Clean up after all tests
  afterAll(() => server.close());
}