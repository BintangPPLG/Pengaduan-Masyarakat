import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, LockKeyhole, UserRound } from 'lucide-react';
import { registerRequest } from '../api/authApi';
import AuthLayout from '../components/auth/AuthLayout';
import AuthInput from '../components/auth/AuthInput';
import AuthSubmitButton from '../components/auth/AuthSubmitButton';

function Register() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (password !== confirmPassword) {
      setError('Konfirmasi password tidak sama.');
      return;
    }
    setLoading(true);
    try {
      await registerRequest(username, email, password);
      setSuccess('Registrasi berhasil. Silakan masuk.');
      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      const payload = err.response?.data;
      const msg =
        payload?.message ||
        payload?.error ||
        err.message ||
        'Registrasi gagal. Coba lagi.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Create Account" subtitle="Buat akun baru untuk mulai mengirim laporan.">
      <motion.form
        key="register-form"
        initial={{ opacity: 0, x: 16 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -16 }}
        transition={{ duration: 0.25 }}
        onSubmit={handleSubmit}
        className="space-y-4"
      >
        {error && (
          <div className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
            {error}
          </div>
        )}
        {success && (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
            {success}
          </div>
        )}

        <AuthInput
          id="username"
          label="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="contoh: budi"
          autoComplete="username"
          icon={UserRound}
        />

        <AuthInput
          id="email"
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="contoh: budi@gmail.com"
          autoComplete="email"
          icon={Mail}
        />

        <AuthInput
          id="password"
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Minimal 6 karakter"
          autoComplete="new-password"
          icon={LockKeyhole}
        />

        <AuthInput
          id="confirmPassword"
          label="Confirm Password"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Ulangi password"
          autoComplete="new-password"
          icon={LockKeyhole}
        />

        <AuthSubmitButton loading={loading} text="Register" />
      </motion.form>
    </AuthLayout>
  );
}

export default Register;
