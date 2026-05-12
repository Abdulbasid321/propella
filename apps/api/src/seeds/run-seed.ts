import { connectDB } from '../config/db'
import { SubjectModel } from '../models/Subject'
import { subjects } from './subjects'

async function seed(): Promise<void> {
  await connectDB()

  const count = await SubjectModel.countDocuments()
  if (count > 0) {
    console.log(`Already seeded (${count} subjects found), skipping`)
    process.exit(0)
  }

  await SubjectModel.insertMany(subjects)
  console.log(`Seeded ${subjects.length} subjects`)
  process.exit(0)
}

seed().catch((err) => {
  console.error('Seed failed:', err)
  process.exit(1)
})
