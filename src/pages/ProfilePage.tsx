import React, { useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useMutation } from '@tanstack/react-query';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { User, Lock, Save } from 'lucide-react';

export default function ProfilePage() {
  const { user, fetchMe } = useAuthStore();
  const [form, setForm] = useState({ name: user?.name || '', email: user?.email || '' });
  const [pwdForm, setPwdForm] = useState({ current_password: '', password: '', password_confirmation: '' });

  const updateProfile = useMutation({
    mutationFn: () => api.put('/user', form),
    onSuccess: () => { fetchMe(); toast.success('Profile updated!'); },
    onError: () => toast.error('Failed to update profile'),
  });

  const updatePassword = useMutation({
    mutationFn: () => api.put('/auth/password', pwdForm),
    onSuccess: () => { setPwdForm({ current_password: '', password: '', password_confirmation: '' }); toast.success('Password updated!'); },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed to update password'),
  });

  return (
    <div className="container-page py-8 max-w-2xl">
      <h1 className="text-2xl font-display font-bold text-dark-900 mb-8">My Profile</h1>
      <div className="space-y-6">
        <div className="card p-6">
          <h2 className="font-semibold text-dark-900 mb-4 flex items-center gap-2"><User size={18} className="text-primary-600" /> Personal Information</h2>
          <div className="space-y-4">
            <div><label className="label">Full Name</label><input className="input" value={form.name} onChange={e => setForm({...form, name: e.target.value})} /></div>
            <div><label className="label">Email</label><input className="input" type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} /></div>
            <button onClick={() => updateProfile.mutate()} disabled={updateProfile.isPending} className="btn-primary"><Save size={16} />{updateProfile.isPending ? 'Saving...' : 'Save Changes'}</button>
          </div>
        </div>
        <div className="card p-6">
          <h2 className="font-semibold text-dark-900 mb-4 flex items-center gap-2"><Lock size={18} className="text-primary-600" /> Change Password</h2>
          <div className="space-y-4">
            <div><label className="label">Current Password</label><input className="input" type="password" value={pwdForm.current_password} onChange={e => setPwdForm({...pwdForm, current_password: e.target.value})} /></div>
            <div><label className="label">New Password</label><input className="input" type="password" value={pwdForm.password} onChange={e => setPwdForm({...pwdForm, password: e.target.value})} /></div>
            <div><label className="label">Confirm New Password</label><input className="input" type="password" value={pwdForm.password_confirmation} onChange={e => setPwdForm({...pwdForm, password_confirmation: e.target.value})} /></div>
            <button onClick={() => updatePassword.mutate()} disabled={updatePassword.isPending} className="btn-primary"><Save size={16} />{updatePassword.isPending ? 'Updating...' : 'Update Password'}</button>
          </div>
        </div>
      </div>
    </div>
  );
}
