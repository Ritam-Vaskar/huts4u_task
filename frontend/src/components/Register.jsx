import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { UserPlus, Eye, EyeOff, User, Mail, Lock, CheckCircle } from 'lucide-react';

export function Register({ onToggleMode }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { signUp } = useAuth();

  const passwordStrength = (pass) => {
    if (pass.length < 6) return { strength: 'weak', color: 'red', width: 'w-1/3' };
    if (pass.length < 10) return { strength: 'medium', color: 'yellow', width: 'w-2/3' };
    return { strength: 'strong', color: 'green', width: 'w-full' };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await signUp(email, password, fullName);
    } catch (err) {
      setError(err.message || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  const strength = passwordStrength(password);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-md animate-fadeIn">
        <div className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8 lg:p-10 card-hover">
          <div className="flex items-center justify-center mb-6 sm:mb-8">
            <div className="bg-gradient-to-br from-green-600 to-emerald-600 rounded-full p-3 shadow-lg animate-scaleIn">
              <UserPlus className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
            </div>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-center text-gray-900 mb-2">Create Account</h2>
          <p className="text-center text-gray-600 mb-6 sm:mb-8 text-sm sm:text-base">Join the resource sharing community</p>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-4 text-sm animate-slideIn">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label htmlFor="fullName" className="block text-sm font-semibold text-gray-700">
                Full Name
              </label>
              <div className="relative group">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-green-500 transition-colors" />
                <input
                  id="fullName"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all hover:border-gray-400"
                  placeholder="John Doe"
                />
                {fullName.length > 2 && (
                  <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-green-500" />
                )}
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700">
                Email Address
              </label>
              <div className="relative group">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-green-500 transition-colors" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all hover:border-gray-400"
                  placeholder="student@college.edu"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-semibold text-gray-700">
                Password
              </label>
              <div className="relative group">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-green-500 transition-colors" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all hover:border-gray-400"
                  placeholder="At least 6 characters"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {password && (
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${strength.width} ${
                        strength.color === 'red' ? 'bg-red-500' :
                        strength.color === 'yellow' ? 'bg-yellow-500' :
                        'bg-green-500'
                      }`}
                    />
                  </div>
                  <span className={`text-xs font-medium ${
                    strength.color === 'red' ? 'text-red-600' :
                    strength.color === 'yellow' ? 'text-yellow-600' :
                    'text-green-600'
                  }`}>
                    {strength.strength}
                  </span>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold py-3 rounded-xl hover:from-green-700 hover:to-emerald-700 focus:ring-4 focus:ring-green-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 btn-primary"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating account...
                </span>
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          <div className="mt-6 sm:mt-8 text-center">
            <p className="text-gray-600 text-sm sm:text-base">
              Already have an account?{' '}
              <button
                onClick={onToggleMode}
                className="text-green-600 font-semibold hover:text-green-700 transition-colors hover:underline"
              >
                Sign In
              </button>
            </p>
          </div>
        </div>

        <div className="mt-6 text-center text-xs sm:text-sm text-gray-500">
          <p>© 2025 College Resource Portal. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}
