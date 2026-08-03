'use client'

import { supabase } from '@/lib/supabase'
import { useEffect, useState } from 'react'

export default function Home() {
  const [msg, setMsg] = useState('Testing auth...')

  useEffect(() => {
    test()
  }, [])

  const test = async () => {
    try {
      // Test 1: Check session
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        setMsg('✅ SUDAH LOGIN: ' + session.user.email)
        return
      }

      // Test 2: Try login
      const { data, error } = await supabase.auth.signInWithPassword({
        email: 'test@test.com',
        password: 'test123',
      })
      
      if (error) {
        setMsg('❌ LOGIN GAGAL:\n' + error.message + '\n\nCek apakah:\n1. Email test@test.com ada di Supabase\n2. Password benar (test123)\n3. User sudah created di UI')
      } else {
        setMsg('✅ LOGIN BERHASIL!\nUser: ' + data.user?.email + '\nRedirect ke /dashboard...')
        setTimeout(() => window.location.href = '/dashboard', 2000)
      }
    } catch (err) {
      setMsg('⚠️ ERROR: ' + err.message)
    }
  }

  return (
    <div style={{
      padding: '40px',
      fontFamily: 'monospace',
      fontSize: '14px',
      whiteSpace: 'pre-wrap',
      lineHeight: '1.8',
      backgroundColor: '#f5f5f5',
      minHeight: '100vh'
    }}>
      {msg}
    </div>
  )
}