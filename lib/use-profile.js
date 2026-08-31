'use client'

import { useState, useEffect } from 'react'
import { api } from './api'

export function useProfile() {
    const [profile, setProfile] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        let aktif = true

        const fetchProfile = async () => {
            try {
                const data = await api.get('/api/auth/me')
                if (!aktif) return
                setProfile(data.profile)
            } catch {
                if (!aktif) setProfile(null)
            }
            if (aktif) setLoading(false)
        }

        fetchProfile()
        return () => {
            aktif = false
        }
    }, [])

    return { profile, loading }
}
