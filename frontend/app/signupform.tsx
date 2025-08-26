'use client'

import { useRouter } from 'next/navigation';
import * as api from '../src/api';
import * as pages from '../src/pages';

export default function SignUpForm() {
  const router = useRouter();

  async function createNewAccount(formData) {
    const email = formData.get('email');
    const password = formData.get('password');
    await api.newAccount(email, password);
    router.push(pages.appleRoute());
  }

  return (
    <div>
      <form action={createNewAccount}>
        <h1>Sign Up</h1>
        <label>
          Email: <input name="email" />
        </label>
        <br />
        <label>
          Password: <input type="password" name="password" />
        </label>
        <br />
        <button type="submit">Submit</button>
      </form>
    </div>
  );
}
