const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed...')

  // Create demo users
  const hashedPassword = await bcrypt.hash('Demo123!', 12)

  // Create Judge
  const judge = await prisma.user.upsert({
    where: { email: 'judge@hexade.com' },
    update: {},
    create: {
      email: 'judge@hexade.com',
      name: 'Justice Sarah Johnson',
      passwordHash: hashedPassword,
      role: 'JUDGE',
      phone: '+1-555-0101',
      bio: 'Experienced judge with 15 years in civil and criminal law.',
    },
  })

  // Create Lawyer
  const lawyer = await prisma.user.upsert({
    where: { email: 'lawyer@hexade.com' },
    update: {},
    create: {
      email: 'lawyer@hexade.com',
      name: 'Michael Chen',
      passwordHash: hashedPassword,
      role: 'LAWYER',
      phone: '+1-555-0102',
      bio: 'Specialized in corporate law and civil litigation.',
    },
  })

  // Create Lawyer Profile
  await prisma.lawyerProfile.upsert({
    where: { userId: lawyer.id },
    update: {},
    create: {
      userId: lawyer.id,
      barNumber: 'BAR123456',
      practiceAreas: JSON.stringify(['Corporate Law', 'Civil Litigation', 'Contract Law']),
      districts: JSON.stringify(['New York', 'California', 'Texas']),
      experienceYears: 8,
      rating: 4.8,
      verified: true,
      consultationFee: 250.0,
      languages: JSON.stringify(['en', 'es']),
    },
  })

  // Create Client
  const client = await prisma.user.upsert({
    where: { email: 'client@hexade.com' },
    update: {},
    create: {
      email: 'client@hexade.com',
      name: 'Emily Rodriguez',
      passwordHash: hashedPassword,
      role: 'CLIENT',
      phone: '+1-555-0103',
      bio: 'Small business owner seeking legal assistance.',
    },
  })

  // Create Admin (only if ENABLE_ADMIN is true)
  if (process.env.ENABLE_ADMIN === 'true') {
    await prisma.user.upsert({
      where: { email: 'admin@hexade.com' },
      update: {},
      create: {
        email: 'admin@hexade.com',
        name: 'System Administrator',
        passwordHash: hashedPassword,
        role: 'ADMIN',
      },
    })
  }

  // Create sample cases
  const case1 = await prisma.case.create({
    data: {
      title: 'Contract Dispute Resolution',
      description: 'Dispute over service agreement terms and payment conditions.',
      caseType: 'Civil',
      status: 'IN_PROGRESS',
      clientId: client.id,
      assignedLawyerId: lawyer.id,
      caseNumber: 'CASE-2024-001',
      courtName: 'Superior Court of California',
      jurisdiction: 'Los Angeles County',
      filingDate: new Date('2024-01-15'),
      hearingDate: new Date('2024-02-15'),
      tags: JSON.stringify(['contract', 'dispute', 'commercial']),
      priority: 'high',
    },
  })

  const case2 = await prisma.case.create({
    data: {
      title: 'Employment Law Consultation',
      description: 'Consultation regarding workplace discrimination policies.',
      caseType: 'Employment',
      status: 'ASSIGNED',
      clientId: client.id,
      assignedLawyerId: lawyer.id,
      caseNumber: 'CASE-2024-002',
      courtName: 'Federal District Court',
      jurisdiction: 'Southern District of New York',
      filingDate: new Date('2024-01-20'),
      tags: JSON.stringify(['employment', 'discrimination', 'consultation']),
      priority: 'normal',
    },
  })

  // Create sample hearings
  const hearing1 = await prisma.hearing.create({
    data: {
      caseId: case1.id,
      scheduledAt: new Date('2024-02-15T10:00:00Z'),
      duration: 90,
      status: 'SCHEDULED',
      judgeId: judge.id,
      roomId: `room-${case1.id}-${Date.now()}`,
      agenda: 'Initial hearing for contract dispute resolution',
    },
  })

  const hearing2 = await prisma.hearing.create({
    data: {
      caseId: case2.id,
      scheduledAt: new Date('2024-02-20T14:00:00Z'),
      duration: 60,
      status: 'SCHEDULED',
      judgeId: judge.id,
      roomId: `room-${case2.id}-${Date.now()}`,
      agenda: 'Employment law consultation hearing',
    },
  })

  // Create sample documents
  await prisma.document.create({
    data: {
      caseId: case1.id,
      title: 'Service Agreement Contract',
      description: 'Original service agreement between parties',
      documentType: 'PETITION',
      s3Key: `documents/case-${case1.id}/service-agreement.pdf`,
      s3Url: `https://hexade-documents.s3.amazonaws.com/documents/case-${case1.id}/service-agreement.pdf`,
      fileSize: 245760,
      mimeType: 'application/pdf',
      uploadedById: client.id,
      signerStatus: 'PENDING',
    },
  })

  await prisma.document.create({
    data: {
      caseId: case1.id,
      title: 'Evidence Document A',
      description: 'Supporting evidence for the case',
      documentType: 'EVIDENCE',
      s3Key: `documents/case-${case1.id}/evidence-a.pdf`,
      s3Url: `https://hexade-documents.s3.amazonaws.com/documents/case-${case1.id}/evidence-a.pdf`,
      fileSize: 512000,
      mimeType: 'application/pdf',
      uploadedById: lawyer.id,
      signerStatus: 'SIGNED',
      signedById: lawyer.id,
      signedAt: new Date(),
    },
  })

  // Create sample messages
  await prisma.message.create({
    data: {
      hearingId: hearing1.id,
      content: 'Welcome to the hearing room. Please ensure your audio and video are working properly.',
      messageType: 'system',
      senderId: judge.id,
    },
  })

  await prisma.message.create({
    data: {
      hearingId: hearing1.id,
      content: 'Good morning, Your Honor. I am ready to proceed.',
      messageType: 'text',
      senderId: lawyer.id,
    },
  })

  await prisma.message.create({
    data: {
      hearingId: hearing1.id,
      content: 'Thank you, Your Honor. I have reviewed the contract and have some questions about the payment terms.',
      messageType: 'text',
      senderId: client.id,
    },
  })

  await prisma.message.create({
    data: {
      hearingId: hearing1.id,
      content: 'Please proceed with your questions, Ms. Rodriguez.',
      messageType: 'text',
      senderId: judge.id,
    },
  })

  await prisma.message.create({
    data: {
      hearingId: hearing2.id,
      content: 'Welcome to the employment law consultation hearing.',
      messageType: 'system',
      senderId: judge.id,
    },
  })

  await prisma.message.create({
    data: {
      hearingId: hearing2.id,
      content: 'Good afternoon, Your Honor. I am here to discuss the workplace discrimination case.',
      messageType: 'text',
      senderId: lawyer.id,
    },
  })

  await prisma.message.create({
    data: {
      hearingId: hearing2.id,
      content: 'I have prepared the necessary documentation regarding the incident.',
      messageType: 'text',
      senderId: client.id,
    },
  })

  console.log('✅ Database seeded successfully!')
  console.log('📧 Demo login credentials:')
  console.log('   Judge: judge@hexade.com / Demo123!')
  console.log('   Lawyer: lawyer@hexade.com / Demo123!')
  console.log('   Client: client@hexade.com / Demo123!')
  if (process.env.ENABLE_ADMIN === 'true') {
    console.log('   Admin: admin@hexade.com / Demo123!')
  }
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error('❌ Seed failed:', e)
    await prisma.$disconnect()
    process.exit(1)
  })
