import { useEffect, useRef, useState } from 'react';
import { Camera, Save, Trash2, UserRound } from 'lucide-react';
import api from '../../lib/api.js';
import { useAuth } from '../auth/AuthContext.jsx';
import { useToast } from '../../components/ToastProvider.jsx';
import { initials } from '../../lib/format.js';

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const { toast } = useToast();
  const fileRef = useRef(null);
  const [form, setForm] = useState({ name: '', phone: '' });
  const [email, setEmail] = useState('');
  const [avatar, setAvatar] = useState('');
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    let active = true;
    api.get('/profile')
      .then(({ data }) => {
        if (!active) return;
        const profile = data.user;
        setForm({ name: profile.name || '', phone: profile.phone || '' });
        setEmail(profile.email || '');
        setAvatar(profile.avatarUrl || '');
      })
      .catch(error => toast(error.response?.data?.message || 'Unable to load profile.', 'error'));
    return () => { active = false; };
  }, [toast]);

  async function save(event) {
    event.preventDefault();
    setSaving(true);
    try {
      const { data } = await api.patch('/profile', form);
      updateUser(data.user);
      toast('Profile updated successfully.');
    } catch (error) {
      toast(error.response?.data?.message || 'Unable to save profile.', 'error');
    } finally {
      setSaving(false);
    }
  }

  async function upload(event) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      toast('Choose a JPG, PNG or WebP image.', 'error');
      return;
    }
    if (file.size > 600 * 1024) {
      toast('Choose an image smaller than 600 KB.', 'error');
      return;
    }
    setUploading(true);
    try {
      const image = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(new Error('Could not read this image.'));
        reader.readAsDataURL(file);
      });
      const { data } = await api.post('/profile/avatar', { image });
      updateUser(data.user);
      setAvatar(data.user.avatarUrl || '');
      toast('Profile photo updated.');
    } catch (error) {
      toast(error.response?.data?.message || 'Could not upload your photo. Please try again.', 'error');
    } finally {
      setUploading(false);
    }
  }

  async function removeAvatar() {
    setUploading(true);
    try {
      const { data } = await api.delete('/profile/avatar');
      updateUser(data.user);
      setAvatar('');
      toast('Profile photo removed.');
    } catch (error) {
      toast(error.response?.data?.message || 'Could not remove photo.', 'error');
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="page-container-inner">
      <div className="page-header"><div><span className="eyebrow">ACCOUNT</span><h1>Your profile</h1><p>Manage the personal details shown to your workspace teammates.</p></div></div>
      <section className="surface workspace-panel">
        <div className="surface-heading"><div><span className="surface-kicker">PERSONAL INFORMATION</span><h2>Profile details</h2><p>Your email address is used for sign-in and invitations.</p></div><span className="surface-icon"><UserRound size={20} /></span></div>
        <div className="profile-photo-editor">
          <div className="profile-photo-preview">{avatar ? <img src={avatar} alt="Profile" /> : <span>{initials(form.name || user?.name)}</span>}</div>
          <div className="profile-photo-actions"><b>Profile photo</b><p>JPG, PNG or WebP · max 600 KB</p><div>
            <button type="button" className="btn-secondary" disabled={uploading} onClick={() => fileRef.current?.click()}><Camera size={15} />{uploading ? 'Uploading…' : 'Upload photo'}</button>
            {avatar && <button type="button" className="btn-secondary" disabled={uploading} onClick={removeAvatar}><Trash2 size={15} />Remove</button>}
          </div><input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" hidden onChange={upload} /></div>
        </div>
        <form className="form-stack" onSubmit={save}>
          <label>Full name<input required minLength="2" maxLength="80" value={form.name} onChange={event => setForm({ ...form, name: event.target.value })} /></label>
          <label>Email address<input value={email} disabled readOnly /></label>
          <label>Phone number <span className="field-hint">Include country code, e.g. +91 98765 43210</span><input type="tel" inputMode="tel" autoComplete="tel" maxLength="20" value={form.phone} onChange={event => setForm({ ...form, phone: event.target.value })} placeholder="+91 98765 43210" pattern="\\+[1-9][0-9 ()-]{7,18}" title="Enter a valid international phone number with country code" /></label>
          <div className="modal-actions"><button className="btn-primary" disabled={saving}><Save size={15} />{saving ? 'Saving…' : 'Save profile'}</button></div>
        </form>
      </section>
    </div>
  );
}
