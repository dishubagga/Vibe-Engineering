import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { setOnboardingCompleted } from '../store/slices/authSlice';
import userService from '../services/userService';

const GOALS = [
  {
    type: 'FAT_LOSS',
    label: 'Fat Loss',
    emoji: '🔥',
    description: 'Lose body fat while preserving muscle',
  },
  {
    type: 'MUSCLE_GAIN',
    label: 'Muscle Gain',
    emoji: '💪',
    description: 'Build muscle with a calorie surplus',
  },
  {
    type: 'MAINTENANCE',
    label: 'Maintenance',
    emoji: '⚖️',
    description: 'Maintain current weight and composition',
  },
];

function calculateMacros(age, weightKg, heightCm, goalType) {
  // Mifflin-St Jeor BMR (using average for gender-neutral)
  const bmr = 10 * weightKg + 6.25 * heightCm - 5 * age + 5;
  const tdee = Math.round(bmr * 1.55);

  let calories, proteinG, fatG;

  if (goalType === 'FAT_LOSS') {
    calories = tdee - 500;
    proteinG = Math.round(2.2 * weightKg);
    fatG = Math.round(0.8 * weightKg);
  } else if (goalType === 'MUSCLE_GAIN') {
    calories = tdee + 300;
    proteinG = Math.round(2.0 * weightKg);
    fatG = Math.round(1.0 * weightKg);
  } else {
    calories = tdee;
    proteinG = Math.round(1.8 * weightKg);
    fatG = Math.round(0.9 * weightKg);
  }

  const proteinCals = proteinG * 4;
  const fatCals = fatG * 9;
  const carbCals = Math.max(calories - proteinCals - fatCals, 0);
  const carbsG = Math.round(carbCals / 4);

  return { dailyCalories: Math.max(calories, 1200), dailyProteinG: proteinG, dailyCarbsG: carbsG, dailyFatG: fatG };
}

function StepIndicator({ current, total }) {
  return (
    <div className="flex items-center justify-center gap-2 mb-8">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className={`h-2 rounded-full transition-all ${
            i < current ? 'w-8 bg-green-500' : i === current ? 'w-8 bg-green-500' : 'w-2 bg-gray-200'
          }`}
        />
      ))}
    </div>
  );
}

function OnboardingFlow() {
  const [step, setStep] = useState(0);
  const [personal, setPersonal] = useState({ age: '', weightKg: '', heightCm: '' });
  const [goalType, setGoalType] = useState('');
  const [macros, setMacros] = useState({ dailyCalories: '', dailyProteinG: '', dailyCarbsG: '', dailyFatG: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);

  const handlePersonalNext = (e) => {
    e.preventDefault();
    setStep(1);
  };

  const handleGoalNext = (selected) => {
    setGoalType(selected);
    const suggested = calculateMacros(
      Number(personal.age),
      Number(personal.weightKg),
      Number(personal.heightCm),
      selected
    );
    setMacros(suggested);
    setStep(2);
  };

  const handleMacroChange = (field, value) => {
    setMacros({ ...macros, [field]: Number(value) });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await userService.completeOnboarding({
        age: Number(personal.age),
        weightKg: Number(personal.weightKg),
        heightCm: Number(personal.heightCm),
        goalType,
        ...macros,
      });
      dispatch(setOnboardingCompleted());
      navigate('/', { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-sm p-8">
        <StepIndicator current={step} total={3} />

        {step === 0 && (
          <>
            <div className="text-center mb-8">
              <h2 className="text-xl font-bold text-gray-900">Tell us about yourself</h2>
              <p className="text-gray-500 text-sm mt-1">We'll calculate your nutrition targets</p>
            </div>
            <form onSubmit={handlePersonalNext} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Age</label>
                <input
                  type="number"
                  value={personal.age}
                  onChange={(e) => setPersonal({ ...personal, age: e.target.value })}
                  required min="13" max="120" placeholder="Years"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Weight (kg)</label>
                <input
                  type="number"
                  value={personal.weightKg}
                  onChange={(e) => setPersonal({ ...personal, weightKg: e.target.value })}
                  required min="30" max="300" step="0.1" placeholder="e.g. 75"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Height (cm)</label>
                <input
                  type="number"
                  value={personal.heightCm}
                  onChange={(e) => setPersonal({ ...personal, heightCm: e.target.value })}
                  required min="100" max="250" placeholder="e.g. 175"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 rounded-xl transition-colors"
              >
                Continue
              </button>
            </form>
          </>
        )}

        {step === 1 && (
          <>
            <div className="text-center mb-8">
              <h2 className="text-xl font-bold text-gray-900">What's your goal?</h2>
              <p className="text-gray-500 text-sm mt-1">Choose what you want to achieve</p>
            </div>
            <div className="space-y-3">
              {GOALS.map((g) => (
                <button
                  key={g.type}
                  onClick={() => handleGoalNext(g.type)}
                  className="w-full flex items-center gap-4 p-4 border-2 border-gray-100 hover:border-green-400 hover:bg-green-50 rounded-xl transition-all text-left"
                >
                  <span className="text-2xl">{g.emoji}</span>
                  <div>
                    <p className="font-semibold text-gray-900">{g.label}</p>
                    <p className="text-gray-500 text-xs">{g.description}</p>
                  </div>
                </button>
              ))}
            </div>
            <button
              onClick={() => setStep(0)}
              className="w-full mt-4 text-sm text-gray-400 hover:text-gray-600 py-2"
            >
              Back
            </button>
          </>
        )}

        {step === 2 && (
          <>
            <div className="text-center mb-8">
              <h2 className="text-xl font-bold text-gray-900">Your daily targets</h2>
              <p className="text-gray-500 text-sm mt-1">Suggested based on your profile — adjust if needed</p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              {[
                { key: 'dailyCalories', label: 'Calories (kcal)', min: 500, max: 10000 },
                { key: 'dailyProteinG', label: 'Protein (g)', min: 0, max: 500 },
                { key: 'dailyCarbsG', label: 'Carbs (g)', min: 0, max: 1000 },
                { key: 'dailyFatG', label: 'Fat (g)', min: 0, max: 300 },
              ].map(({ key, label, min, max }) => (
                <div key={key}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                  <input
                    type="number"
                    value={macros[key]}
                    onChange={(e) => handleMacroChange(key, e.target.value)}
                    required min={min} max={max}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              ))}

              {error && (
                <p className="text-red-500 text-sm bg-red-50 px-4 py-3 rounded-xl">{error}</p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-green-500 hover:bg-green-600 disabled:bg-green-300 text-white font-semibold py-3 rounded-xl transition-colors"
              >
                {loading ? 'Saving...' : "Let's go!"}
              </button>
            </form>
            <button
              onClick={() => setStep(1)}
              className="w-full mt-2 text-sm text-gray-400 hover:text-gray-600 py-2"
            >
              Back
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default OnboardingFlow;
