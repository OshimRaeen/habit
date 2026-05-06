import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Habit from '@/models/Habit';

export async function GET() {
  try {
    await connectDB();
    const habits = await Habit.find({}).sort({ order: 1 }).lean();
    return NextResponse.json({ habits: JSON.parse(JSON.stringify(habits)) });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();
    const { name, icon } = body;
    if (!name?.trim()) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }
    const count = await Habit.countDocuments();
    const habit = await Habit.create({ name: name.trim(), icon: icon || '✅', order: count + 1 });
    return NextResponse.json({ habit: JSON.parse(JSON.stringify(habit)) }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}