import { ArrowUpLeft, Eye, EyeOff, LockKeyhole, UserRound } from 'lucide-react';
import './auth.css';
import React, { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
const loginEmails = Object.freeze(Object.assign(Object.create(null), {
  koka_manager: 'koka_manager@koka.example',
  koka_chef: 'koka_chef@koka.example',
}));
const client = url && key ? createClient(url, key) : null;

async function readRows(table) {
  const rows = [];
  for (let offset = 0; ; offset += 500) {
    const { data, error } = await client.from(table).select('id,data,revision')
      .order('id').range(offset, offset + 499);
    if (error) throw error;
    rows.push(...data);
    if (data.length < 500) return rows;
  }
}

export async function saveRow(table, item, revision) {
  const query = client.from(table);
  const write = revision === undefined
    ? query.insert({ id: item.id, data: item })
    : query.update({ data: item }).eq('id', item.id).eq('revision', revision);
  const { data, error } = await write.select('id,data,revision').maybeSingle();
  if (error) throw error;
  if (!data) throw new Error('تغيّر السجل أو صلاحية تعديله. حدّث الصفحة وحاول مرة أخرى.');
  return data;
}

export default function SecureWorkspace({ App }) {
  const [session, setSession] = useState(undefined);
  const [workspace, setWorkspace] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const userId = session?.user.id;

  useEffect(() => {
    if (!client) return;
    const { data: { subscription } } = client.auth.onAuthStateChange((_, next) => {
      setSession(next);
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!userId) return;
    let active = true;
    setError('');
    (async () => {
      const { data: member, error: failure } = await client.from('koka_members')
        .select('role,department').eq('user_id', userId).maybeSingle();
      if (failure) throw failure;
      if (!member) throw new Error('حسابك مسجل، لكن لم تُمنح صلاحية دخول KOKA بعد.');
      const [materials, recipes] = await Promise.all([readRows('koka_materials'), readRows('koka_recipes')]);
      if (active) setWorkspace({ userId, member, materials, recipes });
    })().catch(failure => {
      if (active) setError(failure.message);
    });
    return () => { active = false; };
  }, [userId]);

  async function signIn(event) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const identifier = String(form.get('identifier')).trim();
    setError('');
    setBusy(true);
    try {
      const { error: failure } = await client.auth.signInWithPassword({
        email: loginEmails[identifier.toLowerCase()] ?? identifier, password: form.get('password'),
      });
      if (failure) setError('تعذر تسجيل الدخول. تحقق من اسم المستخدم أو البريد وكلمة المرور.');
    } catch {
      setError('تعذر الاتصال بخدمة تسجيل الدخول.');
    } finally {
      setBusy(false);
    }
  }

  async function signOut() {
    const { error: failure } = await client.auth.signOut({ scope: 'local' });
    if (failure) {
      setError('تعذر تسجيل الخروج. حاول مرة أخرى.');
      return;
    }
    setWorkspace(null);
    setError('');
  }

  if (userId && workspace?.userId === userId) {
    return <App key={userId} workspace={workspace} signOut={signOut} authError={error}/>;
  }
  return <main className="auth-screen" dir="rtl">
    <div className="auth-shell">
      <section className="auth-panel" aria-labelledby="auth-title">
        <div className="auth-brand">
          <img src={import.meta.env.BASE_URL + 'koka-official-logo.png'} alt=""/>
          <span>حلواني قوقه<small lang="en">KOKA Patisserie</small></span>
        </div>
        <h1 id="auth-title">أهلاً بك في قوقه</h1>
        <p className="auth-intro">سجّل الدخول لإدارة الوصفات والخامات والتكاليف.</p>
        {!client ? <p role="status">اتصال قاعدة البيانات قيد الإعداد.</p>
          : session === undefined ? <p role="status">جاري التحقق من الجلسة…</p>
          : userId ? <><p role="status">{error || 'جاري تحميل مساحة العمل…'}</p><button className="auth-submit" onClick={signOut}>تسجيل الخروج</button></>
          : <form className="auth-form" onSubmit={signIn}>
            <label htmlFor="auth-identifier">اسم المستخدم أو البريد الإلكتروني</label>
            <div className="auth-field">
              <UserRound size={18} aria-hidden="true"/>
              <input id="auth-identifier" name="identifier" dir="auto" placeholder="مثال: koka_manager" autoComplete="username" autoCapitalize="none" spellCheck={false} required/>
            </div>
            <label htmlFor="auth-password">كلمة المرور</label>
            <div className="auth-field">
              <LockKeyhole size={18} aria-hidden="true"/>
              <input id="auth-password" name="password" dir="ltr" type={showPassword ? 'text' : 'password'} autoComplete="current-password" required/>
              <button className="auth-eye" type="button" aria-label={showPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'} onClick={() => setShowPassword(value => !value)}>
                {showPassword ? <EyeOff size={18}/> : <Eye size={18}/>}
              </button>
            </div>
            {error && <p className="auth-error" role="alert">{error}</p>}
            <button className="auth-submit" disabled={busy}>
              <span role="status">{busy ? 'جاري تسجيل الدخول…' : 'تسجيل الدخول'}</span>
              {busy ? <span className="auth-spinner" aria-hidden="true"/> : <ArrowUpLeft size={18} aria-hidden="true"/>}
            </button>
          </form>}
      </section>
      <aside className="auth-art" aria-hidden="true">
        <img src={import.meta.env.BASE_URL + 'departments/bakery.jpg'} alt=""/>
        <div className="auth-art-copy"><span lang="en">KOKA</span><p>من المطبخ إلى دفتر الوصفات</p></div>
      </aside>
    </div>
  </main>;
}
