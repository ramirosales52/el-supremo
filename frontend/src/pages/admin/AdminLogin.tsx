import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Lock } from 'lucide-react';

export default function AdminLogin() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!password.trim()) {
      setError('Ingresá la contraseña');
      return;
    }
    if (login(password)) {
      navigate('/admin');
    } else {
      setError('Contraseña incorrecta');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm bg-white border border-gray-200 p-8">
        <div className="flex justify-center mb-6">
          <div className="h-14 w-14 rounded-full bg-gray-900 flex items-center justify-center">
            <Lock className="h-6 w-6 text-white" />
          </div>
        </div>
        <h1 className="text-xl font-bold text-gray-900 text-center mb-1">
          Admin
        </h1>
        <p className="text-sm text-gray-500 text-center mb-6">
          Ingresá la contraseña para acceder
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Contraseña
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="border border-gray-300 px-3 py-2 text-sm w-full bg-white text-gray-900"
              placeholder="••••••••"
              autoFocus
            />
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 p-3 text-sm border border-red-200">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="w-full py-2.5 font-semibold text-sm bg-gray-900 hover:bg-gray-800 text-white tracking-wider cursor-pointer"
          >
            Ingresar
          </button>
        </form>
      </div>
    </div>
  );
}
