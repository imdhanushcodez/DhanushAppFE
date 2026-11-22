// Seed data aligned with Table Design and User Stories

export const initialUser = {
  id: 1,
  email: 'dhanush@example.com',
  name: 'Dhanush Subramani',
  mobile: '9876543210',
  sex: 'MALE',
  date_of_birth: '2000-01-15',
  profile_photo_url: '',
};

export const initialVaultEntries = [
  {
    id: 1,
    user_id: 1,
    source: 'Gmail',
    login_id: 'dhanush@example.com',
    password_encrypted: 'Pass@Gmail2026',
    created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: 2,
    user_id: 1,
    source: 'GitHub',
    login_id: 'dhanush-git',
    password_encrypted: 'GitSecure#992',
    created_at: new Date(Date.now() - 86400000 * 10).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 10).toISOString(),
  },
  {
    id: 3,
    user_id: 1,
    source: 'Netflix',
    login_id: 'dhanush.streams@gmail.com',
    password_encrypted: 'Movies4All!2026',
    created_at: new Date(Date.now() - 86400000 * 1).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 1).toISOString(),
  },
];

export const initialNotes = [
  {
    id: 1,
    user_id: 1,
    topic: 'Spring Boot Architecture',
    content: 'Entities: User, VaultEntry, Note, WorkoutPlan, WorkoutLog, MealPlan, MealLog. Each row links to user.',
    created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 4).toISOString(),
  },
  {
    id: 2,
    user_id: 1,
    topic: 'Workout Routine Goals',
    content: 'Target 4 gym sessions weekly with focus on progressive overload and minimum 120g daily protein.',
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
];

export const workoutCategories = [
  { id: 1, name: 'Chest' },
  { id: 2, name: 'Back' },
  { id: 3, name: 'Shoulders' },
  { id: 4, name: 'Biceps' },
  { id: 5, name: 'Triceps' },
  { id: 6, name: 'Legs' },
  { id: 7, name: 'ABS' },
  { id: 8, name: 'Cardio' },
  { id: 9, name: 'Other' },
];

export const foodCategories = [
  { id: 1, name: 'Breakfast' },
  { id: 2, name: 'Lunch' },
  { id: 3, name: 'Dinner' },
  { id: 4, name: 'Snacks' },
  { id: 5, name: 'Fruits' },
  { id: 6, name: 'Drinks' },
  { id: 7, name: 'Other' },
];

export const sampleWorkouts = [
  { id: 1, category_id: 1, name: 'Barbell Bench Press', reps: 10, weight_kg: 60, image_url: '' },
  { id: 2, category_id: 1, name: 'Incline Dumbbell Press', reps: 12, weight_kg: 22, image_url: '' },
  { id: 3, category_id: 2, name: 'Lat Pulldown', reps: 12, weight_kg: 50, image_url: '' },
  { id: 4, category_id: 6, name: 'Barbell Squat', reps: 8, weight_kg: 80, image_url: '' },
];

export const sampleFoods = [
  { id: 1, category_id: 1, dish_name: 'Oats with Almond Milk & Berries', weight_g: 250, calories: 340, protein_g: 14, fiber_g: 6, others: '' },
  { id: 2, category_id: 2, dish_name: 'Grilled Chicken Breast with Brown Rice', weight_g: 350, calories: 520, protein_g: 45, fiber_g: 4, others: '' },
  { id: 3, category_id: 4, dish_name: 'Greek Yogurt with Walnuts', weight_g: 150, calories: 180, protein_g: 16, fiber_g: 2, others: '' },
];

