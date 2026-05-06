import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Habit from '@/models/Habit';

const DEFAULT_HABITS = [
  { name: 'Wake up at 05:00',   icon: '⏰', order: 1  },
  { name: 'Gym',                icon: '💪', order: 2  },
  { name: 'Reading / Learning', icon: '📖', order: 3  },
  { name: 'Day Planning',       icon: '🗓️',  order: 4  },
  { name: 'No Gooning',         icon: '🎯', order: 5  },
  { name: 'Project Work',       icon: '💻', order: 6  },
  { name: 'No Alcohol',         icon: '🍾', order: 7  },
  { name: 'Social Media Detox', icon: '📵', order: 8  },
  { name: 'Goal Journaling',    icon: '📓', order: 9  },
  { name: 'Cold Shower',        icon: '🚿', order: 10 },
  { name: '10k Steps',          icon: '🚶', order: 11 },
  { name: 'Plan Tomorrow',      icon: '📋', order: 12 },
];

export async function GET() {
  try {
    await connectDB();
    const count = await Habit.countDocuments();

    // ✅ Never re-seed if ANY habits exist
    if (count > 0) {
      return NextResponse.json({
        message: `Skipped — ${count} habits already exist. Delete from MongoDB to re-seed.`,
      });
    }

    await Habit.insertMany(DEFAULT_HABITS);
    return NextResponse.json({ message: 'Seeded 12 default habits successfully.' });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}