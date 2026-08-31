import { mkdir, writeFile } from 'fs/promises'
import path from 'path'
import { requireSession } from '../../../lib/auth'
import { jsonError } from '../../../lib/http'

const FOLDER_DIIZINKAN = ['assets', 'avatars', 'company-logos']
const UKURAN_MAKS = 5 * 1024 * 1024

export async function POST(request) {
    try {
        await requireSession()

        const formData = await request.formData()
        const file = formData.get('file')
        const folder = formData.get('folder') || 'assets'

        if (!(file instanceof File)) {
            return Response.json({ error: 'File tidak ditemukan' }, { status: 400 })
        }
        if (!FOLDER_DIIZINKAN.includes(folder)) {
            return Response.json({ error: 'Folder tidak valid' }, { status: 400 })
        }
        if (file.size > UKURAN_MAKS) {
            return Response.json({ error: 'Ukuran file maksimal 5MB' }, { status: 400 })
        }

        const aman = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
        const namaFile = `${Date.now()}-${aman}`
        const dirTujuan = path.join(process.cwd(), 'public', 'uploads', folder)
        await mkdir(dirTujuan, { recursive: true })
        await writeFile(path.join(dirTujuan, namaFile), Buffer.from(await file.arrayBuffer()))

        return Response.json({ url: `/uploads/${folder}/${namaFile}` }, { status: 201 })
    } catch (error) {
        return jsonError(error)
    }
}
