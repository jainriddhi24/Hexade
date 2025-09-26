import { prisma } from '@/lib/db'

export async function getLawyers() {
  const lawyers = await prisma.user.findMany({
    where: {
      role: 'LAWYER',
      lawyerProfile: {
        publicProfile: true
      }
    },
    select: {
      id: true,
      name: true,
      email: true,
      avatar: true,
      lawyerProfile: {
        select: {
          practiceAreas: true,
          experienceYears: true,
          rating: true,
          verified: true,
          consultationFee: true,
          districts: true
        }
      }
    },
    orderBy: {
      lawyerProfile: {
        rating: 'desc'
      }
    }
  })

  return lawyers
}