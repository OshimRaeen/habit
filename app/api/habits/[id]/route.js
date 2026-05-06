import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Habit from '@/models/Habit';
import DailyLog from '@/models/DailyLog';

export async function PUT(req, { params }) {
  try {
    await connectDB();
    const { id } = await params; // ✅ await params in Next.js 15
    const body = await req.json();
    const habit = await Habit.findByIdAndUpdate(
      id,
      { $set: body },
      { new: true }
    ).lean();
    if (!habit) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ habit: JSON.parse(JSON.stringify(habit)) });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    await connectDB();
    const { id } = await params; // ✅ await params in Next.js 15
    await Habit.findByIdAndDelete(id);
    await DailyLog.deleteMany({ habitId: id });
    return NextResponse.json({ message: 'Deleted' });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}