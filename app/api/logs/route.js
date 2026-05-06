import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import DailyLog from '@/models/DailyLog';

export async function GET(req) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const year  = searchParams.get('year');
    const month = searchParams.get('month'); // 1–12

    const mm       = String(month).padStart(2, '0');
    const startDate = `${year}-${mm}-01`;
    const lastDay  = new Date(Number(year), Number(month), 0).getDate();
    const endDate  = `${year}-${mm}-${String(lastDay).padStart(2, '0')}`;

    const logs = await DailyLog.find({
      date: { $gte: startDate, $lte: endDate },
    }).lean();

    return NextResponse.json({ logs: JSON.parse(JSON.stringify(logs)) });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    await connectDB();
    const { date, habitId } = await req.json();

    if (!date || !habitId) {
      return NextResponse.json({ error: 'date and habitId required' }, { status: 400 });
    }

    const existing = await DailyLog.findOne({ date, habitId });

    let log;
    if (existing) {
      existing.completed = !existing.completed;
      await existing.save();
      log = existing;
    } else {
      log = await DailyLog.create({ date, habitId, completed: true });
    }

    return NextResponse.json({ log: JSON.parse(JSON.stringify(log)) });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}