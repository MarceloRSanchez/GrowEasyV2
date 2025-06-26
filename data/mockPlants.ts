import { Plant, UserPlant } from '@/types/Plant';

export const mockPlants: Plant[] = [
  {
    id: '1',
    name: 'Basil test',
    scientificName: 'Ocimum basilicum',
    imageUrl: 'https://images.pexels.com/photos/4750270/pexels-photo-4750270.jpeg?auto=compress&cs=tinysrgb&w=800',
    category: 'herb',
    difficulty: 'beginner',
    careSchedule: {
      watering: 2,
      fertilizing: 14,
    },
    growthTime: 75,
    sunlight: 'high',
    waterNeeds: 'medium',
    tips: [
      'Pinch flowers to encourage leaf growth',
      'Harvest in the morning for best flavor',
      'Likes warm, humid conditions'
    ],
  },
  {
    id: '2',
    name: 'Cherry Tomato',
    scientificName: 'Solanum lycopersicum',
    imageUrl: 'https://images.pexels.com/photos/533280/pexels-photo-533280.jpeg?auto=compress&cs=tinysrgb&w=800',
    category: 'vegetable',
    difficulty: 'intermediate',
    careSchedule: {
      watering: 1,
      fertilizing: 10,
      pruning: 7,
    },
    growthTime: 85,
    sunlight: 'high',
    waterNeeds: 'high',
    tips: [
      'Support with stakes or cages',
      'Remove suckers for better fruit production',
      'Water consistently to prevent blossom end rot'
    ],
  },
  {
    id: '3',
    name: 'Mint',
    scientificName: 'Mentha',
    imageUrl: 'https://images.pexels.com/photos/568470/pexels-photo-568470.jpeg?auto=compress&cs=tinysrgb&w=800',
    category: 'herb',
    difficulty: 'beginner',
    careSchedule: {
      watering: 2,
      fertilizing: 21,
    },
    growthTime: 60,
    sunlight: 'medium',
    waterNeeds: 'high',
    tips: [
      'Contains easily, grow in separate pot',
      'Pinch flowers to maintain leaf quality',
      'Thrives in partial shade'
    ],
  },
  {
    id: '4',
    name: 'Lettuce',
    scientificName: 'Lactuca sativa',
    imageUrl: 'https://images.pexels.com/photos/1459339/pexels-photo-1459339.jpeg?auto=compress&cs=tinysrgb&w=800',
    category: 'vegetable',
    difficulty: 'beginner',
    careSchedule: {
      watering: 1,
      fertilizing: 14,
    },
    growthTime: 45,
    sunlight: 'medium',
    waterNeeds: 'medium',
    tips: [
      'Harvest outer leaves first',
      'Grows well in cooler weather',
      'Keep soil consistently moist'
    ],
  },
  {
    id: '5',
    name: 'Strawberry',
    scientificName: 'Fragaria × ananassa',
    imageUrl: 'https://images.pexels.com/photos/70746/strawberries-red-fruit-royalty-free-70746.jpeg?auto=compress&cs=tinysrgb&w=800',
    category: 'fruit',
    difficulty: 'intermediate',
    careSchedule: {
      watering: 2,
      fertilizing: 14,
    },
    growthTime: 120,
    sunlight: 'high',
    waterNeeds: 'medium',
    tips: [
      'Remove runners for larger berries',
      'Protect from birds when fruiting',
      'Replace plants every 3-4 years'
    ],
  },
];

export const mockUserPlants: UserPlant[] = [
  {
    id: '1',
    userId: 'user1',
    plantId: '1',
    plant: mockPlants[0],
    nickname: 'My Sweet Basil',
    sowDate: '2024-01-15',
    growthPercent: 75,
    location: 'Kitchen windowsill',
    isActive: true,
    lastWatered: '2024-01-20',
    nextWateringDue: '2024-01-22',
  },
  {
    id: '2',
    userId: 'user1',
    plantId: '2',
    plant: mockPlants[1],
    nickname: 'Cherry Tom',
    sowDate: '2024-01-10',
    growthPercent: 65,
    location: 'Balcony',
    isActive: true,
    lastWatered: '2024-01-21',
    nextWateringDue: '2024-01-22',
  },
  {
    id: '3',
    userId: 'user1',
    plantId: '3',
    plant: mockPlants[2],
    nickname: 'Mojito Mint',
    sowDate: '2024-01-12',
    growthPercent: 85,
    location: 'Kitchen counter',
    isActive: true,
    lastWatered: '2024-01-20',
    nextWateringDue: '2024-01-22',
  },
];