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
    <section className="modal auth-panel">
      <img src={import.meta.env.BASE_URL + 'koka-official-logo.png'} alt="حلواني قوقه"/>
      <h1>دخول مساحة عمل KOKA</h1>
      {!client ? <p>اتصال قاعدة البيانات قيد الإعداد.</p>
        : session === undefined ? <p>جاري التحقق من الجلسة…</p>
        : userId ? <><p>{error || 'جاري تحميل مساحة العمل…'}</p><button className="light-button" onClick={signOut}>تسجيل الخروج</button></>
        : <form className="form-fields" onSubmit={signIn}>
          <label>اسم المستخدم أو البريد الإلكتروني<input name="identifier" type="text" autoComplete="username" autoCapitalize="none" required/></label>
          <label>كلمة المرور<input name="password" type="password" autoComplete="current-password" required/></label>
          {error && <p role="alert">{error}</p>}
          <button className="dark-button" disabled={busy}>{busy ? 'جاري تسجيل الدخول…' : 'تسجيل الدخول'}</button>
        </form>}
    </section>
  </main>;
}
