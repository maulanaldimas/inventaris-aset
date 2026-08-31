import { api } from './api'

export async function uploadFilePublic(file, folder = 'assets') {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('folder', folder)
    const data = await api.post('/api/upload', formData)
    return data.url
}
