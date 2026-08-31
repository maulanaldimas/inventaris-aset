import { getCurrentUser } from '../../../../lib/auth'
import { jsonError } from '../../../../lib/http'

export async function GET() {
    try {
        const user = await getCurrentUser()
        if (!user) return Response.json({ profile: null })

        return Response.json({
            profile: {
                id: user.id,
                email: user.email,
                role: user.role,
                full_name: user.fullName,
                phone: user.phone,
                job_title: user.jobTitle,
                avatar_url: user.avatarUrl,
                company_id: user.companyId,
                companies: user.company && {
                    id: user.company.id,
                    name: user.company.name,
                    logo_url: user.company.logoUrl,
                    primary_color: user.company.primaryColor,
                },
            },
        })
    } catch (error) {
        return jsonError(error)
    }
}
