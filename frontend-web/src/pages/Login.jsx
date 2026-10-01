import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, LockKeyhole } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { loginRequest } from '../api/authApi';
import AuthLayout from '../components/auth/AuthLayout';
import AuthInput from '../components/auth/AuthInput';
import AuthSubmitButton from '../components/auth/AuthSubmitButton';

function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/dashboard';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await loginRequest(email, password);
      login(data.token, data.user);
      if (!remember) {
        sessionStorage.setItem('token', data.token);
      }
      navigate(from, { replace: true });
    } catch (err) {
      const payload = err.response?.data;
      const msg =
        payload?.message ||
        payload?.error ||
        err.message ||
        'Gagal masuk. Periksa koneksi Anda.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Welcome Back" subtitle="Masuk untuk melanjutkan pelaporan masyarakat.">
      <motion.form
        key="login-form"
        initial={{ opacity: 0, x: -16 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 16 }}
        transition={{ duration: 0.25 }}
        onSubmit={handleSubmit}
        className="space-y-4"
      >
        {error && (
          <div className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
            {error}
          </div>
        )}

        <AuthInput
          id="email"
          label="Email / Username"
          type="text"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="contoh: admin@gmail.com"
          autoComplete="username"
          icon={Mail}
        />

        <AuthInput
          id="password"
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Masukkan password"
          autoComplete="current-password"
          icon={LockKeyhole}
        />

        <div className="flex items-center justify-between gap-3 text-sm">
          <label className="inline-flex cursor-pointer items-center gap-2 text-slate-600">
            <input
              type="checkbox"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-[#56B97E] focus:ring-[#6FCF97] transition"
            />
            Remember me
          </label>
          <button
            type="button"
            className="font-semibold text-[#56B97E] hover:text-[#47a06c] transition"
            onClick={() => setError('Fitur reset password akan segera tersedia.')}
          >
            Forgot password?
          </button>
        </div>

        <AuthSubmitButton loading={loading} text="Sign In" />
      </motion.form>
    </AuthLayout>
  );
}

export default Login;
