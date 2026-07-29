import { useState } from 'react';
import { Lock, User, ShieldCheck, KeyRound, Check, X, Scale, Building2 } from 'lucide-react';
import './Auth.css';

export function ProfileSetupModal({ profile, onSave, onClose, isFirstUse = false }) {
  const [form, setForm] = useState({
    name: profile?.name || '',
    title: profile?.title || 'مستشار',
    court: profile?.court || 'هيئة قضايا الدولة',
    password: profile?.password || '',
    confirmPassword: profile?.password || '',
  });

  const [error, setError] = useState('');

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!form.name.trim()) {
      setError('يرجى إدخال اسم المستشار');
      return;
    }

    if (!form.password) {
      setError('يرجى تعيين كلمة مرور لفتح لوحة التحكم');
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError('كلمة المرور وتأكيدها غير متطابقين');
      return;
    }

    onSave({
      name: form.name.trim(),
      title: form.title.trim() || 'مستشار',
      court: form.court.trim() || 'هيئة قضايا الدولة',
      password: form.password,
    });
  };

  return (
    <div className="modal-overlay" onClick={isFirstUse ? undefined : onClose}>
      <div className="modal-content auth-modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title flex items-center gap-2">
            <ShieldCheck size={22} className="text-gold" />
            {isFirstUse ? 'إعداد بيانات المستشار والأمان (أول استخدام)' : 'تعديل بيانات المستشار والأمان'}
          </h2>
          {!isFirstUse && (
            <button className="btn-icon" onClick={onClose}><X size={20} /></button>
          )}
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {isFirstUse && (
              <div className="auth-welcome-callout mb-4">
                📌 أهلاً بك! يرجى إدخال بياناتك القضائية وتحديد كلمة مرور لفتح لوحة التحكم وحماية البيانات.
              </div>
            )}

            {error && (
              <div className="alert alert-danger mb-4 text-xs font-bold">
                ⚠️ {error}
              </div>
            )}

            <div className="form-group">
              <label className="form-label">اسم المستشار *</label>
              <div className="input-icon-wrapper">
                <User size={18} className="input-icon" />
                <input
                  type="text"
                  className="form-input with-icon"
                  value={form.name}
                  onChange={e => handleChange('name', e.target.value)}
                  placeholder="مثال: أحمد محمد عبد العزيز"
                  required
                  autoFocus
                />
              </div>
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">الدرجة / الصفة القضائية</label>
                <div className="input-icon-wrapper">
                  <Scale size={18} className="input-icon" />
                  <input
                    type="text"
                    className="form-input with-icon"
                    value={form.title}
                    onChange={e => handleChange('title', e.target.value)}
                    placeholder="مستشار / نائب رئيس الهيئة"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">القسم / الجهة</label>
                <div className="input-icon-wrapper">
                  <Building2 size={18} className="input-icon" />
                  <input
                    type="text"
                    className="form-input with-icon"
                    value={form.court}
                    onChange={e => handleChange('court', e.target.value)}
                    placeholder="هيئة قضايا الدولة"
                  />
                </div>
              </div>
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">كلمة المرور لوحة التحكم *</label>
                <div className="input-icon-wrapper">
                  <KeyRound size={18} className="input-icon" />
                  <input
                    type="password"
                    className="form-input with-icon"
                    value={form.password}
                    onChange={e => handleChange('password', e.target.value)}
                    placeholder="كلمة المرور"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">تأكيد كلمة المرور *</label>
                <div className="input-icon-wrapper">
                  <Lock size={18} className="input-icon" />
                  <input
                    type="password"
                    className="form-input with-icon"
                    value={form.confirmPassword}
                    onChange={e => handleChange('confirmPassword', e.target.value)}
                    placeholder="إعادة كلمة المرور"
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="submit" className="btn btn-primary w-full justify-center">
              <Check size={18} />
              {isFirstUse ? 'حفظ البيانات وبدء الاستخدام' : 'حفظ التعديلات'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function PasswordUnlockModal({ profile, onUnlock, onForgotOrReset }) {
  const [passwordInput, setPasswordInput] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!passwordInput) {
      setError('يرجى إدخال كلمة المرور');
      return;
    }

    if (passwordInput === profile?.password) {
      onUnlock();
    } else {
      setError('كلمة المرور غير صحيحة، حاول مرة أخرى');
    }
  };

  const getInitial = () => {
    return profile?.name ? profile.name.trim().charAt(0) : 'م';
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content auth-modal-content" style={{ maxWidth: 450 }} onClick={e => e.stopPropagation()}>
        <div className="unlock-card-body text-center p-6">
          <div className="unlock-avatar-circle">
            {getInitial()}
          </div>

          <h3 className="unlock-title text-xl font-bold mt-3 text-primary">
            أهلاً بك، {profile?.title || 'المستشار'} {profile?.name || ''}
          </h3>
          <p className="text-xs text-muted mt-1 mb-6">
            الرجاء إدخال كلمة المرور لدخول لوحة التحكم والبيانات القضائية 🔒
          </p>

          {error && (
            <div className="alert alert-danger mb-4 text-xs font-bold">
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <div className="input-icon-wrapper">
                <Lock size={18} className="input-icon" />
                <input
                  type="password"
                  className="form-input with-icon"
                  placeholder="أدخل كلمة المرور"
                  value={passwordInput}
                  onChange={e => { setPasswordInput(e.target.value); setError(''); }}
                  autoFocus
                  required
                />
              </div>
            </div>

            <button type="submit" className="btn btn-primary w-full justify-center mt-4">
              <KeyRound size={16} />
              تأكيد الدخول
            </button>
          </form>

          {onForgotOrReset && (
            <button
              className="btn btn-sm btn-ghost text-muted text-xs mt-4"
              onClick={onForgotOrReset}
            >
              تعديل بيانات الحساب / إعادة تعيين
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
